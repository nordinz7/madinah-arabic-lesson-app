import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { toArabicNumber } from '@/src/arabic';
import { LESSONS } from '@/src/data';
import { useEffectiveColorScheme } from '@/src/hooks/use-effective-color-scheme';
import {
  Fonts,
  Palette,
  Radius,
  Semantic,
  type SemanticPalette,
  Space,
} from '@/src/design';
import { lessonCompletion, useProgress } from '@/src/stores/progress';
import type { Lesson } from '@/src/types';

const MIN_TILE = 100;
const TILE_GAP = 6;

type FillerItem = { __filler: true; id: string };
type GridItem = Lesson | FillerItem;
const isFiller = (item: GridItem): item is FillerItem => '__filler' in item;

export default function LessonsScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [query, setQuery] = useState('');

  const colorScheme = useEffectiveColorScheme();
  const palette = Semantic[colorScheme];

  const completed = useProgress((s) => s.completedSections);
  const lastLessonId = useProgress((s) => s.lastLessonId);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return LESSONS;
    return LESSONS.filter(
      (l) =>
        l.title.includes(q) ||
        l.sections.some((s) => s.content.includes(q)),
    );
  }, [query]);

  const HORIZONTAL_PAD = Space[3];
  const usable = width - HORIZONTAL_PAD * 2;
  const cols = Math.max(2, Math.floor((usable + TILE_GAP) / (MIN_TILE + TILE_GAP)));
  const tileWidth = Math.floor((usable - TILE_GAP * (cols - 1)) / cols);

  // Tile height stretches when there's vertical room left after chrome,
  // but never shrinks below the tile width. Caps at 1.2× width so a
  // narrow phone with few lessons doesn't stretch tiles into rectangles.
  const rows = Math.ceil(filtered.length / cols);
  const APPROX_CHROME = 240;
  const availableHeight = Math.max(0, height - APPROX_CHROME);
  const naturalTileHeight = rows > 0 ? (availableHeight - TILE_GAP * (rows - 1)) / rows : tileWidth;
  const tileHeight = Math.max(
    tileWidth,
    Math.min(tileWidth * 1.2, naturalTileHeight),
  );

  const gridData = useMemo<GridItem[]>(() => {
    const remainder = filtered.length % cols;
    if (remainder === 0) return filtered;
    const fillerCount = cols - remainder;
    return [
      ...filtered,
      ...Array.from(
        { length: fillerCount },
        (_, i): FillerItem => ({ __filler: true, id: `__filler-${i}` }),
      ),
    ];
  }, [filtered, cols]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: palette.bg }]}>
      <FlatList<GridItem>
        key={`grid-${cols}`}
        data={gridData}
        keyExtractor={(item) => String(item.id)}
        numColumns={cols}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.headerPad}>
            <SearchBar
              value={query}
              onChange={setQuery}
              palette={palette}
            />
            {lastLessonId !== null && !query ? (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/lesson/[id]',
                    params: { id: lastLessonId },
                  })
                }
                style={({ pressed }) => [
                  styles.resume,
                  { backgroundColor: Palette.brandTint },
                  pressed && { opacity: 0.7 },
                ]}>
                <Ionicons name="play" size={14} color={Palette.brand} />
                <ThemedText
                  variant="footnote"
                  weight="semibold"
                  style={{ color: Palette.brand }}>
                  Continue Lesson {lastLessonId}
                </ThemedText>
              </Pressable>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <ThemedText
            variant="callout"
            tone="secondary"
            style={styles.empty}>
            No results
          </ThemedText>
        }
        renderItem={({ item }) => {
          if (isFiller(item)) {
            return <View style={{ width: tileWidth, height: tileHeight }} />;
          }
          return (
            <LessonTile
              lesson={item}
              completedMap={completed}
              width={tileWidth}
              height={tileHeight}
              palette={palette}
            />
          );
        }}
      />
    </ThemedView>
  );
}

function SearchBar({
  value,
  onChange,
  palette,
}: {
  value: string;
  onChange: (v: string) => void;
  palette: SemanticPalette;
}) {
  return (
    <View style={[styles.searchBar, { backgroundColor: palette.fillTertiary }]}>
      <Ionicons name="search" size={17} color={palette.textTertiary} />
      <TextInput
        style={[
          styles.searchInput,
          { color: palette.text, fontFamily: Fonts.latin },
        ]}
        placeholder="Search lessons"
        placeholderTextColor={palette.placeholder}
        value={value}
        onChangeText={onChange}
        returnKeyType="search"
      />
      {value ? (
        <Pressable onPress={() => onChange('')} hitSlop={10}>
          <Ionicons
            name="close-circle"
            size={17}
            color={palette.textTertiary}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

function LessonTile({
  lesson,
  completedMap,
  width,
  height,
  palette,
}: {
  lesson: Lesson;
  completedMap: Record<string, true>;
  width: number;
  height: number;
  palette: SemanticPalette;
}) {
  const { ratio } = lessonCompletion(
    lesson.id,
    lesson.sections.length,
    completedMap,
  );
  const isComplete = ratio === 1;
  const inProgress = ratio > 0 && ratio < 1;

  const bg = isComplete
    ? Palette.greenSoft
    : inProgress
    ? Palette.brandTint
    : palette.fillTertiary;
  const numeralColor = isComplete
    ? Palette.green
    : inProgress
    ? Palette.brand
    : palette.text;

  // Numeral fontSize derives from the tile so the digit always dominates
  // — ~58% of the smaller dimension, which keeps two-digit numbers safely
  // inside on narrower tiles.
  const numeralSize = Math.floor(Math.min(width, height) * 0.58);

  return (
    <Link
      href={{ pathname: '/lesson/[id]', params: { id: lesson.id } }}
      asChild>
      <Pressable
        style={({ pressed }) => [
          styles.tile,
          { width, height, backgroundColor: bg },
          pressed && { opacity: 0.55 },
        ]}>
        <ThemedText
          script="arabic"
          weight="bold"
          style={{
            fontSize: numeralSize,
            lineHeight: numeralSize * 1.05,
            color: numeralColor,
          }}>
          {toArabicNumber(lesson.id)}
        </ThemedText>
        {(inProgress || isComplete) && (
          <View
            style={[
              styles.tileBar,
              { backgroundColor: 'rgba(120,120,128,0.20)' },
            ]}>
            <View
              style={[
                styles.tileBarFill,
                {
                  width: `${Math.round(ratio * 100)}%`,
                  backgroundColor: numeralColor,
                },
              ]}
            />
          </View>
        )}
        {isComplete ? (
          <View style={[styles.completeBadge, { backgroundColor: Palette.green }]}>
            <Ionicons name="checkmark" size={11} color="white" />
          </View>
        ) : null}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: Space[6] },
  headerPad: {
    paddingHorizontal: Space[3],
    paddingTop: Space[2],
    paddingBottom: Space[3],
    gap: Space[2],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Space[3],
    paddingVertical: Space[2] + 2,
    borderRadius: Radius.md,
    gap: Space[2],
  },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  resume: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
    paddingHorizontal: Space[3],
    paddingVertical: Space[2] + 2,
    borderRadius: Radius.md,
    alignSelf: 'flex-start',
  },
  empty: { textAlign: 'center', paddingVertical: Space[8] },
  columnWrapper: {
    paddingHorizontal: Space[3],
    gap: TILE_GAP,
    marginBottom: TILE_GAP,
  },
  tile: {
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tileBar: {
    position: 'absolute',
    bottom: Space[2],
    left: Space[3],
    right: Space[3],
    height: 2,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  tileBarFill: { height: '100%' },
  completeBadge: {
    position: 'absolute',
    top: Space[2],
    right: Space[2],
    width: 18,
    height: 18,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

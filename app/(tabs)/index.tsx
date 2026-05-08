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
const TILE_GAP = 10;

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
  const tileWidth = (usable - TILE_GAP * (cols - 1)) / cols;

  // Tile height stretches when there's vertical room left after chrome.
  const numRows = Math.ceil(filtered.length / cols);
  const APPROX_CHROME = 240;
  const availableHeight = Math.max(0, height - APPROX_CHROME);
  const naturalTileHeight =
    numRows > 0 ? (availableHeight - TILE_GAP * (numRows - 1)) / numRows : tileWidth;
  const tileHeight = Math.max(
    tileWidth,
    Math.min(tileWidth * 1.2, naturalTileHeight),
  );

  // Group lessons into rows. Last row may have fewer than `cols` lessons,
  // and each tile inside flex-distributes the row width equally — so a
  // 23-lesson catalog in 3 cols ends with a 2-tile row whose tiles each
  // take 50% of the row width. No empty trailing slot.
  const rows = useMemo<Lesson[][]>(() => {
    const out: Lesson[][] = [];
    for (let i = 0; i < filtered.length; i += cols) {
      out.push(filtered.slice(i, i + cols));
    }
    return out;
  }, [filtered, cols]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: palette.bg }]}>
      <FlatList<Lesson[]>
        key={`grid-${cols}`}
        data={rows}
        keyExtractor={(_row, i) => `row-${i}`}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.headerPad}>
            <SearchBar value={query} onChange={setQuery} palette={palette} />
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
        renderItem={({ item: row }) => (
          <View style={styles.row}>
            {row.map((lesson) => (
              <LessonTile
                key={lesson.id}
                lesson={lesson}
                completedMap={completed}
                height={tileHeight}
                palette={palette}
              />
            ))}
          </View>
        )}
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
  height,
  palette,
}: {
  lesson: Lesson;
  completedMap: Record<string, true>;
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
    : palette.fillQuaternary;
  const numeralColor = isComplete
    ? Palette.green
    : inProgress
    ? Palette.brand
    : palette.text;
  const borderColor = isComplete
    ? Palette.green
    : inProgress
    ? Palette.brand
    : palette.separator;

  // Numeral fontSize derives from the tile height so the digit always
  // dominates and two-digit numbers (١٠–٢٣) stay safely inside.
  const numeralSize = Math.floor(height * 0.6);

  return (
    <Link
      href={{ pathname: '/lesson/[id]', params: { id: lesson.id } }}
      asChild>
      <Pressable
        style={({ pressed }) => [
          styles.tile,
          {
            height,
            backgroundColor: bg,
            borderColor,
          },
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
              { backgroundColor: 'rgba(120,120,128,0.18)' },
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
  listContent: {
    paddingHorizontal: Space[3],
    paddingBottom: Space[6],
  },
  headerPad: {
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
  // Each row distributes its tiles via flex: 1 so partial last rows
  // (e.g. 2 tiles in a 3-col layout) still fill the full row width.
  row: {
    flexDirection: 'row',
    gap: TILE_GAP,
    marginBottom: TILE_GAP,
  },
  tile: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
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

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
import { Fonts, Palette, Radius, Semantic, Space } from '@/src/design';
import { lessonCompletion, useProgress } from '@/src/stores/progress';
import type { Lesson } from '@/src/types';

const MIN_TILE = 78;

type FillerItem = { __filler: true; id: string };
type GridItem = Lesson | FillerItem;
const isFiller = (item: GridItem): item is FillerItem => '__filler' in item;

export default function LessonsScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const cols = Math.max(2, Math.floor(width / MIN_TILE));
  const tileSize = width / cols;

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

  const rows = Math.ceil(filtered.length / cols);
  const APPROX_CHROME = 280;
  const availableHeight = Math.max(0, height - APPROX_CHROME);
  const naturalTileHeight = rows > 0 ? availableHeight / rows : tileSize;
  const tileHeight = Math.max(
    tileSize,
    Math.min(tileSize * 1.25, naturalTileHeight),
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList<GridItem>
        key={`grid-${cols}`}
        data={gridData}
        keyExtractor={(item) => String(item.id)}
        numColumns={cols}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={[styles.searchBar, { backgroundColor: palette.fillTertiary }]}>
              <Ionicons name="search" size={17} color={palette.textTertiary} />
              <TextInput
                style={[
                  styles.searchInput,
                  { color: palette.text, fontFamily: Fonts.latin },
                ]}
                placeholder="Search lessons"
                placeholderTextColor={palette.placeholder}
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
              />
              {query ? (
                <Pressable onPress={() => setQuery('')} hitSlop={10}>
                  <Ionicons
                    name="close-circle"
                    size={17}
                    color={palette.textTertiary}
                  />
                </Pressable>
              ) : null}
            </View>
            {lastLessonId !== null ? (
              <Pressable
                style={({ pressed }) => [
                  styles.resume,
                  { backgroundColor: Palette.brandTint },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() =>
                  router.push({
                    pathname: '/lesson/[id]',
                    params: { id: lastLessonId },
                  })
                }>
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
            return <View style={[styles.fillerTile, { height: tileHeight }]} />;
          }
          return (
            <LessonTile
              lesson={item}
              completedMap={completed}
              height={tileHeight}
              borderColor={palette.separator}
            />
          );
        }}
      />
    </ThemedView>
  );
}

function LessonTile({
  lesson,
  completedMap,
  height,
  borderColor,
}: {
  lesson: Lesson;
  completedMap: Record<string, true>;
  height: number;
  borderColor: string;
}) {
  const { ratio } = lessonCompletion(
    lesson.id,
    lesson.sections.length,
    completedMap,
  );
  const isComplete = ratio === 1;
  const inProgress = ratio > 0 && ratio < 1;
  const numeralSize = Math.floor(height * 0.58);

  return (
    <Link
      href={{ pathname: '/lesson/[id]', params: { id: lesson.id } }}
      asChild>
      <Pressable
        style={({ pressed }) => [
          styles.tile,
          { height, borderColor },
          inProgress && styles.tileInProgress,
          isComplete && styles.tileComplete,
          pressed && styles.tilePressed,
        ]}>
        <ThemedText
          script="arabic"
          weight="bold"
          style={[
            styles.tileNumber,
            { fontSize: numeralSize, lineHeight: numeralSize * 1.05 },
            isComplete && { color: Palette.green },
          ]}>
          {toArabicNumber(lesson.id)}
        </ThemedText>
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: 'rgba(120,120,128,0.18)' },
          ]}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.round(ratio * 100)}%` },
              isComplete && styles.progressFillComplete,
            ]}
          />
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: Space[6] },
  header: {
    gap: Space[2],
    paddingHorizontal: Space[3],
    paddingTop: Space[2],
    paddingBottom: Space[3],
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
  tile: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: -StyleSheet.hairlineWidth,
    marginBottom: -StyleSheet.hairlineWidth,
    paddingHorizontal: Space[1],
    paddingTop: Space[2],
    paddingBottom: Space[2],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fillerTile: { flex: 1 },
  tilePressed: { opacity: 0.5 },
  tileInProgress: { borderColor: Palette.brand },
  tileComplete: { borderColor: Palette.green, backgroundColor: Palette.greenSoft },
  tileNumber: { opacity: 0.92 },
  progressTrack: {
    position: 'absolute',
    bottom: Space[2],
    left: Space[3],
    right: Space[3],
    height: 2,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Palette.brand },
  progressFillComplete: { backgroundColor: Palette.green },
});

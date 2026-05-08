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
import { Brand } from '@/constants/theme';
import { toArabicNumber } from '@/src/arabic';
import { LESSONS } from '@/src/data';
import { useEffectiveColorScheme } from '@/src/hooks/use-effective-color-scheme';
import { lessonCompletion, useProgress } from '@/src/stores/progress';
import type { Lesson } from '@/src/types';

const MIN_TILE = 78; // px; columns derived from screen width, no upper cap

type FillerItem = { __filler: true; id: string };
type GridItem = Lesson | FillerItem;
const isFiller = (item: GridItem): item is FillerItem =>
  '__filler' in item;

export default function LessonsScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const cols = Math.max(2, Math.floor(width / MIN_TILE));
  const tileSize = width / cols;

  const [query, setQuery] = useState('');
  const colorScheme = useEffectiveColorScheme();

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

  // Pad with invisible tiles so the last row stays edge-to-edge.
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

  // Stretch tile height when there's vertical room left over after the
  // approximate chrome (stack header, tabs, safe areas, list header).
  const rows = Math.ceil(filtered.length / cols);
  const APPROX_CHROME = 280;
  const availableHeight = Math.max(0, height - APPROX_CHROME);
  const naturalTileHeight = rows > 0 ? availableHeight / rows : tileSize;
  const tileHeight = Math.max(tileSize, Math.min(tileSize * 1.25, naturalTileHeight));

  const isDark = colorScheme === 'dark';
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const inputColor = isDark ? '#ECEDEE' : '#11181C';
  const placeholderColor = isDark ? Brand.muted : '#687076';

  return (
    <ThemedView style={styles.container}>
      <FlatList<GridItem>
        // Force remount when column count changes (e.g. rotation).
        key={`grid-${cols}`}
        data={gridData}
        keyExtractor={(item) => String(item.id)}
        numColumns={cols}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={[styles.searchBar, { backgroundColor: inputBg }]}>
              <Ionicons name="search" size={16} color={placeholderColor} />
              <TextInput
                style={[styles.searchInput, { color: inputColor }]}
                placeholder="Search lessons"
                placeholderTextColor={placeholderColor}
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
              />
              {query ? (
                <Pressable onPress={() => setQuery('')} hitSlop={10}>
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={placeholderColor}
                  />
                </Pressable>
              ) : null}
            </View>
            {lastLessonId !== null ? (
              <Pressable
                style={[styles.resume, { backgroundColor: inputBg }]}
                onPress={() =>
                  router.push({
                    pathname: '/lesson/[id]',
                    params: { id: lastLessonId },
                  })
                }>
                <Ionicons name="play-circle" size={16} color={Brand.accent} />
                <ThemedText style={styles.resumeText}>
                  Resume Lesson {lastLessonId}
                </ThemedText>
              </Pressable>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <ThemedText style={styles.empty}>No results</ThemedText>
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
}: {
  lesson: Lesson;
  completedMap: Record<string, true>;
  height: number;
}) {
  const { ratio } = lessonCompletion(
    lesson.id,
    lesson.sections.length,
    completedMap,
  );
  const isComplete = ratio === 1;
  const inProgress = ratio > 0 && ratio < 1;
  // Numeral fontSize scales with tile height so the digit always dominates.
  const numeralSize = Math.floor(height * 0.6);

  return (
    <Link
      href={{ pathname: '/lesson/[id]', params: { id: lesson.id } }}
      asChild>
      <Pressable
        style={({ pressed }) => [
          styles.tile,
          { height },
          inProgress && styles.tileInProgress,
          isComplete && styles.tileComplete,
          pressed && styles.tilePressed,
        ]}>
        <ThemedText
          style={[
            styles.tileNumber,
            { fontSize: numeralSize, lineHeight: numeralSize * 1.05 },
          ]}>
          {toArabicNumber(lesson.id)}
        </ThemedText>
        <View style={styles.progressTrack}>
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
  listContent: { paddingBottom: 24 },
  header: {
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  resume: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  resumeText: { fontSize: 13, color: Brand.accent, fontWeight: '600' },
  empty: { textAlign: 'center', padding: 32, opacity: 0.6 },
  // flex: 1 makes the tile span its FlatList column wrapper exactly, so
  // tiles always tile across the full row width regardless of RTL or
  // safe-area horizontal insets. Negative margins collapse adjacent
  // hairline borders into single seams.
  tile: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(127,127,127,0.3)',
    marginRight: -StyleSheet.hairlineWidth,
    marginBottom: -StyleSheet.hairlineWidth,
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    overflow: 'hidden',
  },
  fillerTile: { flex: 1 },
  tilePressed: { opacity: 0.45 },
  tileInProgress: { borderColor: Brand.accent },
  tileComplete: {
    borderColor: Brand.success,
    backgroundColor: Brand.successMuted,
  },
  tileNumber: { opacity: 0.92 },
  progressTrack: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    right: 8,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(127,127,127,0.18)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Brand.accent },
  progressFillComplete: { backgroundColor: Brand.success },
});

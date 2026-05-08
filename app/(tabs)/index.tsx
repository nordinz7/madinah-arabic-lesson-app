import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
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

const COLS = 4;

export default function LessonsScreen() {
  const router = useRouter();
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

  const isDark = colorScheme === 'dark';
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const inputColor = isDark ? '#ECEDEE' : '#11181C';
  const placeholderColor = isDark ? Brand.muted : '#687076';

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(l) => String(l.id)}
        numColumns={COLS}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.column}
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
        renderItem={({ item }) => (
          <LessonTile lesson={item} completedMap={completed} />
        )}
      />
    </ThemedView>
  );
}

function LessonTile({
  lesson,
  completedMap,
}: {
  lesson: Lesson;
  completedMap: Record<string, true>;
}) {
  const { ratio } = lessonCompletion(
    lesson.id,
    lesson.sections.length,
    completedMap,
  );
  const isComplete = ratio === 1;
  const inProgress = ratio > 0 && ratio < 1;

  return (
    <Link
      href={{ pathname: '/lesson/[id]', params: { id: lesson.id } }}
      asChild>
      <Pressable
        style={({ pressed }) => [
          styles.tile,
          inProgress && styles.tileInProgress,
          isComplete && styles.tileComplete,
          pressed && styles.tilePressed,
        ]}>
        <ThemedText style={styles.tileNumber}>
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

const TILE_GAP = 8;

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 24 },
  column: { gap: TILE_GAP, marginBottom: TILE_GAP },
  header: { gap: 8, marginBottom: 12 },
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
  tile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(127,127,127,0.35)',
    paddingHorizontal: 6,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  tilePressed: { opacity: 0.45 },
  tileInProgress: {
    borderColor: Brand.accent,
  },
  tileComplete: {
    borderColor: Brand.success,
    backgroundColor: Brand.successMuted,
  },
  tileNumber: {
    fontSize: 36,
    lineHeight: 44,
    opacity: 0.9,
  },
  progressTrack: {
    width: '70%',
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(127,127,127,0.18)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Brand.accent },
  progressFillComplete: { backgroundColor: Brand.success },
});

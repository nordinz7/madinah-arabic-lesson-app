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
import { LESSONS } from '@/src/data';
import { useEffectiveColorScheme } from '@/src/hooks/use-effective-color-scheme';
import { lessonCompletion, useProgress } from '@/src/stores/progress';
import type { Lesson } from '@/src/types';

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
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={[styles.searchBar, { backgroundColor: inputBg }]}>
              <Ionicons name="search" size={17} color={placeholderColor} />
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
                    size={17}
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
                <Ionicons name="play-circle" size={18} color={Brand.accent} />
                <ThemedText style={styles.resumeText}>
                  Resume Lesson {lastLessonId}
                </ThemedText>
                <View style={styles.spacer} />
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={placeholderColor}
                />
              </Pressable>
            ) : null}
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <ThemedText style={styles.empty}>No results</ThemedText>
        }
        renderItem={({ item }) => (
          <LessonRow lesson={item} completedMap={completed} />
        )}
      />
    </ThemedView>
  );
}

function LessonRow({
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
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
        <View
          style={[
            styles.rowNumber,
            isComplete && styles.rowNumberComplete,
            inProgress && styles.rowNumberInProgress,
          ]}>
          {isComplete ? (
            <Ionicons name="checkmark" size={18} color="white" />
          ) : (
            <ThemedText
              style={[
                styles.rowNumberText,
                inProgress && styles.rowNumberTextInProgress,
              ]}>
              {lesson.id}
            </ThemedText>
          )}
        </View>
        <View style={styles.rowBody}>
          <ThemedText type="subtitle" style={styles.rowTitle}>
            {lesson.title}
          </ThemedText>
          {inProgress ? (
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round(ratio * 100)}%` },
                ]}
              />
            </View>
          ) : null}
        </View>
        <Ionicons name="chevron-back" size={18} color={Brand.muted} />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  header: { gap: 10, marginBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  resume: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
  },
  resumeText: { fontSize: 14, color: Brand.accent, fontWeight: '600' },
  spacer: { flex: 1 },
  separator: { height: 1, backgroundColor: 'rgba(127,127,127,0.12)' },
  empty: { textAlign: 'center', padding: 32, opacity: 0.6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 14,
  },
  rowPressed: { opacity: 0.5 },
  rowNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(127,127,127,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowNumberComplete: { backgroundColor: Brand.success },
  rowNumberInProgress: { backgroundColor: 'rgba(10,126,164,0.18)' },
  rowNumberText: { fontWeight: '600', fontSize: 14, opacity: 0.7 },
  rowNumberTextInProgress: { color: Brand.accent, opacity: 1 },
  rowBody: { flex: 1, gap: 6 },
  rowTitle: { fontSize: 22, lineHeight: 32 },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(127,127,127,0.18)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Brand.accent },
});

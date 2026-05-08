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
import { BOOK_TITLE, LESSONS } from '@/src/data';
import { useEffectiveColorScheme } from '@/src/hooks/use-effective-color-scheme';
import { lessonCompletion, useProgress } from '@/src/stores/progress';
import type { Lesson } from '@/src/types';

export default function LessonsScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const colorScheme = useEffectiveColorScheme();

  const completed = useProgress((s) => s.completedSections);
  const bookmarks = useProgress((s) => s.bookmarkedLessons);
  const lastLessonId = useProgress((s) => s.lastLessonId);
  const toggleBookmark = useProgress((s) => s.toggleBookmark);

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
  const inputBg = isDark ? '#2A2D2F' : '#F1F3F5';
  const inputColor = isDark ? '#ECEDEE' : '#11181C';
  const placeholderColor = isDark ? '#9BA1A6' : '#687076';

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(l) => String(l.id)}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText type="title" style={styles.bookTitle}>
              {BOOK_TITLE}
            </ThemedText>
            <ThemedText style={styles.bookSubtitle}>
              {LESSONS.length} دروس
            </ThemedText>
            <View style={[styles.searchBar, { backgroundColor: inputBg }]}>
              <Ionicons name="search" size={18} color={placeholderColor} />
              <TextInput
                style={[styles.searchInput, { color: inputColor }]}
                placeholder="ابحث عن درس أو مفهوم..."
                placeholderTextColor={placeholderColor}
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
              />
              {query ? (
                <Pressable onPress={() => setQuery('')} hitSlop={10}>
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={placeholderColor}
                  />
                </Pressable>
              ) : null}
            </View>
            {lastLessonId !== null ? (
              <Pressable
                style={styles.resume}
                onPress={() =>
                  router.push({
                    pathname: '/lesson/[id]',
                    params: { id: lastLessonId },
                  })
                }>
                <Ionicons name="play-circle" size={20} color="#0a7ea4" />
                <ThemedText style={styles.resumeText}>
                  متابعة الدرس {lastLessonId}
                </ThemedText>
              </Pressable>
            ) : null}
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <ThemedText style={styles.empty}>لا توجد نتائج</ThemedText>
        }
        renderItem={({ item }) => (
          <LessonRow
            lesson={item}
            completedMap={completed}
            bookmarked={Boolean(bookmarks[item.id])}
            onToggleBookmark={() => toggleBookmark(item.id)}
          />
        )}
      />
    </ThemedView>
  );
}

function LessonRow({
  lesson,
  completedMap,
  bookmarked,
  onToggleBookmark,
}: {
  lesson: Lesson;
  completedMap: Record<string, true>;
  bookmarked: boolean;
  onToggleBookmark: () => void;
}) {
  const { done, total, ratio } = lessonCompletion(
    lesson.id,
    lesson.sections.length,
    completedMap,
  );

  return (
    <View style={styles.rowWrap}>
      <Link
        href={{ pathname: '/lesson/[id]', params: { id: lesson.id } }}
        asChild>
        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
          <View style={styles.rowNumber}>
            <ThemedText style={styles.rowNumberText}>{lesson.id}</ThemedText>
          </View>
          <View style={styles.rowBody}>
            <ThemedText type="subtitle" style={styles.rowTitle}>
              {lesson.title}
            </ThemedText>
            <View style={styles.rowMetaLine}>
              <ThemedText style={styles.rowMeta}>
                {done}/{total} أقسام
              </ThemedText>
              {ratio === 1 ? (
                <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
              ) : null}
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round(ratio * 100)}%` },
                ]}
              />
            </View>
          </View>
        </Pressable>
      </Link>
      <Pressable
        onPress={onToggleBookmark}
        hitSlop={12}
        style={styles.bookmarkBtn}>
        <Ionicons
          name={bookmarked ? 'bookmark' : 'bookmark-outline'}
          size={22}
          color={bookmarked ? '#F59E0B' : '#9BA1A6'}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 16, paddingVertical: 16 },
  header: { paddingVertical: 12, marginBottom: 8 },
  bookTitle: { fontSize: 26, lineHeight: 40, textAlign: 'center' },
  bookSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  searchInput: { flex: 1, fontSize: 16, padding: 0 },
  resume: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    marginTop: 12,
  },
  resumeText: { fontSize: 15, color: '#0a7ea4', fontWeight: '600' },
  separator: { height: 12 },
  empty: { textAlign: 'center', padding: 32, opacity: 0.6 },
  rowWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(127,127,127,0.08)',
    gap: 12,
  },
  rowPressed: { opacity: 0.6 },
  rowNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowNumberText: { color: 'white', fontWeight: '700', fontSize: 16 },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 22, lineHeight: 32 },
  rowMetaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  rowMeta: { fontSize: 13, opacity: 0.6 },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(127,127,127,0.2)',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#0a7ea4' },
  bookmarkBtn: { padding: 6 },
});

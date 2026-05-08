import { Link } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BOOK_TITLE, LESSONS } from '@/src/data';
import type { Lesson } from '@/src/types';

export default function LessonsScreen() {
  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={LESSONS}
        keyExtractor={(l) => String(l.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText type="title" style={styles.bookTitle}>
              {BOOK_TITLE}
            </ThemedText>
            <ThemedText style={styles.bookSubtitle}>
              {LESSONS.length} دروس
            </ThemedText>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => <LessonRow lesson={item} />}
      />
    </ThemedView>
  );
}

function LessonRow({ lesson }: { lesson: Lesson }) {
  return (
    <Link href={{ pathname: '/lesson/[id]', params: { id: lesson.id } }} asChild>
      <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
        <View style={styles.rowNumber}>
          <ThemedText style={styles.rowNumberText}>{lesson.id}</ThemedText>
        </View>
        <View style={styles.rowBody}>
          <ThemedText type="subtitle" style={styles.rowTitle}>
            {lesson.title}
          </ThemedText>
          <ThemedText style={styles.rowMeta}>
            {lesson.sections.length} أقسام
          </ThemedText>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 16, paddingVertical: 16 },
  header: { paddingVertical: 12, marginBottom: 8 },
  bookTitle: { fontSize: 28, lineHeight: 40, textAlign: 'center' },
  bookSubtitle: { fontSize: 14, textAlign: 'center', opacity: 0.6, marginTop: 4 },
  separator: { height: 12 },
  row: {
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
  rowMeta: { fontSize: 13, opacity: 0.6, marginTop: 2 },
});

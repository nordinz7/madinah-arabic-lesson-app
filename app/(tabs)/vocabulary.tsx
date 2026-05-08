import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LESSONS } from '@/src/data';
import type { VocabItem } from '@/src/types';

type VocabRow = VocabItem & { lessonId: number };

export default function VocabularyScreen() {
  const vocab = useMemo<VocabRow[]>(() => {
    const all: VocabRow[] = [];
    for (const lesson of LESSONS) {
      for (const section of lesson.sections) {
        if (section.vocab?.length) {
          for (const item of section.vocab) {
            all.push({ ...item, lessonId: lesson.id });
          }
        }
      }
    }
    return all;
  }, []);

  if (vocab.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.empty}>
          <Ionicons
            name="library-outline"
            size={56}
            color="#9BA1A6"
            style={styles.emptyIcon}
          />
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            المفردات ستظهر هنا
          </ThemedText>
          <ThemedText style={styles.emptyBody}>
            عند إضافة مفردات إلى أي درس، ستجمع تلقائياً في هذه الصفحة قابلة
            للبحث والمراجعة.
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={vocab}
        keyExtractor={(v, i) => `${v.arabic}-${i}`}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <ThemedText type="subtitle" style={styles.arabic}>
              {item.arabic}
            </ThemedText>
            {item.translit ? (
              <ThemedText style={styles.translit}>{item.translit}</ThemedText>
            ) : null}
            {item.meaning ? (
              <ThemedText style={styles.meaning}>{item.meaning}</ThemedText>
            ) : null}
            <ThemedText style={styles.lessonRef}>
              الدرس {item.lessonId}
            </ThemedText>
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  separator: { height: 10 },
  row: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(127,127,127,0.08)',
  },
  arabic: { fontSize: 22, lineHeight: 32 },
  translit: { fontSize: 13, opacity: 0.6, marginTop: 2 },
  meaning: { fontSize: 14, marginTop: 4 },
  lessonRef: { fontSize: 12, opacity: 0.5, marginTop: 6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyIcon: { marginBottom: 16, opacity: 0.6 },
  emptyTitle: { textAlign: 'center', marginBottom: 8 },
  emptyBody: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 320,
  },
});

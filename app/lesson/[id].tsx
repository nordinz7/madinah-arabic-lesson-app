import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getLesson } from '@/src/data';
import { SECTION_PALETTE } from '@/src/section-style';
import { SECTION_LABELS_AR, SECTION_LABELS_EN, type Section } from '@/src/types';

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = getLesson(Number(id));

  if (!lesson) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.missing}>الدرس غير موجود</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: `الدرس ${lesson.id}` }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <ThemedText style={styles.lessonNumber}>الدرس {lesson.id}</ThemedText>
          <ThemedText type="title" style={styles.title}>
            {lesson.title}
          </ThemedText>
        </View>
        <View style={styles.sections}>
          {lesson.sections.map((s) => (
            <SectionCard key={s.order} section={s} />
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function SectionCard({ section }: { section: Section }) {
  const palette = SECTION_PALETTE[section.type];
  return (
    <View style={[styles.card, { borderColor: palette.border }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: palette.bg }]}>
          <ThemedText style={[styles.badgeText, { color: palette.fg }]}>
            {SECTION_LABELS_AR[section.type]}
          </ThemedText>
        </View>
        <ThemedText style={styles.badgeEn}>
          {SECTION_LABELS_EN[section.type]}
        </ThemedText>
      </View>
      <ThemedText style={styles.cardContent}>{section.content}</ThemedText>
      {section.meaning ? (
        <ThemedText style={styles.cardMeaning}>{section.meaning}</ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16 },
  missing: { padding: 24, fontSize: 18, textAlign: 'center' },
  header: { paddingVertical: 16, alignItems: 'center' },
  lessonNumber: { fontSize: 14, opacity: 0.6, marginBottom: 4 },
  title: { fontSize: 32, lineHeight: 44, textAlign: 'center' },
  sections: { marginTop: 12, gap: 12 },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    backgroundColor: 'rgba(127,127,127,0.04)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { fontSize: 13, fontWeight: '600' },
  badgeEn: { fontSize: 12, opacity: 0.5 },
  cardContent: { fontSize: 22, lineHeight: 36 },
  cardMeaning: { fontSize: 14, opacity: 0.7, marginTop: 8, lineHeight: 22 },
});

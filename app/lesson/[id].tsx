import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { maybeStripTashkeel } from '@/src/arabic';
import { getLesson } from '@/src/data';
import { SECTION_PALETTE } from '@/src/section-style';
import { lessonCompletion, useProgress } from '@/src/stores/progress';
import { useSettings } from '@/src/stores/settings';
import {
  SECTION_LABELS_AR,
  SECTION_LABELS_EN,
  type Section,
} from '@/src/types';

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lessonId = Number(id);
  const lesson = getLesson(lessonId);

  const setLastLesson = useProgress((s) => s.setLastLesson);
  const completedMap = useProgress((s) => s.completedSections);
  const toggleSection = useProgress((s) => s.toggleSection);
  const isSectionCompleted = useProgress((s) => s.isSectionCompleted);

  const fontScale = useSettings((s) => s.fontScale);
  const showTashkeel = useSettings((s) => s.showTashkeel);

  useEffect(() => {
    if (lesson) setLastLesson(lesson.id);
  }, [lesson, setLastLesson]);

  if (!lesson) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.missing}>الدرس غير موجود</ThemedText>
      </ThemedView>
    );
  }

  const { done, total, ratio } = lessonCompletion(
    lesson.id,
    lesson.sections.length,
    completedMap,
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: `الدرس ${lesson.id}` }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <ThemedText style={styles.lessonNumber}>الدرس {lesson.id}</ThemedText>
          <ThemedText
            type="title"
            style={[
              styles.title,
              { fontSize: 30 * fontScale, lineHeight: 44 * fontScale },
            ]}>
            {maybeStripTashkeel(lesson.title, showTashkeel)}
          </ThemedText>
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round(ratio * 100)}%` },
                ]}
              />
            </View>
            <ThemedText style={styles.progressText}>
              {done}/{total}
            </ThemedText>
          </View>
        </View>
        <View style={styles.sections}>
          {lesson.sections.map((s) => (
            <SectionCard
              key={s.order}
              section={s}
              completed={isSectionCompleted(lesson.id, s.order)}
              onToggle={() => toggleSection(lesson.id, s.order)}
              fontScale={fontScale}
              showTashkeel={showTashkeel}
            />
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function SectionCard({
  section,
  completed,
  onToggle,
  fontScale,
  showTashkeel,
}: {
  section: Section;
  completed: boolean;
  onToggle: () => void;
  fontScale: number;
  showTashkeel: boolean;
}) {
  const palette = SECTION_PALETTE[section.type];
  return (
    <View
      style={[
        styles.card,
        { borderColor: palette.border },
        completed && styles.cardCompleted,
      ]}>
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: palette.bg }]}>
          <ThemedText style={[styles.badgeText, { color: palette.fg }]}>
            {SECTION_LABELS_AR[section.type]}
          </ThemedText>
        </View>
        <ThemedText style={styles.badgeEn}>
          {SECTION_LABELS_EN[section.type]}
        </ThemedText>
        <View style={styles.cardSpacer} />
        <Pressable onPress={onToggle} hitSlop={10}>
          <Ionicons
            name={completed ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={completed ? '#16A34A' : '#9BA1A6'}
          />
        </Pressable>
      </View>
      <ThemedText
        style={[
          styles.cardContent,
          { fontSize: 22 * fontScale, lineHeight: 36 * fontScale },
        ]}>
        {maybeStripTashkeel(section.content, showTashkeel)}
      </ThemedText>
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
  title: { textAlign: 'center' },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    width: '100%',
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(127,127,127,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#0a7ea4' },
  progressText: { fontSize: 13, opacity: 0.7 },
  sections: { marginTop: 12, gap: 12 },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    backgroundColor: 'rgba(127,127,127,0.04)',
  },
  cardCompleted: { opacity: 0.7 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  cardSpacer: { flex: 1 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { fontSize: 13, fontWeight: '600' },
  badgeEn: { fontSize: 12, opacity: 0.5 },
  cardContent: {},
  cardMeaning: { fontSize: 14, opacity: 0.7, marginTop: 8, lineHeight: 22 },
});

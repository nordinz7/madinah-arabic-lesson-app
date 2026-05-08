import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { InterlinearText } from '@/components/interlinear-text';
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
  type ExerciseItem,
  type Section,
  type VocabItem,
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
  const arabic = (s: string) => maybeStripTashkeel(s, showTashkeel);
  const subtitleParts = [section.translit, section.meaning].filter(Boolean);

  return (
    <View style={[styles.section, completed && styles.sectionCompleted]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.typeDot, { backgroundColor: palette.fg }]} />
        <ThemedText style={styles.typeLabel}>
          {SECTION_LABELS_AR[section.type]}
        </ThemedText>
        <View style={styles.cardSpacer} />
        <Pressable onPress={onToggle} hitSlop={10}>
          <Ionicons
            name={completed ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={completed ? '#16A34A' : '#9BA1A6'}
          />
        </Pressable>
      </View>
      <ThemedText
        type="title"
        style={[
          styles.sectionTitle,
          { fontSize: 26 * fontScale, lineHeight: 38 * fontScale },
        ]}>
        {arabic(section.content)}
      </ThemedText>
      {subtitleParts.length ? (
        <ThemedText style={styles.sectionSub}>
          {subtitleParts.join(' · ')}
        </ThemedText>
      ) : null}
      {section.notes ? <NotesBlock notes={section.notes} /> : null}
      {section.examples?.length ? (
        <ExamplesBlock
          examples={section.examples}
          fontScale={fontScale}
          arabic={arabic}
        />
      ) : null}
      {section.vocab?.length ? (
        <VocabBlock vocab={section.vocab} arabic={arabic} />
      ) : null}
      {section.items?.length ? (
        <ItemsBlock items={section.items} fontScale={fontScale} arabic={arabic} />
      ) : null}
    </View>
  );
}

function NotesBlock({ notes }: { notes: string }) {
  const lines = notes
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return (
      <View style={styles.notesBlock}>
        <ThemedText style={styles.notesText}>{notes}</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.notesBlock}>
      {lines.map((line, i) => (
        <View key={i} style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText style={[styles.notesText, styles.bulletText]}>
            {line}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

function ExamplesBlock({
  examples,
  fontScale,
  arabic,
}: {
  examples: ExerciseItem[];
  fontScale: number;
  arabic: (s: string) => string;
}) {
  return (
    <View style={styles.subBlock}>
      <ThemedText style={styles.subHeading}>Examples</ThemedText>
      {examples.map((ex, i) => (
        <View key={i} style={styles.exampleRow}>
          <PhraseLine
            text={ex.prompt}
            tokens={ex.tokens}
            fontScale={fontScale}
            arabic={arabic}
          />
          {ex.answer ? (
            <View style={styles.examplePromptAnswer}>
              <PhraseLine
                text={ex.answer}
                tokens={ex.answerTokens}
                fontScale={fontScale}
                arabic={arabic}
                muted
              />
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function PhraseLine({
  text,
  tokens,
  fontScale,
  arabic,
  muted,
}: {
  text: string;
  tokens?: ExerciseItem['tokens'];
  fontScale: number;
  arabic: (s: string) => string;
  muted?: boolean;
}) {
  if (tokens && tokens.length > 0) {
    return (
      <View style={muted ? styles.phraseMuted : undefined}>
        <InterlinearText tokens={tokens} size={20 * fontScale} />
      </View>
    );
  }
  return (
    <ThemedText
      style={[
        { fontSize: 19 * fontScale, lineHeight: 30 * fontScale },
        muted && { opacity: 0.85 },
      ]}>
      {arabic(text)}
    </ThemedText>
  );
}

function VocabBlock({
  vocab,
  arabic,
}: {
  vocab: VocabItem[];
  arabic: (s: string) => string;
}) {
  return (
    <View style={styles.subBlock}>
      <ThemedText style={styles.subHeading}>المفردات · Vocabulary</ThemedText>
      <View style={styles.vocabGrid}>
        {vocab.map((v, i) => (
          <View key={i} style={styles.vocabRow}>
            <View style={styles.vocabMain}>
              <View style={styles.vocabHeadline}>
                <ThemedText style={styles.vocabArabic}>
                  {arabic(v.arabic)}
                </ThemedText>
                {v.gender ? (
                  <View
                    style={[
                      styles.genderChip,
                      v.gender === 'f' ? styles.genderChipF : styles.genderChipM,
                    ]}>
                    <ThemedText
                      style={[
                        styles.genderChipText,
                        v.gender === 'f'
                          ? styles.genderChipTextF
                          : styles.genderChipTextM,
                      ]}>
                      {v.gender === 'f' ? 'مؤنّث' : 'مذكّر'}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
              {v.translit ? (
                <ThemedText style={styles.vocabTranslit}>{v.translit}</ThemedText>
              ) : null}
              {v.meaning ? (
                <ThemedText style={styles.vocabMeaning}>{v.meaning}</ThemedText>
              ) : null}
              {v.plural ? (
                <View style={styles.vocabPluralRow}>
                  <ThemedText style={styles.vocabPluralLabel}>ج.</ThemedText>
                  <ThemedText style={styles.vocabPluralAr}>
                    {arabic(v.plural)}
                  </ThemedText>
                  {v.pluralTranslit ? (
                    <ThemedText style={styles.vocabPluralTranslit}>
                      {v.pluralTranslit}
                    </ThemedText>
                  ) : null}
                </View>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function ItemsBlock({
  items,
  fontScale,
  arabic,
}: {
  items: ExerciseItem[];
  fontScale: number;
  arabic: (s: string) => string;
}) {
  return (
    <View style={styles.subBlock}>
      <ThemedText style={styles.subHeading}>التَّمْرِين · Exercise items</ThemedText>
      {items.map((item, i) => (
        <ExerciseRow
          key={i}
          item={item}
          index={i + 1}
          fontScale={fontScale}
          arabic={arabic}
        />
      ))}
    </View>
  );
}

function ExerciseRow({
  item,
  index,
  fontScale,
  arabic,
}: {
  item: ExerciseItem;
  index: number;
  fontScale: number;
  arabic: (s: string) => string;
}) {
  const [revealed, setRevealed] = useState(false);
  const hasAnswer = Boolean(item.answer);

  return (
    <View style={styles.exerciseRow}>
      <View style={styles.exerciseRowHeader}>
        <ThemedText style={styles.exerciseIndexText}>{index}.</ThemedText>
        <View style={styles.exerciseBody}>
          <PhraseLine
            text={item.prompt}
            tokens={item.tokens}
            fontScale={fontScale}
            arabic={arabic}
          />
          {item.hint ? (
            <View style={styles.hintChip}>
              <Ionicons name="image-outline" size={12} color="#6B7280" />
              <ThemedText style={styles.hintChipText}>
                {arabic(item.hint)}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>
      {hasAnswer ? (
        <Pressable
          onPress={() => setRevealed((r) => !r)}
          style={styles.answerWrap}
          hitSlop={4}>
          <View style={[styles.answerInner, !revealed && styles.answerTextHidden]}>
            <PhraseLine
              text={item.answer!}
              tokens={item.answerTokens}
              fontScale={fontScale}
              arabic={arabic}
            />
          </View>
          {!revealed ? (
            <View style={styles.answerOverlay}>
              <Ionicons name="eye-outline" size={14} color="#0a7ea4" />
              <ThemedText style={styles.answerOverlayText}>
                Tap to reveal answer
              </ThemedText>
            </View>
          ) : null}
        </Pressable>
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
  sections: { marginTop: 8 },
  section: {
    paddingTop: 24,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(127,127,127,0.25)',
  },
  sectionCompleted: { opacity: 0.7 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  cardSpacer: { flex: 1 },
  typeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  typeLabel: {
    fontSize: 11,
    opacity: 0.55,
    letterSpacing: 0.3,
  },
  sectionTitle: { textAlign: 'right' },
  sectionSub: { fontSize: 13, opacity: 0.55, marginTop: 4, fontStyle: 'italic' },
  notesBlock: {
    backgroundColor: 'rgba(127,127,127,0.07)',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    gap: 6,
  },
  notesText: { fontSize: 13, lineHeight: 21, opacity: 0.85 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#0a7ea4',
    marginTop: 8,
  },
  bulletText: { flex: 1 },
  subBlock: { marginTop: 18 },
  subHeading: {
    fontSize: 11,
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  exampleRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(127,127,127,0.14)',
  },
  examplePromptAnswer: { marginTop: 6 },
  phraseMuted: { opacity: 0.85 },
  vocabGrid: { gap: 6 },
  vocabRow: {
    backgroundColor: 'rgba(127,127,127,0.07)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  vocabMain: { gap: 2 },
  vocabHeadline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  vocabArabic: { fontSize: 20, lineHeight: 30, flexShrink: 1 },
  vocabTranslit: { fontSize: 13, opacity: 0.55, fontStyle: 'italic' },
  vocabMeaning: { fontSize: 14, opacity: 0.9 },
  vocabPluralRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  vocabPluralLabel: {
    fontSize: 11,
    opacity: 0.5,
    fontWeight: '600',
  },
  vocabPluralAr: { fontSize: 15, lineHeight: 22 },
  vocabPluralTranslit: { fontSize: 12, opacity: 0.55, fontStyle: 'italic' },
  genderChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  genderChipM: { backgroundColor: 'rgba(10,126,164,0.12)' },
  genderChipF: { backgroundColor: 'rgba(244,114,182,0.16)' },
  genderChipText: { fontSize: 10, fontWeight: '700' },
  genderChipTextM: { color: '#0a7ea4' },
  genderChipTextF: { color: '#BE185D' },
  exerciseRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(127,127,127,0.14)',
  },
  exerciseRowHeader: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  exerciseIndexText: {
    fontSize: 13,
    opacity: 0.45,
    minWidth: 22,
    textAlign: 'right',
    marginTop: 2,
  },
  exerciseBody: { flex: 1 },
  exerciseMeaning: { fontSize: 13, opacity: 0.6, marginTop: 4 },
  hintChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(127,127,127,0.12)',
    borderRadius: 999,
    marginTop: 6,
  },
  hintChipText: { fontSize: 12, color: '#6B7280' },
  answerWrap: {
    marginTop: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  answerInner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(22,163,74,0.10)',
    borderRadius: 10,
    minHeight: 40,
    justifyContent: 'center',
  },
  answerText: { color: '#15803D' },
  answerTextHidden: { opacity: 0 },
  answerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(127,127,127,0.18)',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  answerOverlayText: { fontSize: 12, color: '#0a7ea4', fontWeight: '600' },
});

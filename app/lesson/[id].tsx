import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { InterlinearText } from '@/components/interlinear-text';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { maybeStripTashkeel } from '@/src/arabic';
import { getLesson } from '@/src/data';
import { Palette, Radius, Space } from '@/src/design';
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
          <ThemedText
            variant="caption1"
            tone="tertiary"
            style={styles.lessonKicker}>
            LESSON {lesson.id}
          </ThemedText>
          <ThemedText
            script="arabic"
            weight="bold"
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
            <ThemedText variant="footnote" tone="secondary" weight="medium">
              {done} / {total}
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
        <ThemedText
          variant="caption2"
          weight="semibold"
          tone="tertiary"
          style={styles.typeLabel}>
          {SECTION_LABELS_AR[section.type]}
        </ThemedText>
        <View style={styles.cardSpacer} />
        <Pressable onPress={onToggle} hitSlop={10}>
          <Ionicons
            name={completed ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={completed ? Palette.green : '#9BA1A6'}
          />
        </Pressable>
      </View>
      <ThemedText
        script="arabic"
        weight="bold"
        style={[
          styles.sectionTitle,
          { fontSize: 26 * fontScale, lineHeight: 38 * fontScale },
        ]}>
        {arabic(section.content)}
      </ThemedText>
      {subtitleParts.length ? (
        <ThemedText
          variant="subheadline"
          tone="tertiary"
          style={styles.sectionSub}>
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
        <ThemedText variant="footnote" tone="secondary">
          {notes}
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.notesBlock}>
      {lines.map((line, i) => (
        <View key={i} style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <ThemedText
            variant="footnote"
            tone="secondary"
            style={styles.bulletText}>
            {line}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

function SubBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.subBlock}>
      <ThemedText
        variant="caption2"
        weight="semibold"
        tone="tertiary"
        style={styles.subHeading}>
        {title.toUpperCase()}
      </ThemedText>
      {children}
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
    <SubBlock title="Examples">
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
    </SubBlock>
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
    <SubBlock title="Vocabulary">
      <View style={styles.vocabGrid}>
        {vocab.map((v, i) => (
          <View key={i} style={styles.vocabRow}>
            <View style={styles.vocabMain}>
              <View style={styles.vocabHeadline}>
                <ThemedText
                  script="arabic"
                  weight="bold"
                  variant="title3"
                  style={styles.vocabArabic}>
                  {arabic(v.arabic)}
                </ThemedText>
                {v.gender ? (
                  <View
                    style={[
                      styles.genderChip,
                      v.gender === 'f'
                        ? { backgroundColor: Palette.feminineTint }
                        : { backgroundColor: Palette.brandTint },
                    ]}>
                    <ThemedText
                      variant="caption2"
                      weight="bold"
                      style={{
                        color: v.gender === 'f' ? Palette.feminine : Palette.brand,
                      }}>
                      {v.gender === 'f' ? 'feminine' : 'masculine'}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
              {v.translit ? (
                <ThemedText
                  variant="footnote"
                  tone="secondary"
                  style={styles.italic}>
                  {v.translit}
                </ThemedText>
              ) : null}
              {v.meaning ? (
                <ThemedText variant="callout">{v.meaning}</ThemedText>
              ) : null}
              {v.plural ? (
                <View style={styles.vocabPluralRow}>
                  <ThemedText variant="caption1" weight="semibold" tone="tertiary">
                    pl.
                  </ThemedText>
                  <ThemedText script="arabic" variant="callout">
                    {arabic(v.plural)}
                  </ThemedText>
                  {v.pluralTranslit ? (
                    <ThemedText
                      variant="caption1"
                      tone="tertiary"
                      style={styles.italic}>
                      {v.pluralTranslit}
                    </ThemedText>
                  ) : null}
                </View>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    </SubBlock>
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
    <SubBlock title="Exercise items">
      {items.map((item, i) => (
        <ExerciseRow
          key={i}
          item={item}
          index={i + 1}
          fontScale={fontScale}
          arabic={arabic}
        />
      ))}
    </SubBlock>
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
        <ThemedText
          variant="footnote"
          tone="tertiary"
          style={styles.exerciseIndexText}>
          {index}.
        </ThemedText>
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
              <ThemedText variant="caption1" tone="secondary">
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
              <Ionicons name="eye-outline" size={14} color={Palette.brand} />
              <ThemedText
                variant="caption1"
                weight="semibold"
                style={{ color: Palette.brand }}>
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
  scroll: { padding: Space[4] },
  missing: { padding: Space[6], textAlign: 'center' },
  header: {
    paddingTop: Space[3],
    paddingBottom: Space[5],
    alignItems: 'center',
  },
  lessonKicker: {
    letterSpacing: 1.4,
    marginBottom: Space[2],
  },
  title: { textAlign: 'center' },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
    marginTop: Space[5],
    width: '100%',
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(120,120,128,0.20)',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Palette.brand },
  sections: { marginTop: Space[2] },
  section: {
    paddingTop: Space[6],
    paddingBottom: Space[2],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(120,120,128,0.25)',
  },
  sectionCompleted: { opacity: 0.7 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
    marginBottom: Space[1],
  },
  cardSpacer: { flex: 1 },
  typeDot: { width: 6, height: 6, borderRadius: 3 },
  typeLabel: { letterSpacing: 0.6 },
  sectionTitle: { textAlign: 'right' },
  sectionSub: { marginTop: Space[1], fontStyle: 'italic' },
  notesBlock: {
    backgroundColor: 'rgba(120,120,128,0.10)',
    borderRadius: Radius.md,
    paddingHorizontal: Space[3],
    paddingVertical: Space[3],
    marginTop: Space[3],
    gap: Space[1] + 2,
  },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Space[2] },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.brand,
    marginTop: 8,
  },
  bulletText: { flex: 1 },
  subBlock: { marginTop: Space[5] },
  subHeading: { letterSpacing: 1, marginBottom: Space[3] },
  exampleRow: {
    paddingVertical: Space[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(120,120,128,0.18)',
  },
  examplePromptAnswer: { marginTop: Space[1] + 2 },
  phraseMuted: { opacity: 0.85 },
  italic: { fontStyle: 'italic' },
  vocabGrid: { gap: Space[1] + 2 },
  vocabRow: {
    backgroundColor: 'rgba(120,120,128,0.10)',
    paddingHorizontal: Space[3],
    paddingVertical: Space[3],
    borderRadius: Radius.md,
  },
  vocabMain: { gap: Space[1] - 2 },
  vocabHeadline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space[2],
  },
  vocabArabic: { flexShrink: 1 },
  vocabPluralRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[1] + 2,
    marginTop: Space[1],
  },
  genderChip: {
    paddingHorizontal: Space[2],
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  exerciseRow: {
    paddingVertical: Space[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(120,120,128,0.18)',
  },
  exerciseRowHeader: {
    flexDirection: 'row',
    gap: Space[2],
    alignItems: 'flex-start',
  },
  exerciseIndexText: {
    minWidth: 22,
    textAlign: 'right',
    marginTop: 2,
  },
  exerciseBody: { flex: 1 },
  hintChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[1],
    alignSelf: 'flex-start',
    paddingHorizontal: Space[2],
    paddingVertical: 3,
    backgroundColor: 'rgba(120,120,128,0.16)',
    borderRadius: Radius.full,
    marginTop: Space[2],
  },
  answerWrap: {
    marginTop: Space[2],
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  answerInner: {
    paddingHorizontal: Space[3],
    paddingVertical: Space[2],
    backgroundColor: 'rgba(48,185,95,0.12)',
    borderRadius: Radius.md,
    minHeight: 40,
    justifyContent: 'center',
  },
  answerTextHidden: { opacity: 0 },
  answerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(120,120,128,0.18)',
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space[1] + 2,
  },
});

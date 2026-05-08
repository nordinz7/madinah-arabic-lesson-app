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
import { maybeStripTashkeel, toArabicNumber } from '@/src/arabic';
import { LESSONS } from '@/src/data';
import { useEffectiveColorScheme } from '@/src/hooks/use-effective-color-scheme';
import {
  Fonts,
  Palette,
  Radius,
  Semantic,
  type SemanticPalette,
  Space,
} from '@/src/design';
import { lessonCompletion, useProgress } from '@/src/stores/progress';
import { useSettings } from '@/src/stores/settings';
import type { Lesson, Section } from '@/src/types';

const MIN_TILE = 150;
const TILE_GAP = 6;

type FillerItem = { __filler: true; id: string };
type GridItem = Lesson | FillerItem;
const isFiller = (item: GridItem): item is FillerItem => '__filler' in item;

type Signature = { ar: string; meaning: string; section: Section | null };

/**
 * Each lesson's tile is identified by an "Arabic signature" — the topic
 * concept the lesson teaches (هذا, ذلك, هذه, الممنوع من الصرف, …) rather
 * than just its number. We pull this from the first topic > grammar >
 * question section, trimming structural separators that distract from
 * the headline word.
 */
function lessonSignature(lesson: Lesson): Signature {
  const candidate =
    lesson.sections.find((s) => s.type === 'topic') ??
    lesson.sections.find((s) => s.type === 'grammar') ??
    lesson.sections.find((s) => s.type === 'question') ??
    lesson.sections[0] ??
    null;
  if (!candidate) return { ar: '', meaning: '', section: null };
  // First chunk before transformation arrows / commas — keeps the
  // headline word, drops the "→ derived form" half.
  const ar = candidate.content.split(/\s*[>،]\s*/)[0].trim();
  return {
    ar,
    meaning: candidate.meaning ?? candidate.translit ?? '',
    section: candidate,
  };
}

export default function LessonsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');

  const colorScheme = useEffectiveColorScheme();
  const palette = Semantic[colorScheme];
  const showTashkeel = useSettings((s) => s.showTashkeel);

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

  const HORIZONTAL_PAD = Space[3];
  const usable = width - HORIZONTAL_PAD * 2;
  const cols = Math.max(2, Math.floor((usable + TILE_GAP) / (MIN_TILE + TILE_GAP)));
  const tileWidth = Math.floor((usable - TILE_GAP * (cols - 1)) / cols);
  const tileHeight = Math.round(tileWidth / 0.95); // a hair taller than wide

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

  // Choose the featured lesson: last visited if it's still in the
  // filtered list, otherwise the first lesson.
  const featureLesson =
    (lastLessonId !== null && filtered.find((l) => l.id === lastLessonId)) ||
    filtered[0] ||
    null;
  const isFreshStart = lastLessonId === null;

  return (
    <ThemedView style={[styles.container, { backgroundColor: palette.bg }]}>
      <FlatList<GridItem>
        key={`grid-${cols}`}
        data={gridData}
        keyExtractor={(item) => String(item.id)}
        numColumns={cols}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <View style={styles.headerPad}>
              <SearchBar
                value={query}
                onChange={setQuery}
                palette={palette}
              />
              {featureLesson && !query ? (
                <FeatureCard
                  lesson={featureLesson}
                  fresh={isFreshStart}
                  showTashkeel={showTashkeel}
                  completedMap={completed}
                  onPress={() =>
                    router.push({
                      pathname: '/lesson/[id]',
                      params: { id: featureLesson.id },
                    })
                  }
                />
              ) : null}
              <ThemedText
                variant="caption2"
                weight="semibold"
                tone="tertiary"
                style={styles.gridHeader}>
                {query ? 'RESULTS' : 'ALL LESSONS'}
              </ThemedText>
            </View>
          </View>
        }
        ListEmptyComponent={
          <ThemedText
            variant="callout"
            tone="secondary"
            style={styles.empty}>
            No results
          </ThemedText>
        }
        renderItem={({ item }) => {
          if (isFiller(item)) {
            return <View style={{ width: tileWidth, height: tileHeight }} />;
          }
          return (
            <LessonTile
              lesson={item}
              completedMap={completed}
              showTashkeel={showTashkeel}
              width={tileWidth}
              height={tileHeight}
              palette={palette}
            />
          );
        }}
      />
    </ThemedView>
  );
}

function SearchBar({
  value,
  onChange,
  palette,
}: {
  value: string;
  onChange: (v: string) => void;
  palette: SemanticPalette;
}) {
  return (
    <View style={[styles.searchBar, { backgroundColor: palette.fillTertiary }]}>
      <Ionicons name="search" size={17} color={palette.textTertiary} />
      <TextInput
        style={[
          styles.searchInput,
          { color: palette.text, fontFamily: Fonts.latin },
        ]}
        placeholder="Search lessons"
        placeholderTextColor={palette.placeholder}
        value={value}
        onChangeText={onChange}
        returnKeyType="search"
      />
      {value ? (
        <Pressable onPress={() => onChange('')} hitSlop={10}>
          <Ionicons
            name="close-circle"
            size={17}
            color={palette.textTertiary}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

function FeatureCard({
  lesson,
  fresh,
  showTashkeel,
  completedMap,
  onPress,
}: {
  lesson: Lesson;
  fresh: boolean;
  showTashkeel: boolean;
  completedMap: Record<string, true>;
  onPress: () => void;
}) {
  const { done, total, ratio } = lessonCompletion(
    lesson.id,
    lesson.sections.length,
    completedMap,
  );
  const pct = Math.round(ratio * 100);
  const sig = lessonSignature(lesson);
  const kicker = fresh ? 'START HERE' : 'CONTINUE';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.feature,
        { backgroundColor: Palette.brandTint },
        pressed && { opacity: 0.85 },
      ]}>
      <View style={styles.featureHeader}>
        <View style={styles.featureKickerRow}>
          <ThemedText
            variant="caption2"
            weight="semibold"
            style={[styles.kickerText, { color: Palette.brand }]}>
            {kicker}
          </ThemedText>
          <View style={[styles.numberBadge, { backgroundColor: Palette.brand }]}>
            <ThemedText
              script="arabic"
              weight="bold"
              style={styles.numberBadgeText}>
              {toArabicNumber(lesson.id)}
            </ThemedText>
          </View>
        </View>
        <Ionicons name="play-circle" size={28} color={Palette.brand} />
      </View>
      <View style={styles.featureBody}>
        <ThemedText
          script="arabic"
          weight="bold"
          adjustsFontSizeToFit
          numberOfLines={2}
          style={[styles.featureSignature, { color: Palette.brand }]}>
          {maybeStripTashkeel(sig.ar, showTashkeel)}
        </ThemedText>
        {sig.meaning ? (
          <ThemedText
            variant="callout"
            tone="secondary"
            numberOfLines={1}
            style={styles.featureMeaning}>
            {sig.meaning}
          </ThemedText>
        ) : null}
      </View>
      <View style={styles.featureFooter}>
        <View style={styles.featureTrack}>
          <View
            style={[
              styles.featureFill,
              { width: `${pct}%`, backgroundColor: Palette.brand },
            ]}
          />
        </View>
        <ThemedText
          variant="caption1"
          weight="semibold"
          style={{ color: Palette.brand, minWidth: 70, textAlign: 'right' }}>
          {fresh ? 'Begin →' : `${done}/${total} · ${pct}%`}
        </ThemedText>
      </View>
    </Pressable>
  );
}

function LessonTile({
  lesson,
  completedMap,
  showTashkeel,
  width,
  height,
  palette,
}: {
  lesson: Lesson;
  completedMap: Record<string, true>;
  showTashkeel: boolean;
  width: number;
  height: number;
  palette: SemanticPalette;
}) {
  const { ratio } = lessonCompletion(
    lesson.id,
    lesson.sections.length,
    completedMap,
  );
  const isComplete = ratio === 1;
  const inProgress = ratio > 0 && ratio < 1;
  const sig = lessonSignature(lesson);

  const bg = isComplete
    ? Palette.greenSoft
    : inProgress
    ? Palette.brandTint
    : palette.fillTertiary;
  const accentColor = isComplete
    ? Palette.green
    : inProgress
    ? Palette.brand
    : palette.text;
  const numberBadgeBg = isComplete
    ? Palette.green
    : inProgress
    ? Palette.brand
    : palette.fill;
  const numberBadgeText = isComplete || inProgress ? 'white' : palette.text;

  return (
    <Link
      href={{ pathname: '/lesson/[id]', params: { id: lesson.id } }}
      asChild>
      <Pressable
        style={({ pressed }) => [
          styles.tile,
          { width, height, backgroundColor: bg },
          pressed && { opacity: 0.55 },
        ]}>
        <View style={[styles.numberBadge, { backgroundColor: numberBadgeBg }]}>
          <ThemedText
            script="arabic"
            weight="bold"
            style={[
              styles.numberBadgeText,
              { color: numberBadgeText },
            ]}>
            {toArabicNumber(lesson.id)}
          </ThemedText>
        </View>
        <View style={styles.tileBody}>
          <ThemedText
            script="arabic"
            weight="bold"
            adjustsFontSizeToFit
            numberOfLines={2}
            style={[
              styles.tileSignature,
              { color: accentColor, fontSize: width * 0.24 },
            ]}>
            {maybeStripTashkeel(sig.ar, showTashkeel)}
          </ThemedText>
          {sig.meaning ? (
            <ThemedText
              variant="caption1"
              tone="secondary"
              numberOfLines={1}
              style={styles.tileMeaning}>
              {sig.meaning}
            </ThemedText>
          ) : null}
        </View>
        {(inProgress || isComplete) && (
          <View
            style={[
              styles.tileBar,
              { backgroundColor: 'rgba(120,120,128,0.20)' },
            ]}>
            <View
              style={[
                styles.tileBarFill,
                {
                  width: `${Math.round(ratio * 100)}%`,
                  backgroundColor: accentColor,
                },
              ]}
            />
          </View>
        )}
        {isComplete ? (
          <View style={[styles.completeBadge, { backgroundColor: Palette.green }]}>
            <Ionicons name="checkmark" size={11} color="white" />
          </View>
        ) : null}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: Space[6] },
  headerPad: {
    paddingHorizontal: Space[3],
    paddingTop: Space[2],
    gap: Space[3],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Space[3],
    paddingVertical: Space[2] + 2,
    borderRadius: Radius.md,
    gap: Space[2],
  },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  empty: { textAlign: 'center', paddingVertical: Space[8] },

  // Feature card -----------------------------------------------------------
  feature: {
    borderRadius: Radius.xl,
    padding: Space[4],
    gap: Space[3],
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featureKickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
  },
  kickerText: { letterSpacing: 1.4 },
  featureBody: { gap: 4 },
  featureSignature: { fontSize: 44, lineHeight: 56 },
  featureMeaning: { fontStyle: 'italic' },
  featureFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
    marginTop: Space[1],
  },
  featureTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(120,120,128,0.20)',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  featureFill: { height: '100%' },

  // Grid header -----------------------------------------------------------
  gridHeader: { letterSpacing: 1.2, marginTop: Space[2], marginBottom: -Space[1] },

  // Tile ------------------------------------------------------------------
  columnWrapper: {
    paddingHorizontal: Space[3],
    gap: TILE_GAP,
    marginBottom: TILE_GAP,
  },
  tile: {
    borderRadius: Radius.lg,
    padding: Space[3],
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  numberBadge: {
    minWidth: 26,
    height: 22,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    alignSelf: 'flex-start',
  },
  numberBadgeText: { fontSize: 13, lineHeight: 16 },
  tileBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Space[2],
  },
  tileSignature: {
    textAlign: 'center',
    lineHeight: undefined,
  },
  tileMeaning: { marginTop: 4, textAlign: 'center', maxWidth: '100%' },
  tileBar: {
    height: 3,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginHorizontal: -Space[1],
  },
  tileBarFill: { height: '100%' },
  completeBadge: {
    position: 'absolute',
    top: Space[2],
    right: Space[2],
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

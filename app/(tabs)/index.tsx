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
import type { Lesson } from '@/src/types';

const MIN_TILE = 78;
const TILE_GAP = 4;

type FillerItem = { __filler: true; id: string };
type GridItem = Lesson | FillerItem;
const isFiller = (item: GridItem): item is FillerItem => '__filler' in item;

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

  // Compute grid metrics. cols flexes with screen width; tile width comes
  // from a usable area = screenWidth - outer padding - inter-tile gaps.
  const HORIZONTAL_PAD = Space[3];
  const usable = width - HORIZONTAL_PAD * 2;
  const cols = Math.max(2, Math.floor((usable + TILE_GAP) / (MIN_TILE + TILE_GAP)));
  const tileSize = Math.floor(
    (usable - TILE_GAP * (cols - 1)) / cols,
  );

  // Pad with invisible tiles so the last row stays square.
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

  // The "feature" card target — last visited if known, else Lesson 1.
  const featureLessonId =
    lastLessonId !== null && filtered.some((l) => l.id === lastLessonId)
      ? lastLessonId
      : filtered[0]?.id;
  const featureLesson = featureLessonId
    ? filtered.find((l) => l.id === featureLessonId)
    : null;
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
                <ContinueCard
                  lesson={featureLesson}
                  fresh={isFreshStart}
                  showTashkeel={showTashkeel}
                  completedMap={completed}
                  palette={palette}
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
                ALL LESSONS
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
            return <View style={{ width: tileSize, height: tileSize }} />;
          }
          return (
            <LessonTile
              lesson={item}
              completedMap={completed}
              size={tileSize}
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

function ContinueCard({
  lesson,
  fresh,
  showTashkeel,
  completedMap,
  palette,
  onPress,
}: {
  lesson: Lesson;
  fresh: boolean;
  showTashkeel: boolean;
  completedMap: Record<string, true>;
  palette: SemanticPalette;
  onPress: () => void;
}) {
  const { done, total, ratio } = lessonCompletion(
    lesson.id,
    lesson.sections.length,
    completedMap,
  );
  const pct = Math.round(ratio * 100);
  const kicker = fresh ? 'START HERE' : 'CONTINUE LEARNING';
  const titleSection = lesson.sections.find((s) => s.type === 'topic');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.featureCard,
        { backgroundColor: Palette.brandTint },
        pressed && { opacity: 0.85 },
      ]}>
      <View style={styles.featureHeader}>
        <ThemedText
          variant="caption2"
          weight="semibold"
          style={[styles.featureKicker, { color: Palette.brand }]}>
          {kicker}
        </ThemedText>
        <Ionicons name="chevron-forward" size={18} color={Palette.brand} />
      </View>
      <View style={styles.featureBody}>
        <ThemedText
          script="arabic"
          weight="bold"
          style={[styles.featureNumeral, { color: Palette.brand }]}>
          {toArabicNumber(lesson.id)}
        </ThemedText>
        <View style={styles.featureMain}>
          <ThemedText
            script="arabic"
            weight="bold"
            variant="title2"
            numberOfLines={1}>
            {maybeStripTashkeel(lesson.title, showTashkeel)}
          </ThemedText>
          {titleSection ? (
            <ThemedText
              variant="footnote"
              tone="secondary"
              numberOfLines={1}
              style={styles.featureSub}>
              {titleSection.translit
                ? `${titleSection.translit} · ${titleSection.meaning ?? ''}`
                : titleSection.meaning ?? ''}
            </ThemedText>
          ) : null}
        </View>
      </View>
      <View style={styles.featureProgress}>
        <View
          style={[
            styles.featureTrack,
            { backgroundColor: 'rgba(120,120,128,0.20)' },
          ]}>
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
          style={{ color: Palette.brand, minWidth: 60, textAlign: 'right' }}>
          {fresh ? 'Begin' : `${done}/${total} · ${pct}%`}
        </ThemedText>
      </View>
    </Pressable>
  );
}

function LessonTile({
  lesson,
  completedMap,
  size,
  palette,
}: {
  lesson: Lesson;
  completedMap: Record<string, true>;
  size: number;
  palette: SemanticPalette;
}) {
  const { ratio } = lessonCompletion(
    lesson.id,
    lesson.sections.length,
    completedMap,
  );
  const isComplete = ratio === 1;
  const inProgress = ratio > 0 && ratio < 1;
  const numeralSize = Math.floor(size * 0.5);

  const bg = isComplete
    ? Palette.greenSoft
    : inProgress
    ? Palette.brandTint
    : palette.fillTertiary;
  const numeralColor = isComplete
    ? Palette.green
    : inProgress
    ? Palette.brand
    : palette.text;

  return (
    <Link
      href={{ pathname: '/lesson/[id]', params: { id: lesson.id } }}
      asChild>
      <Pressable
        style={({ pressed }) => [
          styles.tile,
          {
            width: size,
            height: size,
            backgroundColor: bg,
          },
          pressed && { opacity: 0.55 },
        ]}>
        <ThemedText
          script="arabic"
          weight="bold"
          style={{
            fontSize: numeralSize,
            lineHeight: numeralSize * 1.05,
            color: numeralColor,
          }}>
          {toArabicNumber(lesson.id)}
        </ThemedText>
        {inProgress ? (
          <View style={[styles.tileBar, { backgroundColor: 'rgba(120,120,128,0.20)' }]}>
            <View
              style={[
                styles.tileBarFill,
                {
                  width: `${Math.round(ratio * 100)}%`,
                  backgroundColor: Palette.brand,
                },
              ]}
            />
          </View>
        ) : null}
        {isComplete ? (
          <View style={styles.tileCheck}>
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

  // Feature / continue card -------------------------------------------------
  featureCard: {
    borderRadius: Radius.xl,
    padding: Space[4],
    gap: Space[3],
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featureKicker: { letterSpacing: 1.2 },
  featureBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[3],
  },
  featureNumeral: {
    fontSize: 64,
    lineHeight: 64,
    minWidth: 64,
    textAlign: 'center',
  },
  featureMain: { flex: 1, gap: 2 },
  featureSub: { fontStyle: 'italic' },
  featureProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
  },
  featureTrack: {
    flex: 1,
    height: 4,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  featureFill: { height: '100%' },

  // Grid header -------------------------------------------------------------
  gridHeader: {
    letterSpacing: 1.2,
    marginTop: Space[2],
    marginBottom: -Space[2],
  },

  // Grid tiles --------------------------------------------------------------
  columnWrapper: {
    paddingHorizontal: Space[3],
    gap: TILE_GAP,
    marginBottom: TILE_GAP,
  },
  tile: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tileBar: {
    position: 'absolute',
    bottom: Space[2],
    left: Space[3],
    right: Space[3],
    height: 2,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  tileBarFill: { height: '100%' },
  tileCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: Radius.full,
    backgroundColor: Palette.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

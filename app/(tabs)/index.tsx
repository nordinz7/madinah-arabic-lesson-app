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
import { toArabicNumber } from '@/src/arabic';
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
import type { Lesson } from '@/src/types';

const MIN_TILE = 120;
const HAIRLINE = StyleSheet.hairlineWidth;

export default function LessonsScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [query, setQuery] = useState('');

  const colorScheme = useEffectiveColorScheme();
  const palette = Semantic[colorScheme];

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

  const cols = Math.max(2, Math.floor(width / MIN_TILE));
  const numRows = Math.ceil(filtered.length / cols);

  // Tile height stretches when there's vertical room left after chrome.
  // Reference width comes from the actual screen/cols ratio (no padding).
  const tileWidthRef = width / cols;
  const APPROX_CHROME = 240;
  const availableHeight = Math.max(0, height - APPROX_CHROME);
  const naturalTileHeight = numRows > 0 ? availableHeight / numRows : tileWidthRef;
  const tileHeight = Math.max(
    tileWidthRef,
    Math.min(tileWidthRef * 1.15, naturalTileHeight),
  );

  // Group into rows so last row's items flex-distribute the row width.
  const rows = useMemo<Lesson[][]>(() => {
    const out: Lesson[][] = [];
    for (let i = 0; i < filtered.length; i += cols) {
      out.push(filtered.slice(i, i + cols));
    }
    return out;
  }, [filtered, cols]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: palette.bg }]}>
      <FlatList<Lesson[]>
        key={`grid-${cols}`}
        data={rows}
        keyExtractor={(_row, i) => `row-${i}`}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.headerPad}>
            <SearchBar value={query} onChange={setQuery} palette={palette} />
            {lastLessonId !== null && !query ? (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/lesson/[id]',
                    params: { id: lastLessonId },
                  })
                }
                style={({ pressed }) => [
                  styles.resume,
                  { backgroundColor: Palette.brandTint },
                  pressed && { opacity: 0.7 },
                ]}>
                <Ionicons name="play" size={14} color={Palette.brand} />
                <ThemedText
                  variant="footnote"
                  weight="semibold"
                  style={{ color: Palette.brand }}>
                  Continue Lesson {lastLessonId}
                </ThemedText>
              </Pressable>
            ) : null}
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
        renderItem={({ item: row }) => (
          <View style={styles.row}>
            {row.map((lesson) => (
              <LessonTile
                key={lesson.id}
                lesson={lesson}
                completedMap={completed}
                height={tileHeight}
                palette={palette}
              />
            ))}
          </View>
        )}
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

function LessonTile({
  lesson,
  completedMap,
  height,
  palette,
}: {
  lesson: Lesson;
  completedMap: Record<string, true>;
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

  const bg = isComplete
    ? Palette.greenSoft
    : inProgress
    ? Palette.brandTint
    : palette.fillQuaternary;
  const numeralColor = isComplete
    ? Palette.green
    : inProgress
    ? Palette.brand
    : palette.text;

  // Numeral fills the tile aggressively — 72% of height. Two-digit
  // numbers stay inside thanks to a small horizontal padding allowance.
  const numeralSize = Math.floor(height * 0.72);

  return (
    <Link
      href={{ pathname: '/lesson/[id]', params: { id: lesson.id } }}
      asChild>
      <Pressable
        style={({ pressed }) => [
          styles.tile,
          {
            height,
            backgroundColor: bg,
            borderColor: palette.separator,
          },
          pressed && { opacity: 0.5 },
        ]}>
        <ThemedText
          script="arabic"
          weight="bold"
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{
            fontSize: numeralSize,
            lineHeight: numeralSize * 1.0,
            color: numeralColor,
          }}>
          {toArabicNumber(lesson.id)}
        </ThemedText>
        {(inProgress || isComplete) && (
          <View
            style={[
              styles.tileBar,
              { backgroundColor: 'rgba(120,120,128,0.18)' },
            ]}>
            <View
              style={[
                styles.tileBarFill,
                {
                  width: `${Math.round(ratio * 100)}%`,
                  backgroundColor: numeralColor,
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
    paddingBottom: Space[3],
    gap: Space[2],
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
  resume: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
    paddingHorizontal: Space[3],
    paddingVertical: Space[2] + 2,
    borderRadius: Radius.md,
    alignSelf: 'flex-start',
  },
  empty: { textAlign: 'center', paddingVertical: Space[8] },
  // Row spans the full screen width. Tiles inside flex-distribute that
  // width equally — partial last rows still reach edge-to-edge because
  // 2 tiles each get 50% of the row instead of 33% each + a 33% void.
  row: {
    flexDirection: 'row',
    width: '100%',
    alignSelf: 'stretch',
  },
  // Tiles touch each other. Negative right + bottom margin collapse
  // adjacent hairline borders into single seams (otherwise borders
  // double up to a full pixel between tiles).
  tile: {
    flex: 1,
    borderWidth: HAIRLINE,
    marginRight: -HAIRLINE,
    marginBottom: -HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: Space[1],
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
  completeBadge: {
    position: 'absolute',
    top: Space[2],
    right: Space[2],
    width: 18,
    height: 18,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

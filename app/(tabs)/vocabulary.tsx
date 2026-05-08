import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LESSONS } from '@/src/data';
import { useEffectiveColorScheme } from '@/src/hooks/use-effective-color-scheme';
import { Palette, Radius, Semantic, type SemanticPalette, Space } from "@/src/design";
import type { VocabItem } from '@/src/types';

type VocabRow = VocabItem & { lessonId: number };

export default function VocabularyScreen() {
  const colorScheme = useEffectiveColorScheme();
  const palette = Semantic[colorScheme];

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
    return <EmptyState palette={palette} />;
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: palette.bgSecondary }]}>
      <FlatList
        data={vocab}
        keyExtractor={(v, i) => `${v.arabic}-${i}`}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: palette.separator }]} />
        )}
        renderItem={({ item }) => (
          <View style={[styles.row, { backgroundColor: palette.bgTertiary }]}>
            <View style={styles.rowMain}>
              <ThemedText script="arabic" weight="bold" variant="title3">
                {item.arabic}
              </ThemedText>
              {item.translit ? (
                <ThemedText
                  variant="footnote"
                  tone="secondary"
                  style={styles.italic}>
                  {item.translit}
                </ThemedText>
              ) : null}
              {item.meaning ? (
                <ThemedText variant="callout">{item.meaning}</ThemedText>
              ) : null}
            </View>
            <View style={[styles.lessonChip, { backgroundColor: palette.fillTertiary }]}>
              <ThemedText variant="caption2" tone="secondary">
                L{item.lessonId}
              </ThemedText>
            </View>
          </View>
        )}
      />
    </ThemedView>
  );
}

function EmptyState({ palette }: { palette: SemanticPalette }) {
  return (
    <ThemedView style={[styles.container, styles.emptyContainer]}>
      <View style={[styles.iconCircle, { backgroundColor: Palette.brandTint }]}>
        <Ionicons name="library-outline" size={36} color={Palette.brand} />
      </View>
      <ThemedText variant="title2" weight="bold" style={styles.emptyTitle}>
        Vocabulary lives here
      </ThemedText>
      <ThemedText
        variant="callout"
        tone="secondary"
        style={styles.emptyBody}>
        As lessons get digitized, every word from their vocabulary tables
        will appear in this tab — searchable, browseable, and ready for
        spaced-repetition review.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: Space[4] },
  separator: { height: StyleSheet.hairlineWidth, marginVertical: Space[2] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[3],
    paddingHorizontal: Space[4],
    paddingVertical: Space[3],
    borderRadius: Radius.lg,
  },
  rowMain: { flex: 1, gap: 2 },
  italic: { fontStyle: 'italic' },
  lessonChip: {
    paddingHorizontal: Space[2],
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Space[6],
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space[5],
  },
  emptyTitle: { textAlign: 'center', marginBottom: Space[2] },
  emptyBody: {
    textAlign: 'center',
    maxWidth: 320,
  },
});

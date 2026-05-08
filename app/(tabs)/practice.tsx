import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEffectiveColorScheme } from '@/src/hooks/use-effective-color-scheme';
import { Palette, Radius, Semantic, type SemanticPalette, Space } from "@/src/design";

export default function PracticeScreen() {
  const colorScheme = useEffectiveColorScheme();
  const palette = Semantic[colorScheme];

  return (
    <ThemedView style={[styles.container, { backgroundColor: palette.bgSecondary }]}>
      <View style={styles.empty}>
        <View style={[styles.iconCircle, { backgroundColor: Palette.brandTint }]}>
          <Ionicons name="repeat-outline" size={36} color={Palette.brand} />
        </View>
        <ThemedText variant="title2" weight="bold" style={styles.emptyTitle}>
          Daily review
        </ThemedText>
        <ThemedText variant="callout" tone="secondary" style={styles.emptyBody}>
          Spaced-repetition flashcards will appear here as you encounter
          new vocabulary. The system tests you on words you've seen, at
          increasing intervals, so they stick in long-term memory.
        </ThemedText>
        <View style={styles.statsRow}>
          <Stat label="Today" value="0" palette={palette} />
          <Stat label="Total" value="0" palette={palette} />
          <Stat label="Streak" value="0" palette={palette} />
        </View>
      </View>
    </ThemedView>
  );
}

function Stat({
  label,
  value,
  palette,
}: {
  label: string;
  value: string;
  palette: SemanticPalette;
}) {
  return (
    <View style={[styles.stat, { backgroundColor: palette.bgTertiary }]}>
      <ThemedText variant="title1" weight="bold">
        {value}
      </ThemedText>
      <ThemedText variant="caption1" tone="secondary" style={{ marginTop: 2 }}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Space[6],
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
    maxWidth: 340,
    marginBottom: Space[8],
  },
  statsRow: { flexDirection: 'row', gap: Space[3], width: '100%' },
  stat: {
    flex: 1,
    paddingVertical: Space[4],
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
});

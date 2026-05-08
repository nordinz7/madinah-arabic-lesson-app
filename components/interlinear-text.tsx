import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { maybeStripTashkeel } from '@/src/arabic';
import { useSettings } from '@/src/stores/settings';
import type { Token } from '@/src/types';

type Props = {
  tokens: Token[];
  /** Base Arabic font size; English gloss is rendered at ~50% of this. */
  size?: number;
  /** Override tashkeel display (defaults to user setting). */
  showTashkeel?: boolean;
};

/**
 * Renders an Arabic phrase as a stack of word columns: Arabic on top,
 * English gloss underneath. Columns flow right-to-left (RTL natural)
 * and wrap on narrow screens.
 */
export function InterlinearText({ tokens, size = 22, showTashkeel }: Props) {
  const userShowTashkeel = useSettings((s) => s.showTashkeel);
  const showHarakat = showTashkeel ?? userShowTashkeel;

  return (
    <View style={styles.row}>
      {tokens.map((t, i) => (
        <View key={i} style={styles.column}>
          <ThemedText
            style={[styles.arabic, { fontSize: size, lineHeight: size * 1.6 }]}>
            {maybeStripTashkeel(t.ar, showHarakat)}
          </ThemedText>
          <ThemedText style={styles.english}>{t.en}</ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    columnGap: 14,
    rowGap: 8,
  },
  column: {
    alignItems: 'center',
    minWidth: 50,
  },
  arabic: {
    textAlign: 'center',
  },
  english: {
    fontSize: 11,
    lineHeight: 15,
    opacity: 0.55,
    textAlign: 'center',
  },
});

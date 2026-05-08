import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand } from '@/constants/theme';

export default function PracticeScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.empty}>
        <Ionicons
          name="repeat-outline"
          size={56}
          color={Brand.muted}
          style={styles.emptyIcon}
        />
        <ThemedText type="subtitle" style={styles.emptyTitle}>
          المراجعة اليومية
        </ThemedText>
        <ThemedText style={styles.emptyBody}>
          ستظهر هنا بطاقات المراجعة بنظام التكرار المتباعد بمجرد إضافة المفردات
          إلى الدروس. سيتم اختبارك على المفردات التي درستها لتثبيتها في الذاكرة
          طويلة المدى.
        </ThemedText>
        <View style={styles.statsRow}>
          <Stat label="بطاقات اليوم" value="0" />
          <Stat label="إجمالي المفردات" value="0" />
          <Stat label="السلسلة" value="0" />
        </View>
      </View>
    </ThemedView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText type="title" style={styles.statValue}>
        {value}
      </ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyIcon: { marginBottom: 16, opacity: 0.6 },
  emptyTitle: { textAlign: 'center', marginBottom: 8 },
  emptyBody: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 15,
    lineHeight: 26,
    maxWidth: 340,
    marginBottom: 32,
  },
  statsRow: { flexDirection: 'row', gap: 12 },
  stat: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(127,127,127,0.08)',
    alignItems: 'center',
    minWidth: 90,
  },
  statValue: { fontSize: 28, lineHeight: 36 },
  statLabel: { fontSize: 12, opacity: 0.6, marginTop: 4 },
});

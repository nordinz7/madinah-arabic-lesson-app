import Ionicons from '@expo/vector-icons/Ionicons';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand } from '@/constants/theme';
import { useEffectiveColorScheme } from '@/src/hooks/use-effective-color-scheme';
import { useProgress } from '@/src/stores/progress';
import {
  AUDIO_SPEED_OPTIONS,
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  type ThemePreference,
  useSettings,
} from '@/src/stores/settings';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'النظام' },
  { value: 'light', label: 'فاتح' },
  { value: 'dark', label: 'داكن' },
];

export default function SettingsScreen() {
  const colorScheme = useEffectiveColorScheme();
  const cardBg = colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';

  const fontScale = useSettings((s) => s.fontScale);
  const showTashkeel = useSettings((s) => s.showTashkeel);
  const theme = useSettings((s) => s.theme);
  const audioSpeed = useSettings((s) => s.audioSpeed);
  const setFontScale = useSettings((s) => s.setFontScale);
  const setShowTashkeel = useSettings((s) => s.setShowTashkeel);
  const setTheme = useSettings((s) => s.setTheme);
  const setAudioSpeed = useSettings((s) => s.setAudioSpeed);

  const resetProgress = useProgress((s) => s.reset);

  const onResetPress = () => {
    Alert.alert(
      'إعادة تعيين التقدم',
      'سيتم حذف جميع علامات الإكمال والمفضلة. لا يمكن التراجع.',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'حذف', style: 'destructive', onPress: () => resetProgress() },
      ],
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Section title="القراءة">
          <Row label={`حجم الخط (${fontScale.toFixed(2)}×)`} hint="يؤثر على نص الدروس">
            <View style={styles.stepperRow}>
              <Stepper
                disabled={fontScale <= FONT_SCALE_MIN + 0.001}
                onPress={() => setFontScale(fontScale - 0.1)}
                icon="remove"
              />
              <View style={[styles.fontPreview, { backgroundColor: cardBg }]}>
                <ThemedText
                  style={{ fontSize: 22 * fontScale, lineHeight: 36 * fontScale }}>
                  بِسْمِ اللَّهِ
                </ThemedText>
              </View>
              <Stepper
                disabled={fontScale >= FONT_SCALE_MAX - 0.001}
                onPress={() => setFontScale(fontScale + 0.1)}
                icon="add"
              />
            </View>
          </Row>
          <Row label="إظهار التشكيل" hint="الحركات على الحروف العربية">
            <Switch
              value={showTashkeel}
              onValueChange={setShowTashkeel}
              trackColor={{ false: Brand.muted, true: Brand.accent }}
            />
          </Row>
        </Section>

        <Section title="المظهر">
          <Row label="السمة">
            <SegmentedControl
              options={THEME_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              value={theme}
              onChange={(v) => setTheme(v)}
            />
          </Row>
        </Section>

        <Section title="الصوت">
          <Row label="سرعة التشغيل">
            <SegmentedControl
              options={AUDIO_SPEED_OPTIONS.map((s) => ({
                value: s,
                label: `${s}×`,
              }))}
              value={audioSpeed}
              onChange={(v) => setAudioSpeed(v)}
            />
          </Row>
        </Section>

        <Section title="البيانات">
          <Pressable onPress={onResetPress} style={[styles.dangerRow, { backgroundColor: cardBg }]}>
            <Ionicons name="trash-outline" size={20} color={Brand.danger} />
            <ThemedText style={styles.dangerText}>إعادة تعيين التقدم</ThemedText>
          </Pressable>
        </Section>

        <ThemedText style={styles.footer}>
          تطبيق مفتوح المصدر · مدينة العربية
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLabel}>
        <ThemedText style={styles.rowLabelText}>{label}</ThemedText>
        {hint ? <ThemedText style={styles.rowHint}>{hint}</ThemedText> : null}
      </View>
      <View>{children}</View>
    </View>
  );
}

function Stepper({
  icon,
  onPress,
  disabled,
}: {
  icon: 'add' | 'remove';
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.stepperBtn,
        disabled && styles.stepperBtnDisabled,
        pressed && !disabled && styles.stepperBtnPressed,
      ]}>
      <Ionicons name={icon} size={20} color={disabled ? Brand.muted : Brand.accent} />
    </Pressable>
  );
}

function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segments}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={String(opt.value)}
            onPress={() => onChange(opt.value)}
            style={[styles.segment, active && styles.segmentActive]}>
            <ThemedText
              style={[styles.segmentText, active && styles.segmentTextActive]}>
              {opt.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionBody: { gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowLabel: { flex: 1 },
  rowLabelText: { fontSize: 16 },
  rowHint: { fontSize: 12, opacity: 0.55, marginTop: 2 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(10,126,164,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnPressed: { opacity: 0.6 },
  stepperBtnDisabled: { backgroundColor: 'rgba(127,127,127,0.1)' },
  fontPreview: {
    minWidth: 70,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  segments: {
    flexDirection: 'row',
    backgroundColor: 'rgba(127,127,127,0.12)',
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  segment: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  segmentActive: { backgroundColor: Brand.accent },
  segmentText: { fontSize: 14 },
  segmentTextActive: { color: 'white', fontWeight: '600' },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
  },
  dangerText: { fontSize: 16, color: Brand.danger },
  footer: { textAlign: 'center', opacity: 0.4, fontSize: 12, marginTop: 16 },
});

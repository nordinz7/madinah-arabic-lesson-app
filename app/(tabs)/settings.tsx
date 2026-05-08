import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEffectiveColorScheme } from '@/src/hooks/use-effective-color-scheme';
import { Palette, Radius, Semantic, type SemanticPalette, Space } from "@/src/design";
import { useProgress } from '@/src/stores/progress';
import {
  AUDIO_SPEED_OPTIONS,
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  type ThemePreference,
  useSettings,
} from '@/src/stores/settings';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function SettingsScreen() {
  const colorScheme = useEffectiveColorScheme();
  const palette = Semantic[colorScheme];

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
      'Reset progress',
      'All completion marks and bookmarks will be removed. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => resetProgress() },
      ],
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: palette.bgSecondary }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Section title="Reading" palette={palette}>
          <Row
            label="Arabic font size"
            hint={`${fontScale.toFixed(2)}× — affects lesson body text`}
            palette={palette}>
            <View style={styles.stepperRow}>
              <Stepper
                disabled={fontScale <= FONT_SCALE_MIN + 0.001}
                onPress={() => setFontScale(fontScale - 0.1)}
                icon="remove"
              />
              <View style={[styles.fontPreview, { backgroundColor: palette.fillTertiary }]}>
                <ThemedText
                  script="arabic"
                  style={{
                    fontSize: 22 * fontScale,
                    lineHeight: 36 * fontScale,
                  }}>
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
          <Separator palette={palette} />
          <Row
            label="Show tashkeel"
            hint="Diacritic marks on Arabic letters"
            palette={palette}>
            <Switch
              value={showTashkeel}
              onValueChange={setShowTashkeel}
              trackColor={{ false: palette.fill, true: Palette.brand }}
              ios_backgroundColor={palette.fill}
            />
          </Row>
        </Section>

        <Section title="Appearance" palette={palette}>
          <Row label="Theme" palette={palette}>
            <SegmentedControl
              options={THEME_OPTIONS}
              value={theme}
              onChange={(v) => setTheme(v)}
              palette={palette}
            />
          </Row>
        </Section>

        <Section title="Audio" palette={palette}>
          <Row label="Playback speed" palette={palette}>
            <SegmentedControl
              options={AUDIO_SPEED_OPTIONS.map((s) => ({
                value: s,
                label: `${s}×`,
              }))}
              value={audioSpeed}
              onChange={(v) => setAudioSpeed(v)}
              palette={palette}
            />
          </Row>
        </Section>

        <Section title="Data" palette={palette}>
          <Pressable
            onPress={onResetPress}
            style={({ pressed }) => [
              styles.dangerRow,
              { backgroundColor: palette.bgTertiary },
              pressed && { opacity: 0.6 },
            ]}>
            <Ionicons name="trash-outline" size={20} color={Palette.red} />
            <ThemedText
              variant="body"
              weight="medium"
              style={{ color: Palette.red }}>
              Reset progress
            </ThemedText>
          </Pressable>
        </Section>

        <ThemedText
          variant="caption1"
          tone="tertiary"
          style={styles.footer}>
          Open source · Madinah Arabic
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

function Section({
  title,
  palette,
  children,
}: {
  title: string;
  palette: SemanticPalette;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <ThemedText
        variant="footnote"
        weight="semibold"
        tone="secondary"
        style={styles.sectionTitle}>
        {title.toUpperCase()}
      </ThemedText>
      <View style={[styles.sectionBody, { backgroundColor: palette.bgTertiary }]}>
        {children}
      </View>
    </View>
  );
}

function Row({
  label,
  hint,
  palette,
  children,
}: {
  label: string;
  hint?: string;
  palette: SemanticPalette;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLabel}>
        <ThemedText variant="body">{label}</ThemedText>
        {hint ? (
          <ThemedText variant="caption1" tone="secondary" style={{ marginTop: 2 }}>
            {hint}
          </ThemedText>
        ) : null}
      </View>
      <View>{children}</View>
    </View>
  );
}

function Separator({ palette }: { palette: SemanticPalette }) {
  return (
    <View
      style={[styles.separator, { backgroundColor: palette.separator }]}
    />
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
        { backgroundColor: Palette.brandTint },
        disabled && styles.stepperBtnDisabled,
        pressed && !disabled && { opacity: 0.5 },
      ]}>
      <Ionicons
        name={icon}
        size={18}
        color={disabled ? '#9BA1A6' : Palette.brand}
      />
    </Pressable>
  );
}

function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  palette,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  palette: SemanticPalette;
}) {
  return (
    <View style={[styles.segments, { backgroundColor: palette.fillTertiary }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={String(opt.value)}
            onPress={() => onChange(opt.value)}
            style={[
              styles.segment,
              active && { backgroundColor: palette.bgTertiary },
            ]}>
            <ThemedText
              variant="footnote"
              weight={active ? 'semibold' : 'regular'}>
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
  scroll: { padding: Space[4], paddingBottom: Space[10] },
  section: { marginBottom: Space[6] },
  sectionTitle: {
    marginBottom: Space[2],
    paddingHorizontal: Space[4],
    letterSpacing: 0.6,
  },
  sectionBody: {
    borderRadius: Radius.lg,
    paddingHorizontal: Space[4],
    paddingVertical: Space[1],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space[3],
    paddingVertical: Space[3],
  },
  rowLabel: { flex: 1 },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 0,
  },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: Space[2] },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: { backgroundColor: 'rgba(127,127,127,0.10)' },
  fontPreview: {
    minWidth: 80,
    paddingHorizontal: Space[3],
    paddingVertical: Space[1],
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  segments: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: 3,
    gap: 2,
  },
  segment: {
    paddingHorizontal: Space[3],
    paddingVertical: Space[1] + 2,
    borderRadius: Radius.sm,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[3],
    paddingHorizontal: Space[4],
    paddingVertical: Space[3] + 2,
    borderRadius: Radius.lg,
  },
  footer: { textAlign: 'center', marginTop: Space[4] },
});

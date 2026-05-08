import { Platform } from 'react-native';

/**
 * Brand-level color tokens used app-wide. Reference these instead of
 * inlining hex strings; that way any palette change touches one file.
 */
export const Brand = {
  accent: '#0a7ea4',
  accentMuted: 'rgba(10,126,164,0.12)',
  success: '#16A34A',
  successText: '#15803D',
  successMuted: 'rgba(22,163,74,0.10)',
  warning: '#F59E0B',
  danger: '#DC2626',
  /** Femnine accent (used for gender chips, etc). */
  feminine: '#BE185D',
  feminineMuted: 'rgba(244,114,182,0.16)',
  /** Neutral icon / muted-text color, identical in light + dark. */
  muted: '#9BA1A6',
  /** Slightly stronger muted, used for chip captions, hints, etc. */
  mutedStrong: '#6B7280',
};

const tintColorLight = Brand.accent;
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: Brand.muted,
    tabIconDefault: Brand.muted,
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

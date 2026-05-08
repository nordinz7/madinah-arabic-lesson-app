/**
 * Design system tokens — single source of truth for typography, spacing,
 * radii, and semantic colors. Inspired by Apple's HIG with adjustments
 * for Arabic content.
 *
 * Use semantic names (`Type.title2`, `Space[4]`, `Semantic.light.text`)
 * rather than raw values; that way layout and palette decisions live in
 * one file and get applied consistently.
 */

// --- Fonts -----------------------------------------------------------------

export const Fonts = {
  arabic: 'NotoNaskhArabic_400Regular',
  arabicBold: 'NotoNaskhArabic_700Bold',
  latin: 'Inter_400Regular',
  latinMedium: 'Inter_500Medium',
  latinSemibold: 'Inter_600SemiBold',
  latinBold: 'Inter_700Bold',
} as const;

// --- Type scale ------------------------------------------------------------
// Sizes follow Apple's HIG. Latin text uses these directly; Arabic text
// gets a slightly looser line-height (×1.4 of fontSize) to clear harakat
// and tashkeel cleanly.

export const Type = {
  largeTitle: { fontSize: 34, lineHeight: 41 },
  title1: { fontSize: 28, lineHeight: 34 },
  title2: { fontSize: 22, lineHeight: 28 },
  title3: { fontSize: 20, lineHeight: 25 },
  headline: { fontSize: 17, lineHeight: 22 },
  body: { fontSize: 16, lineHeight: 22 },
  callout: { fontSize: 15, lineHeight: 20 },
  subheadline: { fontSize: 14, lineHeight: 19 },
  footnote: { fontSize: 13, lineHeight: 18 },
  caption1: { fontSize: 12, lineHeight: 16 },
  caption2: { fontSize: 11, lineHeight: 13 },
} as const;

export type TypeVariant = keyof typeof Type;

/** Multiplier applied to fontSize for Arabic text line height. */
export const ARABIC_LINE_HEIGHT_RATIO = 1.45;

// --- Spacing scale ---------------------------------------------------------
// 4px base unit. Use Space[N] where N is the multiplier.

export const Space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

// --- Radii -----------------------------------------------------------------

export const Radius = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  full: 9999,
} as const;

// --- Brand palette ---------------------------------------------------------

export const Palette = {
  brand: '#0E7C9C',
  brandStrong: '#0A5A75',
  brandTint: 'rgba(14,124,156,0.12)',
  brandTintStrong: 'rgba(14,124,156,0.20)',

  // Apple-system semantic colors, vibrant variants
  blue: '#007AFF',
  green: '#30B95F',
  greenSoft: 'rgba(48,185,95,0.14)',
  red: '#FF453A',
  redSoft: 'rgba(255,69,58,0.14)',
  yellow: '#FFD60A',
  orange: '#FF9F0A',
  indigo: '#5E5CE6',
  purple: '#BF5AF2',
  pink: '#FF375F',
  teal: '#64D2FF',

  // Gender chips
  feminine: '#BE185D',
  feminineTint: 'rgba(244,114,182,0.16)',
} as const;

// --- Semantic colors (light + dark) ---------------------------------------
// Each variant has primary/secondary/tertiary backgrounds, foreground
// text in 4 levels of emphasis, separators, and "fill" overlays for chip
// backgrounds. Keep all consumers reading from one of these so theme
// changes flow uniformly.

export const Semantic = {
  light: {
    bg: '#FFFFFF',
    bgSecondary: '#F2F2F7',
    bgTertiary: '#FFFFFF',

    fill: 'rgba(120,120,128,0.20)',
    fillSecondary: 'rgba(120,120,128,0.16)',
    fillTertiary: 'rgba(118,118,128,0.12)',
    fillQuaternary: 'rgba(116,116,128,0.08)',

    text: '#000000',
    textSecondary: 'rgba(60,60,67,0.60)',
    textTertiary: 'rgba(60,60,67,0.30)',
    textQuaternary: 'rgba(60,60,67,0.18)',

    separator: 'rgba(60,60,67,0.29)',
    separatorOpaque: '#C6C6C8',

    placeholder: 'rgba(60,60,67,0.30)',
  },
  dark: {
    bg: '#000000',
    bgSecondary: '#1C1C1E',
    bgTertiary: '#2C2C2E',

    fill: 'rgba(120,120,128,0.36)',
    fillSecondary: 'rgba(120,120,128,0.32)',
    fillTertiary: 'rgba(118,118,128,0.24)',
    fillQuaternary: 'rgba(118,118,128,0.18)',

    text: '#FFFFFF',
    textSecondary: 'rgba(235,235,245,0.60)',
    textTertiary: 'rgba(235,235,245,0.30)',
    textQuaternary: 'rgba(235,235,245,0.18)',

    separator: 'rgba(84,84,88,0.65)',
    separatorOpaque: '#38383A',

    placeholder: 'rgba(235,235,245,0.30)',
  },
} as const;

export type ColorScheme = keyof typeof Semantic;

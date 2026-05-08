import { Text, type TextProps } from 'react-native';

import {
  ARABIC_LINE_HEIGHT_RATIO,
  Fonts,
  Type,
  type TypeVariant,
} from '@/src/design';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useEffectiveColorScheme } from '@/src/hooks/use-effective-color-scheme';
import { Semantic } from '@/src/design';

// Test for any Arabic-block character (covers Arabic, Arabic Supplement,
// Arabic Extended, presentation forms, harakat, ligatures).
// eslint-disable-next-line no-misleading-character-class
const ARABIC_RE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

/** Semantic emphasis level — controls color, not size. */
export type Tone = 'primary' | 'secondary' | 'tertiary' | 'brand' | 'inherit';

/** Weight tier that maps to the right Inter / Noto Naskh face. */
export type Weight = 'regular' | 'medium' | 'semibold' | 'bold';

export type ThemedTextProps = TextProps & {
  /** Semantic typography variant from the type scale. */
  variant?: TypeVariant;
  tone?: Tone;
  weight?: Weight;
  /** Force script direction. Auto-detected from content if omitted. */
  script?: 'arabic' | 'latin';

  /** Legacy prop, mapped to variant + weight; new code should use them directly. */
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';

  /** Optional style override colors — usually leave to `tone`. */
  lightColor?: string;
  darkColor?: string;
};

const LEGACY_TYPE_MAP: Record<
  NonNullable<ThemedTextProps['type']>,
  { variant: TypeVariant; weight: Weight; tone?: Tone }
> = {
  default: { variant: 'body', weight: 'regular' },
  defaultSemiBold: { variant: 'body', weight: 'semibold' },
  subtitle: { variant: 'title3', weight: 'semibold' },
  title: { variant: 'title1', weight: 'bold' },
  link: { variant: 'body', weight: 'medium', tone: 'brand' },
};

function fontFor(script: 'arabic' | 'latin', weight: Weight): string {
  if (script === 'arabic') {
    return weight === 'bold' || weight === 'semibold'
      ? Fonts.arabicBold
      : Fonts.arabic;
  }
  switch (weight) {
    case 'regular':
      return Fonts.latin;
    case 'medium':
      return Fonts.latinMedium;
    case 'semibold':
      return Fonts.latinSemibold;
    case 'bold':
      return Fonts.latinBold;
  }
}

export function ThemedText({
  style,
  children,
  type,
  variant: variantProp,
  weight: weightProp,
  tone: toneProp,
  script: scriptProp,
  lightColor,
  darkColor,
  ...rest
}: ThemedTextProps) {
  const legacy = type ? LEGACY_TYPE_MAP[type] : undefined;
  const variant: TypeVariant = variantProp ?? legacy?.variant ?? 'body';
  const weight: Weight = weightProp ?? legacy?.weight ?? 'regular';
  const tone: Tone = toneProp ?? legacy?.tone ?? 'primary';

  const detected: 'arabic' | 'latin' =
    scriptProp ??
    (typeof children === 'string' && ARABIC_RE.test(children)
      ? 'arabic'
      : 'latin');

  const { fontSize, lineHeight } = Type[variant];
  const fontFamily = fontFor(detected, weight);
  // Arabic glyphs need more vertical space for harakat than Latin.
  const adjustedLineHeight =
    detected === 'arabic'
      ? Math.round(fontSize * ARABIC_LINE_HEIGHT_RATIO)
      : lineHeight;

  const themeColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const colorScheme = useEffectiveColorScheme();
  const palette = Semantic[colorScheme];

  const color = (() => {
    if (lightColor || darkColor) return themeColor;
    switch (tone) {
      case 'primary':
        return palette.text;
      case 'secondary':
        return palette.textSecondary;
      case 'tertiary':
        return palette.textTertiary;
      case 'brand':
        return Semantic.light.text === palette.text ? '#0E7C9C' : '#5AC8FA';
      case 'inherit':
        return undefined;
    }
  })();

  return (
    <Text
      style={[
        {
          fontFamily,
          fontSize,
          lineHeight: adjustedLineHeight,
          color,
        },
        style,
      ]}
      {...rest}>
      {children}
    </Text>
  );
}

import { StyleSheet, Text, type TextProps } from 'react-native';

import { Brand } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const arabicFont =
    type === 'title' || type === 'subtitle' || type === 'defaultSemiBold'
      ? 'NotoNaskhArabic_700Bold'
      : 'NotoNaskhArabic_400Regular';

  return (
    <Text
      style={[
        { color, fontFamily: arabicFont },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 26,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 26,
  },
  title: {
    fontSize: 30,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 32,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: Brand.accent,
  },
});

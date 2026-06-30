import { StyleSheet, Text, type TextProps } from 'react-native';

import { Type, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'display' // Fraunces — hero voice
    | 'title' // Fraunces — screen / section titles
    | 'subtitle' // Fraunces — smaller headings
    | 'serifQuote' // Fraunces italic — pull quotes / vendor pitches
    | 'small'
    | 'smallBold'
    | 'eyebrow' // Inter, tracked uppercase — editorial labels
    | 'label'
    | 'link'
    | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        styles[type],
        style,
      ]}
      {...rest}
    />
  );
}

// fontFamily carries the weight; we never set fontWeight over a custom face.
const styles = StyleSheet.create({
  display: { fontFamily: Type.serif, fontSize: 46, lineHeight: 48, letterSpacing: -0.8 },
  title: { fontFamily: Type.serif, fontSize: 30, lineHeight: 36, letterSpacing: -0.4 },
  subtitle: { fontFamily: Type.serif, fontSize: 22, lineHeight: 28, letterSpacing: -0.2 },
  serifQuote: { fontFamily: Type.serifItalic, fontSize: 18, lineHeight: 27 },
  default: { fontFamily: Type.sans, fontSize: 16, lineHeight: 24 },
  small: { fontFamily: Type.sans, fontSize: 14, lineHeight: 20 },
  smallBold: { fontFamily: Type.sansSemibold, fontSize: 13, lineHeight: 18 },
  eyebrow: { fontFamily: Type.sansSemibold, fontSize: 11.5, lineHeight: 14, letterSpacing: 1.6, textTransform: 'uppercase' },
  label: { fontFamily: Type.sansMedium, fontSize: 15, lineHeight: 20 },
  link: { fontFamily: Type.sansSemibold, fontSize: 15, lineHeight: 20 },
  code: { fontFamily: Type.sans, fontSize: 13, lineHeight: 18 },
});

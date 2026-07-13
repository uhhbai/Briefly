import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** A coloured left rule for emphasis (e.g. the budget note). Used sparingly. */
  accentColor?: string;
};

/** A quiet surface: raised bone with a hairline, no shadow. */
export function Card({ children, style, accentColor }: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
        Shadow.card,
        accentColor ? { borderLeftWidth: 2, borderLeftColor: accentColor } : null,
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
    gap: Spacing.two,
  },
});

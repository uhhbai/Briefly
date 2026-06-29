import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Adds a coloured left border accent (e.g. for the "best price" card). */
  accentColor?: string;
};

export function Card({ children, style, accentColor }: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
        accentColor ? { borderLeftWidth: 4, borderLeftColor: accentColor } : null,
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
    padding: Spacing.three,
    gap: Spacing.two,
  },
});

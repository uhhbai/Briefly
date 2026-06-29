import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Radius } from '@/constants/theme';

type Props = {
  colors: [string, string];
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
};

export function GradientCard({ colors, children, style, radius = Radius.lg }: Props) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.base, { borderRadius: radius }, style]}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});

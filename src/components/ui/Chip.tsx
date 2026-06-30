import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { haptic } from '@/lib/haptics';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

/** A pill filter. Selected = ink fill; rest = hairline outline. Quiet, no colour noise. */
export function Chip({ label, selected, onPress }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => {
        haptic.select();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.text : 'transparent',
          borderColor: selected ? theme.text : theme.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}>
      <ThemedText
        style={{
          fontFamily: Type.sansMedium,
          color: selected ? theme.background : theme.textSecondary,
          fontSize: 14,
        }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.three,
    height: 38,
    justifyContent: 'center',
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
});

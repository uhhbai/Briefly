import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  /** Optional leading emoji/icon. */
  icon?: string;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  icon,
  style,
}: Props) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const bg =
    variant === 'primary' ? theme.tint : variant === 'secondary' ? theme.backgroundSelected : 'transparent';
  const fg =
    variant === 'primary' ? theme.tintText : variant === 'ghost' ? theme.tint : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg, opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1 },
        variant === 'ghost' && { borderWidth: 1, borderColor: theme.tint },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <ThemedText style={{ color: fg, fontWeight: '700', fontSize: 16 }}>
          {icon ? `${icon}  ` : ''}
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    flexDirection: 'row',
  },
});

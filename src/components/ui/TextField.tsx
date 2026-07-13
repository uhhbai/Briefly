import { StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = TextInputProps & {
  label: string;
  hint?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function TextField({ label, hint, style, containerStyle, multiline, ...props }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.wrap, containerStyle]}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {label}
      </ThemedText>
      <TextInput
        placeholderTextColor={theme.muted}
        multiline={multiline}
        style={[
          styles.input,
          {
            minHeight: multiline ? 104 : 50,
            color: theme.text,
            backgroundColor: theme.card,
            borderColor: theme.border,
            textAlignVertical: multiline ? 'top' : 'center',
          },
          style,
        ]}
        {...props}
      />
      {hint ? (
        <ThemedText type="small" themeColor="muted">
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.two },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontFamily: Type.sans,
    fontSize: 15,
    lineHeight: 21,
  },
});

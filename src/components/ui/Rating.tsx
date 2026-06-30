import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  value: number;
  reviewCount?: number;
  size?: number;
};

/** A single filled star glyph + the numeric score. No emoji. */
export function Rating({ value, reviewCount, size = 13 }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Feather name="star" size={size} color={theme.tint} style={{ marginTop: -1 }} />
      <ThemedText type="smallBold" style={{ color: theme.text }}>
        {value.toFixed(1)}
      </ThemedText>
      {reviewCount != null && (
        <ThemedText type="small" themeColor="muted">
          ({reviewCount})
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});

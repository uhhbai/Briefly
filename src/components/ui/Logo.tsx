import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * The "B" monogram — a soft-cornered ink tile with a bone serif B and the
 * brand's sienna full-stop. Doubles as the app icon mark. See assets/logo.svg
 * for the exportable vector.
 */
export function LogoMark({ size = 40 }: { size?: number }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.tile,
        { width: size, height: size, borderRadius: size * 0.28, backgroundColor: theme.text },
      ]}>
      <ThemedText
        style={{
          fontFamily: Type.serif,
          fontSize: size * 0.62,
          color: theme.background,
          ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
        }}>
        B
      </ThemedText>
      <View
        style={{
          position: 'absolute',
          right: size * 0.2,
          bottom: size * 0.24,
          width: size * 0.11,
          height: size * 0.11,
          borderRadius: 999,
          backgroundColor: theme.tint,
        }}
      />
    </View>
  );
}

/** The wordmark: "Briefly" in Fraunces with a sienna full-stop — concise, done. */
export function Logo({ size = 26, withMark = false, style }: { size?: number; withMark?: boolean; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return (
    <View style={[styles.row, { gap: size * 0.34 }, style]}>
      {withMark && <LogoMark size={size * 1.32} />}
      <View style={styles.wordmark}>
        <ThemedText style={{ fontFamily: Type.serif, fontSize: size, letterSpacing: -0.5, color: theme.text }}>
          Briefly
        </ThemedText>
        <ThemedText style={{ fontFamily: Type.serif, fontSize: size, color: theme.tint }}>.</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  wordmark: { flexDirection: 'row', alignItems: 'baseline' },
});

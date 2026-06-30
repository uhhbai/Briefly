import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  /** Maker photo. Falls back to a typographic monogram when absent. */
  uri?: string;
  name: string;
  size?: number;
};

function monogram(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const second = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + second).toUpperCase();
}

/** Circular maker identity — real photography, with a clean monogram fallback. */
export function Avatar({ uri, name, size = 44 }: Props) {
  const theme = useTheme();
  const radius = size / 2;

  if (uri) {
    return (
      <Image
        source={uri}
        style={{ width: size, height: size, borderRadius: radius, backgroundColor: theme.backgroundSelected }}
        contentFit="cover"
        transition={250}
      />
    );
  }

  return (
    <View
      style={[
        styles.monogram,
        { width: size, height: size, borderRadius: radius, backgroundColor: theme.tintSoft },
      ]}>
      <ThemedText style={{ fontFamily: Type.serif, fontSize: size * 0.38, color: theme.tint }}>
        {monogram(name)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  monogram: { alignItems: 'center', justifyContent: 'center' },
});

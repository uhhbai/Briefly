import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

type WashSpec = {
  color: string;
  size: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  duration: number;
};

const WASHES: Record<'light' | 'dark', WashSpec[]> = {
  light: [
    { color: 'rgba(156,66,38,0.10)', size: 460, x: -150, y: -120, dx: 70, dy: 60, duration: 19000 },
    { color: 'rgba(217,154,78,0.10)', size: 520, x: 180, y: 360, dx: -80, dy: -50, duration: 27000 },
    { color: 'rgba(120,140,110,0.06)', size: 420, x: 60, y: 680, dx: 50, dy: 40, duration: 23000 },
  ],
  dark: [
    { color: 'rgba(218,125,79,0.13)', size: 460, x: -150, y: -120, dx: 70, dy: 60, duration: 19000 },
    { color: 'rgba(214,156,84,0.10)', size: 520, x: 180, y: 360, dx: -80, dy: -50, duration: 27000 },
    { color: 'rgba(150,170,120,0.07)', size: 420, x: 60, y: 680, dx: 50, dy: 40, duration: 23000 },
  ],
};

function Wash({ color, size, x, y, dx, dy, duration }: WashSpec) {
  const reduced = useReducedMotion();
  const p = useSharedValue(reduced ? 0.5 : 0);

  useEffect(() => {
    if (reduced) return;
    p.value = withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [reduced, p, duration]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: x + dx * p.value },
      { translateY: y + dy * p.value },
      { scale: 1 + 0.12 * p.value },
    ],
  }));

  return (
    <Animated.View style={[{ position: 'absolute', width: size, height: size }, style]}>
      <LinearGradient
        colors={[color, 'transparent']}
        start={{ x: 0.25, y: 0.1 }}
        end={{ x: 0.9, y: 0.95 }}
        style={{ flex: 1, borderRadius: size / 2 }}
      />
    </Animated.View>
  );
}

/**
 * Barely-there warm ambience behind everything. Slow-moving, low-opacity
 * washes give the bone canvas life without competing with content — ambient,
 * not decorative. Honors the OS "reduce motion" setting.
 */
export function LivingBackground() {
  const scheme = useColorScheme();
  const washes = scheme === 'dark' ? WASHES.dark : WASHES.light;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {washes.map((w, i) => (
        <Wash key={i} {...w} />
      ))}
    </View>
  );
}

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

type RibbonSpec = {
  colors: [string, string, string];
  width: number;
  height: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  tilt: number;
  duration: number;
};

const RIBBONS: Record<'light' | 'dark', RibbonSpec[]> = {
  light: [
    {
      colors: ['rgba(45,212,191,0.28)', 'rgba(105,83,211,0.12)', 'rgba(255,255,255,0)'],
      width: 720,
      height: 170,
      x: -260,
      y: 28,
      dx: 70,
      dy: 18,
      tilt: -17,
      duration: 22000,
    },
    {
      colors: ['rgba(99,102,241,0.20)', 'rgba(14,165,233,0.12)', 'rgba(255,255,255,0)'],
      width: 640,
      height: 140,
      x: 42,
      y: 470,
      dx: -80,
      dy: 36,
      tilt: 14,
      duration: 27000,
    },
    {
      colors: ['rgba(14,147,132,0.18)', 'rgba(255,255,255,0.04)', 'rgba(255,255,255,0)'],
      width: 560,
      height: 110,
      x: -120,
      y: 760,
      dx: 50,
      dy: -30,
      tilt: -8,
      duration: 25000,
    },
  ],
  dark: [
    {
      colors: ['rgba(45,212,191,0.24)', 'rgba(167,139,250,0.14)', 'rgba(7,17,31,0)'],
      width: 720,
      height: 170,
      x: -260,
      y: 28,
      dx: 70,
      dy: 18,
      tilt: -17,
      duration: 22000,
    },
    {
      colors: ['rgba(99,102,241,0.22)', 'rgba(14,165,233,0.12)', 'rgba(7,17,31,0)'],
      width: 640,
      height: 140,
      x: 42,
      y: 470,
      dx: -80,
      dy: 36,
      tilt: 14,
      duration: 27000,
    },
    {
      colors: ['rgba(20,184,166,0.16)', 'rgba(167,139,250,0.08)', 'rgba(7,17,31,0)'],
      width: 560,
      height: 110,
      x: -120,
      y: 760,
      dx: 50,
      dy: -30,
      tilt: -8,
      duration: 25000,
    },
  ],
};

function Ribbon({ colors, width, height, x, y, dx, dy, tilt, duration }: RibbonSpec) {
  const reduced = useReducedMotion();
  const p = useSharedValue(reduced ? 0.5 : 0);

  useEffect(() => {
    if (reduced) return;
    p.value = withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [duration, p, reduced]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: x + dx * p.value },
      { translateY: y + dy * p.value },
      { rotateZ: `${tilt + 3 * p.value}deg` },
      { scaleX: 1 + 0.06 * p.value },
    ],
  }));

  return (
    <Animated.View style={[styles.ribbon, { width, height }, style]}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

export function LivingBackground() {
  const scheme = useColorScheme();
  const ribbons = scheme === 'dark' ? RIBBONS.dark : RIBBONS.light;
  const gridColor = scheme === 'dark' ? 'rgba(183,197,216,0.045)' : 'rgba(71,84,103,0.055)';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.grid, { borderColor: gridColor }]} />
      {ribbons.map((r, i) => (
        <Ribbon key={i} {...r} />
      ))}
      <LinearGradient
        colors={scheme === 'dark' ? ['rgba(7,17,31,0)', '#07111F'] : ['rgba(245,248,255,0)', '#F5F8FF']}
        style={styles.fade}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderWidth: StyleSheet.hairlineWidth,
    opacity: 0.8,
  },
  ribbon: {
    position: 'absolute',
    overflow: 'hidden',
    borderRadius: 28,
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 220,
  },
});

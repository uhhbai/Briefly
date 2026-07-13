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
  rotate: string;
  duration: number;
};

const RIBBONS: Record<'light' | 'dark', RibbonSpec[]> = {
  light: [
    {
      colors: ['rgba(15,159,143,0.16)', 'rgba(124,140,248,0.10)', 'transparent'],
      width: 820,
      height: 96,
      x: -260,
      y: 88,
      dx: 90,
      dy: 22,
      rotate: '-18deg',
      duration: 18000,
    },
    {
      colors: ['rgba(255,122,89,0.12)', 'rgba(244,201,93,0.12)', 'transparent'],
      width: 700,
      height: 84,
      x: 8,
      y: 420,
      dx: -70,
      dy: 30,
      rotate: '15deg',
      duration: 23000,
    },
    {
      colors: ['rgba(47,143,105,0.10)', 'rgba(79,163,247,0.08)', 'transparent'],
      width: 760,
      height: 72,
      x: -180,
      y: 720,
      dx: 80,
      dy: -25,
      rotate: '-10deg',
      duration: 26000,
    },
    {
      colors: ['rgba(255,122,89,0.08)', 'rgba(15,159,143,0.10)', 'transparent'],
      width: 620,
      height: 48,
      x: -120,
      y: 250,
      dx: 130,
      dy: -18,
      rotate: '28deg',
      duration: 16000,
    },
    {
      colors: ['rgba(244,201,93,0.10)', 'rgba(124,140,248,0.08)', 'transparent'],
      width: 900,
      height: 56,
      x: -360,
      y: 585,
      dx: 110,
      dy: 35,
      rotate: '-28deg',
      duration: 21000,
    },
  ],
  dark: [
    {
      colors: ['rgba(114,224,201,0.16)', 'rgba(124,140,248,0.10)', 'transparent'],
      width: 820,
      height: 96,
      x: -260,
      y: 88,
      dx: 90,
      dy: 22,
      rotate: '-18deg',
      duration: 18000,
    },
    {
      colors: ['rgba(255,154,120,0.13)', 'rgba(242,200,107,0.10)', 'transparent'],
      width: 700,
      height: 84,
      x: 8,
      y: 420,
      dx: -70,
      dy: 30,
      rotate: '15deg',
      duration: 23000,
    },
    {
      colors: ['rgba(134,211,158,0.10)', 'rgba(79,163,247,0.09)', 'transparent'],
      width: 760,
      height: 72,
      x: -180,
      y: 720,
      dx: 80,
      dy: -25,
      rotate: '-10deg',
      duration: 26000,
    },
    {
      colors: ['rgba(255,154,120,0.09)', 'rgba(114,224,201,0.10)', 'transparent'],
      width: 620,
      height: 48,
      x: -120,
      y: 250,
      dx: 130,
      dy: -18,
      rotate: '28deg',
      duration: 16000,
    },
    {
      colors: ['rgba(242,200,107,0.10)', 'rgba(124,140,248,0.08)', 'transparent'],
      width: 900,
      height: 56,
      x: -360,
      y: 585,
      dx: 110,
      dy: 35,
      rotate: '-28deg',
      duration: 21000,
    },
  ],
};

function Ribbon({ colors, width, height, x, y, dx, dy, rotate, duration }: RibbonSpec) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(reduced ? 0.45 : 0);

  useEffect(() => {
    if (reduced) return;
    progress.set(withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [duration, progress, reduced]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x + dx * progress.value },
      { translateY: y + dy * progress.value },
      { rotate },
      { scaleX: 1 + 0.06 * progress.value },
    ],
  }));

  return (
    <Animated.View style={[styles.ribbon, { width, height }, animatedStyle]}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.fill} />
    </Animated.View>
  );
}

export function LivingBackground() {
  const scheme = useColorScheme();
  const ribbons = scheme === 'dark' ? RIBBONS.dark : RIBBONS.light;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {ribbons.map((ribbon, i) => (
        <Ribbon key={i} {...ribbon} />
      ))}
      <LinearGradient
        colors={scheme === 'dark' ? ['rgba(7,17,31,0)', '#07111F'] : ['rgba(245,248,255,0)', '#F5F8FF']}
        style={styles.fade}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ribbon: {
    position: 'absolute',
    opacity: 1,
  },
  fill: {
    flex: 1,
    borderRadius: 999,
  },
  fade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Radius, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function LogoMark({ size = 40 }: { size?: number }) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    progress.set(withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.cubic) }), -1, true));
  }, [progress, reduced]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: size * (-0.42 + progress.value * 0.62) },
      { translateY: size * (-0.07 + progress.value * 0.11) },
      { rotate: '-18deg' },
    ],
    opacity: 0.18 + progress.value * 0.48,
  }));

  const bidStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.9 + progress.value * 0.13 }],
    opacity: 0.76 + progress.value * 0.22,
  }));

  return (
    <View
      style={[
        styles.mark,
        {
          width: size,
          height: size,
          borderRadius: Math.max(Radius.lg, size * 0.24),
          shadowColor: theme.tint,
        },
      ]}>
      <LinearGradient
        colors={['#0F9F8F', '#5F7DF2', '#FF7A59']}
        start={{ x: 0.04, y: 0.08 }}
        end={{ x: 0.98, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.spine,
          {
            left: size * 0.2,
            top: size * 0.2,
            width: size * 0.12,
            height: size * 0.62,
            borderRadius: size * 0.06,
          },
        ]}
      />

      <View
        style={[
          styles.cardLobe,
          {
            left: size * 0.31,
            top: size * 0.19,
            width: size * 0.43,
            height: size * 0.26,
            borderTopRightRadius: size * 0.16,
            borderBottomRightRadius: size * 0.16,
          },
        ]}>
        <View style={[styles.roughLine, { width: size * 0.21, marginTop: size * 0.075 }]} />
        <View style={[styles.roughLine, { width: size * 0.28, opacity: 0.45 }]} />
      </View>

      <View
        style={[
          styles.cardLobe,
          {
            left: size * 0.31,
            top: size * 0.51,
            width: size * 0.49,
            height: size * 0.3,
            borderTopRightRadius: size * 0.18,
            borderBottomRightRadius: size * 0.18,
          },
        ]}>
        <View style={[styles.cleanLine, { width: size * 0.24, marginTop: size * 0.08 }]} />
        <View style={[styles.cleanLine, { width: size * 0.16, opacity: 0.46 }]} />
        <Animated.View
          style={[
            styles.bidDot,
            {
              width: size * 0.12,
              height: size * 0.12,
              borderRadius: size * 0.06,
              right: size * 0.08,
              bottom: size * 0.07,
              backgroundColor: theme.accent,
            },
            bidStyle,
          ]}>
          <View style={[styles.tickA, { width: size * 0.035, height: size * 0.012 }]} />
          <View style={[styles.tickB, { width: size * 0.055, height: size * 0.012 }]} />
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.sweep,
          {
            width: size * 0.72,
            height: size * 0.11,
            borderRadius: size * 0.06,
          },
          sweepStyle,
        ]}
      />
    </View>
  );
}

export function Logo({
  size = 26,
  withMark = false,
  style,
}: {
  size?: number;
  withMark?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.row, { gap: size * 0.34 }, style]}>
      {withMark && <LogoMark size={size * 1.42} />}
      <View style={styles.wordmark}>
        <ThemedText
          style={{
            fontFamily: Type.serifBlack,
            fontSize: size,
            letterSpacing: 0,
            color: theme.text,
            ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
          }}>
          Brief
        </ThemedText>
        <View>
          <ThemedText
            style={{
              fontFamily: Type.serifDisplayItalic,
              fontSize: size,
              letterSpacing: 0,
              color: theme.tint,
              ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
            }}>
            ly
          </ThemedText>
          <View style={[styles.wordSpark, { backgroundColor: theme.accent }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  spine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  cardLobe: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    paddingLeft: '9%',
    gap: 4,
    overflow: 'hidden',
  },
  roughLine: {
    height: 2,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(23,32,42,0.42)',
  },
  cleanLine: {
    height: 2,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(15,159,143,0.72)',
  },
  bidDot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickA: {
    position: 'absolute',
    backgroundColor: 'white',
    transform: [{ translateX: -2 }, { rotate: '42deg' }],
    borderRadius: Radius.pill,
  },
  tickB: {
    position: 'absolute',
    backgroundColor: 'white',
    transform: [{ translateX: 2 }, { rotate: '-42deg' }],
    borderRadius: Radius.pill,
  },
  sweep: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  wordmark: { flexDirection: 'row', alignItems: 'baseline' },
  wordSpark: {
    position: 'absolute',
    right: -6,
    top: 1,
    width: 6,
    height: 6,
    borderRadius: Radius.pill,
  },
});

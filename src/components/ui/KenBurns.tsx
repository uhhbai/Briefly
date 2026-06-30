import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { BLUR_PLACEHOLDER } from '@/lib/images';

const AnimatedImage = Animated.createAnimatedComponent(Image);

type Props = {
  uri: string;
  style?: StyleProp<ViewStyle>;
  /** Seconds for one drift cycle. */
  duration?: number;
};

/** A photo with a slow, looping zoom/pan — quiet cinematic life. Static if the
 *  user prefers reduced motion. */
export function KenBurns({ uri, style, duration = 16000 }: Props) {
  const reduced = useReducedMotion();
  const p = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    p.value = withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [reduced, p, duration]);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: 1.04 + 0.07 * p.value },
      { translateX: -8 * p.value },
      { translateY: 5 * p.value },
    ],
  }));

  return (
    <View style={[styles.wrap, style]}>
      <AnimatedImage
        source={uri}
        placeholder={{ blurhash: BLUR_PLACEHOLDER }}
        contentFit="cover"
        transition={300}
        style={[StyleSheet.absoluteFill, imageStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: '#E1DACB' },
});

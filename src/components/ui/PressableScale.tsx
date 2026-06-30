import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { haptic } from '@/lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** How far it shrinks on press (0.96 = subtle, 0.92 = punchy). */
  scaleTo?: number;
  /** Light haptic tick on press-in (native only). Defaults on. */
  haptics?: boolean;
};

/** A Pressable that springs and ticks when pressed — gives the app a tactile feel. */
export function PressableScale({
  children,
  onPress,
  style,
  scaleTo = 0.96,
  haptics = true,
}: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        if (haptics) haptic.light();
        scale.value = withTiming(scaleTo, { duration: 90 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 220 });
      }}
      style={[animatedStyle, style]}>
      {children}
    </AnimatedPressable>
  );
}

import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { BLUR_PLACEHOLDER } from '@/lib/images';

type Props = {
  uri: string;
  /** Optional gradient overlay [top, bottom] — use rgba() for see-through. */
  overlay?: [string, string];
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Content alignment within the cover. */
  align?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
};

/**
 * A photo with a smooth fade-in, blurred placeholder, and an optional
 * gradient overlay so text/badges stay readable on top. The building block
 * that turns the storefront from "wireframe" into "real app".
 */
export function CoverImage({ uri, overlay, children, style, align = 'flex-end' }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={uri}
        placeholder={{ blurhash: BLUR_PLACEHOLDER }}
        contentFit="cover"
        transition={350}
        style={StyleSheet.absoluteFill}
      />
      {overlay && (
        <LinearGradient
          colors={overlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={[styles.content, { justifyContent: align }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: '#e5e7eb' },
  content: { flex: 1 },
});

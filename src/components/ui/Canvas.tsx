import { View, type StyleProp, type ViewStyle } from 'react-native';

import { LivingBackground } from '@/components/ui/LivingBackground';
import { useTheme } from '@/hooks/use-theme';

/**
 * An opaque screen backing (bone/espresso) with the ambient LivingBackground
 * behind its content. Each screen owns its own canvas so navigation scenes stay
 * opaque — no bleed-through when switching tabs.
 */
export function Canvas({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return (
    <View style={[{ flex: 1, backgroundColor: theme.background }, style]}>
      <LivingBackground />
      {children}
    </View>
  );
}

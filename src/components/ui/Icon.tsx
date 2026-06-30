import { Feather } from '@expo/vector-icons';
import { type ColorValue } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type IconName = keyof typeof Feather.glyphMap;

type Props = {
  name: IconName;
  size?: number;
  color?: ColorValue;
};

/** The single line-icon set for the whole app (Feather — consistent 2px stroke). */
export function Icon({ name, size = 20, color }: Props) {
  const theme = useTheme();
  return <Feather name={name} size={size} color={(color as string) ?? theme.text} />;
}

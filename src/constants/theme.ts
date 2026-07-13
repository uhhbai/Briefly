import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#101828',
    textSecondary: '#475467',
    muted: '#7A869A',
    background: '#F5F8FF',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E7F0FF',
    card: 'rgba(255,255,255,0.86)',
    border: '#D7E0EF',
    tint: '#0E9384',
    tintText: '#F7FEFF',
    tintSoft: '#D7F7F2',
    accent: '#6953D3',
    success: '#079455',
    successBg: '#DDF8E7',
    warning: '#B54708',
    danger: '#D92D20',
    onImage: '#F8FBFF',
    scrim: 'rgba(16,24,40,0.36)',
    frame: '#D9E6F7',
  },
  dark: {
    text: '#F5FAFF',
    textSecondary: '#B7C5D8',
    muted: '#7F8EA3',
    background: '#07111F',
    backgroundElement: '#101A2B',
    backgroundSelected: '#16263D',
    card: 'rgba(16,26,43,0.84)',
    border: '#26364D',
    tint: '#2DD4BF',
    tintText: '#031B1A',
    tintSoft: '#123C3B',
    accent: '#A78BFA',
    success: '#6CE9A6',
    successBg: '#0B3320',
    warning: '#FEC84B',
    danger: '#FDA29B',
    onImage: '#F8FBFF',
    scrim: 'rgba(3,9,18,0.56)',
    frame: '#030712',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Type = {
  serif: 'Fraunces_600SemiBold',
  serifMedium: 'Fraunces_500Medium',
  serifRegular: 'Fraunces_400Regular',
  serifItalic: 'Fraunces_400Regular_Italic',
  serifDisplayItalic: 'Fraunces_600SemiBold_Italic',
  serifBlack: 'Fraunces_900Black',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemibold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
} as const;

export const Fonts = Platform.select({
  ios: { sans: 'Inter_400Regular', serif: 'Fraunces_600SemiBold', rounded: 'Inter_400Regular', mono: 'ui-monospace' },
  default: { sans: 'Inter_400Regular', serif: 'Fraunces_600SemiBold', rounded: 'Inter_400Regular', mono: 'monospace' },
  web: { sans: 'Inter_400Regular', serif: 'Fraunces_600SemiBold', rounded: 'Inter_400Regular', mono: 'var(--font-mono)' },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  gutter: 22,
  section: 48,
  huge: 80,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 760;

export const Radius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  pill: 999,
} as const;

export const Shadow = {
  card: {
    shadowColor: '#0B1220',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  float: {
    shadowColor: '#0B1220',
    shadowOpacity: 0.18,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
  },
} as const;

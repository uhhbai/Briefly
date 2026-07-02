/**
 * Briefly design system: bright marketplace, calm enough for decisions.
 *
 * Porcelain surfaces, ink text, and balanced teal, coral, lilac, and amber
 * accents. The goal is lighter and more ownable without turning the app into
 * a single-color theme.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#17202A',
    textSecondary: '#536171',
    muted: '#8390A0',
    background: '#FBFCF8',
    backgroundElement: '#F4F8F2',
    backgroundSelected: '#E7F2ED',
    card: '#FFFFFF',
    border: '#DFE8E3',
    tint: '#0F9F8F',
    tintText: '#F9FFFC',
    tintSoft: '#DAF3EC',
    accent: '#FF7A59',
    success: '#2F8F69',
    successBg: '#DFF4EA',
    warning: '#B77B12',
    danger: '#C94E45',
    onImage: '#FFFFFF',
    scrim: 'rgba(23,32,42,0.36)',
    frame: '#EEF4EF',
  },
  dark: {
    text: '#F5FBF8',
    textSecondary: '#C6D4CE',
    muted: '#91A39B',
    background: '#13211F',
    backgroundElement: '#1B2D29',
    backgroundSelected: '#243D37',
    card: '#1B2D29',
    border: '#31524A',
    tint: '#72E0C9',
    tintText: '#10201D',
    tintSoft: '#234D45',
    accent: '#FF9A78',
    success: '#86D39E',
    successBg: '#213B2B',
    warning: '#F2C86B',
    danger: '#F08A7C',
    onImage: '#FFFFFF',
    scrim: 'rgba(9,20,18,0.5)',
    frame: '#0D1715',
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
  sm: 4,
  md: 8,
  lg: 8,
  xl: 10,
  pill: 999,
} as const;

export const Shadow = {
  card: {
    shadowColor: '#19332F',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  float: {
    shadowColor: '#19332F',
    shadowOpacity: 0.14,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
} as const;

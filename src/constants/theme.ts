/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#5B6470',
    muted: '#8A929E',
    background: '#F6F7F9',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#ECEDF1',
    card: '#FFFFFF',
    border: '#E6E8EC',
    tint: '#4F46E5',
    tintText: '#FFFFFF',
    tintSoft: '#EEF0FE',
    accent: '#F59E0B',
    success: '#16A34A',
    successBg: '#E7F7EC',
    warning: '#D97706',
    danger: '#DC2626',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    muted: '#6B7280',
    background: '#0B0D10',
    backgroundElement: '#16181D',
    backgroundSelected: '#23262C',
    card: '#16181D',
    border: '#262A30',
    tint: '#7C73FF',
    tintText: '#FFFFFF',
    tintSoft: '#1E1B36',
    accent: '#FBBF24',
    success: '#22C55E',
    successBg: '#13301E',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

/** Cross-platform elevation presets (iOS shadow* + Android elevation). */
export const Shadow = {
  card: {
    shadowColor: '#0B1020',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  float: {
    shadowColor: '#0B1020',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
} as const;

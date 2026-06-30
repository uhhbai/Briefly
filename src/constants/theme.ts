/**
 * Briefly design system — "Editorial Commerce".
 *
 * Modelled on the restraint of Aesop / 1stDibs: ink on bone paper, a single
 * sienna accent used sparingly, hierarchy carried by a serif display
 * (Fraunces) against a neutral sans (Inter) — never by colour or decoration.
 * Generous negative space, hairline rules instead of boxes, real photography.
 *
 * Principles enforced here:
 *   1. Monochrome base + ONE accent. Colour is an event, not a texture.
 *   2. Type is the brand: Fraunces for voice, Inter for information.
 *   3. Whitespace doubled — sections breathe (see Spacing.section / .huge).
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1C1A16', // warm near-black ink
    textSecondary: '#5C554A',
    muted: '#938A7B',
    background: '#ECE6DA', // bone paper
    backgroundElement: '#F4F0E7', // raised bone
    backgroundSelected: '#E1DACB',
    card: '#F4F0E7',
    border: '#D6CDBC', // warm hairline
    tint: '#9C4226', // deep sienna — the only accent
    tintText: '#F7F3EA',
    tintSoft: '#E6DCCB',
    accent: '#9C4226',
    success: '#3F6B4F',
    successBg: '#DCE6DB',
    warning: '#8E6320',
    danger: '#9B3022',
    onImage: '#F7F3EA', // text laid over photography
    scrim: 'rgba(20,16,10,0.42)',
    /** Letterbox surround when framed as a phone on wide screens. */
    frame: '#D9CFBE',
  },
  dark: {
    text: '#EFE6D6',
    textSecondary: '#B0A28E',
    muted: '#867764',
    background: '#2A2018', // warm espresso brown (not black)
    backgroundElement: '#352A20',
    backgroundSelected: '#413427',
    card: '#352A20',
    border: '#48392B',
    tint: '#DA7D4F', // warm sienna, lifted for contrast on brown
    tintText: '#241B12',
    tintSoft: '#3C2E20',
    accent: '#DA7D4F',
    success: '#85A56E',
    successBg: '#2A331E',
    warning: '#D69C54',
    danger: '#DC7A5E',
    onImage: '#F6F1E8',
    scrim: 'rgba(10,7,4,0.5)',
    frame: '#0E0B07',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Type families. Loaded in the root layout via expo-font. Each constant maps
 * to a baked-weight family, so we set `fontFamily` and never `fontWeight`
 * (which would synthesize an incorrect weight over a custom face).
 */
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
  /** Horizontal page margin — a touch wider than the old 16 for air. */
  gutter: 22,
  /** Vertical rhythm between major sections. */
  section: 48,
  huge: 80,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 760;

/** Squared, refined corners — editorial commerce barely rounds anything. */
export const Radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
} as const;

/** Used rarely. Editorial UI separates with hairlines, not shadows. */
export const Shadow = {
  card: {
    shadowColor: '#2A1C10',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  float: {
    shadowColor: '#2A1C10',
    shadowOpacity: 0.14,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
} as const;

/**
 * Thin, crash-safe wrapper around expo-haptics.
 *
 * Native-only by design: the Web Vibration API is inconsistent and often
 * unwanted, so we no-op on web. Every call is fire-and-forget and swallows
 * errors (Low Power Mode, missing hardware, permissions, etc.).
 */
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const on = Platform.OS === 'ios' || Platform.OS === 'android';
const safe = (p: Promise<void>) => p.catch(() => {});

export const haptic = {
  /** Light tap — pressing a card, selecting a chip. */
  light: () => on && safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Medium tap — confirming a primary action. */
  medium: () => on && safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  /** Selection tick — moving through options. */
  select: () => on && safe(Haptics.selectionAsync()),
  /** Success buzz — booking confirmed. */
  success: () => on && safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  /** Warning buzz — something needs attention. */
  warning: () => on && safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  /** Error buzz — an action failed. */
  error: () => on && safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};

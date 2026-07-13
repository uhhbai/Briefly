/**
 * Lightweight toast notifications. Wrap the app in <ToastProvider> once, then
 * call `useToast().show(message, variant)` from anywhere instead of scattering
 * inline notice/error text through the screens.
 */

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, Layout } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { haptic } from '@/lib/haptics';

export type ToastVariant = 'success' | 'error' | 'info';

type Toast = { id: number; message: string; variant: ToastVariant };

type ToastContextValue = {
  show: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastVariant, IconName> = {
  success: 'check-circle',
  error: 'alert-triangle',
  info: 'info',
};

const DURATION = 3400;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      if (!message?.trim()) return;
      const id = nextId.current++;
      if (variant === 'error') haptic.error();
      else haptic.success();
      setToasts((list) => [...list.slice(-2), { id, message, variant }]);
      setTimeout(() => dismiss(id), DURATION);
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (message) => show(message, 'success'),
      error: (message) => show(message, 'error'),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastHost toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastHost({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  const insets = useSafeAreaInsets();
  if (!toasts.length) return null;

  return (
    <View pointerEvents="box-none" style={[styles.host, { top: insets.top + Spacing.two }]}>
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </View>
  );
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const theme = useTheme();
  const accent =
    toast.variant === 'success' ? theme.success : toast.variant === 'error' ? theme.danger : theme.tint;

  return (
    <Animated.View entering={FadeInUp.duration(240)} exiting={FadeOutUp.duration(180)} layout={Layout}>
      <Pressable
        onPress={() => {
          haptic.light();
          onDismiss();
        }}
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={[styles.accent, { backgroundColor: accent }]} />
        <Icon name={ICONS[toast.variant]} size={18} color={accent} />
        <ThemedText type="smallBold" style={{ flex: 1, color: theme.text }} numberOfLines={3}>
          {toast.message}
        </ThemedText>
        <Icon name="x" size={16} color={theme.muted} />
      </Pressable>
    </Animated.View>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: Spacing.gutter,
    right: Spacing.gutter,
    zIndex: 1000,
    gap: Spacing.two,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 520,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    paddingLeft: Spacing.four,
    paddingRight: Spacing.three,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
});

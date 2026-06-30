import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * A designed, cross-platform confirmation sheet. Replaces React Native's
 * Alert.alert, which silently no-ops on web — so flows like accepting a bid
 * work everywhere, and the dialog matches the editorial system.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: Props) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel} statusBarTranslucent>
      {visible && (
        <Animated.View entering={FadeIn.duration(160)} style={[StyleSheet.absoluteFill, styles.scrim, { backgroundColor: theme.scrim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel="Dismiss" />
          <Animated.View
            entering={FadeInDown.duration(240)}
            style={[styles.sheet, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.grabber} />
            <ThemedText type="title" style={{ fontSize: 24 }}>
              {title}
            </ThemedText>
            {message ? (
              <ThemedText type="default" themeColor="textSecondary" style={{ lineHeight: 23 }}>
                {message}
              </ThemedText>
            ) : null}
            <View style={styles.actions}>
              <Button title={confirmLabel} iconRight="arrow-right" onPress={onConfirm} />
              <Button title={cancelLabel} variant="ghost" onPress={onCancel} />
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  grabber: { alignSelf: 'center', width: 36, height: 4, borderRadius: 999, backgroundColor: 'rgba(120,90,60,0.25)', marginBottom: Spacing.two },
  actions: { gap: Spacing.two, marginTop: Spacing.one },
});

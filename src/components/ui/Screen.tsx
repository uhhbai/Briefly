import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Canvas } from '@/components/ui/Canvas';
import { Icon } from '@/components/ui/Icon';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { haptic } from '@/lib/haptics';

type Props = {
  children: React.ReactNode;
  title?: string;
  /** Small tracked label shown above the title. */
  eyebrow?: string;
  subtitle?: string;
  showBack?: boolean;
  /** Sticky content pinned to the bottom (e.g. a primary Button). */
  footer?: React.ReactNode;
  scroll?: boolean;
};

export function Screen({ children, title, eyebrow, subtitle, showBack, footer, scroll = true }: Props) {
  const theme = useTheme();

  const header =
    showBack || title ? (
      <View style={styles.header}>
        {showBack && (
          <Pressable
            onPress={() => {
              haptic.light();
              router.back();
            }}
            hitSlop={14}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.back}>
            <Icon name="arrow-left" size={22} color={theme.text} />
          </Pressable>
        )}
        {title && (
          <View>
            {eyebrow && (
              <ThemedText type="eyebrow" themeColor="muted" style={{ marginBottom: Spacing.two }}>
                {eyebrow}
              </ThemedText>
            )}
            <ThemedText type="title">{title}</ThemedText>
            {subtitle ? (
              <ThemedText type="default" themeColor="textSecondary" style={{ marginTop: Spacing.two }}>
                {subtitle}
              </ThemedText>
            ) : null}
          </View>
        )}
      </View>
    ) : null;

  const body = (
    <View style={styles.content}>
      {header}
      {children}
    </View>
  );

  return (
    <Canvas>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {body}
          </ScrollView>
        ) : (
          body
        )}
        {footer ? (
          <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
            <View style={styles.footerInner}>{footer}</View>
          </View>
        ) : null}
      </SafeAreaView>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.four,
    flex: 1,
  },
  header: { gap: Spacing.three },
  back: { width: 40, height: 40, justifyContent: 'center', marginLeft: -8 },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    alignItems: 'center',
  },
  footerInner: { width: '100%', maxWidth: MaxContentWidth },
});

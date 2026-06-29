import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  /** Sticky content pinned to the bottom (e.g. a primary Button). */
  footer?: React.ReactNode;
  /** Set false for screens that manage their own scrolling/layout. */
  scroll?: boolean;
};

export function Screen({ children, title, subtitle, showBack, footer, scroll = true }: Props) {
  const theme = useTheme();

  const header =
    showBack || title ? (
      <View style={styles.header}>
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <ThemedText style={{ fontSize: 26, color: theme.text }}>‹</ThemedText>
          </Pressable>
        )}
        {title && (
          <View style={{ flex: 1 }}>
            <ThemedText type="subtitle" style={styles.title}>
              {title}
            </ThemedText>
            {subtitle ? (
              <ThemedText type="small" themeColor="textSecondary">
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
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
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
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: { fontSize: 28, lineHeight: 34 },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    alignItems: 'center',
  },
  footerInner: { width: '100%', maxWidth: MaxContentWidth },
});

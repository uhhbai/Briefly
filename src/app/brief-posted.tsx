import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useBrief } from '@/store/BriefContext';

export default function BriefPostedScreen() {
  const theme = useTheme();
  const { spec, bids } = useBrief();

  return (
    <Screen showHome eyebrow="Brief posted" title="Your brief is live">
      <Animated.View entering={FadeInDown.duration(320)}>
        <Card accentColor={theme.success}>
          <View style={styles.successRow}>
            <View style={[styles.successIcon, { backgroundColor: theme.successBg }]}>
              <Icon name="check-circle" color={theme.success} size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="subtitle">{spec?.title ?? 'Brief posted'}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Vendors can now find this brief. You can relax on Home, or compare the first generated bids now.
              </ThemedText>
            </View>
          </View>
        </Card>
      </Animated.View>

      <View style={styles.actions}>
        <Button title="Back to home" iconRight="home" onPress={() => router.replace('/')} style={styles.action} />
        <Button
          title={bids.length ? `Compare ${bids.length} bids` : 'View my briefs'}
          variant="secondary"
          iconRight="arrow-right"
          onPress={() => router.push(bids.length ? '/bids' : '/briefs')}
          style={styles.action}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  action: { flex: 1, minWidth: 180 },
  successIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
});

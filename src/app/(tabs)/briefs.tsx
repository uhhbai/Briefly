import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Canvas } from '@/components/ui/Canvas';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { Icon } from '@/components/ui/Icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/config';
import type { Order } from '@/lib/types';
import { useBrief } from '@/store/BriefContext';

export default function BriefsScreen() {
  const theme = useTheme();
  const { spec, bids, orders } = useBrief();
  const hasDraft = !!spec;
  const isEmpty = !hasDraft && orders.length === 0;

  return (
    <Canvas>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <ThemedText type="title">Briefs</ThemedText>

          {isEmpty && (
            <Animated.View entering={FadeInDown.duration(340)} style={styles.empty}>
              <Icon name="file-text" size={28} color={theme.muted} />
              <ThemedText type="subtitle" style={{ textAlign: 'center' }}>
                No briefs yet
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center', maxWidth: 280 }}>
                Describe something you want made or done, and makers will bid for the job.
              </ThemedText>
            </Animated.View>
          )}

          {/* In-progress draft */}
          {hasDraft && (
            <Animated.View entering={FadeInDown.duration(340)}>
              <Card>
                <View style={styles.statusRow}>
                  <View style={[styles.dot, { backgroundColor: bids.length ? theme.tint : theme.muted }]} />
                  <ThemedText type="eyebrow" style={{ color: bids.length ? theme.tint : theme.muted }}>
                    {bids.length ? 'Bids in' : 'Draft'}
                  </ThemedText>
                  <ThemedText type="eyebrow" themeColor="muted">
                    · {spec!.category.label}
                  </ThemedText>
                </View>
                <ThemedText type="subtitle">{spec!.title}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
                  {spec!.summary}
                </ThemedText>
                <Divider style={{ marginVertical: Spacing.two }} />
                {bids.length ? (
                  <Button title={`Compare ${bids.length} bids`} variant="secondary" iconRight="arrow-right" onPress={() => router.push('/bids')} />
                ) : (
                  <Button title="Continue this brief" variant="secondary" iconRight="arrow-right" onPress={() => router.push('/spec')} />
                )}
              </Card>
            </Animated.View>
          )}

          {/* Booked orders */}
          {orders.length > 0 && (
            <View style={{ gap: Spacing.three }}>
              <ThemedText type="eyebrow" themeColor="muted">
                Booked · {orders.length}
              </ThemedText>
              {orders.map((o, i) => (
                <Animated.View key={o.id} entering={FadeInDown.delay(i * 60).duration(340)}>
                  <OrderCard order={o} />
                </Animated.View>
              ))}
            </View>
          )}

          <Button title="Start a new brief" iconRight="arrow-right" onPress={() => router.push('/describe')} style={{ marginTop: Spacing.two }} />
        </ScrollView>
      </SafeAreaView>
    </Canvas>
  );
}

function OrderCard({ order }: { order: Order }) {
  const theme = useTheme();
  const { spec, bid } = order;
  return (
    <Card>
      <View style={styles.statusRow}>
        <View style={[styles.dot, { backgroundColor: theme.success }]} />
        <ThemedText type="eyebrow" style={{ color: theme.success }}>
          Booked
        </ThemedText>
        <ThemedText type="eyebrow" themeColor="muted">
          · {spec.category.label}
        </ThemedText>
      </View>
      <ThemedText type="subtitle">{spec.title}</ThemedText>
      <Divider style={{ marginVertical: Spacing.two }} />
      <View style={styles.vendorRow}>
        <Avatar name={bid.vendorName} size={42} />
        <View style={{ flex: 1 }}>
          <View style={styles.nameLine}>
            <ThemedText type="label">{bid.vendorName}</ThemedText>
            {bid.verified && <Icon name="check-circle" size={14} color={theme.tint} />}
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {formatPrice(bid.price)} · ready in ~{bid.etaDays} days
          </ThemedText>
        </View>
        <View style={[styles.escrow, { borderColor: theme.border }]}>
          <Icon name="shield" size={13} color={theme.success} />
          <ThemedText type="small" themeColor="textSecondary">
            In escrow
          </ThemedText>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.gutter, paddingTop: Spacing.two, paddingBottom: Spacing.huge, gap: Spacing.four },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  dot: { width: 7, height: 7, borderRadius: 999 },
  vendorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  nameLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  escrow: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: StyleSheet.hairlineWidth, borderRadius: 999, paddingHorizontal: Spacing.two, paddingVertical: 5 },
  empty: { alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.six },
});

import { router } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/config';
import type { Bid } from '@/lib/types';
import { useBrief } from '@/store/BriefContext';

export default function BidsScreen() {
  const theme = useTheme();
  const { spec, bids, selectedBidId, selectBid, reset } = useBrief();

  const sorted = useMemo(() => [...bids].sort((a, b) => a.price - b.price), [bids]);
  const cheapestId = sorted[0]?.id;
  const topRatedId = useMemo(
    () => [...bids].sort((a, b) => b.rating - a.rating)[0]?.id,
    [bids]
  );
  const selected = bids.find((b) => b.id === selectedBidId) ?? null;

  function handleAccept() {
    if (!selected) return;
    Alert.alert(
      `Accept ${selected.vendorName}?`,
      `${formatPrice(selected.price)} · ready in ~${selected.etaDays} days.\n\nYour payment is held safely in escrow and only released when you confirm the job is done.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & fund escrow',
          onPress: () =>
            Alert.alert(
              '🎉 Booked!',
              `${selected.vendorName} has been notified and will start your job. You can chat and track milestones from “My Briefs”.`,
              [
                {
                  text: 'Done',
                  onPress: () => {
                    reset();
                    router.dismissAll();
                  },
                },
              ]
            ),
        },
      ]
    );
  }

  return (
    <Screen
      showBack
      title="Compare bids"
      subtitle={`${bids.length} vendors responded${spec ? ` · ${spec.title}` : ''}`}
      footer={
        <Button
          title={selected ? `Accept ${selected.vendorName} · ${formatPrice(selected.price)}` : 'Select a bid to continue'}
          icon={selected ? '🤝' : undefined}
          disabled={!selected}
          onPress={handleAccept}
        />
      }>
      {sorted.map((bid, i) => (
        <Animated.View key={bid.id} entering={FadeInDown.delay(i * 80).duration(350)}>
          <BidCard
            bid={bid}
            selected={bid.id === selectedBidId}
            isCheapest={bid.id === cheapestId}
            isTopRated={bid.id === topRatedId}
            onPress={() => selectBid(bid.id)}
          />
        </Animated.View>
      ))}

      <ThemedText type="small" themeColor="muted" style={{ textAlign: 'center', marginTop: Spacing.one }}>
        Tap a bid to select it. Payment is held in escrow until you’re happy.
      </ThemedText>
    </Screen>
  );
}

function BidCard({
  bid,
  selected,
  isCheapest,
  isTopRated,
  onPress,
}: {
  bid: Bid;
  selected: boolean;
  isCheapest: boolean;
  isTopRated: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: selected ? theme.tint : theme.border,
          borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
          opacity: pressed ? 0.92 : 1,
        },
      ]}>
      {/* badges */}
      {(isCheapest || isTopRated) && (
        <View style={styles.badgeRow}>
          {isCheapest && (
            <View style={[styles.badge, { backgroundColor: theme.successBg }]}>
              <ThemedText type="small" style={{ color: theme.success, fontWeight: '700' }}>
                💸 Lowest price
              </ThemedText>
            </View>
          )}
          {isTopRated && (
            <View style={[styles.badge, { backgroundColor: theme.tintSoft }]}>
              <ThemedText type="small" style={{ color: theme.tint, fontWeight: '700' }}>
                ⭐ Top rated
              </ThemedText>
            </View>
          )}
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.vendor}>
          <ThemedText style={{ fontSize: 30 }}>{bid.vendorAvatar}</ThemedText>
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <ThemedText type="default" style={{ fontWeight: '700' }} numberOfLines={1}>
                {bid.vendorName}
              </ThemedText>
              {bid.verified && (
                <ThemedText type="small" style={{ color: theme.tint }}>
                  ✓ verified
                </ThemedText>
              )}
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              ⭐ {bid.rating.toFixed(1)} ({bid.reviewCount}) · {bid.distanceKm} km away
            </ThemedText>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <ThemedText style={{ fontSize: 22, fontWeight: '800', color: theme.text }}>
            {formatPrice(bid.price)}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            ~{bid.etaDays} days
          </ThemedText>
        </View>
      </View>

      <ThemedText type="small" style={{ color: theme.text }}>
        “{bid.message}”
      </ThemedText>

      <View style={styles.highlights}>
        {bid.highlights.map((h) => (
          <View key={h} style={[styles.tag, { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText type="small" themeColor="textSecondary">
              {h}
            </ThemedText>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.lg, padding: Spacing.three, gap: Spacing.two },
  badgeRow: { flexDirection: 'row', gap: Spacing.two },
  badge: { paddingHorizontal: Spacing.two, paddingVertical: 3, borderRadius: Radius.pill },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.two },
  vendor: { flexDirection: 'row', gap: Spacing.two, flex: 1, alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  highlights: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  tag: { paddingHorizontal: Spacing.two, paddingVertical: 4, borderRadius: Radius.sm },
});

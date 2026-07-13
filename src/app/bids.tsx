import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Icon } from '@/components/ui/Icon';
import { Rating } from '@/components/ui/Rating';
import { Screen } from '@/components/ui/Screen';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { loadBidsForBrief, saveAcceptedOrder } from '@/lib/briefsDb';
import { formatPrice } from '@/lib/config';
import { haptic } from '@/lib/haptics';
import { createCheckoutSession, openCheckout } from '@/lib/payments';
import type { Bid } from '@/lib/types';
import { useBrief } from '@/store/BriefContext';

/** Append vendor bids not already represented (by vendor + price) in the base set. */
function mergeBids(base: Bid[], incoming: Bid[]): Bid[] {
  const seen = new Set(base.map((b) => `${b.vendorName}__${b.price}`));
  const extra = incoming.filter((b) => !seen.has(`${b.vendorName}__${b.price}`));
  return extra.length ? [...base, ...extra] : base;
}

export default function BidsScreen() {
  const { spec, bids, selectedBidId, selectBid, bookSelectedBid, remoteBriefId, setBids } = useBrief();
  const sorted = useMemo(() => [...bids].sort((a, b) => a.price - b.price), [bids]);
  const cheapestId = sorted[0]?.id;
  const topRatedId = useMemo(() => [...bids].sort((a, b) => b.rating - a.rating)[0]?.id, [bids]);
  const selected = bids.find((b) => b.id === selectedBidId) ?? null;
  const [confirming, setConfirming] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [checking, setChecking] = useState(false);

  const refreshVendorBids = useCallback(async () => {
    if (!remoteBriefId) return;
    setChecking(true);
    try {
      const dbBids = await loadBidsForBrief(remoteBriefId);
      const merged = mergeBids(bids, dbBids);
      if (merged.length !== bids.length) setBids(merged);
    } finally {
      setChecking(false);
    }
  }, [bids, remoteBriefId, setBids]);

  // Pull in any real vendor bids submitted against this brief.
  useEffect(() => {
    const handle = setTimeout(() => void refreshVendorBids(), 0);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteBriefId]);

  function openConfirm() {
    if (!selected) return;
    haptic.medium();
    setConfirming(true);
  }

  async function confirmAccept() {
    if (!selected) return;
    setConfirming(false);
    setAccepting(true);

    try {
      const remoteOrderId = await saveAcceptedOrder(remoteBriefId, selected);
      const order = bookSelectedBid();
      haptic.success();

      if (order) {
        router.dismissAll();
        router.navigate('/briefs');
      }

      if (!remoteOrderId) {
        Alert.alert(
          'Order saved locally',
          'The remote order could not be created yet. Run the latest Supabase migration, then try accepting a new bid.'
        );
        return;
      }

      const checkout = await createCheckoutSession(remoteOrderId);
      await openCheckout(checkout.url);
    } catch (error) {
      Alert.alert(
        'Payment setup needed',
        error instanceof Error
          ? error.message
          : 'Stripe Checkout could not start. Check your Supabase function secrets and deployment.'
      );
    } finally {
      setAccepting(false);
    }
  }

  return (
    <Screen
      showBack
      eyebrow="The bids"
      title="Compare offers"
      subtitle={`${bids.length} vendors responded${spec ? ` - ${spec.title}` : ''}`}
      footer={
        <View style={{ gap: Spacing.two }}>
          <Button
            title={selected ? `Accept - ${formatPrice(selected.price)}` : 'Select a bid to continue'}
            iconRight={selected ? 'arrow-right' : undefined}
            disabled={!selected || accepting}
            loading={accepting}
            onPress={openConfirm}
          />
          {remoteBriefId ? (
            <Button
              title="Check for new bids"
              variant="ghost"
              iconRight="refresh-cw"
              loading={checking}
              onPress={refreshVendorBids}
            />
          ) : null}
        </View>
      }>
      {selected ? (
        <ConfirmDialog
          visible={confirming}
          title={`Accept ${selected.vendorName}?`}
          message={`${formatPrice(selected.price)} - ready in about ${selected.etaDays} days. Your payment is held in escrow and released only when you confirm the job is done.`}
          confirmLabel="Continue to checkout"
          loading={accepting}
          onConfirm={confirmAccept}
          onCancel={() => setConfirming(false)}
        />
      ) : null}

      {sorted.map((bid, i) => (
        <Animated.View key={bid.id} entering={FadeInDown.delay(i * 70).duration(340)}>
          <BidCard
            bid={bid}
            selected={bid.id === selectedBidId}
            isCheapest={bid.id === cheapestId}
            isTopRated={bid.id === topRatedId}
            onPress={() => {
              haptic.light();
              selectBid(bid.id);
            }}
          />
        </Animated.View>
      ))}

      <ThemedText type="small" themeColor="muted">
        Tap a bid to select it. Payment stays in escrow until you are satisfied.
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
          borderColor: selected ? theme.text : theme.border,
          borderWidth: selected ? 1.5 : StyleSheet.hairlineWidth,
          opacity: pressed ? 0.9 : 1,
        },
      ]}>
      {isCheapest || isTopRated ? (
        <View style={styles.badgeRow}>
          {isCheapest ? (
            <ThemedText type="eyebrow" style={{ color: theme.tint }}>
              Lowest price
            </ThemedText>
          ) : null}
          {isCheapest && isTopRated ? (
            <ThemedText type="eyebrow" themeColor="muted">
              -
            </ThemedText>
          ) : null}
          {isTopRated ? (
            <ThemedText type="eyebrow" themeColor="textSecondary">
              Top rated
            </ThemedText>
          ) : null}
        </View>
      ) : null}

      <View style={styles.header}>
        <View style={styles.vendor}>
          <Avatar name={bid.vendorName} size={46} />
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <ThemedText type="subtitle" style={{ fontSize: 19, flexShrink: 1 }} numberOfLines={1}>
                {bid.vendorName}
              </ThemedText>
              {bid.verified ? <Icon name="check-circle" size={15} color={theme.tint} /> : null}
            </View>
            <View style={styles.metaRow}>
              <Rating value={bid.rating} reviewCount={bid.reviewCount} />
              <ThemedText type="small" themeColor="muted">
                - {bid.distanceKm} km away
              </ThemedText>
            </View>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <ThemedText type="subtitle" style={{ fontSize: 22 }}>
            {formatPrice(bid.price)}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            ~{bid.etaDays} days
          </ThemedText>
        </View>
      </View>

      <ThemedText type="serifQuote" themeColor="textSecondary">
        {`"${bid.message}"`}
      </ThemedText>

      <View style={styles.highlights}>
        {bid.highlights.map((h, i) => (
          <View key={h} style={styles.highlight}>
            {i > 0 ? <View style={[styles.dot, { backgroundColor: theme.muted }]} /> : null}
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
  card: { borderRadius: Radius.lg, padding: Spacing.four, gap: Spacing.three },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.two },
  vendor: { flexDirection: 'row', gap: Spacing.three, flex: 1, alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: 3 },
  highlights: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.two },
  highlight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  dot: { width: 3, height: 3, borderRadius: 999 },
});

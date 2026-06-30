import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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
import { formatPrice } from '@/lib/config';
import { haptic } from '@/lib/haptics';
import type { Bid } from '@/lib/types';
import { useBrief } from '@/store/BriefContext';

export default function BidsScreen() {
  const { spec, bids, selectedBidId, selectBid, bookSelectedBid } = useBrief();

  const sorted = useMemo(() => [...bids].sort((a, b) => a.price - b.price), [bids]);
  const cheapestId = sorted[0]?.id;
  const topRatedId = useMemo(() => [...bids].sort((a, b) => b.rating - a.rating)[0]?.id, [bids]);
  const selected = bids.find((b) => b.id === selectedBidId) ?? null;
  const [confirming, setConfirming] = useState(false);

  function openConfirm() {
    if (!selected) return;
    haptic.medium();
    setConfirming(true);
  }

  function confirmAccept() {
    setConfirming(false);
    const order = bookSelectedBid();
    haptic.success();
    router.dismissAll();
    if (order) router.navigate('/briefs');
  }

  return (
    <Screen
      showBack
      eyebrow="The bids"
      title="Compare offers"
      subtitle={`${bids.length} vendors responded${spec ? ` · ${spec.title}` : ''}`}
      footer={
        <Button
          title={selected ? `Accept · ${formatPrice(selected.price)}` : 'Select a bid to continue'}
          iconRight={selected ? 'arrow-right' : undefined}
          disabled={!selected}
          onPress={openConfirm}
        />
      }>
      {selected && (
        <ConfirmDialog
          visible={confirming}
          title={`Accept ${selected.vendorName}?`}
          message={`${formatPrice(selected.price)} · ready in about ${selected.etaDays} days. Your payment is held in escrow and released only when you confirm the job is done.`}
          confirmLabel="Confirm & fund escrow"
          onConfirm={confirmAccept}
          onCancel={() => setConfirming(false)}
        />
      )}
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
        Tap a bid to select it. Payment stays in escrow until you’re satisfied.
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
      {(isCheapest || isTopRated) && (
        <View style={styles.badgeRow}>
          {isCheapest && (
            <ThemedText type="eyebrow" style={{ color: theme.tint }}>
              Lowest price
            </ThemedText>
          )}
          {isCheapest && isTopRated && <ThemedText type="eyebrow" themeColor="muted">·</ThemedText>}
          {isTopRated && (
            <ThemedText type="eyebrow" themeColor="textSecondary">
              Top rated
            </ThemedText>
          )}
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.vendor}>
          <Avatar name={bid.vendorName} size={46} />
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <ThemedText type="subtitle" style={{ fontSize: 19, flexShrink: 1 }} numberOfLines={1}>
                {bid.vendorName}
              </ThemedText>
              {bid.verified && <Icon name="check-circle" size={15} color={theme.tint} />}
            </View>
            <View style={styles.metaRow}>
              <Rating value={bid.rating} reviewCount={bid.reviewCount} />
              <ThemedText type="small" themeColor="muted">
                · {bid.distanceKm} km away
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
        “{bid.message}”
      </ThemedText>

      <View style={styles.highlights}>
        {bid.highlights.map((h, i) => (
          <View key={h} style={styles.highlight}>
            {i > 0 && <View style={[styles.dot, { backgroundColor: theme.muted }]} />}
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

import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { useToast } from '@/components/ui/Toast';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/config';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/AuthContext';

type RemoteOrder = { id: string; status: string; escrow_amount: number; created_at: string };

const STATUS_LABEL: Record<string, string> = {
  escrow_pending: 'Awaiting payment',
  funded: 'Funded — in escrow',
  in_progress: 'In progress',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export default function AccountPayments() {
  const theme = useTheme();
  const toast = useToast();
  const { user } = useAuth();
  const [orders, setOrders] = useState<RemoteOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const { data } = await supabase
        .from('orders')
        .select('id, status, escrow_amount, created_at')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setOrders(data as RemoteOrder[]);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    const h = setTimeout(() => void load(), 0);
    return () => clearTimeout(h);
  }, [load]);

  async function startCheckout(orderId: string) {
    setCheckoutId(orderId);
    try {
      router.push({ pathname: '/checkout', params: { orderId } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not open checkout.');
    } finally {
      setCheckoutId(null);
    }
  }

  const funded = orders.filter((o) => o.status === 'funded').length;

  return (
    <Screen
      showBack
      showHome
      eyebrow="Account"
      title="Payment & escrow"
      subtitle="Card details are handled by Stripe Checkout — never stored in the app."
      footer={<Button title="Refresh status" variant="secondary" iconRight="refresh-cw" loading={refreshing} onPress={load} />}>
      <View style={styles.statusGrid}>
        <Tile label="Orders" value={String(orders.length)} />
        <Tile label="Funded" value={String(funded)} />
        <Tile label="Pending" value={String(orders.filter((o) => o.status === 'escrow_pending').length)} />
      </View>

      {orders.length ? (
        orders.map((order) => (
          <View key={order.id} style={[styles.row, { borderColor: theme.border }]}>
            <View style={{ flex: 1 }}>
              <ThemedText type="label">{formatPrice(order.escrow_amount)}</ThemedText>
              <ThemedText type="small" themeColor="muted">
                {STATUS_LABEL[order.status] ?? order.status}
              </ThemedText>
            </View>
            {order.status === 'escrow_pending' ? (
              <Button
                title="Pay now"
                variant="secondary"
                loading={checkoutId === order.id}
                onPress={() => startCheckout(order.id)}
                style={styles.payBtn}
              />
            ) : (
              <Icon name="check-circle" color={theme.success} />
            )}
          </View>
        ))
      ) : (
        <ThemedText type="small" themeColor="textSecondary">
          Accept a bid to create an escrow order. It will appear here to fund via Stripe.
        </ThemedText>
      )}
    </Screen>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.tile, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="title" style={{ fontSize: 22 }} numberOfLines={1}>
        {value}
      </ThemedText>
      <ThemedText type="eyebrow" themeColor="muted">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  statusGrid: { flexDirection: 'row', gap: Spacing.two },
  tile: { flex: 1, borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.three, gap: Spacing.one },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  payBtn: { minHeight: 42, paddingHorizontal: Spacing.three },
});

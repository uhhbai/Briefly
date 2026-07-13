import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useToast } from '@/components/ui/Toast';
import { Spacing } from '@/constants/theme';
import { createCheckoutSession, openCheckoutFallback } from '@/lib/payments';

export default function NativeCheckoutScreen() {
  const toast = useToast();
  const params = useLocalSearchParams<{ orderId?: string }>();
  const orderId = typeof params.orderId === 'string' ? params.orderId : '';
  const [loading, setLoading] = useState(false);

  async function openSecureCheckout() {
    if (!orderId) return;
    setLoading(true);
    try {
      const checkout = await createCheckoutSession(orderId);
      await openCheckoutFallback(checkout.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not open Stripe Checkout.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen showBack showHome eyebrow="Payment" title="Checkout">
      <View style={{ gap: Spacing.three }}>
        <ThemedText type="small" themeColor="textSecondary">
          Embedded card entry is available on the website. On this device, use Stripe&apos;s secure checkout page.
        </ThemedText>
        <Button title="Open secure checkout" iconRight="external-link" loading={loading} disabled={!orderId} onPress={openSecureCheckout} />
        <Button title="Back to payments" variant="ghost" iconRight="credit-card" onPress={() => router.replace('/account/payments')} />
      </View>
    </Screen>
  );
}

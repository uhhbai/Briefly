import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Spacing } from '@/constants/theme';
import { createCheckoutSession } from '@/lib/payments';

const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export default function WebCheckoutScreen() {
  const params = useLocalSearchParams<{ orderId?: string }>();
  const orderId = typeof params.orderId === 'string' ? params.orderId : '';

  const fetchClientSecret = useCallback(async () => {
    if (!orderId) throw new Error('Missing order ID.');
    const checkout = await createCheckoutSession(orderId);
    if (!checkout.clientSecret) {
      throw new Error('Stripe did not return an embedded checkout secret. Redeploy create-checkout-session.');
    }
    return checkout.clientSecret;
  }, [orderId]);

  const options = useMemo(() => ({ fetchClientSecret }), [fetchClientSecret]);

  if (!orderId) {
    return (
      <Screen showBack showHome eyebrow="Payment" title="Checkout">
        <ThemedText type="small" themeColor="textSecondary">
          This checkout link is missing an order. Return to Payment & escrow and try again.
        </ThemedText>
        <Button title="Back to payments" variant="secondary" iconRight="credit-card" onPress={() => router.replace('/account/payments')} />
      </Screen>
    );
  }

  if (!stripePromise) {
    return (
      <Screen showBack showHome eyebrow="Payment" title="Checkout">
        <ThemedText type="small" themeColor="textSecondary">
          Add EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env, then restart Expo to show checkout here.
        </ThemedText>
      </Screen>
    );
  }

  return (
    <Screen
      showBack
      showHome
      eyebrow="Payment"
      title="Checkout"
      subtitle="Card details stay inside Stripe's encrypted payment form. Briefly never stores them.">
      <Card style={styles.checkoutCard}>
        <View style={styles.checkoutHost}>
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{
              ...options,
              onComplete: () => router.replace('/account/payments'),
            }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  checkoutCard: { padding: Spacing.two },
  checkoutHost: {
    minHeight: 680,
    width: '100%',
  },
});

import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Spacing } from '@/constants/theme';

export default function CheckoutReturnScreen() {
  const params = useLocalSearchParams<{ session_id?: string }>();
  const hasSession = typeof params.session_id === 'string' && params.session_id.length > 0;

  useEffect(() => {
    const handle = setTimeout(() => router.replace('/account/payments'), 2500);
    return () => clearTimeout(handle);
  }, []);

  return (
    <Screen showHome eyebrow="Payment" title={hasSession ? 'Payment received' : 'Checkout finished'}>
      <View style={{ gap: Spacing.three }}>
        <ThemedText type="small" themeColor="textSecondary">
          Stripe is confirming the payment. Your escrow status updates when the webhook finishes.
        </ThemedText>
        <Button title="View payment status" iconRight="credit-card" onPress={() => router.replace('/account/payments')} />
      </View>
    </Screen>
  );
}

import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

export type CheckoutSessionResponse = {
  clientSecret?: string | null;
  url?: string | null;
  sessionId?: string;
};

export type CheckoutSession = {
  clientSecret: string | null;
  url: string | null;
  sessionId: string;
};

export async function createCheckoutSession(orderId: string): Promise<CheckoutSession> {
  const { data, error } = await supabase.functions.invoke<CheckoutSessionResponse>('create-checkout-session', {
    body: { orderId },
  });

  if (error) {
    throw new Error(
      [
        'Could not reach the payment Edge Function.',
        'Make sure create-checkout-session is deployed to this Supabase project.',
        `Supabase said: ${error.message}`,
      ].join(' ')
    );
  }
  if (!data?.sessionId) {
    throw new Error('Stripe checkout did not return a session.');
  }
  if (!data.clientSecret && !data.url) {
    throw new Error('Stripe checkout did not return an embedded checkout secret.');
  }

  return { clientSecret: data.clientSecret ?? null, url: data.url ?? null, sessionId: data.sessionId };
}

export async function openCheckoutFallback(url: string | null) {
  if (!url) {
    throw new Error(
      Platform.OS === 'web'
        ? 'This checkout session is embedded. Open it from the Briefly checkout page.'
        : 'Stripe did not return a checkout link for this device.'
    );
  }
  await WebBrowser.openBrowserAsync(url);
}

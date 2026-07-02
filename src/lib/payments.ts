import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/lib/supabase';

type CheckoutSessionResponse = {
  url?: string;
  sessionId?: string;
};

export async function createCheckoutSession(orderId: string): Promise<Required<CheckoutSessionResponse>> {
  const { data, error } = await supabase.functions.invoke<CheckoutSessionResponse>('create-checkout-session', {
    body: { orderId },
  });

  if (error) throw error;
  if (!data?.url || !data.sessionId) {
    throw new Error('Stripe checkout did not return a payment link.');
  }

  return { url: data.url, sessionId: data.sessionId };
}

export async function openCheckout(url: string) {
  await WebBrowser.openBrowserAsync(url);
}

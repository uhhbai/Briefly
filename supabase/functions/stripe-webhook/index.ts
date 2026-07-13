import Stripe from 'npm:stripe@18.5.0';
import { createClient } from 'npm:@supabase/supabase-js@2.110.0';

import { corsHeaders } from '../_shared/cors.ts';

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!stripeSecretKey || !serviceRoleKey || !supabaseUrl || !webhookSecret) {
      throw new Error('Webhook secrets are not configured.');
    }

    const stripe = new Stripe(stripeSecretKey);
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return json({ error: 'Missing Stripe signature.' }, 400);
    }

    const rawBody = await req.text();
    const event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;

      if (orderId && session.payment_status === 'paid') {
        const amount = Math.round((session.amount_total ?? 0) / 100);
        await Promise.all([
          admin.from('orders').update({ status: 'funded', updated_at: new Date().toISOString() }).eq('id', orderId),
          admin
            .from('payment_sessions')
            .update({ status: 'paid', updated_at: new Date().toISOString() })
            .eq('stripe_session_id', session.id),
          admin.from('escrow_events').insert({
            order_id: orderId,
            event_type: 'funded',
            amount,
            provider_ref: session.id,
          }),
        ]);
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;
      await Promise.all([
        admin
          .from('payment_sessions')
          .update({ status: 'expired', updated_at: new Date().toISOString() })
          .eq('stripe_session_id', session.id),
        orderId
          ? admin.from('escrow_events').insert({
              order_id: orderId,
              event_type: 'failed',
              amount: Math.round((session.amount_total ?? 0) / 100),
              provider_ref: session.id,
            })
          : Promise.resolve(),
      ]);
    }

    return json({ received: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Webhook failed.' }, 400);
  }
});

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

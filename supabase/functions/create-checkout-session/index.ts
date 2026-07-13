import Stripe from 'npm:stripe@18.5.0';
import { createClient } from 'npm:@supabase/supabase-js@2.110.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const fallbackAppUrl = Deno.env.get('APP_URL') ?? 'http://localhost:8081';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!stripeSecretKey || !serviceRoleKey || !supabaseUrl) {
      throw new Error('Payment secrets are not configured.');
    }

    const stripe = new Stripe(stripeSecretKey);
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return json({ error: 'Missing authorization.' }, 401);
    }

    const {
      data: { user },
      error: userError,
    } = await admin.auth.getUser(token);

    if (userError || !user) {
      return json({ error: 'Invalid authorization.' }, 401);
    }

    const { orderId } = await req.json();
    if (!orderId || typeof orderId !== 'string') {
      return json({ error: 'Missing orderId.' }, 400);
    }

    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('id, brief_id, bid_id, buyer_id, escrow_amount, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return json({ error: 'Order not found.' }, 404);
    }

    if (order.buyer_id && order.buyer_id !== user.id) {
      return json({ error: 'This order belongs to a different account.' }, 403);
    }

    if (!order.buyer_id) {
      await admin.from('orders').update({ buyer_id: user.id }).eq('id', order.id);
    }

    const [{ data: brief }, { data: bid }] = await Promise.all([
      admin.from('briefs').select('title, summary').eq('id', order.brief_id).maybeSingle(),
      admin.from('bids').select('vendor_name').eq('id', order.bid_id).maybeSingle(),
    ]);

    const amount = Math.max(100, Math.round(Number(order.escrow_amount) * 100));
    const origin = req.headers.get('origin') ?? fallbackAppUrl;
    const appUrl = origin.startsWith('http') ? origin : fallbackAppUrl;
    const title = brief?.title ?? 'Briefly escrow payment';
    const vendorName = bid?.vendor_name ? ` with ${bid.vendor_name}` : '';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'sgd',
            unit_amount: amount,
            product_data: {
              name: `${title}${vendorName}`,
              description: brief?.summary?.slice(0, 500) ?? 'Briefly service booking',
            },
          },
        },
      ],
      metadata: {
        order_id: order.id,
        brief_id: order.brief_id,
        user_id: user.id,
      },
      success_url: `${appUrl}/briefs?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/bids?checkout=cancelled&order_id=${order.id}`,
    });

    await Promise.all([
      admin.from('payment_sessions').upsert(
        {
          order_id: order.id,
          profile_id: user.id,
          stripe_session_id: session.id,
          checkout_url: session.url,
          status: 'open',
          amount: order.escrow_amount,
          currency: 'sgd',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'stripe_session_id' }
      ),
      admin.from('escrow_events').insert({
        order_id: order.id,
        event_type: 'checkout_started',
        amount: order.escrow_amount,
        provider_ref: session.id,
      }),
    ]);

    return json({ url: session.url, sessionId: session.id });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Checkout failed.' }, 500);
  }
});

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

import { createClient } from 'npm:@supabase/supabase-js@2.110.0';

import { corsHeaders } from '../_shared/cors.ts';

// Sends the buyer a Telegram message when a vendor bids on their brief.
// Secrets required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TELEGRAM_BOT_TOKEN.

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN') ?? '';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!serviceRoleKey || !supabaseUrl) {
      throw new Error('Server secrets are not configured.');
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Require a signed-in caller (the bidding vendor).
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return json({ error: 'Missing authorization.' }, 401);
    const {
      data: { user },
      error: userError,
    } = await admin.auth.getUser(token);
    if (userError || !user) return json({ error: 'Invalid authorization.' }, 401);

    const { briefId, vendorName, price } = await req.json();
    if (!briefId || typeof briefId !== 'string') {
      return json({ error: 'Missing briefId.' }, 400);
    }

    const { data: brief } = await admin
      .from('briefs')
      .select('id, title, buyer_id')
      .eq('id', briefId)
      .maybeSingle();

    if (!brief?.buyer_id) return json({ sent: false, reason: 'no_buyer' });

    const { data: buyer } = await admin
      .from('profiles')
      .select('telegram_chat_id, display_name')
      .eq('id', brief.buyer_id)
      .maybeSingle();

    const chatId = buyer?.telegram_chat_id?.trim();
    if (!chatId) return json({ sent: false, reason: 'no_chat_id' });

    if (!telegramBotToken) {
      return json({ sent: false, reason: 'no_bot_token' });
    }

    const priceLine = typeof price === 'number' && price > 0 ? ` — S$${price}` : '';
    const text =
      `🔔 *New bid on your brief*\n\n` +
      `*${escapeMarkdown(brief.title)}*\n` +
      `${escapeMarkdown(vendorName || 'A vendor')} just placed a bid${priceLine}.\n\n` +
      `Open Briefly to compare and accept.`;

    const tgRes = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    });

    if (!tgRes.ok) {
      const detail = await tgRes.text();
      return json({ sent: false, reason: 'telegram_error', detail }, 502);
    }

    return json({ sent: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Notification failed.' }, 500);
  }
});

function escapeMarkdown(input: string): string {
  return String(input).replace(/([_*`\[\]])/g, '\\$1');
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

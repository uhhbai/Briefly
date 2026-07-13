import { createClient } from 'npm:@supabase/supabase-js@2.110.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Sends the buyer an in-app notification and, when linked, a Telegram message
// whenever a vendor bids on their brief.
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

    // Require a signed-in caller.
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return json({ error: 'Missing authorization.' }, 401);
    const {
      data: { user },
      error: userError,
    } = await admin.auth.getUser(token);
    if (userError || !user) return json({ error: 'Invalid authorization.' }, 401);

    const payload = await req.json().catch(() => ({}));

    if (payload?.botInfo === true) {
      const bot = await getBotInfo();
      if (!bot.ok) {
        return json({ botAvailable: false, reason: bot.reason, detail: bot.detail });
      }
      return json({ botAvailable: true, botUsername: bot.username, botName: bot.name });
    }

    // Test mode: send a sample message to the caller's own linked chat so a
    // buyer can confirm their chat id and bot setup from Settings.
    if (payload?.test === true) {
      if (!telegramBotToken) return json({ sent: false, reason: 'no_bot_token' });
      const bot = await getBotInfo();

      const { data: me } = await admin
        .from('profiles')
        .select('telegram_chat_id')
        .eq('id', user.id)
        .maybeSingle();
      const myChatId = me?.telegram_chat_id?.trim();
      if (!myChatId) return json({ sent: false, reason: 'no_chat_id', botUsername: bot.ok ? bot.username : null });

      const testRes = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: myChatId,
          text: 'Briefly is connected. You will get a message here whenever a vendor bids on your brief.',
        }),
      });
      if (!testRes.ok) {
        const detail = await responseDetail(testRes);
        return json({ sent: false, reason: 'telegram_error', detail, botUsername: bot.ok ? bot.username : null });
      }
      return json({ sent: true, botUsername: bot.ok ? bot.username : null });
    }

    const { briefId, vendorName, price } = payload;
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

    const inAppSent = await createBidNotification(admin, {
      buyerId: brief.buyer_id,
      briefTitle: brief.title,
      vendorName,
      price,
    });

    const chatId = buyer?.telegram_chat_id?.trim();
    if (!chatId) return json({ sent: false, inAppSent, reason: 'no_chat_id' });

    if (!telegramBotToken) {
      return json({ sent: false, inAppSent, reason: 'no_bot_token' });
    }

    const priceLine = typeof price === 'number' && price > 0 ? ` - S$${price}` : '';
    const text = [
      'New bid on your brief',
      '',
      brief.title,
      `${vendorName || 'A vendor'} just placed a bid${priceLine}.`,
      '',
      'Open Briefly to compare and accept.',
    ].join('\n');

    const tgRes = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    if (!tgRes.ok) {
      const detail = await responseDetail(tgRes);
      return json({ sent: false, inAppSent, reason: 'telegram_error', detail }, 502);
    }

    return json({ sent: true, inAppSent });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Notification failed.' }, 500);
  }
});

async function getBotInfo() {
  if (!telegramBotToken) {
    return { ok: false as const, reason: 'no_bot_token' };
  }

  const res = await fetch(`https://api.telegram.org/bot${telegramBotToken}/getMe`);
  if (!res.ok) {
    return { ok: false as const, reason: 'telegram_error', detail: await responseDetail(res) };
  }

  const body = await res.json().catch(() => null) as
    | { ok?: boolean; result?: { username?: string; first_name?: string }; description?: string }
    | null;
  if (!body?.ok || !body.result?.username) {
    return {
      ok: false as const,
      reason: 'telegram_error',
      detail: body?.description ?? 'Telegram did not return a bot username.',
    };
  }

  return {
    ok: true as const,
    username: body.result.username,
    name: body.result.first_name ?? body.result.username,
  };
}

async function createBidNotification(
  admin: ReturnType<typeof createClient>,
  input: { buyerId: string; briefTitle: string; vendorName: unknown; price: unknown }
) {
  const priceLine = typeof input.price === 'number' && input.price > 0 ? ` at S$${input.price}` : '';
  const vendor = typeof input.vendorName === 'string' && input.vendorName.trim() ? input.vendorName.trim() : 'A vendor';
  const { error } = await admin.from('notifications').insert({
    user_id: input.buyerId,
    title: 'New bid received',
    body: `${vendor} placed a bid${priceLine} on "${input.briefTitle}".`,
  });
  return !error;
}

async function responseDetail(response: Response) {
  const text = await response.text();
  try {
    const body = JSON.parse(text) as { description?: string };
    return body.description ?? text;
  } catch {
    return text;
  }
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

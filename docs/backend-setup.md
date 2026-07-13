# Briefly backend setup (Supabase + Stripe + Telegram)

The app runs against a real Supabase project. Do this once and payments,
vendor storefronts, and Telegram bid alerts all work.

- Project ref: `aqyigmhamqqedyiifwvs`
- Functions base URL: `https://aqyigmhamqqedyiifwvs.supabase.co/functions/v1`

There are two paths. **Path A (CLI)** is fastest but needs a network that
doesn't block the Supabase API — a corporate proxy often does (you'll see
`Transport error`). If the CLI won't connect, use a phone hotspot, or use
**Path B (browser only)**, which works behind a corporate proxy.

## 0. Environment (.env)
`.env` in the project root (git-ignored) needs:
```
EXPO_PUBLIC_SUPABASE_URL=https://aqyigmhamqqedyiifwvs.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your anon public key>
```
The client accepts `EXPO_PUBLIC_SUPABASE_ANON_KEY` **or**
`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

---

## Path A — CLI

```powershell
# Auth without the interactive browser login (avoids the flaky `supabase login`):
$env:SUPABASE_ACCESS_TOKEN = "sbp_your_token"   # Dashboard → Account → Tokens
npx supabase link --project-ref aqyigmhamqqedyiifwvs   # prompts for the DB password
npm run db:push                                        # applies every migration

# Secrets — SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically, do NOT set them:
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx TELEGRAM_BOT_TOKEN=123456:abc

npm run functions:deploy   # deploys all three; the webhook goes out with --no-verify-jwt
```
Then do **Stripe webhook** below.

---

## Path B — Browser only (works behind a corporate proxy)

### 1. Database
Dashboard → **SQL Editor** → **New query** → paste all of
[`docs/all-migrations.sql`](all-migrations.sql) → **Run**. It's idempotent, so
re-running is safe. This creates every table + RLS, the `vendor-media` storage
bucket, the `telegram_chat_id` column, and vendor-owned service listings.

### 2. Edge functions
Dashboard → **Edge Functions** → **Deploy a new function** (in-browser editor).
Create each one, name it EXACTLY as shown, paste the file's contents:

| Function name             | Paste from                                            | Verify JWT |
|---------------------------|-------------------------------------------------------|------------|
| `create-checkout-session` | `supabase/functions/create-checkout-session/index.ts` | **On**     |
| `notify-bid`              | `supabase/functions/notify-bid/index.ts`              | **On**     |
| `stripe-webhook`          | `supabase/functions/stripe-webhook/index.ts`          | **OFF** ⚠️ |

Each function is self-contained (no shared imports), so it pastes cleanly.

### 3. Secrets
Dashboard → **Edge Functions → Secrets**. Add `STRIPE_SECRET_KEY`,
`TELEGRAM_BOT_TOKEN`, and (after the webhook step) `STRIPE_WEBHOOK_SECRET`.
Don't add `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — they're automatic.

---

## Stripe webhook (required — this is what makes a payment "complete")

> **Why payments look broken without this:** Supabase verifies a user JWT on
> functions by default. Stripe's webhook sends a *signature*, not a JWT, so it
> gets rejected with 401 and the order never moves to `funded`. The
> `stripe-webhook` function must be deployed with JWT verification OFF —
> Path A does this via `--no-verify-jwt`; Path B via the **Verify JWT: Off**
> toggle in the table above.

1. Deploy the functions (Path A or B).
2. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
   - URL: `https://aqyigmhamqqedyiifwvs.supabase.co/functions/v1/stripe-webhook`
   - Events: `checkout.session.completed`, `checkout.session.expired`
3. Copy the signing secret (`whsec_…`) → set `STRIPE_WEBHOOK_SECRET`.
   - Path A: `npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...` then
     `npm run functions:deploy:webhook`
   - Path B: add it in the dashboard Secrets (no redeploy needed).

**Flow:** accept a bid → app opens Stripe Checkout → on payment Stripe calls the
webhook → order becomes `funded` and an escrow event is recorded.
Account → Payment & escrow → **Refresh** shows the status update.

> Native redirect note: after paying, Stripe redirects to `APP_URL` (default
> `http://localhost:8081`). The payment still completes regardless — the webhook
> is what matters. Set an `APP_URL` secret to point at your own page.

---

## Telegram bid alerts

1. Telegram → **@BotFather** → `/newbot` → copy the token → set
   `TELEGRAM_BOT_TOKEN` (Path A/B secrets). Rotate it with `/revoke` if it ever leaks.
2. As a buyer: message **@userinfobot** to get your numeric chat ID, paste it in
   the app under **Account → Settings → Telegram chat ID**, Save.
3. Press **Start** in a chat with your bot once (Telegram blocks bots from DMing
   users who haven't started them).

When a vendor bids, `submitVendorBid` calls `notify-bid`, which (service role)
looks up the brief's buyer and DMs their linked chat. It always writes an in-app
notification too, so alerts work even without Telegram linked.

## Troubleshooting
- **"Could not reach the payment Edge Function"** → functions not deployed, or
  the CLI never linked / the network blocked it.
- **Checkout opens but order stays `escrow_pending`** → webhook missing, wrong
  `STRIPE_WEBHOOK_SECRET`, or `stripe-webhook` deployed with Verify JWT **on**.
- **No Telegram message** → missing `TELEGRAM_BOT_TOKEN`, wrong/blank chat ID, or
  you never pressed Start in the bot chat. (The in-app notification still appears.)

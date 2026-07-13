# Briefly backend setup (Supabase + Stripe + Telegram)

The app runs against a real Supabase project. Follow these once and payments,
vendor storefronts, and Telegram bid alerts all work.

## 0. Prerequisites
- The Supabase CLI (used via `npx supabase …`, no install needed).
- Your project ref: `aqyigmhamqqedyiifwvs` (already in `supabase/config.toml`).
- A Stripe account (test mode is fine).

## 1. Environment (.env)
`.env` in the project root (git-ignored) needs:
```
EXPO_PUBLIC_SUPABASE_URL=https://aqyigmhamqqedyiifwvs.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your anon public key>
```
The client accepts `EXPO_PUBLIC_SUPABASE_ANON_KEY` **or**
`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## 2. Link + push the database
```
npm run db:login      # opens browser to authenticate the CLI
npm run db:link       # pick the Briefly project
npm run db:push       # applies every migration in supabase/migrations
```
This creates all tables, RLS, the `vendor-media` storage bucket, the
`telegram_chat_id` column, and vendor-owned service listings.

## 3. Set function secrets
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically — you
only set the third-party ones:
```
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx   # from step 5
npx supabase secrets set APP_URL=https://your-landing-or-web-url
npx supabase secrets set TELEGRAM_BOT_TOKEN=123456:ABC...  # from step 6 (optional)
```

## 4. Deploy the edge functions
```
npm run functions:deploy
```
Deploys `create-checkout-session`, `stripe-webhook`, and `notify-bid`.

> **Why payments "don't work" without this:** Supabase verifies a user JWT on
> functions by default. Stripe's webhook sends a *signature*, not a JWT, so it
> would be rejected with 401 and orders would never move to `funded`.
> `supabase/config.toml` disables JWT verification for `stripe-webhook` only —
> make sure you deploy *after* that file exists.

## 5. Configure the Stripe webhook
In the Stripe dashboard → Developers → Webhooks → Add endpoint:
- URL: `https://aqyigmhamqqedyiifwvs.supabase.co/functions/v1/stripe-webhook`
- Events: `checkout.session.completed`, `checkout.session.expired`
- Copy the signing secret (`whsec_…`) into `STRIPE_WEBHOOK_SECRET` (step 3),
  then redeploy: `npm run functions:deploy:webhook`.

Flow: accept a bid → app opens Stripe Checkout → on payment Stripe calls the
webhook → order becomes `funded` and an escrow event is recorded. Pull to
refresh (Account → Payment & escrow → Refresh) to see the status update.

## 6. Telegram bid alerts (optional)
1. In Telegram, message **@BotFather** → `/newbot` → copy the bot token →
   set it as `TELEGRAM_BOT_TOKEN` (step 3) and redeploy `notify-bid`.
2. As a buyer: message **@userinfobot** to get your numeric chat ID, paste it
   in the app under Account → Settings → Telegram chat ID, and press Save.
3. Start a chat with your bot (send it any message) so it's allowed to DM you.
4. When a vendor bids on your brief, `notify-bid` DMs you automatically.

## Troubleshooting
- **"Could not reach the payment Edge Function"** → functions not deployed, or
  project not linked. Re-run steps 2 and 4.
- **Checkout opens but order stays `escrow_pending`** → webhook not configured
  or `STRIPE_WEBHOOK_SECRET` wrong (step 5).
- **No Telegram message** → missing `TELEGRAM_BOT_TOKEN`, missing/incorrect
  chat ID, or you never started a chat with the bot (step 6).

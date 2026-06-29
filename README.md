# Briefly 📋

**Describe it. They build it.** — a reverse marketplace for custom-made products & services.

You describe what you want made or done; the AI turns it into a clear, structured spec; real
vendors (carpenters, painters, 3D-print shops, makers) bid for the job; you compare and pick.
Briefly earns a 10–20% commission on completed jobs.

> Pilot market: **Singapore / SEA** (prices in SGD).

---

## What's built so far (the buyer flow)

```
Describe  →  AI Brief Builder  →  Structured Spec  →  Compare Bids  →  Pick
(index)      (builder)            (spec)              (bids)
```

- **Describe** — type (voice coming soon) what you want; tap an example to prefill.
- **AI Brief Builder** — the AI asks smart follow-up questions to fill gaps.
- **Structured Spec** — the messy text becomes a clean spec + a **budget sanity-check**.
- **Compare Bids** — realistic vendor bids with "Lowest price" / "Top rated" badges; pick one,
  funds go to (mock) escrow.

The AI and bids are a **mock layer right now** — no API keys, no cost, fully offline. The code
is structured so switching to real Claude + Supabase later is a one-file change.

---

## Project structure

```
src/
  app/                 Screens (file-based routing via expo-router)
    _layout.tsx        Root Stack + theme + BriefProvider
    index.tsx          Describe screen (home)
    builder.tsx        AI follow-up questions
    spec.tsx           Structured spec review
    bids.tsx           Compare & pick bids
  components/ui/        Button, Card, Chip, Screen (design system)
  constants/theme.ts   Colors, spacing, radius, fonts
  lib/
    types.ts           Domain types (Spec, Bid, etc.)
    config.ts          Categories, currency, USE_REAL_AI switch
    ai.ts              AI facade — screens import from here
    mockAI.ts          Mock spec-extraction + bids (swap for Claude later)
  store/BriefContext.tsx   Carries the draft brief across screens
```

### Swapping in real AI later

1. Create `src/lib/realAI.ts` exporting the same functions as `mockAI.ts`
   (`extractSpec`, `getFollowUps`, `generateBids`, `applyAnswers`).
2. Set `USE_REAL_AI = true` in `src/lib/config.ts` and point `ai.ts` at it.
3. The screens don't change.

---

## Run it (development)

```bash
npm install        # first time only
npm run start      # opens Expo Dev Tools
```

Then:
- **On your phone (easiest):** install **Expo Go** from the App Store / Play Store, then scan the
  QR code in the terminal. The app loads instantly and hot-reloads as you edit.
- **In a browser:** `npm run web`
- **Android emulator:** `npm run android`   ·   **iOS simulator (Mac only):** `npm run ios`

---

## Shipping to the App Store & Play Store

Builds are done in the cloud with **EAS** — you do **not** need a Mac for iOS.

```bash
npm install -g eas-cli
eas login                       # free Expo account
eas build:configure
eas build --platform android    # produces an .aab for Play Store
eas build --platform ios        # produces an .ipa for App Store (cloud-signed)
eas submit --platform android   # upload to Play Console
eas submit --platform ios       # upload to App Store Connect
```

**Accounts / costs you'll need before submitting:**
| Item | Cost |
|---|---|
| Expo account (EAS free tier) | Free (paid tiers for more build minutes) |
| Apple Developer Program | US$99 / year |
| Google Play Developer | US$25 one-time |

**Before first submission:** set a unique `ios.bundleIdentifier` and `android.package` in
`app.json` (e.g. `com.briefly.app`), finalise the app icon/splash in `assets/`, and bump
`version`.

---

## Roadmap (next slices)

- [ ] Voice input (expo-speech / on-device ASR)
- [ ] Real AI: Claude for spec extraction + budget check
- [ ] Backend: Supabase (auth, briefs, bids, escrow), real vendor accounts
- [ ] Vendor app side (receive briefs, place bids, manage jobs)
- [ ] "My Briefs" tab, chat, milestone tracking, photo/AR preview

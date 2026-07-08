# Briefly — Backend setup (Supabase)

The app runs on **mock data** until these steps are done. Once `.env` has your
keys, every data call automatically switches to the real database.

## 1. Create the project (one-time, ~2 min)

1. Go to [supabase.com](https://supabase.com) → **New project** (free tier is fine).
2. Pick a name + region (choose **Singapore** for the pilot) and a database password.
3. Wait for it to provision.

## 2. Add your keys

1. In the dashboard: **Project Settings → API**.
2. Copy **Project URL** and the **anon public** key.
3. In the repo, copy `.env.example` to `.env` and paste them in:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

## 3. Enable anonymous sign-in

**Authentication → Sign In / Providers → Anonymous sign-ins → Enable.**
(The app signs each device in anonymously so per-user data + security work
without a login screen yet.)

## 4. Apply the schema + seed data

**Option A — Supabase CLI (recommended, keeps migrations in sync):**
```bash
npx supabase login                       # opens browser, one-time
npx supabase link --project-ref <your-ref>   # the xxxx from your URL
npx supabase db push                     # runs both migration files
```

**Option B — no CLI:** open the dashboard **SQL Editor** and run the contents of,
in order:
1. `supabase/migrations/20260630090000_init_schema.sql`
2. `supabase/migrations/20260630090100_seed_catalog.sql`

## 5. Restart with the new env

```bash
npx expo start -c     # -c clears the cache so .env is picked up
```

You should see the catalog load from the database (no more "Supabase not
configured" warning in the logs), and briefs/orders you create will persist
across launches and devices.

## (Optional) Generate typed DB definitions

```bash
npx supabase gen types typescript --linked > src/lib/database.types.ts
```
Then the data layer in `src/lib/db.ts` can use fully-typed queries.

---

### How the code is wired

| Layer | File | Role |
|---|---|---|
| Client + anon auth | `src/lib/supabase.ts` | Creates the client, signs in anonymously |
| Session bootstrap | `src/store/SessionProvider.tsx` | Ensures a user on launch |
| Data access | `src/lib/db.ts` | All queries; **falls back to mock when no keys** |
| Schema | `supabase/migrations/*.sql` | Tables, RLS, seed |

Screens/stores should call `src/lib/db.ts` — never `supabase` directly.

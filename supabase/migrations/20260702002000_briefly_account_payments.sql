-- Account tools and Stripe payment tracking for Briefly.
-- Apply with: npm run db:push

alter table public.briefs alter column buyer_id set default auth.uid();
alter table public.orders alter column buyer_id set default auth.uid();

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_schema = 'public'
      and table_name = 'vendor_profiles'
      and constraint_name = 'vendor_profiles_profile_id_unique'
  ) then
    alter table public.vendor_profiles
      add constraint vendor_profiles_profile_id_unique unique (profile_id);
  end if;
end $$;

alter table public.escrow_events drop constraint if exists escrow_events_event_type_check;
alter table public.escrow_events
  add constraint escrow_events_event_type_check
  check (event_type in ('hold_created', 'checkout_started', 'funded', 'released', 'refunded', 'failed'));

create table if not exists public.user_addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Home',
  line1 text not null,
  unit text,
  postal_code text,
  country text not null default 'Singapore',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_sessions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  stripe_session_id text not null unique,
  checkout_url text,
  status text not null default 'open' check (status in ('open', 'paid', 'expired', 'failed')),
  amount integer not null,
  currency text not null default 'sgd',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_review', 'resolved')),
  created_at timestamptz not null default now()
);

create index if not exists user_addresses_profile_id_idx on public.user_addresses(profile_id);
create index if not exists payment_sessions_order_id_idx on public.payment_sessions(order_id);
create index if not exists payment_sessions_profile_id_idx on public.payment_sessions(profile_id);
create index if not exists support_requests_user_id_idx on public.support_requests(user_id);

alter table public.user_addresses enable row level security;
alter table public.payment_sessions enable row level security;
alter table public.support_requests enable row level security;

grant select, insert, update, delete on public.user_addresses to authenticated;
grant select, insert, update on public.payment_sessions to authenticated;
grant select, insert, update on public.support_requests to authenticated;
grant select, insert, update on public.orders to authenticated;
grant insert on public.notifications to authenticated;

drop policy if exists "orders own update" on public.orders;
create policy "orders own update" on public.orders
for update to authenticated
using (buyer_id = auth.uid())
with check (buyer_id = auth.uid());

drop policy if exists "addresses own" on public.user_addresses;
create policy "addresses own" on public.user_addresses
for all to authenticated
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

drop policy if exists "payment sessions own" on public.payment_sessions;
create policy "payment sessions own" on public.payment_sessions
for select to authenticated
using (profile_id = auth.uid());

drop policy if exists "payment sessions service insert" on public.payment_sessions;
create policy "payment sessions service insert" on public.payment_sessions
for insert to authenticated
with check (profile_id = auth.uid());

drop policy if exists "support requests own" on public.support_requests;
create policy "support requests own" on public.support_requests
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

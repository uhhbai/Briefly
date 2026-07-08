-- Briefly — initial schema
-- Marketplace where buyers post briefs and vendors bid. Catalog tables are
-- public-read; user data (briefs/bids/orders/profiles) is locked to the owner
-- via row-level security keyed on auth.uid() (works with anonymous sign-in).

-- ── Enums ──────────────────────────────────────────────────────────────────
create type brief_status as enum ('draft', 'open', 'booked', 'closed');
create type bid_status   as enum ('pending', 'accepted', 'rejected');
create type order_status as enum ('booked', 'in_progress', 'completed', 'cancelled');

-- ── Catalog (reference data, public read) ────────────────────────────────────
create table public.categories (
  id            text primary key,
  label         text not null,
  emoji         text not null default '',
  example       text not null default '',
  gradient_from text not null,
  gradient_to   text not null,
  image         text not null,
  sort_order    int  not null default 0
);

create table public.vendors (
  id            text primary key,
  name          text not null,
  avatar        text not null default '',
  category_id   text not null references public.categories(id),
  tagline       text not null default '',
  rating        numeric(2,1) not null default 0,
  review_count  int  not null default 0,
  jobs_done     int  not null default 0,
  verified      boolean not null default false,
  price_from    numeric not null default 0,
  location      text not null default '',
  gradient_from text not null,
  gradient_to   text not null,
  image         text not null,
  created_at    timestamptz not null default now()
);

create table public.services (
  id            text primary key,
  title         text not null,
  category_id   text not null references public.categories(id),
  vendor_id     text not null references public.vendors(id) on delete cascade,
  emoji         text not null default '',
  price_from    numeric not null default 0,
  rating        numeric(2,1) not null default 0,
  review_count  int  not null default 0,
  eta_days      int  not null default 0,
  gradient_from text not null,
  gradient_to   text not null,
  image         text not null,
  created_at    timestamptz not null default now()
);

-- ── Users & transactions (owner-scoped) ──────────────────────────────────────
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  location     text default 'Singapore',
  created_at   timestamptz not null default now()
);

create table public.briefs (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  title            text not null,
  category_id      text not null references public.categories(id),
  raw_text         text not null,
  summary          text not null default '',
  -- StructuredSpec.fields: [{ key, label, emoji, value }]
  fields           jsonb not null default '[]'::jsonb,
  budget_realistic boolean,
  budget_note      text,
  status           brief_status not null default 'open',
  created_at       timestamptz not null default now()
);

create table public.bids (
  id            uuid primary key default gen_random_uuid(),
  brief_id      uuid not null references public.briefs(id) on delete cascade,
  -- nullable: AI/mock-generated bids may not map to a real vendor yet
  vendor_id     text references public.vendors(id),
  vendor_name   text not null,
  vendor_avatar text not null default '',
  verified      boolean not null default false,
  rating        numeric(2,1) not null default 0,
  review_count  int not null default 0,
  price         numeric not null,
  eta_days      int not null default 0,
  message       text not null default '',
  highlights    text[] not null default '{}',
  distance_km   numeric not null default 0,
  status        bid_status not null default 'pending',
  created_at    timestamptz not null default now()
);

create table public.orders (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  brief_id   uuid not null references public.briefs(id) on delete cascade,
  bid_id     uuid not null references public.bids(id),
  status     order_status not null default 'booked',
  created_at timestamptz not null default now()
);

-- ── Indexes ──────────────────────────────────────────────────────────────────
create index vendors_category_idx on public.vendors (category_id);
create index services_category_idx on public.services (category_id);
create index services_vendor_idx  on public.services (vendor_id);
create index briefs_user_idx      on public.briefs (user_id, created_at desc);
create index bids_brief_idx       on public.bids (brief_id);
create index orders_user_idx      on public.orders (user_id, created_at desc);

-- ── Auto-create a profile row when a user signs up ───────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Row-Level Security ───────────────────────────────────────────────────────
alter table public.categories enable row level security;
alter table public.vendors    enable row level security;
alter table public.services   enable row level security;
alter table public.profiles   enable row level security;
alter table public.briefs     enable row level security;
alter table public.bids       enable row level security;
alter table public.orders     enable row level security;

-- Catalog: anyone (anon + authenticated) may read; no client writes.
create policy "categories are public" on public.categories for select using (true);
create policy "vendors are public"    on public.vendors    for select using (true);
create policy "services are public"   on public.services   for select using (true);

-- Profiles: owner reads/updates own row (insert handled by trigger).
create policy "read own profile"   on public.profiles for select using (auth.uid() = id);
create policy "update own profile" on public.profiles for update using (auth.uid() = id);

-- Briefs: full CRUD on your own rows only.
create policy "read own briefs"   on public.briefs for select using (auth.uid() = user_id);
create policy "insert own briefs" on public.briefs for insert with check (auth.uid() = user_id);
create policy "update own briefs" on public.briefs for update using (auth.uid() = user_id);
create policy "delete own briefs" on public.briefs for delete using (auth.uid() = user_id);

-- Bids: scoped through the parent brief's owner. (In the mock phase the app
-- writes its own bids; when real vendors bid, add a vendor-insert policy.)
create policy "read bids on own briefs" on public.bids for select
  using (exists (select 1 from public.briefs b where b.id = bids.brief_id and b.user_id = auth.uid()));
create policy "insert bids on own briefs" on public.bids for insert
  with check (exists (select 1 from public.briefs b where b.id = bids.brief_id and b.user_id = auth.uid()));
create policy "update bids on own briefs" on public.bids for update
  using (exists (select 1 from public.briefs b where b.id = bids.brief_id and b.user_id = auth.uid()));

-- Orders: owner only.
create policy "read own orders"   on public.orders for select using (auth.uid() = user_id);
create policy "insert own orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "update own orders" on public.orders for update using (auth.uid() = user_id);

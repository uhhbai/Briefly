-- Briefly — ALL migrations combined, in order. Safe to run as one query.
-- Paste this whole file into Supabase Dashboard → SQL Editor → New query → Run.

-- ============================================================
-- 20260702000000_briefly_catalog.sql
-- ============================================================
-- Briefly marketplace catalog bootstrap.
-- Run this in Supabase Dashboard -> SQL Editor -> New query.
-- It creates read-only public catalog tables for the app's Browse/Discover flow.

create table if not exists public.vendors (
  id text primary key,
  name text not null,
  avatar text not null default '',
  category_id text not null check (category_id in ('furniture', 'painting', 'renovation', 'printing', 'apparel', 'other')),
  tagline text not null,
  rating numeric(2,1) not null default 0,
  review_count integer not null default 0,
  jobs_done integer not null default 0,
  verified boolean not null default false,
  price_from integer not null default 0,
  location text not null,
  gradient_from text not null,
  gradient_to text not null,
  image text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id text primary key,
  title text not null,
  category_id text not null check (category_id in ('furniture', 'painting', 'renovation', 'printing', 'apparel', 'other')),
  vendor_id text not null references public.vendors(id) on delete cascade,
  emoji text not null default '',
  price_from integer not null default 0,
  rating numeric(2,1) not null default 0,
  review_count integer not null default 0,
  eta_days integer not null default 0,
  gradient_from text not null,
  gradient_to text not null,
  image text not null,
  created_at timestamptz not null default now()
);

alter table public.vendors enable row level security;
alter table public.services enable row level security;

grant select on public.vendors to anon, authenticated;
grant select on public.services to anon, authenticated;

drop policy if exists "vendors are publicly readable" on public.vendors;
create policy "vendors are publicly readable"
on public.vendors
for select
to anon, authenticated
using (true);

drop policy if exists "services are publicly readable" on public.services;
create policy "services are publicly readable"
on public.services
for select
to anon, authenticated
using (true);

insert into public.vendors (
  id, name, avatar, category_id, tagline, rating, review_count, jobs_done,
  verified, price_from, location, gradient_from, gradient_to, image
) values
  ('v_tan', 'Tan Woodworks', 'TW', 'furniture', 'Heirloom-grade solid wood furniture, made to measure.', 4.9, 213, 340, true, 280, 'Woodlands', '#6366F1', '#8B5CF6', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80&auto=format&fit=crop'),
  ('v_kampung', 'KampungCraft Studio', 'KC', 'furniture', 'Scandinavian-inspired pieces for small homes.', 4.7, 88, 120, true, 180, 'Tampines', '#0EA5E9', '#2563EB', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80&auto=format&fit=crop'),
  ('v_bayu', 'Bayu Finishings', 'BF', 'painting', 'Spotless interior & exterior painting, fast turnaround.', 4.6, 142, 410, true, 350, 'Jurong', '#F59E0B', '#EF4444', 'https://images.unsplash.com/photo-1604147706283-d7119b5b822c?w=800&q=80&auto=format&fit=crop'),
  ('v_freshcoat', 'FreshCoat SG', 'FC', 'painting', 'Eco-friendly paints, weekend slots available.', 4.8, 96, 205, false, 300, 'Bishan', '#F97316', '#DB2777', 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&q=80&auto=format&fit=crop'),
  ('v_built', 'BuiltRight Interiors', 'BI', 'renovation', 'Custom built-ins, wardrobes & feature walls.', 4.7, 174, 260, true, 900, 'Ang Mo Kio', '#0EA5E9', '#2563EB', 'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80&auto=format&fit=crop'),
  ('v_maker', 'Maker Lab SG', 'ML', 'printing', 'Rapid 3D printing & prototyping, PLA / ABS / resin.', 4.8, 156, 520, true, 40, 'one-north', '#10B981', '#059669', 'https://images.unsplash.com/photo-1611117775350-ac3950990985?w=800&q=80&auto=format&fit=crop'),
  ('v_precision', 'PrecisionPrint Co.', 'PP', 'printing', 'Engineering-grade prints with tight tolerances.', 4.6, 102, 300, true, 60, 'Kallang', '#14B8A6', '#0D9488', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80&auto=format&fit=crop'),
  ('v_thread', 'ThreadWorks', 'TW', 'apparel', 'Custom embroidery & printed apparel, bulk friendly.', 4.5, 64, 180, false, 12, 'Geylang', '#EC4899', '#BE185D', 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80&auto=format&fit=crop')
on conflict (id) do update set
  name = excluded.name,
  avatar = excluded.avatar,
  category_id = excluded.category_id,
  tagline = excluded.tagline,
  rating = excluded.rating,
  review_count = excluded.review_count,
  jobs_done = excluded.jobs_done,
  verified = excluded.verified,
  price_from = excluded.price_from,
  location = excluded.location,
  gradient_from = excluded.gradient_from,
  gradient_to = excluded.gradient_to,
  image = excluded.image;

insert into public.services (
  id, title, category_id, vendor_id, emoji, price_from, rating, review_count,
  eta_days, gradient_from, gradient_to, image
) values
  ('s_coffee', 'Custom solid-wood coffee table', 'furniture', 'v_tan', 'table', 480, 4.9, 96, 18, '#6366F1', '#8B5CF6', 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80&auto=format&fit=crop'),
  ('s_shelf', 'Floating shelves & bookcase', 'furniture', 'v_kampung', 'shelf', 220, 4.7, 41, 10, '#0EA5E9', '#2563EB', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80&auto=format&fit=crop'),
  ('s_flat', 'Full HDB flat repaint', 'painting', 'v_bayu', 'home', 680, 4.6, 120, 5, '#F59E0B', '#EF4444', 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800&q=80&auto=format&fit=crop'),
  ('s_accent', 'Feature / accent wall', 'painting', 'v_freshcoat', 'paint', 180, 4.8, 52, 2, '#F97316', '#DB2777', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80&auto=format&fit=crop'),
  ('s_wardrobe', 'Fitted wardrobe with soft-close', 'renovation', 'v_built', 'wardrobe', 1200, 4.7, 88, 21, '#0EA5E9', '#2563EB', 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&q=80&auto=format&fit=crop'),
  ('s_prototype', '3D-printed prototype batch', 'printing', 'v_maker', 'prototype', 40, 4.8, 73, 4, '#10B981', '#059669', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80&auto=format&fit=crop'),
  ('s_enclosure', 'Custom electronics enclosure', 'printing', 'v_precision', 'enclosure', 60, 4.6, 39, 6, '#14B8A6', '#0D9488', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80&auto=format&fit=crop'),
  ('s_polo', 'Embroidered company polos', 'apparel', 'v_thread', 'polo', 12, 4.5, 28, 9, '#EC4899', '#BE185D', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80&auto=format&fit=crop')
on conflict (id) do update set
  title = excluded.title,
  category_id = excluded.category_id,
  vendor_id = excluded.vendor_id,
  emoji = excluded.emoji,
  price_from = excluded.price_from,
  rating = excluded.rating,
  review_count = excluded.review_count,
  eta_days = excluded.eta_days,
  gradient_from = excluded.gradient_from,
  gradient_to = excluded.gradient_to,
  image = excluded.image;


-- ============================================================
-- 20260702001000_briefly_core.sql
-- ============================================================
-- Briefly core marketplace schema.
-- Apply with: npm run db:push

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.categories (
  id text primary key check (id in ('furniture', 'painting', 'renovation', 'printing', 'apparel', 'other')),
  label text not null,
  emoji text not null default '',
  example text not null default '',
  gradient_from text not null default '#7C3AED',
  gradient_to text not null default '#06B6D4',
  image text not null default '',
  created_at timestamptz not null default now()
);

insert into public.categories (id, label, emoji, example, gradient_from, gradient_to, image) values
  ('furniture', 'Furniture & Carpentry', 'furniture', 'A walnut coffee table for a 1.8m wall, hidden charging, under S$800', '#6D5DF6', '#20C7B5', 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80&auto=format&fit=crop'),
  ('painting', 'Painting & Home Services', 'paint', 'Paint my 3-room HDB flat, neutral colours, done within 2 weeks', '#FF9A76', '#F4C95D', 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800&q=80&auto=format&fit=crop'),
  ('renovation', 'Renovation & Built-ins', 'tools', 'Build a fitted wardrobe 2.4m wide with soft-close doors', '#4FA3F7', '#7AE0C3', 'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80&auto=format&fit=crop'),
  ('printing', '3D Printing & Prototyping', 'print', 'Print 20 PLA enclosures for a small electronics gadget', '#2DD4BF', '#8BDF7C', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80&auto=format&fit=crop'),
  ('apparel', 'Apparel & Custom Goods', 'thread', '30 embroidered polo shirts with our company logo', '#FF7AB6', '#7C8CF8', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80&auto=format&fit=crop'),
  ('other', 'Something else', 'spark', 'Describe anything you want made or done', '#8EA4FF', '#F8C96B', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80&auto=format&fit=crop')
on conflict (id) do update set
  label = excluded.label,
  emoji = excluded.emoji,
  example = excluded.example,
  gradient_from = excluded.gradient_from,
  gradient_to = excluded.gradient_to,
  image = excluded.image;

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_schema = 'public'
      and table_name = 'vendors'
      and constraint_name = 'vendors_category_id_fkey'
  ) then
    alter table public.vendors
      add constraint vendors_category_id_fkey
      foreign key (category_id) references public.categories(id);
  end if;

  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_schema = 'public'
      and table_name = 'services'
      and constraint_name = 'services_category_id_fkey'
  ) then
    alter table public.services
      add constraint services_category_id_fkey
      foreign key (category_id) references public.categories(id);
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Guest',
  role text not null default 'buyer' check (role in ('buyer', 'vendor', 'admin')),
  avatar_url text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vendor_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  vendor_id text references public.vendors(id) on delete set null,
  business_name text not null,
  category_id text not null references public.categories(id),
  bio text not null default '',
  service_area text not null default 'Singapore',
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.briefs (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.profiles(id) on delete set null,
  title text not null,
  category_id text not null references public.categories(id),
  raw_text text not null,
  summary text not null,
  budget_realistic boolean,
  budget_note text,
  status text not null default 'draft' check (status in ('draft', 'posted', 'bidding', 'booked', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brief_fields (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid not null references public.briefs(id) on delete cascade,
  field_key text not null,
  label text not null,
  emoji text not null default '',
  value text,
  created_at timestamptz not null default now()
);

create table if not exists public.follow_up_answers (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid not null references public.briefs(id) on delete cascade,
  field_key text not null,
  question text not null,
  answer text,
  created_at timestamptz not null default now()
);

create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid not null references public.briefs(id) on delete cascade,
  vendor_profile_id uuid references public.vendor_profiles(id) on delete set null,
  vendor_name text not null,
  vendor_avatar text not null default '',
  verified boolean not null default false,
  rating numeric(2,1) not null default 0,
  review_count integer not null default 0,
  price integer not null,
  eta_days integer not null,
  message text not null,
  highlights text[] not null default '{}',
  distance_km numeric(5,1) not null default 0,
  status text not null default 'submitted' check (status in ('submitted', 'accepted', 'declined', 'withdrawn')),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid not null references public.briefs(id) on delete restrict,
  bid_id uuid not null references public.bids(id) on delete restrict,
  buyer_id uuid references public.profiles(id) on delete set null,
  vendor_profile_id uuid references public.vendor_profiles(id) on delete set null,
  status text not null default 'escrow_pending' check (status in ('escrow_pending', 'funded', 'in_progress', 'delivered', 'completed', 'cancelled', 'refunded')),
  escrow_amount integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.order_milestones (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  title text not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done', 'blocked')),
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid references public.briefs(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  message_id uuid references public.messages(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete set null,
  bucket text not null default 'briefly',
  path text not null,
  url text,
  mime_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  reviewer_id uuid references public.profiles(id) on delete set null,
  vendor_profile_id uuid references public.vendor_profiles(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.escrow_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  event_type text not null check (event_type in ('hold_created', 'funded', 'released', 'refunded', 'failed')),
  amount integer not null,
  provider_ref text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists briefs_buyer_id_idx on public.briefs(buyer_id);
create index if not exists briefs_status_idx on public.briefs(status);
create index if not exists brief_fields_brief_id_idx on public.brief_fields(brief_id);
create index if not exists bids_brief_id_idx on public.bids(brief_id);
create index if not exists orders_buyer_id_idx on public.orders(buyer_id);
create index if not exists orders_vendor_profile_id_idx on public.orders(vendor_profile_id);
create index if not exists messages_order_id_idx on public.messages(order_id);
create index if not exists notifications_user_id_idx on public.notifications(user_id);

alter table public.categories enable row level security;
alter table public.profiles enable row level security;
alter table public.vendor_profiles enable row level security;
alter table public.briefs enable row level security;
alter table public.brief_fields enable row level security;
alter table public.follow_up_answers enable row level security;
alter table public.bids enable row level security;
alter table public.orders enable row level security;
alter table public.messages enable row level security;
alter table public.order_milestones enable row level security;
alter table public.attachments enable row level security;
alter table public.reviews enable row level security;
alter table public.escrow_events enable row level security;
alter table public.notifications enable row level security;

grant select on public.categories to anon, authenticated;
grant select on public.vendor_profiles to anon, authenticated;
grant select, insert, update on public.briefs to anon, authenticated;
grant select, insert on public.brief_fields to anon, authenticated;
grant select, insert on public.follow_up_answers to anon, authenticated;
grant select, insert, update on public.bids to anon, authenticated;
grant select, insert on public.orders to anon, authenticated;
grant select, insert on public.escrow_events to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.messages to authenticated;
grant select, insert, update on public.order_milestones to authenticated;
grant select, insert, update on public.attachments to authenticated;
grant select, insert on public.reviews to authenticated;
grant select, update on public.notifications to authenticated;

drop policy if exists "categories are publicly readable" on public.categories;
create policy "categories are publicly readable" on public.categories
for select to anon, authenticated using (true);

drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own" on public.profiles
for select to authenticated using (id = auth.uid());

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles
for insert to authenticated with check (id = auth.uid());

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "vendor profiles are publicly readable" on public.vendor_profiles;
create policy "vendor profiles are publicly readable" on public.vendor_profiles
for select to anon, authenticated using (true);

drop policy if exists "vendor profiles write own" on public.vendor_profiles;
create policy "vendor profiles write own" on public.vendor_profiles
for all to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());

drop policy if exists "briefs public prototype insert" on public.briefs;
create policy "briefs public prototype insert" on public.briefs
for insert to anon, authenticated with check (buyer_id is null or buyer_id = auth.uid());

drop policy if exists "briefs public prototype read" on public.briefs;
create policy "briefs public prototype read" on public.briefs
for select to anon, authenticated using (buyer_id is null or buyer_id = auth.uid() or status in ('posted', 'bidding'));

drop policy if exists "briefs public prototype update" on public.briefs;
create policy "briefs public prototype update" on public.briefs
for update to anon, authenticated
using (buyer_id is null or buyer_id = auth.uid())
with check (buyer_id is null or buyer_id = auth.uid());

drop policy if exists "brief fields follow brief read" on public.brief_fields;
create policy "brief fields follow brief read" on public.brief_fields
for select to anon, authenticated using (
  exists (select 1 from public.briefs b where b.id = brief_id and (b.buyer_id is null or b.buyer_id = auth.uid() or b.status in ('posted', 'bidding')))
);

drop policy if exists "brief fields public prototype insert" on public.brief_fields;
create policy "brief fields public prototype insert" on public.brief_fields
for insert to anon, authenticated with check (
  exists (select 1 from public.briefs b where b.id = brief_id and (b.buyer_id is null or b.buyer_id = auth.uid()))
);

drop policy if exists "follow ups follow brief read" on public.follow_up_answers;
create policy "follow ups follow brief read" on public.follow_up_answers
for select to anon, authenticated using (
  exists (select 1 from public.briefs b where b.id = brief_id and (b.buyer_id is null or b.buyer_id = auth.uid()))
);

drop policy if exists "follow ups public prototype insert" on public.follow_up_answers;
create policy "follow ups public prototype insert" on public.follow_up_answers
for insert to anon, authenticated with check (
  exists (select 1 from public.briefs b where b.id = brief_id and (b.buyer_id is null or b.buyer_id = auth.uid()))
);

drop policy if exists "bids public prototype insert" on public.bids;
create policy "bids public prototype insert" on public.bids
for insert to anon, authenticated with check (
  exists (select 1 from public.briefs b where b.id = brief_id and (b.buyer_id is null or b.buyer_id = auth.uid() or b.status in ('posted', 'bidding')))
);

drop policy if exists "bids public prototype read" on public.bids;
create policy "bids public prototype read" on public.bids
for select to anon, authenticated using (
  exists (select 1 from public.briefs b where b.id = brief_id and (b.buyer_id is null or b.buyer_id = auth.uid() or b.status in ('posted', 'bidding')))
);

drop policy if exists "bids public prototype update" on public.bids;
create policy "bids public prototype update" on public.bids
for update to anon, authenticated
using (
  exists (select 1 from public.briefs b where b.id = brief_id and (b.buyer_id is null or b.buyer_id = auth.uid()))
)
with check (
  exists (select 1 from public.briefs b where b.id = brief_id and (b.buyer_id is null or b.buyer_id = auth.uid()))
);

drop policy if exists "orders public prototype insert" on public.orders;
create policy "orders public prototype insert" on public.orders
for insert to anon, authenticated with check (buyer_id is null or buyer_id = auth.uid());

drop policy if exists "orders public prototype read" on public.orders;
create policy "orders public prototype read" on public.orders
for select to anon, authenticated using (buyer_id is null or buyer_id = auth.uid());

drop policy if exists "escrow events follow order" on public.escrow_events;
create policy "escrow events follow order" on public.escrow_events
for select to anon, authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and (o.buyer_id is null or o.buyer_id = auth.uid()))
);

drop policy if exists "escrow events public prototype insert" on public.escrow_events;
create policy "escrow events public prototype insert" on public.escrow_events
for insert to anon, authenticated with check (
  exists (select 1 from public.orders o where o.id = order_id and (o.buyer_id is null or o.buyer_id = auth.uid()))
);

drop policy if exists "messages participant access" on public.messages;
create policy "messages participant access" on public.messages
for all to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
) with check (
  exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
);

drop policy if exists "milestones participant access" on public.order_milestones;
create policy "milestones participant access" on public.order_milestones
for all to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
) with check (
  exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
);

drop policy if exists "attachments owner access" on public.attachments;
create policy "attachments owner access" on public.attachments
for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "reviews participant insert" on public.reviews;
create policy "reviews participant insert" on public.reviews
for insert to authenticated with check (reviewer_id = auth.uid());

drop policy if exists "reviews public read" on public.reviews;
create policy "reviews public read" on public.reviews
for select to anon, authenticated using (true);

drop policy if exists "notifications own" on public.notifications;
create policy "notifications own" on public.notifications
for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());


-- ============================================================
-- 20260702002000_briefly_account_payments.sql
-- ============================================================
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


-- ============================================================
-- 20260708000000_vendor_marketplace_seed.sql
-- ============================================================
-- Starter open briefs so vendor accounts can immediately browse multiple job types.

insert into public.briefs (id, buyer_id, title, category_id, raw_text, summary, budget_realistic, budget_note, status) values
  ('0fcb4c31-1a38-4fb1-83d3-9ed95b7e9c10', null, 'Custom walnut storage bench', 'furniture', 'Need a walnut bench with hidden shoe storage for my entryway, around 1.4m wide.', 'Build a compact walnut-look entry bench with hidden shoe storage, soft-close access, and delivery in Singapore.', true, 'Budget target around S$850.', 'bidding'),
  ('2d26f850-7b52-4f31-bf18-fd9f57c5c12d', null, 'Paint a 3-room HDB flat', 'painting', 'Paint living room and two bedrooms, warm white, minor patching needed.', 'Repaint a 3-room HDB interior in warm white with light wall patching before painting.', true, 'Budget target around S$1,200.', 'bidding'),
  ('6cce779e-d967-4a07-a7d8-35f8a479755c', null, 'Prototype 20 plastic enclosures', 'printing', 'Need 20 small electronics enclosures printed in black PLA from STL files.', '3D print 20 black PLA electronics enclosures from supplied STL files and clean up rough edges.', true, 'Budget target around S$280.', 'bidding'),
  ('db837c3d-a3c7-4f46-a2ac-993be922711f', null, 'Company polo embroidery', 'apparel', 'Need 35 navy polo shirts embroidered with a small chest logo.', 'Supply or embroider 35 navy polo shirts with a small chest logo for a company event.', true, 'Budget target around S$700.', 'bidding')
on conflict (id) do update set
  title = excluded.title,
  category_id = excluded.category_id,
  raw_text = excluded.raw_text,
  summary = excluded.summary,
  budget_realistic = excluded.budget_realistic,
  budget_note = excluded.budget_note,
  status = excluded.status;

delete from public.brief_fields
where brief_id in (
  '0fcb4c31-1a38-4fb1-83d3-9ed95b7e9c10',
  '2d26f850-7b52-4f31-bf18-fd9f57c5c12d',
  '6cce779e-d967-4a07-a7d8-35f8a479755c',
  'db837c3d-a3c7-4f46-a2ac-993be922711f'
);

insert into public.brief_fields (brief_id, field_key, label, emoji, value) values
  ('0fcb4c31-1a38-4fb1-83d3-9ed95b7e9c10', 'size', 'Size', 'measure', '1.4m wide'),
  ('0fcb4c31-1a38-4fb1-83d3-9ed95b7e9c10', 'material', 'Material', 'wood', 'Walnut look'),
  ('0fcb4c31-1a38-4fb1-83d3-9ed95b7e9c10', 'delivery', 'Delivery', 'truck', 'Singapore'),
  ('2d26f850-7b52-4f31-bf18-fd9f57c5c12d', 'rooms', 'Rooms', 'home', 'Living room and two bedrooms'),
  ('2d26f850-7b52-4f31-bf18-fd9f57c5c12d', 'paint', 'Paint', 'paint', 'Warm white'),
  ('2d26f850-7b52-4f31-bf18-fd9f57c5c12d', 'prep', 'Prep', 'tool', 'Minor patching'),
  ('6cce779e-d967-4a07-a7d8-35f8a479755c', 'quantity', 'Quantity', 'box', '20 pieces'),
  ('6cce779e-d967-4a07-a7d8-35f8a479755c', 'material', 'Material', 'print', 'Black PLA'),
  ('6cce779e-d967-4a07-a7d8-35f8a479755c', 'files', 'Files', 'file', 'STL supplied'),
  ('db837c3d-a3c7-4f46-a2ac-993be922711f', 'quantity', 'Quantity', 'shirt', '35 polos'),
  ('db837c3d-a3c7-4f46-a2ac-993be922711f', 'color', 'Color', 'swatch', 'Navy'),
  ('db837c3d-a3c7-4f46-a2ac-993be922711f', 'logo', 'Logo', 'thread', 'Small chest embroidery');


-- ============================================================
-- 20260713000000_vendor_media_telegram.sql
-- ============================================================
-- Vendor media (logos + own service listings), buyer Telegram link, and a
-- public storage bucket for uploaded images.
-- Apply with: npm run db:push

-- 1. Buyer Telegram chat id (for bid notifications) --------------------------
alter table public.profiles add column if not exists telegram_chat_id text;

-- 2. Vendor company logo -----------------------------------------------------
alter table public.vendor_profiles add column if not exists logo_url text;

-- 3. Let vendors own service listings ---------------------------------------
alter table public.services add column if not exists vendor_profile_id uuid
  references public.vendor_profiles(id) on delete cascade;
alter table public.services alter column vendor_id drop not null;
-- Auto-generate ids so vendor-created listings don't collide with seed ids.
alter table public.services alter column id set default ('svc_' || replace(gen_random_uuid()::text, '-', ''));

create index if not exists services_vendor_profile_id_idx on public.services(vendor_profile_id);

grant insert, update, delete on public.services to authenticated;

drop policy if exists "vendors manage own services" on public.services;
create policy "vendors manage own services" on public.services
for all to authenticated
using (
  exists (
    select 1 from public.vendor_profiles vp
    where vp.id = services.vendor_profile_id and vp.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.vendor_profiles vp
    where vp.id = services.vendor_profile_id and vp.profile_id = auth.uid()
  )
);

-- 4. Public storage bucket for uploaded logos / service photos --------------
insert into storage.buckets (id, name, public)
values ('vendor-media', 'vendor-media', true)
on conflict (id) do update set public = true;

drop policy if exists "vendor-media public read" on storage.objects;
create policy "vendor-media public read" on storage.objects
for select to anon, authenticated
using (bucket_id = 'vendor-media');

-- Ownership is enforced by the first path segment (the uploader's user id),
-- which the app always sets: `${user.id}/logos/...`. This is reliable at
-- INSERT check-time, unlike storage.objects.owner.
drop policy if exists "vendor-media authed upload" on storage.objects;
create policy "vendor-media authed upload" on storage.objects
for insert to authenticated
with check (bucket_id = 'vendor-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "vendor-media authed update" on storage.objects;
create policy "vendor-media authed update" on storage.objects
for update to authenticated
using (bucket_id = 'vendor-media' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'vendor-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "vendor-media authed delete" on storage.objects;
create policy "vendor-media authed delete" on storage.objects
for delete to authenticated
using (bucket_id = 'vendor-media' and (storage.foldername(name))[1] = auth.uid()::text);



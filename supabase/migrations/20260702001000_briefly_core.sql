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

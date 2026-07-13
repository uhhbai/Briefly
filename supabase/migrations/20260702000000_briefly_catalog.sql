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

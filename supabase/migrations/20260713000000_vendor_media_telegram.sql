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

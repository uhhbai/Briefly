/**
 * Data-access layer. Screens/stores call THESE functions — never supabase
 * directly. Each one talks to Supabase when configured, and otherwise falls
 * back to the local mock catalog so the app runs with no backend.
 *
 * Rows come back snake_case; mappers convert to the camelCase domain types
 * in src/lib/types.ts. numeric columns arrive as strings, so we Number() them.
 */

import * as mock from '@/lib/catalog';
import { CATEGORIES, getCategory } from '@/lib/config';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Bid, Category, Order, Service, StructuredSpec, Vendor } from '@/lib/types';

// ── Row mappers ──────────────────────────────────────────────────────────────

const toCategory = (r: any): Category => ({
  id: r.id,
  label: r.label,
  emoji: r.emoji,
  example: r.example,
  gradient: [r.gradient_from, r.gradient_to],
  image: r.image,
});

const toVendor = (r: any): Vendor => ({
  id: r.id,
  name: r.name,
  avatar: r.avatar,
  categoryId: r.category_id,
  tagline: r.tagline,
  rating: Number(r.rating),
  reviewCount: r.review_count,
  jobsDone: r.jobs_done,
  verified: r.verified,
  priceFrom: Number(r.price_from),
  location: r.location,
  gradient: [r.gradient_from, r.gradient_to],
  image: r.image,
});

const toService = (r: any): Service => ({
  id: r.id,
  title: r.title,
  categoryId: r.category_id,
  vendorId: r.vendor_id,
  emoji: r.emoji,
  priceFrom: Number(r.price_from),
  rating: Number(r.rating),
  reviewCount: r.review_count,
  etaDays: r.eta_days,
  gradient: [r.gradient_from, r.gradient_to],
  image: r.image,
});

const toBid = (r: any): Bid => ({
  id: r.id,
  vendorName: r.vendor_name,
  vendorAvatar: r.vendor_avatar,
  verified: r.verified,
  rating: Number(r.rating),
  reviewCount: r.review_count,
  price: Number(r.price),
  etaDays: r.eta_days,
  message: r.message,
  highlights: r.highlights ?? [],
  distanceKm: Number(r.distance_km),
});

const toSpec = (r: any): StructuredSpec => ({
  title: r.title,
  category: getCategory(r.category_id),
  rawText: r.raw_text,
  fields: r.fields ?? [],
  summary: r.summary,
  budgetSanity:
    r.budget_realistic === null || r.budget_realistic === undefined
      ? undefined
      : { realistic: r.budget_realistic, note: r.budget_note ?? '' },
});

// ── Catalog (public read) ─────────────────────────────────────────────────────

export async function fetchCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) return CATEGORIES;
  const { data, error } = await supabase.from('categories').select('*').order('sort_order');
  if (error || !data) return CATEGORIES;
  return data.map(toCategory);
}

export async function fetchVendors(): Promise<Vendor[]> {
  if (!isSupabaseConfigured) return mock.VENDORS;
  const { data, error } = await supabase.from('vendors').select('*');
  if (error || !data) return mock.VENDORS;
  return data.map(toVendor);
}

export async function fetchVendor(id: string): Promise<Vendor | null> {
  if (!isSupabaseConfigured) return mock.getVendor(id) ?? null;
  const { data, error } = await supabase.from('vendors').select('*').eq('id', id).single();
  if (error || !data) return mock.getVendor(id) ?? null;
  return toVendor(data);
}

export async function fetchServices(): Promise<Service[]> {
  if (!isSupabaseConfigured) return mock.SERVICES;
  const { data, error } = await supabase.from('services').select('*');
  if (error || !data) return mock.SERVICES;
  return data.map(toService);
}

export async function fetchServicesByVendor(vendorId: string): Promise<Service[]> {
  if (!isSupabaseConfigured) return mock.SERVICES.filter((s) => s.vendorId === vendorId);
  const { data, error } = await supabase.from('services').select('*').eq('vendor_id', vendorId);
  if (error || !data) return mock.SERVICES.filter((s) => s.vendorId === vendorId);
  return data.map(toService);
}

export async function fetchFeaturedVendors(): Promise<Vendor[]> {
  const vendors = await fetchVendors();
  return [...vendors].sort((a, b) => b.rating - a.rating).slice(0, 5);
}

export async function fetchPopularServices(): Promise<Service[]> {
  const services = await fetchServices();
  return [...services].sort((a, b) => b.reviewCount - a.reviewCount);
}

export async function searchCatalog(query: string): Promise<{ vendors: Vendor[]; services: Service[] }> {
  const [vendors, services] = await Promise.all([fetchVendors(), fetchServices()]);
  const q = query.trim().toLowerCase();
  if (!q) return { vendors, services };
  return {
    vendors: vendors.filter((v) => v.name.toLowerCase().includes(q) || v.tagline.toLowerCase().includes(q)),
    services: services.filter((s) => s.title.toLowerCase().includes(q)),
  };
}

// ── Briefs / bids / orders (owner-scoped writes) ─────────────────────────────

async function currentUserId(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/** Persist a posted brief. Returns the new brief id, or null if offline/mock. */
export async function createBrief(spec: StructuredSpec): Promise<string | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const { data, error } = await supabase
    .from('briefs')
    .insert({
      user_id: uid,
      title: spec.title,
      category_id: spec.category.id,
      raw_text: spec.rawText,
      summary: spec.summary,
      fields: spec.fields,
      budget_realistic: spec.budgetSanity?.realistic ?? null,
      budget_note: spec.budgetSanity?.note ?? null,
      status: 'open',
    })
    .select('id')
    .single();
  if (error || !data) {
    console.warn('[Briefly] createBrief failed:', error?.message);
    return null;
  }
  return data.id as string;
}

/** Persist the bids generated for a brief. Returns rows with their new ids. */
export async function saveBids(briefId: string, bids: Bid[]): Promise<Bid[]> {
  if (!isSupabaseConfigured) return bids;
  const rows = bids.map((b) => ({
    brief_id: briefId,
    vendor_name: b.vendorName,
    vendor_avatar: b.vendorAvatar,
    verified: b.verified,
    rating: b.rating,
    review_count: b.reviewCount,
    price: b.price,
    eta_days: b.etaDays,
    message: b.message,
    highlights: b.highlights,
    distance_km: b.distanceKm,
    status: 'pending',
  }));
  const { data, error } = await supabase.from('bids').insert(rows).select('*');
  if (error || !data) {
    console.warn('[Briefly] saveBids failed:', error?.message);
    return bids;
  }
  return data.map(toBid);
}

export async function listBriefs(): Promise<{ id: string; spec: StructuredSpec; status: string }[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('briefs').select('*').order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({ id: r.id, spec: toSpec(r), status: r.status }));
}

export async function listBids(briefId: string): Promise<Bid[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('bids').select('*').eq('brief_id', briefId);
  if (error || !data) return [];
  return data.map(toBid);
}

/**
 * Accept a bid: create an order, mark the bid accepted and the brief booked.
 * Returns the new order id (or null when offline/mock).
 */
export async function createOrder(briefId: string, bidId: string): Promise<string | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const { data, error } = await supabase
    .from('orders')
    .insert({ user_id: uid, brief_id: briefId, bid_id: bidId, status: 'booked' })
    .select('id')
    .single();
  if (error || !data) {
    console.warn('[Briefly] createOrder failed:', error?.message);
    return null;
  }
  await supabase.from('bids').update({ status: 'accepted' }).eq('id', bidId);
  await supabase.from('briefs').update({ status: 'booked' }).eq('id', briefId);
  return data.id as string;
}

/** Booked jobs for the current user, newest first. */
export async function listOrders(): Promise<Order[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('orders')
    .select('id, brief:briefs(*), bid:bids(*)')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data
    .filter((r: any) => r.brief && r.bid)
    .map((r: any) => ({ id: r.id, spec: toSpec(r.brief), bid: toBid(r.bid) }));
}

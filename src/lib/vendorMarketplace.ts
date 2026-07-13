import { CATEGORIES, getCategory } from '@/lib/config';
import { supabase } from '@/lib/supabase';
import type { Category, CategoryId } from '@/lib/types';

export type VendorProfileRow = {
  id: string;
  business_name: string;
  category_id: CategoryId;
  bio: string;
  service_area: string;
  verified: boolean;
};

export type VendorBriefField = {
  field_key: string;
  label: string;
  emoji: string;
  value: string | null;
};

export type VendorBrief = {
  id: string;
  title: string;
  category: Category;
  raw_text: string;
  summary: string;
  status: string;
  budget_note: string | null;
  budget_realistic: boolean | null;
  created_at: string;
  fields: VendorBriefField[];
};

type BriefRow = {
  id: string;
  title: string;
  category_id: string;
  raw_text: string;
  summary: string;
  status: string;
  budget_note: string | null;
  budget_realistic: boolean | null;
  created_at: string;
  brief_fields?: VendorBriefField[] | null;
};

function normalizeCategoryId(id: string): CategoryId {
  return CATEGORIES.some((category) => category.id === id) ? (id as CategoryId) : 'other';
}

function mapBrief(row: BriefRow): VendorBrief {
  const categoryId = normalizeCategoryId(row.category_id);
  return {
    id: row.id,
    title: row.title,
    category: getCategory(categoryId),
    raw_text: row.raw_text,
    summary: row.summary,
    status: row.status,
    budget_note: row.budget_note,
    budget_realistic: row.budget_realistic,
    created_at: row.created_at,
    fields: row.brief_fields ?? [],
  };
}

export async function loadOpenBriefs(): Promise<VendorBrief[]> {
  const { data, error } = await supabase
    .from('briefs')
    .select(
      'id, title, category_id, raw_text, summary, status, budget_note, budget_realistic, created_at, brief_fields(field_key, label, emoji, value)'
    )
    .in('status', ['posted', 'bidding'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as BriefRow[]).map(mapBrief);
}

export async function loadVendorProfile(userId: string): Promise<VendorProfileRow | null> {
  const { data, error } = await supabase
    .from('vendor_profiles')
    .select('id, business_name, category_id, bio, service_area, verified')
    .eq('profile_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    ...(data as Omit<VendorProfileRow, 'category_id'> & { category_id: string }),
    category_id: normalizeCategoryId((data as { category_id: string }).category_id),
  };
}

export async function saveVendorProfileForUser(
  userId: string,
  input: Pick<VendorProfileRow, 'business_name' | 'category_id' | 'bio' | 'service_area'>
): Promise<VendorProfileRow> {
  const { data, error } = await supabase
    .from('vendor_profiles')
    .upsert(
      {
        profile_id: userId,
        business_name: input.business_name.trim(),
        category_id: input.category_id,
        bio: input.bio.trim(),
        service_area: input.service_area.trim() || 'Singapore',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'profile_id' }
    )
    .select('id, business_name, category_id, bio, service_area, verified')
    .single();

  if (error) throw error;
  return {
    ...(data as Omit<VendorProfileRow, 'category_id'> & { category_id: string }),
    category_id: normalizeCategoryId((data as { category_id: string }).category_id),
  };
}

export async function submitVendorBid({
  briefId,
  profile,
  price,
  etaDays,
  message,
}: {
  briefId: string;
  profile: VendorProfileRow;
  price: number;
  etaDays: number;
  message: string;
}) {
  const { error } = await supabase.from('bids').insert({
    brief_id: briefId,
    vendor_profile_id: profile.id,
    vendor_name: profile.business_name,
    vendor_avatar: '',
    verified: profile.verified,
    rating: 0,
    review_count: 0,
    price,
    eta_days: etaDays,
    message: message.trim(),
    highlights: ['Vendor-submitted', profile.service_area, getCategory(profile.category_id).label],
    distance_km: 0,
    status: 'submitted',
  });

  if (error) throw error;
}

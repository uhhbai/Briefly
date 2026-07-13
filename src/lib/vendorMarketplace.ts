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
  logo_url: string | null;
};

/** A service listing owned by the signed-in vendor. */
export type MyService = {
  id: string;
  title: string;
  category_id: CategoryId;
  price_from: number;
  eta_days: number;
  emoji: string;
  image: string;
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

const VENDOR_PROFILE_COLUMNS = 'id, business_name, category_id, bio, service_area, verified, logo_url';

export async function loadVendorProfile(userId: string): Promise<VendorProfileRow | null> {
  const { data, error } = await supabase
    .from('vendor_profiles')
    .select(VENDOR_PROFILE_COLUMNS)
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
  input: Pick<VendorProfileRow, 'business_name' | 'category_id' | 'bio' | 'service_area'> & {
    logo_url?: string | null;
  }
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
        logo_url: input.logo_url ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'profile_id' }
    )
    .select(VENDOR_PROFILE_COLUMNS)
    .single();

  if (error) throw error;
  return {
    ...(data as Omit<VendorProfileRow, 'category_id'> & { category_id: string }),
    category_id: normalizeCategoryId((data as { category_id: string }).category_id),
  };
}

// --- Vendor-owned service listings ----------------------------------------

const MY_SERVICE_COLUMNS = 'id, title, category_id, price_from, eta_days, emoji, image';

export async function loadMyServices(vendorProfileId: string): Promise<MyService[]> {
  const { data, error } = await supabase
    .from('services')
    .select(MY_SERVICE_COLUMNS)
    .eq('vendor_profile_id', vendorProfileId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as (MyService & { category_id: string })[]).map((row) => ({
    ...row,
    category_id: normalizeCategoryId(row.category_id),
  }));
}

export async function saveMyService(
  vendorProfileId: string,
  input: {
    id?: string;
    title: string;
    category_id: CategoryId;
    price_from: number;
    eta_days: number;
    image: string;
  }
): Promise<void> {
  const category = getCategory(input.category_id);
  const row = {
    title: input.title.trim(),
    category_id: input.category_id,
    vendor_profile_id: vendorProfileId,
    emoji: category.emoji,
    price_from: input.price_from,
    rating: 0,
    review_count: 0,
    eta_days: input.eta_days,
    gradient_from: category.gradient[0],
    gradient_to: category.gradient[1],
    image: input.image || category.image,
  };

  const { error } = input.id
    ? await supabase.from('services').update(row).eq('id', input.id)
    : await supabase.from('services').insert(row);

  if (error) throw error;
}

export async function deleteMyService(id: string): Promise<void> {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw error;
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

  // Best-effort: notify the buyer over Telegram. Never fails the bid.
  try {
    await supabase.functions.invoke('notify-bid', {
      body: { briefId, vendorName: profile.business_name, price },
    });
  } catch {
    // ignore — notification is not critical to submitting a bid
  }
}

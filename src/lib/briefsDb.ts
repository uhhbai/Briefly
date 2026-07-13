import { supabase } from '@/lib/supabase';
import type { Bid, StructuredSpec } from '@/lib/types';

export async function saveBriefWithBids(spec: StructuredSpec, bids: Bid[]): Promise<string | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: brief, error: briefError } = await supabase
      .from('briefs')
      .insert({
        buyer_id: user?.id ?? null,
        title: spec.title,
        category_id: spec.category.id,
        raw_text: spec.rawText,
        summary: spec.summary,
        budget_realistic: spec.budgetSanity?.realistic ?? null,
        budget_note: spec.budgetSanity?.note ?? null,
        status: 'bidding',
      })
      .select('id')
      .single();

    if (briefError || !brief?.id) return null;
    const briefId = brief.id as string;

    const fields = spec.fields.map((field) => ({
      brief_id: briefId,
      field_key: field.key,
      label: field.label,
      emoji: field.emoji,
      value: field.value,
    }));

    const bidRows = bids.map((bid) => ({
      brief_id: briefId,
      vendor_name: bid.vendorName,
      vendor_avatar: bid.vendorAvatar,
      verified: bid.verified,
      rating: bid.rating,
      review_count: bid.reviewCount,
      price: bid.price,
      eta_days: bid.etaDays,
      message: bid.message,
      highlights: bid.highlights,
      distance_km: bid.distanceKm,
      status: 'submitted',
    }));

    const [fieldsResult, bidsResult] = await Promise.all([
      fields.length ? supabase.from('brief_fields').insert(fields) : Promise.resolve({ error: null }),
      bidRows.length ? supabase.from('bids').insert(bidRows) : Promise.resolve({ error: null }),
    ]);

    if (fieldsResult.error || bidsResult.error) return briefId;
    if (user?.id) {
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Your brief is live',
        body: `${bids.length} vendor bids are ready to compare.`,
      });
    }
    return briefId;
  } catch {
    return null;
  }
}

type BidRow = {
  id: string;
  vendor_name: string;
  vendor_avatar: string | null;
  verified: boolean;
  rating: number;
  review_count: number;
  price: number;
  eta_days: number;
  message: string;
  highlights: string[] | null;
  distance_km: number;
};

function mapBid(row: BidRow): Bid {
  return {
    id: row.id,
    vendorName: row.vendor_name,
    vendorAvatar: row.vendor_avatar ?? '',
    verified: row.verified,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    price: row.price,
    etaDays: row.eta_days,
    message: row.message,
    highlights: row.highlights ?? [],
    distanceKm: Number(row.distance_km),
  };
}

/**
 * All bids on a brief straight from the DB — the buyer's demo/seed bids plus
 * any real vendor submissions. Returns [] on any error so the screen can fall
 * back to the in-memory bids without crashing.
 */
export async function loadBidsForBrief(briefId: string): Promise<Bid[]> {
  try {
    const { data, error } = await supabase
      .from('bids')
      .select(
        'id, vendor_name, vendor_avatar, verified, rating, review_count, price, eta_days, message, highlights, distance_km'
      )
      .eq('brief_id', briefId)
      .order('price', { ascending: true });

    if (error || !data) return [];
    return (data as BidRow[]).map(mapBid);
  } catch {
    return [];
  }
}

export async function saveAcceptedOrder(briefId: string | null, bid: Bid): Promise<string | null> {
  if (!briefId) return null;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // A bid loaded from the DB carries its real UUID; match on that directly.
    // In-memory demo bids use synthetic ids, so fall back to vendor + price.
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bid.id);

    let bidId: string | undefined;
    if (isUuid) {
      const { data: byId } = await supabase.from('bids').select('id').eq('id', bid.id).maybeSingle();
      bidId = byId?.id as string | undefined;
    }
    if (!bidId) {
      const { data: savedBid } = await supabase
        .from('bids')
        .select('id')
        .eq('brief_id', briefId)
        .eq('vendor_name', bid.vendorName)
        .eq('price', bid.price)
        .limit(1)
        .maybeSingle();
      bidId = savedBid?.id as string | undefined;
    }
    if (!bidId) return null;

    await supabase.from('bids').update({ status: 'accepted' }).eq('id', bidId);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        brief_id: briefId,
        bid_id: bidId,
        buyer_id: user?.id ?? null,
        status: 'escrow_pending',
        escrow_amount: bid.price,
      })
      .select('id')
      .single();

    if (orderError || !order?.id) return null;

    await Promise.all([
      supabase.from('briefs').update({ status: 'booked' }).eq('id', briefId),
      supabase.from('escrow_events').insert({
        order_id: order.id,
        event_type: 'hold_created',
        amount: bid.price,
        provider_ref: 'mock_escrow',
      }),
    ]);

    return order.id as string;
  } catch {
    return null;
  }
}

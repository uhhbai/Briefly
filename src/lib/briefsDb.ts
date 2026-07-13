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

export async function saveAcceptedOrder(briefId: string | null, bid: Bid): Promise<string | null> {
  if (!briefId) return null;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: savedBid } = await supabase
      .from('bids')
      .select('id')
      .eq('brief_id', briefId)
      .eq('vendor_name', bid.vendorName)
      .eq('price', bid.price)
      .limit(1)
      .maybeSingle();

    const bidId = savedBid?.id as string | undefined;
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

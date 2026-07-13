/**
 * Holds the draft brief as the buyer moves through the flow:
 *   Describe → Builder (follow-ups) → Spec → Bids → (book)
 *
 * Accepted bids become persisted `orders` (the buyer's booked jobs), which
 * survive starting a new brief. A single React Context is plenty for this
 * scope; this is the seam to swap for a real store + Supabase later.
 */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { applyAnswers as applyAnswersImpl } from '@/lib/ai';
import { createOrder, listOrders } from '@/lib/db';
import type { Bid, FollowUpQuestion, Order, StructuredSpec } from '@/lib/types';

type BriefState = {
  rawText: string;
  spec: StructuredSpec | null;
  followUps: FollowUpQuestion[];
  bids: Bid[];
  selectedBidId: string | null;
  remoteBriefId: string | null;
  /** Booked jobs — persist across new briefs. */
  orders: Order[];
};

type BriefContextValue = BriefState & {
  setRawText: (t: string) => void;
  setSpec: (s: StructuredSpec) => void;
  setFollowUps: (q: FollowUpQuestion[]) => void;
  answerFollowUps: (answers: Record<string, string>) => void;
  setBids: (b: Bid[], briefId?: string | null) => void;
  selectBid: (id: string | null) => void;
  setRemoteBriefId: (id: string | null) => void;
  /** Book the selected bid → creates an Order and clears the draft. Returns it. */
  bookSelectedBid: () => Promise<Order | null>;
  /** Clear the draft only (keeps booked orders). */
  reset: () => void;
};

const emptyDraft = {
  rawText: '',
  spec: null,
  followUps: [],
  bids: [],
  selectedBidId: null,
  remoteBriefId: null,
} satisfies Omit<BriefState, 'orders'>;

const initial: BriefState = { ...emptyDraft, orders: [] };

const BriefContext = createContext<BriefContextValue | null>(null);

export function BriefProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BriefState>(initial);

  useEffect(() => {
    let active = true;
    listOrders().then((orders) => {
      if (active && orders.length) setState((s) => ({ ...s, orders }));
    });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<BriefContextValue>(
    () => ({
      ...state,
      setRawText: (rawText) => setState((s) => ({ ...s, rawText })),
      setSpec: (spec) => setState((s) => ({ ...s, spec })),
      setFollowUps: (followUps) => setState((s) => ({ ...s, followUps })),
      answerFollowUps: (answers) =>
        setState((s) => (s.spec ? { ...s, spec: applyAnswersImpl(s.spec, answers) } : s)),
      setBids: (bids, briefId = null) => setState((s) => ({ ...s, bids, briefId })),
      selectBid: (selectedBidId) => setState((s) => ({ ...s, selectedBidId })),
      setRemoteBriefId: (remoteBriefId) => setState((s) => ({ ...s, remoteBriefId })),
      bookSelectedBid: () => {
        let booked: Order | null = null;
        let persistedBriefId: string | null = null;
        let persistedBidId: string | null = null;
        setState((s) => {
          const bid = s.bids.find((b) => b.id === s.selectedBidId);
          if (!s.spec || !bid) return s;
          persistedBriefId = s.briefId;
          persistedBidId = bid.id;
          booked = { id: `order_${s.orders.length + 1}_${bid.id}`, spec: s.spec, bid };
          return { ...emptyDraft, orders: [booked, ...s.orders] };
        });
        if (persistedBriefId && persistedBidId) {
          const orderId = await createOrder(persistedBriefId, persistedBidId);
          if (orderId) {
            const orders = await listOrders();
            setState((s) => ({ ...s, orders: orders.length ? orders : s.orders }));
          }
        }
        return booked;
      },
      reset: () => setState((s) => ({ ...emptyDraft, orders: s.orders })),
    }),
    [state]
  );

  return <BriefContext.Provider value={value}>{children}</BriefContext.Provider>;
}

export function useBrief() {
  const ctx = useContext(BriefContext);
  if (!ctx) throw new Error('useBrief must be used inside <BriefProvider>');
  return ctx;
}

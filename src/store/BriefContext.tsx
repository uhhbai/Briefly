/**
 * Holds the draft brief as the buyer moves through the flow:
 *   Describe → Builder (follow-ups) → Spec → Bids → (book)
 *
 * Accepted bids become persisted `orders` (the buyer's booked jobs), which
 * survive starting a new brief. A single React Context is plenty for this
 * scope; this is the seam to swap for a real store + Supabase later.
 */

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { applyAnswers as applyAnswersImpl } from '@/lib/ai';
import type { Bid, FollowUpQuestion, Order, StructuredSpec } from '@/lib/types';

type BriefState = {
  rawText: string;
  spec: StructuredSpec | null;
  followUps: FollowUpQuestion[];
  bids: Bid[];
  selectedBidId: string | null;
  /** Booked jobs — persist across new briefs. */
  orders: Order[];
};

type BriefContextValue = BriefState & {
  setRawText: (t: string) => void;
  setSpec: (s: StructuredSpec) => void;
  setFollowUps: (q: FollowUpQuestion[]) => void;
  answerFollowUps: (answers: Record<string, string>) => void;
  setBids: (b: Bid[]) => void;
  selectBid: (id: string | null) => void;
  /** Book the selected bid → creates an Order and clears the draft. Returns it. */
  bookSelectedBid: () => Order | null;
  /** Clear the draft only (keeps booked orders). */
  reset: () => void;
};

const emptyDraft = {
  rawText: '',
  spec: null,
  followUps: [],
  bids: [],
  selectedBidId: null,
} satisfies Omit<BriefState, 'orders'>;

const initial: BriefState = { ...emptyDraft, orders: [] };

const BriefContext = createContext<BriefContextValue | null>(null);

export function BriefProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BriefState>(initial);

  const value = useMemo<BriefContextValue>(
    () => ({
      ...state,
      setRawText: (rawText) => setState((s) => ({ ...s, rawText })),
      setSpec: (spec) => setState((s) => ({ ...s, spec })),
      setFollowUps: (followUps) => setState((s) => ({ ...s, followUps })),
      answerFollowUps: (answers) =>
        setState((s) => (s.spec ? { ...s, spec: applyAnswersImpl(s.spec, answers) } : s)),
      setBids: (bids) => setState((s) => ({ ...s, bids })),
      selectBid: (selectedBidId) => setState((s) => ({ ...s, selectedBidId })),
      bookSelectedBid: () => {
        let booked: Order | null = null;
        setState((s) => {
          const bid = s.bids.find((b) => b.id === s.selectedBidId);
          if (!s.spec || !bid) return s;
          booked = { id: `order_${s.orders.length + 1}_${bid.id}`, spec: s.spec, bid };
          return { ...emptyDraft, orders: [booked, ...s.orders] };
        });
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

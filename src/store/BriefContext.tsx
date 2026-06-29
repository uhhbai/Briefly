/**
 * Holds the draft brief as the buyer moves through the flow:
 *   Describe → Builder (follow-ups) → Spec → Bids
 *
 * A single React Context is plenty for this scope. If the app grows
 * (saved briefs, auth, server sync) this is the seam to swap for a real
 * store + Supabase, without touching the screens' call sites much.
 */

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { applyAnswers as applyAnswersImpl } from '@/lib/ai';
import type { Bid, FollowUpQuestion, StructuredSpec } from '@/lib/types';

type BriefState = {
  rawText: string;
  spec: StructuredSpec | null;
  followUps: FollowUpQuestion[];
  bids: Bid[];
  selectedBidId: string | null;
};

type BriefContextValue = BriefState & {
  setRawText: (t: string) => void;
  setSpec: (s: StructuredSpec) => void;
  setFollowUps: (q: FollowUpQuestion[]) => void;
  answerFollowUps: (answers: Record<string, string>) => void;
  setBids: (b: Bid[]) => void;
  selectBid: (id: string | null) => void;
  reset: () => void;
};

const initial: BriefState = {
  rawText: '',
  spec: null,
  followUps: [],
  bids: [],
  selectedBidId: null,
};

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
      reset: () => setState(initial),
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

/**
 * AI facade. Screens import from HERE, never from mockAI directly.
 *
 * Today every call routes to the mock layer. When USE_REAL_AI flips to true,
 * route to realAI.ts (Claude) instead — the screens stay untouched.
 */

import { USE_REAL_AI } from '@/lib/config';
import * as mock from '@/lib/mockAI';

// When you build the real layer, it must export the same four functions:
//   extractSpec, getFollowUps, generateBids  (async)
//   applyAnswers (sync)
// import * as real from '@/lib/realAI';

const impl = USE_REAL_AI ? mock /* swap to `real` */ : mock;

export const extractSpec = impl.extractSpec;
export const getFollowUps = impl.getFollowUps;
export const generateBids = impl.generateBids;
export const applyAnswers = impl.applyAnswers;

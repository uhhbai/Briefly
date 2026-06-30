/**
 * Core domain types for Briefly.
 *
 * These describe the buyer flow: a free-text request becomes a structured
 * spec, which vendors bid on. Keeping them in one place means the mock AI
 * layer and the (future) real Claude/Supabase layer return the same shapes.
 */

export type CategoryId =
  | 'furniture'
  | 'painting'
  | 'renovation'
  | 'printing'
  | 'apparel'
  | 'other';

export type Category = {
  id: CategoryId;
  label: string;
  emoji: string;
  /** Example one-liner shown as a prompt hint on the Describe screen. */
  example: string;
  /** Two-stop gradient [from, to] for storefront tiles. */
  gradient: [string, string];
  /** Background photo for the category tile. */
  image: string;
};

/** A vendor users can browse in the marketplace. */
export type Vendor = {
  id: string;
  name: string;
  avatar: string; // emoji stand-in
  categoryId: CategoryId;
  tagline: string;
  rating: number;
  reviewCount: number;
  jobsDone: number;
  verified: boolean;
  priceFrom: number;
  location: string;
  gradient: [string, string];
  image: string;
};

/** A pre-listed service/package users can browse (the "catalog" side). */
export type Service = {
  id: string;
  title: string;
  categoryId: CategoryId;
  vendorId: string;
  emoji: string;
  priceFrom: number;
  rating: number;
  reviewCount: number;
  etaDays: number;
  gradient: [string, string];
  image: string;
};

/** A single extracted attribute of the spec (e.g. Budget, Dimensions). */
export type SpecField = {
  key: string;
  label: string;
  emoji: string;
  /** The extracted value, or null if the AI couldn't find one. */
  value: string | null;
};

/** The structured spec produced from the buyer's description. */
export type StructuredSpec = {
  title: string;
  category: Category;
  /** Buyer's original words, kept for context. */
  rawText: string;
  fields: SpecField[];
  /** A clean, vendor-facing summary the AI rewrote. */
  summary: string;
  /** AI's note on whether the stated budget is realistic. */
  budgetSanity?: {
    realistic: boolean;
    note: string;
  };
};

export type FollowUpQuestionType = 'choice' | 'text';

/** A gap-filling question the AI asks before finalising the spec. */
export type FollowUpQuestion = {
  id: string;
  /** Which spec field this answer should populate. */
  fieldKey: string;
  question: string;
  type: FollowUpQuestionType;
  /** For 'choice' questions. */
  options?: string[];
  placeholder?: string;
};

/** A booked job: the spec the buyer posted + the bid they accepted. */
export type Order = {
  id: string;
  spec: StructuredSpec;
  bid: Bid;
};

export type Bid = {
  id: string;
  vendorName: string;
  vendorAvatar: string; // emoji stand-in until real avatars
  verified: boolean;
  rating: number; // 0–5
  reviewCount: number;
  price: number; // in the buyer's currency (SGD for the SEA pilot)
  etaDays: number;
  /** Vendor's pitch / note to the buyer. */
  message: string;
  /** Short bullet highlights shown on the bid card. */
  highlights: string[];
  distanceKm: number;
};

/**
 * Mock AI layer — no network, no API keys, no cost.
 *
 * It mimics what a real Claude-powered backend will eventually do:
 *   - extractSpec:    messy text  -> structured, vendor-ready spec
 *   - getFollowUps:   find the gaps and ask smart questions
 *   - generateBids:   produce realistic vendor offers around the budget
 *
 * The logic here is intentionally heuristic (regex + keyword lists). It's good
 * enough to demo convincingly and lets us perfect the whole UX for free.
 * Replace with real model calls in realAI.ts when ready — same in/out shapes.
 */

import { getCategory } from '@/lib/config';
import type {
  Bid,
  Category,
  CategoryId,
  FollowUpQuestion,
  SpecField,
  StructuredSpec,
} from '@/lib/types';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Category detection
// ---------------------------------------------------------------------------

const CATEGORY_KEYWORDS: Record<Exclude<CategoryId, 'other'>, string[]> = {
  furniture: ['table', 'chair', 'desk', 'shelf', 'cabinet', 'stool', 'bench', 'coffee table', 'bookshelf', 'sideboard'],
  painting: ['paint', 'repaint', 'painting', 'wall colour', 'wall color', 'coat of paint'],
  renovation: ['wardrobe', 'built-in', 'built in', 'renovate', 'renovation', 'flooring', 'kitchen', 'carpentry work', 'fitted'],
  printing: ['3d print', '3d-print', 'print', 'prototype', 'pla', 'abs', 'resin', 'enclosure', 'filament'],
  apparel: ['shirt', 'polo', 'tee', 't-shirt', 'hoodie', 'embroider', 'embroidery', 'apparel', 'uniform', 'jersey'],
};

function detectCategory(text: string): Category {
  const t = text.toLowerCase();
  let best: CategoryId = 'other';
  let bestScore = 0;
  (Object.keys(CATEGORY_KEYWORDS) as Exclude<CategoryId, 'other'>[]).forEach((id) => {
    const score = CATEGORY_KEYWORDS[id].reduce((n, kw) => (t.includes(kw) ? n + 1 : n), 0);
    if (score > bestScore) {
      bestScore = score;
      best = id;
    }
  });
  return getCategory(best);
}

// ---------------------------------------------------------------------------
// Field extractors (each returns a string value or null)
// ---------------------------------------------------------------------------

function extractBudget(text: string): string | null {
  const t = text.toLowerCase();
  // currency-prefixed, e.g. S$800, $1,200
  const cur = t.match(/(?:s\$|\$|sgd\s?)\s?(\d[\d,]*)/i);
  if (cur) return `S$${cur[1].replace(/,/g, '')}`;
  // "under 800", "below 1000", "budget of 500", "around 900", "max 700"
  const ctx = t.match(/(?:under|below|budget(?:\s+of)?|around|approx(?:imately)?|max(?:imum)?|up to)\s+\$?\s?(\d[\d,]*)/i);
  if (ctx) return `S$${ctx[1].replace(/,/g, '')}`;
  return null;
}

function extractDimensions(text: string): string | null {
  // 1.8m, 2.4 m, 180cm, "2.4m x 0.6m", 6ft
  const matches = text.match(/\d+(?:\.\d+)?\s?(?:mm|cm|m|ft|")(?:\s?[x×]\s?\d+(?:\.\d+)?\s?(?:mm|cm|m|ft|")?)?/gi);
  if (!matches) return null;
  return matches.slice(0, 3).join(', ');
}

function extractMaterials(text: string): string | null {
  const t = text.toLowerCase();
  const mats = ['walnut', 'oak', 'pine', 'teak', 'plywood', 'mdf', 'bamboo', 'rattan', 'metal', 'steel', 'aluminium', 'aluminum', 'glass', 'marble', 'pla', 'abs', 'petg', 'resin', 'cotton', 'polyester', 'leather', 'acrylic'];
  const found = mats.filter((m) => new RegExp(`\\b${m}\\b`).test(t));
  if (!found.length) return null;
  return found.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(', ');
}

function extractTimeline(text: string): string | null {
  const t = text.toLowerCase();
  if (/\basap\b|urgent|rush/.test(t)) return 'ASAP';
  const rel = t.match(/(?:within|in|by)\s+(\d+)\s+(day|week|month)s?/);
  if (rel) return `Within ${rel[1]} ${rel[2]}${Number(rel[1]) > 1 ? 's' : ''}`;
  const plain = t.match(/(\d+)\s+(day|week|month)s?/);
  if (plain) return `${plain[1]} ${plain[2]}${Number(plain[1]) > 1 ? 's' : ''}`;
  return null;
}

function extractQuantity(text: string): string | null {
  const t = text.toLowerCase();
  const m = t.match(/(\d+)\s*(pcs|pieces|units|shirts|polos|tees|enclosures|sets|copies|prints)/);
  if (m) return `${m[1]} ${m[2]}`;
  const x = t.match(/(\d+)\s*x\b/);
  if (x) return `${x[1]} units`;
  return null;
}

function extractColour(text: string): string | null {
  const t = text.toLowerCase();
  if (/neutral/.test(t)) return 'Neutral tones';
  const colours = ['white', 'black', 'grey', 'gray', 'beige', 'navy', 'blue', 'green', 'red', 'cream', 'charcoal'];
  const found = colours.filter((c) => new RegExp(`\\b${c}\\b`).test(t));
  if (!found.length) return null;
  return found.map((c) => c.charAt(0).toUpperCase() + c.slice(1)).join(', ');
}

function extractFinish(text: string): string | null {
  const t = text.toLowerCase();
  const finishes = ['matte', 'matt', 'gloss', 'glossy', 'satin', 'stain', 'oiled', 'lacquered', 'soft-close', 'soft close', 'hidden charging', 'wireless charging'];
  const found = finishes.filter((f) => t.includes(f));
  if (!found.length) return null;
  return found.map((f) => f.charAt(0).toUpperCase() + f.slice(1)).join(', ');
}

// ---------------------------------------------------------------------------
// Which fields matter per category
// ---------------------------------------------------------------------------

type FieldDef = {
  key: string;
  label: string;
  emoji: string;
  extract: (t: string) => string | null;
  /** A question to ask if this field comes back empty. */
  question: string;
  options?: string[];
};

const FIELD_LIBRARY: Record<string, FieldDef> = {
  dimensions: { key: 'dimensions', label: 'Dimensions', emoji: '📐', extract: extractDimensions, question: 'Roughly what size do you need? (width / height / depth)' },
  materials: { key: 'materials', label: 'Material', emoji: '🪵', extract: extractMaterials, question: 'Any material preference?', options: ['Solid wood', 'Plywood / MDF', 'Metal', 'No preference'] },
  finish: { key: 'finish', label: 'Finish & features', emoji: '✨', extract: extractFinish, question: 'Any finish or special features?', options: ['Matte', 'Glossy', 'Natural / oiled', 'No preference'] },
  budget: { key: 'budget', label: 'Budget', emoji: '💰', extract: extractBudget, question: 'What budget are you working with?', options: ['Under S$300', 'S$300–800', 'S$800–2,000', 'Flexible'] },
  timeline: { key: 'timeline', label: 'Timeline', emoji: '⏱️', extract: extractTimeline, question: 'How soon do you need it?', options: ['ASAP', 'Within 2 weeks', 'Within a month', "I'm flexible"] },
  quantity: { key: 'quantity', label: 'Quantity', emoji: '🔢', extract: extractQuantity, question: 'How many do you need?', options: ['1–10', '10–50', '50–200', '200+'] },
  colour: { key: 'colour', label: 'Colour', emoji: '🎨', extract: extractColour, question: 'Any colour preference?', options: ['Neutral', 'White', 'Dark tones', 'No preference'] },
  area: { key: 'area', label: 'Area / size', emoji: '📐', extract: extractDimensions, question: 'How big is the space? (e.g. 3-room flat, or floor area)' },
};

const CATEGORY_FIELDS: Record<CategoryId, string[]> = {
  furniture: ['dimensions', 'materials', 'finish', 'budget', 'timeline'],
  painting: ['area', 'colour', 'budget', 'timeline'],
  renovation: ['dimensions', 'materials', 'finish', 'budget', 'timeline'],
  printing: ['materials', 'quantity', 'budget', 'timeline'],
  apparel: ['quantity', 'colour', 'budget', 'timeline'],
  other: ['budget', 'timeline'],
};

// ---------------------------------------------------------------------------
// Public API (matches the future real-AI surface)
// ---------------------------------------------------------------------------

function makeTitle(text: string, category: Category): string {
  const firstLine = text.trim().split(/[.\n]/)[0].trim();
  const clean = firstLine.replace(/^(i\s+(want|need|would like)( to)?|please|can you|looking for)\s+/i, '');
  const titled = clean.charAt(0).toUpperCase() + clean.slice(1);
  if (titled.length > 4 && titled.length <= 52) return titled;
  if (titled.length > 52) return titled.slice(0, 49).trimEnd() + '…';
  return `Custom ${category.label.split(' ')[0].toLowerCase()} request`;
}

function buildBudgetSanity(spec: StructuredSpec): StructuredSpec['budgetSanity'] {
  const budgetField = spec.fields.find((f) => f.key === 'budget');
  const materials = spec.fields.find((f) => f.key === 'materials')?.value?.toLowerCase() ?? '';
  if (!budgetField?.value) return undefined;
  const amount = Number(budgetField.value.replace(/[^\d]/g, ''));
  if (!amount) return undefined;
  // toy heuristic: premium hardwood under S$900 reads as optimistic
  const premium = /walnut|oak|teak|marble|leather/.test(materials);
  if (premium && amount < 900) {
    return {
      realistic: false,
      note: `Solid ${materials.split(',')[0]} at ${budgetField.value} is below typical market — expect strong bids closer to S$${Math.round(amount * 1.4 / 50) * 50}.`,
    };
  }
  return { realistic: true, note: 'Your budget looks realistic for this kind of job.' };
}

export async function extractSpec(rawText: string): Promise<StructuredSpec> {
  await delay(900); // simulate "thinking"
  const category = detectCategory(rawText);
  const fieldKeys = CATEGORY_FIELDS[category.id];
  const fields: SpecField[] = fieldKeys.map((k) => {
    const def = FIELD_LIBRARY[k];
    return { key: def.key, label: def.label, emoji: def.emoji, value: def.extract(rawText) };
  });

  const spec: StructuredSpec = {
    title: makeTitle(rawText, category),
    category,
    rawText: rawText.trim(),
    fields,
    summary: '', // filled below
    budgetSanity: undefined,
  };
  spec.summary = buildSummary(spec);
  spec.budgetSanity = buildBudgetSanity(spec);
  return spec;
}

function buildSummary(spec: StructuredSpec): string {
  const known = spec.fields.filter((f) => f.value).map((f) => `${f.label.toLowerCase()}: ${f.value}`);
  const head = `${spec.category.label} request.`;
  if (!known.length) return `${head} ${spec.rawText}`;
  return `${head} ${known.join(' · ')}.`;
}

/** Questions for fields that came back empty. */
export async function getFollowUps(spec: StructuredSpec): Promise<FollowUpQuestion[]> {
  await delay(350);
  return spec.fields
    .filter((f) => !f.value)
    .map((f) => {
      const def = FIELD_LIBRARY[f.key];
      return {
        id: `q_${f.key}`,
        fieldKey: f.key,
        question: def.question,
        type: def.options ? ('choice' as const) : ('text' as const),
        options: def.options,
        placeholder: def.label,
      };
    });
}

/** Merge follow-up answers back into the spec, then refresh summary/sanity. */
export function applyAnswers(spec: StructuredSpec, answers: Record<string, string>): StructuredSpec {
  const fields = spec.fields.map((f) =>
    !f.value && answers[f.key] ? { ...f, value: answers[f.key] } : f
  );
  const next: StructuredSpec = { ...spec, fields };
  next.summary = buildSummary(next);
  next.budgetSanity = buildBudgetSanity(next);
  return next;
}

// ---------------------------------------------------------------------------
// Mock vendor bids
// ---------------------------------------------------------------------------

const VENDOR_POOL: { name: string; avatar: string; verified: boolean; rating: number; reviews: number }[] = [
  { name: 'Tan Woodworks', avatar: '🪚', verified: true, rating: 4.9, reviews: 213 },
  { name: 'KampungCraft Studio', avatar: '🛠️', verified: true, rating: 4.7, reviews: 88 },
  { name: 'Lim & Sons Carpentry', avatar: '🔨', verified: false, rating: 4.5, reviews: 41 },
  { name: 'Maker Lab SG', avatar: '⚙️', verified: true, rating: 4.8, reviews: 156 },
  { name: 'Bayu Finishings', avatar: '🎨', verified: false, rating: 4.4, reviews: 27 },
  { name: 'PrecisionPrint Co.', avatar: '🖨️', verified: true, rating: 4.6, reviews: 102 },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function generateBids(spec: StructuredSpec): Promise<Bid[]> {
  await delay(1200);
  const budgetField = spec.fields.find((f) => f.key === 'budget');
  const base = budgetField?.value ? Number(budgetField.value.replace(/[^\d]/g, '')) : 600;
  const anchor = base || 600;

  const count = 4 + Math.floor(Math.random() * 2); // 4–5 bids
  const vendors = [...VENDOR_POOL].sort(() => Math.random() - 0.5).slice(0, count);

  const messages = [
    'Happy to take this on — I’ve done several similar pieces. Can share photos of past work.',
    'I can match your spec exactly. Slightly higher for premium materials, but built to last.',
    'Quickest turnaround of the bunch — I have a slot open this week.',
    'Budget-friendly option without cutting corners. Let’s discuss the finish.',
    'Premium build with a 1-year workmanship warranty included.',
  ];
  const highlightPool = [
    'Free delivery & install',
    'Photos of past work',
    '1-year warranty',
    'Eco-friendly materials',
    'Milestone payments via escrow',
    'Site visit before starting',
  ];

  return vendors.map((v, i) => {
    // spread prices around the anchor: one below, some near, one premium
    const factor = [0.85, 0.98, 1.1, 1.25, 1.05][i % 5];
    const price = Math.max(50, Math.round((anchor * factor) / 10) * 10);
    return {
      id: `bid_${i}_${v.name.replace(/\W/g, '')}`,
      vendorName: v.name,
      vendorAvatar: v.avatar,
      verified: v.verified,
      rating: v.rating,
      reviewCount: v.reviews,
      price,
      etaDays: 3 + Math.floor(Math.random() * 18),
      message: messages[i % messages.length],
      highlights: [...highlightPool].sort(() => Math.random() - 0.5).slice(0, 2),
      distanceKm: Math.round((1 + Math.random() * 14) * 10) / 10,
    };
  });
}

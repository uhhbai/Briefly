import { img } from '@/lib/images';
import type { Category } from '@/lib/types';

/**
 * Central config. The single switch that flips the app from the free,
 * offline mock layer to real services later.
 *
 * When you're ready for real AI:
 *   1. Set USE_REAL_AI = true
 *   2. Implement the functions in src/lib/realAI.ts (Claude API)
 *   3. The screens don't change — they call src/lib/ai.ts which routes here.
 */
export const USE_REAL_AI = false;

/** Currency for the Singapore / SEA pilot. */
export const CURRENCY = 'SGD';
export const CURRENCY_SYMBOL = 'S$';

export function formatPrice(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-SG')}`;
}

/** Commission band shown to buyers/vendors (your 10–20% model). */
export const COMMISSION_LABEL = '10–20% on completed jobs';

export const CATEGORIES: Category[] = [
  {
    id: 'furniture',
    label: 'Furniture & Carpentry',
    emoji: '🪑',
    example: 'A walnut coffee table for a 1.8m wall, hidden charging, under S$800',
    gradient: ['#6366F1', '#8B5CF6'],
    image: img('1567538096630-e0c55bd6374c'),
  },
  {
    id: 'painting',
    label: 'Painting & Home Services',
    emoji: '🎨',
    example: 'Paint my 3-room HDF flat, neutral colours, done within 2 weeks',
    gradient: ['#F59E0B', '#EF4444'],
    image: img('1581539250439-c96689b516dd'),
  },
  {
    id: 'renovation',
    label: 'Renovation & Built-ins',
    emoji: '🔨',
    example: 'Build a fitted wardrobe 2.4m wide with soft-close doors',
    gradient: ['#0EA5E9', '#2563EB'],
    image: img('1503602642458-232111445657'),
  },
  {
    id: 'printing',
    label: '3D Printing & Prototyping',
    emoji: '🖨️',
    example: 'Print 20 PLA enclosures for a small electronics gadget',
    gradient: ['#10B981', '#059669'],
    image: img('1562259949-e8e7689d7828'),
  },
  {
    id: 'apparel',
    label: 'Apparel & Custom Goods',
    emoji: '🧵',
    example: '30 embroidered polo shirts with our company logo',
    gradient: ['#EC4899', '#BE185D'],
    image: img('1521791136064-7986c2920216'),
  },
  {
    id: 'other',
    label: 'Something else',
    emoji: '✨',
    example: 'Describe anything you want made or done',
    gradient: ['#64748B', '#475569'],
    image: img('1416879595882-3373a0480b5b'),
  },
];

export function getCategory(id: string): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}

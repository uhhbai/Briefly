/**
 * Mock marketplace catalog — the "browse / e-commerce" side of Briefly.
 *
 * Vendors and pre-listed services users can scroll through, search, and tap.
 * Swap for Supabase queries later; the screens read via the helpers below.
 */

import { img } from '@/lib/images';
import type { CategoryId, Service, Vendor } from '@/lib/types';

export const VENDORS: Vendor[] = [
  {
    id: 'v_tan',
    name: 'Tan Woodworks',
    avatar: '🪚',
    categoryId: 'furniture',
    tagline: 'Heirloom-grade solid wood furniture, made to measure.',
    rating: 4.9,
    reviewCount: 213,
    jobsDone: 340,
    verified: true,
    priceFrom: 280,
    location: 'Woodlands',
    gradient: ['#6366F1', '#8B5CF6'],
    image: img('1493809842364-78817add7ffb'),
  },
  {
    id: 'v_kampung',
    name: 'KampungCraft Studio',
    avatar: '🛠️',
    categoryId: 'furniture',
    tagline: 'Scandinavian-inspired pieces for small homes.',
    rating: 4.7,
    reviewCount: 88,
    jobsDone: 120,
    verified: true,
    priceFrom: 180,
    location: 'Tampines',
    gradient: ['#0EA5E9', '#2563EB'],
    image: img('1555041469-a586c61ea9bc'),
  },
  {
    id: 'v_bayu',
    name: 'Bayu Finishings',
    avatar: '🎨',
    categoryId: 'painting',
    tagline: 'Spotless interior & exterior painting, fast turnaround.',
    rating: 4.6,
    reviewCount: 142,
    jobsDone: 410,
    verified: true,
    priceFrom: 350,
    location: 'Jurong',
    gradient: ['#F59E0B', '#EF4444'],
    image: img('1604147706283-d7119b5b822c'),
  },
  {
    id: 'v_freshcoat',
    name: 'FreshCoat SG',
    avatar: '🖌️',
    categoryId: 'painting',
    tagline: 'Eco-friendly paints, weekend slots available.',
    rating: 4.8,
    reviewCount: 96,
    jobsDone: 205,
    verified: false,
    priceFrom: 300,
    location: 'Bishan',
    gradient: ['#F97316', '#DB2777'],
    image: img('1581783898377-1c85bf937427'),
  },
  {
    id: 'v_built',
    name: 'BuiltRight Interiors',
    avatar: '🔨',
    categoryId: 'renovation',
    tagline: 'Custom built-ins, wardrobes & feature walls.',
    rating: 4.7,
    reviewCount: 174,
    jobsDone: 260,
    verified: true,
    priceFrom: 900,
    location: 'Ang Mo Kio',
    gradient: ['#0EA5E9', '#2563EB'],
    image: img('1503602642458-232111445657'),
  },
  {
    id: 'v_maker',
    name: 'Maker Lab SG',
    avatar: '⚙️',
    categoryId: 'printing',
    tagline: 'Rapid 3D printing & prototyping, PLA / ABS / resin.',
    rating: 4.8,
    reviewCount: 156,
    jobsDone: 520,
    verified: true,
    priceFrom: 40,
    location: 'one-north',
    gradient: ['#10B981', '#059669'],
    image: img('1611117775350-ac3950990985'),
  },
  {
    id: 'v_precision',
    name: 'PrecisionPrint Co.',
    avatar: '🖨️',
    categoryId: 'printing',
    tagline: 'Engineering-grade prints with tight tolerances.',
    rating: 4.6,
    reviewCount: 102,
    jobsDone: 300,
    verified: true,
    priceFrom: 60,
    location: 'Kallang',
    gradient: ['#14B8A6', '#0D9488'],
    image: img('1620799140408-edc6dcb6d633'),
  },
  {
    id: 'v_thread',
    name: 'ThreadWorks',
    avatar: '🧵',
    categoryId: 'apparel',
    tagline: 'Custom embroidery & printed apparel, bulk friendly.',
    rating: 4.5,
    reviewCount: 64,
    jobsDone: 180,
    verified: false,
    priceFrom: 12,
    location: 'Geylang',
    gradient: ['#EC4899', '#BE185D'],
    image: img('1604719312566-8912e9227c6a'),
  },
];

export const SERVICES: Service[] = [
  {
    id: 's_coffee',
    title: 'Custom solid-wood coffee table',
    categoryId: 'furniture',
    vendorId: 'v_tan',
    emoji: '🪑',
    priceFrom: 480,
    rating: 4.9,
    reviewCount: 96,
    etaDays: 18,
    gradient: ['#6366F1', '#8B5CF6'],
    image: img('1567538096630-e0c55bd6374c'),
  },
  {
    id: 's_shelf',
    title: 'Floating shelves & bookcase',
    categoryId: 'furniture',
    vendorId: 'v_kampung',
    emoji: '📚',
    priceFrom: 220,
    rating: 4.7,
    reviewCount: 41,
    etaDays: 10,
    gradient: ['#0EA5E9', '#2563EB'],
    image: img('1524758631624-e2822e304c36'),
  },
  {
    id: 's_flat',
    title: 'Full HDB flat repaint',
    categoryId: 'painting',
    vendorId: 'v_bayu',
    emoji: '🏠',
    priceFrom: 680,
    rating: 4.6,
    reviewCount: 120,
    etaDays: 5,
    gradient: ['#F59E0B', '#EF4444'],
    image: img('1581539250439-c96689b516dd'),
  },
  {
    id: 's_accent',
    title: 'Feature / accent wall',
    categoryId: 'painting',
    vendorId: 'v_freshcoat',
    emoji: '🎨',
    priceFrom: 180,
    rating: 4.8,
    reviewCount: 52,
    etaDays: 2,
    gradient: ['#F97316', '#DB2777'],
    image: img('1556228720-195a672e8a03'),
  },
  {
    id: 's_wardrobe',
    title: 'Fitted wardrobe with soft-close',
    categoryId: 'renovation',
    vendorId: 'v_built',
    emoji: '🚪',
    priceFrom: 1200,
    rating: 4.7,
    reviewCount: 88,
    etaDays: 21,
    gradient: ['#0EA5E9', '#2563EB'],
    image: img('1538688525198-9b88f6f53126'),
  },
  {
    id: 's_prototype',
    title: '3D-printed prototype batch',
    categoryId: 'printing',
    vendorId: 'v_maker',
    emoji: '🧩',
    priceFrom: 40,
    rating: 4.8,
    reviewCount: 73,
    etaDays: 4,
    gradient: ['#10B981', '#059669'],
    image: img('1562259949-e8e7689d7828'),
  },
  {
    id: 's_enclosure',
    title: 'Custom electronics enclosure',
    categoryId: 'printing',
    vendorId: 'v_precision',
    emoji: '📦',
    priceFrom: 60,
    rating: 4.6,
    reviewCount: 39,
    etaDays: 6,
    gradient: ['#14B8A6', '#0D9488'],
    image: img('1631049307264-da0ec9d70304'),
  },
  {
    id: 's_polo',
    title: 'Embroidered company polos',
    categoryId: 'apparel',
    vendorId: 'v_thread',
    emoji: '👕',
    priceFrom: 12,
    rating: 4.5,
    reviewCount: 28,
    etaDays: 9,
    gradient: ['#EC4899', '#BE185D'],
    image: img('1521791136064-7986c2920216'),
  },
];

// --- helpers (the future Supabase query seam) -----------------------------

export function getVendor(id: string): Vendor | undefined {
  return VENDORS.find((v) => v.id === id);
}

export function vendorsByCategory(categoryId: CategoryId): Vendor[] {
  return VENDORS.filter((v) => v.categoryId === categoryId);
}

export function featuredVendors(): Vendor[] {
  return [...VENDORS].sort((a, b) => b.rating - a.rating).slice(0, 5);
}

export function popularServices(): Service[] {
  return [...SERVICES].sort((a, b) => b.reviewCount - a.reviewCount);
}

export function searchCatalog(query: string): { vendors: Vendor[]; services: Service[] } {
  const q = query.trim().toLowerCase();
  if (!q) return { vendors: VENDORS, services: SERVICES };
  return {
    vendors: VENDORS.filter(
      (v) => v.name.toLowerCase().includes(q) || v.tagline.toLowerCase().includes(q)
    ),
    services: SERVICES.filter((s) => s.title.toLowerCase().includes(q)),
  };
}

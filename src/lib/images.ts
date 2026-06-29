/**
 * Curated Unsplash photos (verified reachable). `img()` builds a sized,
 * auto-formatted CDN URL. expo-image caches these after first load.
 * Swap for your own asset URLs / Supabase storage later.
 */
export const img = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

/** Low-res blurred placeholder shown while the photo loads (smooth fade-in). */
export const BLUR_PLACEHOLDER = 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4';

export const HERO_IMAGE = img('1567016432779-094069958ea5', 1000);

import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

/**
 * Supabase client + anonymous-auth bootstrap.
 *
 * Reads EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY from .env.
 * Until those are set, `isSupabaseConfigured` is false and the data layer
 * (src/lib/db.ts) falls back to the local mock catalog — so the app always
 * runs, with or without a backend.
 */

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured && __DEV__) {
  console.warn(
    '[Briefly] Supabase not configured — using mock data. ' +
      'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env to connect.'
  );
}

export const supabase = createClient(
  url ?? 'https://placeholder.supabase.co',
  anonKey ?? 'placeholder-anon-key',
  {
    auth: {
      // Persist the session so the same anonymous user is kept across launches.
      storage: Platform.OS === 'web' ? undefined : AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

/**
 * Ensure there's a signed-in user. With no login UI yet, we sign in
 * anonymously — every device gets a real auth.uid() so row-level security
 * works and data is scoped per user. Later, link this anon user to an
 * email/Singpass identity to "upgrade" the account without losing data.
 */
export async function ensureAnonymousSession(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  const { data: existing } = await supabase.auth.getSession();
  if (existing.session?.user) return existing.session.user.id;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.warn('[Briefly] Anonymous sign-in failed:', error.message);
    return null;
  }
  return data.user?.id ?? null;
}

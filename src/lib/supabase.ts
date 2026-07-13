import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

class NoopWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readonly CONNECTING = NoopWebSocket.CONNECTING;
  readonly OPEN = NoopWebSocket.OPEN;
  readonly CLOSING = NoopWebSocket.CLOSING;
  readonly CLOSED = NoopWebSocket.CLOSED;
  readonly readyState = NoopWebSocket.CLOSED;
  readonly protocol = '';
  readonly url: string;
  binaryType = 'blob';
  bufferedAmount = 0;
  extensions = '';
  onclose: ((this: unknown, ev: CloseEvent) => unknown) | null = null;
  onerror: ((this: unknown, ev: Event) => unknown) | null = null;
  onmessage: ((this: unknown, ev: MessageEvent) => unknown) | null = null;
  onopen: ((this: unknown, ev: Event) => unknown) | null = null;

  constructor(address: string | URL) {
    this.url = String(address);
  }

  close() {}
  send() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {
    return false;
  }
}

function normalizeSupabaseUrl(rawUrl: string | undefined) {
  if (!rawUrl) throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL.');

  try {
    const url = new URL(rawUrl);
    return `${url.protocol}//${url.host}`;
  } catch {
    throw new Error('EXPO_PUBLIC_SUPABASE_URL must be a full URL like https://your-project-ref.supabase.co.');
  }
}

const supabaseUrl = normalizeSupabaseUrl(process.env.EXPO_PUBLIC_SUPABASE_URL);
// Accept either the newer publishable key or the classic anon key so a project
// set up with either naming convention connects without silent 401s.
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!supabasePublishableKey) {
  throw new Error(
    'Missing Supabase key. Set EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or EXPO_PUBLIC_SUPABASE_ANON_KEY) in your .env.'
  );
}
// Node's static-render environment can expose a partial `localStorage` shim
// that lacks getItem/setItem — guard on the methods, not just the global.
const hasLocalStorage =
  typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function';
const realtimeTransport = typeof WebSocket !== 'undefined' ? WebSocket : NoopWebSocket;
const storage = Platform.OS === 'web' ? (hasLocalStorage ? localStorage : undefined) : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
  realtime: {
    transport: realtimeTransport,
  },
});

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

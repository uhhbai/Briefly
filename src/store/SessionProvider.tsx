/**
 * Signs the user in anonymously on launch (when Supabase is configured) so
 * every device has a real auth.uid() for row-level security. No login UI yet.
 * Exposes the current user id + readiness for screens that want it.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { ensureAnonymousSession, isSupabaseConfigured, supabase } from '@/lib/supabase';

type SessionValue = {
  userId: string | null;
  /** True once the initial sign-in attempt has settled (or backend is off). */
  ready: boolean;
  configured: boolean;
};

const SessionContext = createContext<SessionValue>({ userId: null, ready: true, configured: false });

export function SessionProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;

    ensureAnonymousSession()
      .then((id) => active && setUserId(id))
      .finally(() => active && setReady(true));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUserId(session?.user?.id ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ userId, ready, configured: isSupabaseConfigured }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}

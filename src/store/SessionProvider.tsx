import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type AuthResult = { error?: string; message?: string };

type SessionValue = {
  userId: string | null;
  email: string | null;
  ready: boolean;
  configured: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [ready, setReady] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setUserId(data.session?.user.id ?? null);
        setEmail(data.session?.user.email ?? null);
      })
      .finally(() => active && setReady(true));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUserId(session?.user.id ?? null);
      setEmail(session?.user.email ?? null);
      if (session?.user) setIsGuest(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      userId,
      email,
      ready,
      configured: isSupabaseConfigured,
      isGuest,
      signIn: async (nextEmail, password) => {
        if (!isSupabaseConfigured) return { error: 'Supabase is not configured yet. Continue as guest for the demo build.' };
        const { error } = await supabase.auth.signInWithPassword({
          email: nextEmail.trim(),
          password,
        });
        return error ? { error: error.message } : {};
      },
      signUp: async (nextEmail, password) => {
        if (!isSupabaseConfigured) return { error: 'Supabase is not configured yet. Continue as guest for the demo build.' };
        const { data, error } = await supabase.auth.signUp({
          email: nextEmail.trim(),
          password,
        });
        if (error) return { error: error.message };
        return data.session
          ? {}
          : { message: 'Account created. Check your email to confirm your sign up, then log in.' };
      },
      signOut: async () => {
        setIsGuest(false);
        setUserId(null);
        setEmail(null);
        if (isSupabaseConfigured) await supabase.auth.signOut();
      },
      continueAsGuest: () => {
        setIsGuest(true);
        setReady(true);
      },
    }),
    [email, isGuest, ready, userId]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}

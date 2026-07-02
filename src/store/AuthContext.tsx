import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

export type BrieflyProfile = {
  id: string;
  display_name: string;
  role: 'buyer' | 'vendor' | 'admin';
  avatar_url: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
};

type ProfilePatch = Partial<Pick<BrieflyProfile, 'display_name' | 'role' | 'avatar_url' | 'location'>>;

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: BrieflyProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (patch: ProfilePatch) => Promise<BrieflyProfile>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function nameFromUser(user: User, fallback?: string) {
  const metadataName = typeof user.user_metadata?.display_name === 'string' ? user.user_metadata.display_name : '';
  const emailName = user.email?.split('@')[0] ?? 'Briefly user';
  return fallback?.trim() || metadataName.trim() || emailName;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<BrieflyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function ensureProfile(user: User | null, displayName?: string) {
    if (!user) {
      setProfile(null);
      return null;
    }

    const { data: existing } = await supabase
      .from('profiles')
      .select('id, display_name, role, avatar_url, location, created_at, updated_at')
      .eq('id', user.id)
      .maybeSingle();

    if (existing) {
      const next = existing as BrieflyProfile;
      setProfile(next);
      return next;
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        display_name: nameFromUser(user, displayName),
        location: 'Singapore',
      })
      .select('id, display_name, role, avatar_url, location, created_at, updated_at')
      .single();

    if (error) throw error;
    const next = data as BrieflyProfile;
    setProfile(next);
    return next;
  }

  useEffect(() => {
    let mounted = true;

    async function initialise() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      await ensureProfile(data.session?.user ?? null);
      if (mounted) setLoading(false);
    }

    void initialise();

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      void ensureProfile(nextSession?.user ?? null).finally(() => setLoading(false));
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        setSession(data.session);
        await ensureProfile(data.user);
      },
      signUp: async (email, password, displayName) => {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: displayName.trim() } },
        });
        if (error) throw error;
        setSession(data.session);
        if (data.user && data.session) await ensureProfile(data.user, displayName);
        return !!data.session;
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setSession(null);
        setProfile(null);
      },
      updateProfile: async (patch) => {
        const user = session?.user;
        if (!user) throw new Error('You need to be logged in.');

        const { data, error } = await supabase
          .from('profiles')
          .update({ ...patch, updated_at: new Date().toISOString() })
          .eq('id', user.id)
          .select('id, display_name, role, avatar_url, location, created_at, updated_at')
          .single();

        if (error) throw error;
        const next = data as BrieflyProfile;
        setProfile(next);
        return next;
      },
      refreshProfile: async () => {
        await ensureProfile(session?.user ?? null);
      },
    }),
    [loading, profile, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  updated_at: string | null;
}

async function upsertProfile(user: User) {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!existing) {
    await supabase.from('profiles').insert({
      id: user.id,
      full_name: user.user_metadata?.full_name ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
    });
  }
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Handle sign-out — clear state and redirect away from protected routes.
        // This also covers token expiry and logout from another tab.
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          if (!window.location.pathname.startsWith('/auth')) {
            window.location.replace('/auth');
          }
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await upsertProfile(session.user);
          const p = await fetchProfile(session.user.id);
          setProfile(p);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    // Clear local state immediately so UI updates before the async call completes.
    setUser(null);
    setSession(null);
    setProfile(null);

    try {
      await supabase.auth.signOut();
      // SIGNED_OUT event handler above will redirect to /auth.
    } catch (err) {
      console.error('Sign out error:', err);
      // State already cleared; force redirect as fallback.
      window.location.replace('/auth');
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const p = await fetchProfile(user.id);
      setProfile(p);
    }
  };

  return { user, session, profile, loading, signOut, refreshProfile };
}

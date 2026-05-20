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
        if (event === 'SIGNED_OUT') {
          // Just clear state. Do NOT navigate here.
          // Reason: window.location during Supabase signOut reloads the page
          // before localStorage is cleared, so AuthPage re-reads the stale
          // session and redirects back to /dashboard — breaking logout.
          // Navigation is handled by the calling component (navigate('/auth'))
          // after await signOut() ensures supabase has fully cleared storage.
          // ProtectedRoute handles the redirect for external logouts (token
          // expiry, other-tab signout) via <Navigate to="/auth"> when user=null.
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
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
    // Clear local state immediately so UI updates before the network call.
    setUser(null);
    setSession(null);
    setProfile(null);

    try {
      // Must await — this clears Supabase localStorage before we navigate.
      // Navigating before this completes leaves the session in storage and
      // causes AuthPage to redirect back to /dashboard on the next load.
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
      // State is already cleared. Caller will still navigate away.
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

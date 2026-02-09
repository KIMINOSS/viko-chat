import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '@/types';

interface AuthState {
  user: SupabaseUser | null;
  profile: User | null;
  loading: boolean;
}

let _initialized = false;

export const useAuthStore = create<AuthState>(() => ({
  user: null,
  profile: null,
  loading: true,
}));

async function fetchProfile(userId: string): Promise<User | null> {
  try {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return data as User | null;
  } catch {
    return null;
  }
}

function initAuth() {
  if (_initialized) return;
  _initialized = true;

  // Failsafe: 5초 후에도 loading이면 강제 해제
  const timeout = setTimeout(() => {
    if (useAuthStore.getState().loading) {
      useAuthStore.setState({ loading: false });
    }
  }, 5000);

  supabase.auth.getSession()
    .then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        useAuthStore.setState({ user: session.user, profile, loading: false });
      } else {
        useAuthStore.setState({ user: null, profile: null, loading: false });
      }
    })
    .catch(() => {
      useAuthStore.setState({ user: null, profile: null, loading: false });
    })
    .finally(() => clearTimeout(timeout));

  // Auth state change listener
  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const current = useAuthStore.getState();
      if (current.profile?.id === session.user.id) {
        useAuthStore.setState({ user: session.user, loading: false });
        return;
      }
      const profile = await fetchProfile(session.user.id);
      useAuthStore.setState({ user: session.user, profile, loading: false });
    } else {
      useAuthStore.setState({ user: null, profile: null, loading: false });
    }
  });
}

export function useAuth() {
  initAuth();
  return useAuthStore();
}

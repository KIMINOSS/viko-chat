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

  supabase.auth.onAuthStateChange(async (event, session) => {
    try {
      if (!session?.user) {
        useAuthStore.setState({ user: null, profile: null, loading: false });
        return;
      }

      // session에서 user를 즉시 세팅 (failsafe 발동 시 로그인 리다이렉트 방지)
      useAuthStore.setState({ user: session.user });

      const current = useAuthStore.getState();
      if (current.profile?.id === session.user.id) {
        useAuthStore.setState({ loading: false });
        return;
      }

      if (event === 'INITIAL_SESSION') {
        const { error } = await supabase.auth.getUser();
        if (error) {
          useAuthStore.setState({ user: null, profile: null, loading: false });
          await supabase.auth.signOut().catch(() => {});
          return;
        }
      }

      const profile = await fetchProfile(session.user.id);
      useAuthStore.setState({ user: session.user, profile, loading: false });
    } catch {
      useAuthStore.setState({ user: null, profile: null, loading: false });
    }
  });

  // Failsafe: 어떤 경우에도 3초 후 loading 해제 (제거 불가능한 안전망)
  setTimeout(() => {
    if (useAuthStore.getState().loading) {
      useAuthStore.setState({ loading: false });
    }
  }, 3000);
}

export function useAuth() {
  initAuth();
  return useAuthStore();
}

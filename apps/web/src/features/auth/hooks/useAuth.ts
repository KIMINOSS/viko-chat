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

  // Failsafe: 3초 후에도 loading이면 강제 해제
  const timeout = setTimeout(() => {
    if (useAuthStore.getState().loading) {
      useAuthStore.setState({ loading: false });
    }
  }, 3000);

  // onAuthStateChange 단일 소스 (getSession 중복 호출 제거)
  // INITIAL_SESSION 이벤트로 초기 세션도 여기서 처리됨
  supabase.auth.onAuthStateChange(async (event, session) => {
    clearTimeout(timeout);

    if (!session?.user) {
      useAuthStore.setState({ user: null, profile: null, loading: false });
      return;
    }

    // 같은 유저면 profile 재요청 스킵
    const current = useAuthStore.getState();
    if (current.profile?.id === session.user.id) {
      useAuthStore.setState({ user: session.user, loading: false });
      return;
    }

    // 세션이 있으면 서버에서 토큰 유효성 검증 (stale 세션 방지)
    if (event === 'INITIAL_SESSION') {
      const { error } = await supabase.auth.getUser();
      if (error) {
        // 삭제된 유저의 stale 토큰 → 로그아웃
        await supabase.auth.signOut();
        useAuthStore.setState({ user: null, profile: null, loading: false });
        return;
      }
    }

    const profile = await fetchProfile(session.user.id);
    useAuthStore.setState({ user: session.user, profile, loading: false });
  });
}

export function useAuth() {
  initAuth();
  return useAuthStore();
}

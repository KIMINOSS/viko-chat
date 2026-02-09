import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import { useAuthStore } from '../hooks/useAuth';
import type { Lang, User } from '@/types';

export function LoginPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [lang, setLang] = useState<Lang>('ko');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleNameChange(value: string) {
    const filtered = value.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();
    setName(filtered);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.length !== 4) return;

    setError('');
    setLoading(true);

    const email = `${name.toLowerCase()}@viko.chat`;
    const password = `viko${name.toLowerCase()}2024`;

    try {
      let userId: string | undefined;

      // 1) 로그인 시도
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        if (signInError.message !== 'Invalid login credentials') {
          throw signInError;
        }
        // 2) 계정 없으면 회원가입 (trigger가 users 행 자동 생성)
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (signUpError) throw signUpError;

        userId = signUpData.user?.id;

        // 자동 세션 없으면 수동 로그인
        if (!signUpData.session) {
          const { data: retryData, error: retryError } =
            await supabase.auth.signInWithPassword({ email, password });
          if (retryError) throw retryError;
          userId = retryData.user?.id;
        }
      } else {
        userId = signInData.user?.id;
      }

      // 3) 백엔드 API로 프로필 보장 (service key로 RLS 우회)
      if (userId) {
        const profile = await api.post<User>('/auth/ensure-profile', {
          name,
          preferred_lang: lang,
        });
        useAuthStore.setState({ profile });
      }

      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  const isValid = name.length === 4;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500 text-2xl font-bold text-white shadow-lg">
            VI
          </div>
          <h1 className="text-2xl font-bold text-gray-900">VIKO Chat</h1>
          <p className="mt-1 text-sm text-gray-500">Vietnamese-Korean Translation</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Your ID
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-2xl font-bold tracking-[0.3em] uppercase outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              placeholder="ABCD"
              maxLength={4}
              autoComplete="off"
              required
            />
            <p className="mt-1.5 text-center text-xs text-gray-400">
              Enter 4 English letters as your ID
            </p>
          </div>

          {/* Language Selector */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Language</label>
            <div className="grid grid-cols-2 gap-3">
              {(['ko', 'vi'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition ${
                    lang === l
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {l === 'ko' ? '한국어' : 'Tiếng Việt'}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !isValid}
            className="w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? '...' : 'Start Chat'}
          </button>
        </form>
      </div>
    </div>
  );
}

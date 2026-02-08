import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Loading } from '@/shared/components/Loading';
import type { Lang } from '@/types';

export function ProfileSetup() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [lang, setLang] = useState<Lang>('ko');
  const [loading, setLoading] = useState(false);

  if (authLoading) return <Loading />;
  if (!user) {
    navigate('/login');
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await supabase
      .from('users')
      .update({ name, preferred_lang: lang })
      .eq('id', user!.id);

    setLoading(false);
    navigate('/');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-gray-900">Profile Setup</h1>
          <p className="mt-1 text-sm text-gray-500">Tell us about yourself</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Preferred Language</label>
            <div className="grid grid-cols-2 gap-3">
              {(['ko', 'vi'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${
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

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? '...' : 'Get Started'}
          </button>
        </form>
      </div>
    </div>
  );
}

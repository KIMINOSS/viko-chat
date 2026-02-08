import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Avatar } from '@/shared/components/Avatar';
import { BottomNav } from '@/shared/components/BottomNav';
import { Loading } from '@/shared/components/Loading';
import type { Lang } from '@/types';

export function SettingsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.name ?? '');
  const [lang, setLang] = useState<Lang>(profile?.preferred_lang ?? 'ko');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (authLoading) return <Loading />;

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setSaved(false);

    await supabase
      .from('users')
      .update({ name, preferred_lang: lang })
      .eq('id', user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-lg">
        <h1 className="text-lg font-bold text-gray-900">Settings</h1>
      </header>

      <main className="flex-1 px-4 pt-6 pb-28">
        {/* Profile Card */}
        <div className="flex flex-col items-center rounded-2xl bg-white p-6 shadow-sm">
          <Avatar name={profile?.name ?? '?'} url={profile?.avatar_url} size="lg" />
          <p className="mt-2 text-sm text-gray-500">{user?.email}</p>
        </div>

        {/* Edit Form */}
        <div className="mt-4 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-300"
            />
          </div>

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
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {l === 'ko' ? '한국어' : 'Tiếng Việt'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-indigo-500 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-4 w-full rounded-2xl bg-white py-3 text-sm font-medium text-red-500 shadow-sm transition active:bg-red-50"
        >
          Logout
        </button>

        <p className="mt-6 text-center text-[10px] text-gray-300">VIKO Chat v1.0</p>
      </main>

      <BottomNav />
    </div>
  );
}

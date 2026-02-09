import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Avatar } from '@/shared/components/Avatar';
import { BottomNav } from '@/shared/components/BottomNav';
import type { User } from '@/types';

export function ContactsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || !user) return;

    setSearching(true);
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .ilike('name', `%${query.trim()}%`)
        .neq('id', user.id)
        .limit(20);

      setResults((data as User[]) ?? []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function startConversation(targetUserId: string) {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .or(
          `and(user1_id.eq.${user.id},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${user.id})`,
        )
        .maybeSingle();

      if (existing) {
        navigate(`/chat/${existing.id}`);
        return;
      }

      const { data: newConvo } = await supabase
        .from('conversations')
        .insert({ user1_id: user.id, user2_id: targetUserId })
        .select()
        .single();

      if (newConvo) {
        navigate(`/chat/${newConvo.id}`);
      }
    } catch {
      // silent fail - UI에서 재시도 가능
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-lg">
        <h1 className="text-lg font-bold text-gray-900">Contacts</h1>
      </header>

      <main className="flex-1 px-4 pt-4 pb-28">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name..."
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-300"
          />
          <button
            type="submit"
            disabled={searching}
            className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:opacity-50"
          >
            {searching ? '...' : 'Search'}
          </button>
        </form>

        {/* Results */}
        <div className="mt-4 space-y-2">
          {results.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm"
            >
              <Avatar name={u.name} url={u.avatar_url} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                <p className="text-xs text-gray-500 truncate">{u.email}</p>
              </div>
              <button
                onClick={() => startConversation(u.id)}
                className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100"
              >
                Chat
              </button>
            </div>
          ))}
          {results.length === 0 && query && !searching && (
            <p className="py-8 text-center text-sm text-gray-400">No users found</p>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

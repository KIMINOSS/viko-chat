import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useChatStore } from '../stores/chatStore';
import type { Conversation, User, Message } from '@/types';

export function useConversations() {
  const { user } = useAuth();
  const { conversations, setConversations } = useChatStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetchConversations();

    // Realtime: listen for new conversations
    const channel = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => { fetchConversations(); },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  async function fetchConversations() {
    if (!user) return;

    const { data: convos } = await supabase
      .from('conversations')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('updated_at', { ascending: false });

    if (!convos) { setLoading(false); return; }

    // Batch fetch: 모든 상대방 유저를 한 번에 조회 (N+1 → 1+N)
    const otherIds = [...new Set(convos.map((c: Conversation) =>
      c.user1_id === user.id ? c.user2_id : c.user1_id
    ))];

    const [{ data: otherUsers }, ...lastMessageResults] = await Promise.all([
      supabase.from('users').select('*').in('id', otherIds),
      ...convos.map((c: Conversation) =>
        supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', c.id)
          .order('created_at', { ascending: false })
          .limit(1)
      ),
    ]);

    const userMap = new Map((otherUsers ?? []).map((u: User) => [u.id, u]));

    const enriched: Conversation[] = convos.map((c: Conversation, i: number) => {
      const otherId = c.user1_id === user.id ? c.user2_id : c.user1_id;
      return {
        ...c,
        other_user: userMap.get(otherId),
        last_message: lastMessageResults[i]?.data?.[0] as Message | undefined,
      };
    });

    setConversations(enriched);
    setLoading(false);
  }

  return { conversations, loading, refresh: fetchConversations };
}

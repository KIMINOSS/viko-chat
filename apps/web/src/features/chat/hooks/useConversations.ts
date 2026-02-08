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

    // Fetch other users and last messages
    const enriched: Conversation[] = await Promise.all(
      convos.map(async (c: Conversation) => {
        const otherId = c.user1_id === user.id ? c.user2_id : c.user1_id;

        const [{ data: otherUser }, { data: lastMessages }] = await Promise.all([
          supabase.from('users').select('*').eq('id', otherId).single(),
          supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', c.id)
            .order('created_at', { ascending: false })
            .limit(1),
        ]);

        return {
          ...c,
          other_user: otherUser as User | undefined,
          last_message: lastMessages?.[0] as Message | undefined,
        };
      }),
    );

    setConversations(enriched);
    setLoading(false);
  }

  return { conversations, loading, refresh: fetchConversations };
}

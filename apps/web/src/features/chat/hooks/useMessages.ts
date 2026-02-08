import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useChatStore } from '../stores/chatStore';
import { api } from '@/lib/api';
import type { Message } from '@/types';

export function useMessages(conversationId: string) {
  const { user } = useAuth();
  const { currentMessages, setCurrentMessages, addMessage } = useChatStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) return;

    fetchMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Only add if not from current user (our optimistic update already added it)
          if (newMsg.sender_id !== user?.id) {
            addMessage(newMsg);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      setCurrentMessages([]);
    };
  }, [conversationId]);

  async function fetchMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(100);

    setCurrentMessages((data as Message[]) ?? []);
    setLoading(false);
  }

  const sendMessage = useCallback(
    async (content: string) => {
      if (!user || !content.trim()) return;

      // Optimistic update
      const tempId = crypto.randomUUID();
      const optimistic: Message = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
        translated: null,
        source_lang: 'ko',
        target_lang: 'vi',
        read_at: null,
        created_at: new Date().toISOString(),
      };
      addMessage(optimistic);

      try {
        const saved = await api.post<Message>('/messages', {
          conversationId,
          senderId: user.id,
          content: content.trim(),
        });

        // Replace optimistic with real
        useChatStore.getState().updateMessage(tempId, {
          ...saved,
          id: saved.id,
        });
      } catch {
        // Remove optimistic on failure
        const messages = useChatStore.getState().currentMessages;
        setCurrentMessages(messages.filter((m) => m.id !== tempId));
      }
    },
    [user, conversationId],
  );

  return { messages: currentMessages, loading, sendMessage };
}

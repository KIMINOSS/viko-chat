import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useChatStore } from '../stores/chatStore';
import { api } from '@/lib/api';
import type { Message, MessageType } from '@/types';

export function useMessages(conversationId: string) {
  const { user } = useAuth();
  const { currentMessages, setCurrentMessages, addMessage } = useChatStore();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!conversationId) { setLoading(false); return; }

    fetchMessages();

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
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(100);

      setCurrentMessages((data as Message[]) ?? []);
    } finally {
      setLoading(false);
    }
  }

  const sendMessage = useCallback(
    async (content: string) => {
      if (!user || !content.trim()) return;

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
        message_type: 'text',
        file_url: null,
        file_name: null,
        file_size: null,
      };
      addMessage(optimistic);

      try {
        const saved = await api.post<Message>('/messages', {
          conversationId,
          senderId: user.id,
          content: content.trim(),
        });

        useChatStore.getState().updateMessage(tempId, {
          ...saved,
          id: saved.id,
        });
      } catch {
        const messages = useChatStore.getState().currentMessages;
        setCurrentMessages(messages.filter((m) => m.id !== tempId));
      }
    },
    [user, conversationId],
  );

  const sendFileMessage = useCallback(
    async (file: File, messageType: MessageType) => {
      if (!user) return;

      setUploading(true);
      const tempId = crypto.randomUUID();
      try {
        const ext = file.name.split('.').pop() ?? '';
        const filePath = `${conversationId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('chat-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('chat-files')
          .getPublicUrl(filePath);

        const fileUrl = urlData.publicUrl;

        const optimistic: Message = {
          id: tempId,
          conversation_id: conversationId,
          sender_id: user.id,
          content: file.name,
          translated: null,
          source_lang: 'ko',
          target_lang: 'vi',
          read_at: null,
          created_at: new Date().toISOString(),
          message_type: messageType,
          file_url: fileUrl,
          file_name: file.name,
          file_size: file.size,
        };
        addMessage(optimistic);

        const saved = await api.post<Message>('/messages', {
          conversationId,
          senderId: user.id,
          content: file.name,
          messageType,
          fileUrl,
          fileName: file.name,
          fileSize: file.size,
        });

        useChatStore.getState().updateMessage(tempId, {
          ...saved,
          id: saved.id,
        });
      } catch {
        const messages = useChatStore.getState().currentMessages;
        setCurrentMessages(messages.filter((m) => m.id !== tempId));
      } finally {
        setUploading(false);
      }
    },
    [user, conversationId],
  );

  return { messages: currentMessages, loading, uploading, sendMessage, sendFileMessage };
}

import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useMessages } from '../hooks/useMessages';
import { MessageBubble } from '../components/MessageBubble';
import { MessageInput } from '../components/MessageInput';
import { Avatar } from '@/shared/components/Avatar';
import type { User } from '@/types';

export function ChatRoom() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useMessages(conversationId!);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);

  // Fetch conversation partner info
  useEffect(() => {
    if (!conversationId || !user) return;

    (async () => {
      const { data: convo } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (!convo) return;

      const otherId = convo.user1_id === user.id ? convo.user2_id : convo.user1_id;
      const { data } = await supabase.from('users').select('*').eq('id', otherId).single();
      if (data) setOtherUser(data as User);
    })();
  }, [conversationId, user?.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-100 bg-white/95 px-3 py-2.5 backdrop-blur-lg">
        <button
          onClick={() => navigate('/')}
          className="flex h-9 w-9 items-center justify-center rounded-full transition active:bg-gray-100"
        >
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        {otherUser && (
          <>
            <Avatar name={otherUser.name} url={otherUser.avatar_url} size="sm" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{otherUser.name}</p>
              <p className="text-[10px] text-gray-400">
                {otherUser.preferred_lang === 'ko' ? '한국어' : 'Tiếng Việt'}
              </p>
            </div>
          </>
        )}
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-3 pt-3 pb-32 hide-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center pt-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <p className="text-sm text-gray-400">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === user?.id}
            />
          ))
        )}
        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <MessageInput onSend={sendMessage} />
    </div>
  );
}

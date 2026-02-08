import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/shared/components/Avatar';
import type { Conversation } from '@/types';

interface ConversationItemProps {
  conversation: Conversation;
}

export function ConversationItem({ conversation }: ConversationItemProps) {
  const navigate = useNavigate();
  const otherUser = conversation.other_user;
  const lastMsg = conversation.last_message;

  const name = otherUser?.name ?? 'Unknown';
  const preview = lastMsg?.content ?? 'No messages yet';
  const time = lastMsg
    ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <button
      onClick={() => navigate(`/chat/${conversation.id}`)}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition active:bg-gray-50"
    >
      <Avatar name={name} url={otherUser?.avatar_url} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900 truncate">{name}</span>
          <span className="text-[10px] text-gray-400 shrink-0 ml-2">{time}</span>
        </div>
        <p className="mt-0.5 truncate text-xs text-gray-500">{preview}</p>
      </div>
    </button>
  );
}

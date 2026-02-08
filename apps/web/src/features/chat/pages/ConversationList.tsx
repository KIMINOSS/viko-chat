import { useConversations } from '../hooks/useConversations';
import { ConversationItem } from '../components/ConversationItem';
import { BottomNav } from '@/shared/components/BottomNav';

export function ConversationList() {
  const { conversations, loading } = useConversations();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-lg">
        <h1 className="text-lg font-bold text-gray-900">Chats</h1>
      </header>

      {/* Content */}
      <main className="flex-1 pb-28">
        {loading ? (
          <div className="flex items-center justify-center pt-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <div className="mb-3 text-4xl">💬</div>
            <p className="text-sm font-medium text-gray-500">No conversations yet</p>
            <p className="mt-1 text-xs text-gray-400">
              Go to Contacts to start a new chat
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {conversations.map((c) => (
              <ConversationItem key={c.id} conversation={c} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

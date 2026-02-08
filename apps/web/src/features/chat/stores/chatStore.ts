import { create } from 'zustand';
import type { Message, Conversation, User } from '@/types';

interface ChatState {
  conversations: Conversation[];
  currentMessages: Message[];
  currentUser: User | null;

  setConversations: (conversations: Conversation[]) => void;
  setCurrentMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setCurrentUser: (user: User | null) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  currentMessages: [],
  currentUser: null,

  setConversations: (conversations) => set({ conversations }),
  setCurrentMessages: (messages) => set({ currentMessages: messages }),
  addMessage: (message) =>
    set((state) => ({
      currentMessages: [...state.currentMessages, message],
    })),
  setCurrentUser: (user) => set({ currentUser: user }),
  updateMessage: (id, updates) =>
    set((state) => ({
      currentMessages: state.currentMessages.map((m) =>
        m.id === id ? { ...m, ...updates } : m,
      ),
    })),
}));

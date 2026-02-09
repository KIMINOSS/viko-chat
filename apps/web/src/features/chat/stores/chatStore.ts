import { create } from 'zustand';
import type { Message, Conversation } from '@/types';

interface ChatState {
  conversations: Conversation[];
  currentMessages: Message[];

  setConversations: (conversations: Conversation[]) => void;
  setCurrentMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  currentMessages: [],

  setConversations: (conversations) => set({ conversations }),
  setCurrentMessages: (messages) => set({ currentMessages: messages }),
  addMessage: (message) =>
    set((state) => ({
      currentMessages: [...state.currentMessages, message],
    })),
  updateMessage: (id, updates) =>
    set((state) => ({
      currentMessages: state.currentMessages.map((m) =>
        m.id === id ? { ...m, ...updates } : m,
      ),
    })),
}));

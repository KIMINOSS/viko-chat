export interface User {
  id: string;
  email: string | null;
  name: string;
  avatar_url: string | null;
  preferred_lang: 'ko' | 'vi';
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  updated_at: string;
  // Joined data
  other_user?: User;
  last_message?: Message;
}

export type MessageType = 'text' | 'image' | 'video' | 'file';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  translated: string | null;
  source_lang: 'ko' | 'vi';
  target_lang: 'ko' | 'vi';
  read_at: string | null;
  created_at: string;
  message_type: MessageType;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type Lang = 'ko' | 'vi';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types
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
}

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
}

// User operations
export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as User;
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single();

  if (error) return null;
  return data as User;
}

// Message operations
export async function getMessages(conversationId: string, limit = 50, offset = 0) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data as Message[];
}

export async function createMessage(message: Omit<Message, 'id' | 'created_at' | 'read_at'>) {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}

// Conversation operations
export async function getConversations(userId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Conversation[];
}

export async function searchUsersByEmail(email: string, excludeUserId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, avatar_url, preferred_lang')
    .ilike('email', `%${email}%`)
    .neq('id', excludeUserId)
    .limit(20);

  if (error) throw error;
  return data as Pick<User, 'id' | 'email' | 'name' | 'avatar_url' | 'preferred_lang'>[];
}

export async function getOrCreateConversation(user1Id: string, user2Id: string) {
  // Check existing
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)
    .single();

  if (existing) return existing as Conversation;

  // Create new
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user1_id: user1Id, user2_id: user2Id })
    .select()
    .single();

  if (error) throw error;
  return data as Conversation;
}

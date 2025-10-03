"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  userName: string;
  photoURL?: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  chat_id: string;
  user_id: string;
  user_name: string;
  user_photo_url?: string;
  created_at: string;
}

interface UseSupabaseChatReturn {
  messages: Message[];
  sendMessage: (content: string, user: User) => Promise<void>;
  isLoading: boolean;
  activeUsers: User[];
  typingUsers: User[];
  startTyping: (user: User) => Promise<void>;
  stopTyping: (user: User) => Promise<void>;
  isConnected: boolean;
}

export function useSupabaseChat(chatId: string): UseSupabaseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const channelRef = useRef<any>(null);

  // Initialize Supabase channel
  useEffect(() => {
    if (!supabase || !chatId) {
      console.log('Supabase not available or no chatId');
      return;
    }

    console.log('Initializing Supabase real-time for chat:', chatId);

    const channel = supabase.channel(`chat-${chatId}`, {
      config: [{ event: '*', filter: '*' }]
    });

    // Listen for new messages
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `chat_id=eq.${chatId}`
    }, (payload: any) => {
      console.log('New message received:', payload.new);
      setMessages(prev => [...prev, payload.new]);
    });

    // Listen for presence changes
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const users = Object.values(state).map(user => ({
        id: (user as any)[0].user_id,
        userName: (user as any)[0].user_name || 'User',
        photoURL: (user as any)[0].user_photo_url
      }));
      setActiveUsers(users);
      console.log('Active users updated:', users);
    });

    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key, newPresences);
    });

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key, leftPresences);
    });

    channel.subscribe(async (status) => {
      console.log('Channel status:', status);
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        console.log('✅ Connected to Supabase real-time');
      }
    });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      setIsConnected(false);
    };
  }, [chatId]);

  // Load existing messages
  useEffect(() => {
    if (!supabase || !chatId) return;

    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading messages:', error);
          return;
        }

        setMessages(data || []);
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    loadMessages();
  }, [chatId]);

  const sendMessage = useCallback(async (content: string, user: User) => {
    if (!supabase || !chatId) {
      console.error('Supabase not available or no chatId');
      return;
    }

    console.log('Sending message:', content, 'User:', user);
    
    try {
      const messageData = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: content.trim(),
        sender: 'user' as const,
        chat_id: chatId,
        user_id: user.id,
        user_name: user.userName,
        user_photo_url: user.photoURL || '',
        created_at: new Date().toISOString()
      };

      console.log('Supabase client:', supabase, 'Chat ID:', chatId);
      const insertResult = await supabase
        .from('messages')
        .insert([messageData]);

      console.log('Insert result:', insertResult);

      if (insertResult.error) {
        console.error('Database error:', {
          message: insertResult.error.message || 'Unknown error',
          code: insertResult.error.code || 'unknown',
          details: insertResult.error.details || 'No details',
          hint: insertResult.error.hint || 'No hint',
          messageData: messageData,
          fullError: JSON.stringify(insertResult.error)
        });
        throw new Error(`Database error: ${JSON.stringify(insertResult.error)}`);
      }

      // Update typing users to remove this user
      setTypingUsers(prev => prev.filter(u => u.id !== user.id));

    } catch (dbError: any) {
      console.error('Error sending message:', {
        dbError: dbError,
        message: dbError?.message || 'Unknown database error',
        code: dbError?.code || 'unknown',
        details: dbError?.details || 'No details available',
        hint: dbError?.hint || 'No .hint',
        messageData: { content, user, chatId },
        fullError: JSON.stringify(dbError || {})
      });
      throw new Error(`Database error: ${JSON.stringify(dbError || {})}`);
    }
  }, [chatId]);

  const startTyping = useCallback(async (user: User) => {
    if (!supabase || !chatId || !channelRef.current) {
      console.log('Cannot start typing:', { supabase: !!supabase, chatId, channel: !!channelRef.current });
      return;
    }

    console.log('Starting typing:', user);
    
    const userPresence = {
      user_id: user.id,
      user_name: user.userName,
      user_photo_url: user.photoURL
    };

    const { error } = await channelRef.current.track(userPresence);
    
    if (error) {
      console.error('Error tracking presence (typing):', error);
    } else {
      // Add to typing users with deduplication
      setTypingUsers(prev => {
        const exists = prev.some(u => u.id === user.id);
        if (!exists) {
          return [...prev, user];
        }
        return prev;
      });
    }
  }, [chatId]);

  const stopTyping = useCallback(async (user: User) => {
    if (!supabase || !chatId || !channelRef.current) {
      console.log('Cannot stop typing:', { supabase: !!supabase, chatId, channel: !!channelRef.current });
      return;
    }

    console.log('Stopping typing:', user);
    
    // Remove from typing users
    setTypingUsers(prev => prev.filter(u => u.id !== user.id));
  }, [chatId]);

  return {
    messages,
    sendMessage,
    isLoading,
    activeUsers,
    typingUsers,
    startTyping,
    stopTyping,
    isConnected
  };
}

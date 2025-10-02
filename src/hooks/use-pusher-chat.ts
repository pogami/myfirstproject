import { useEffect, useState, useRef } from 'react';
import { pusher, initializePusher } from '@/lib/pusher';
import { useChatStore } from './use-chat-store';

interface UsePusherChatOptions {
  chatId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  enabled?: boolean;
}

interface PusherUser {
  userId: string;
  userName: string;
  userPhotoURL?: string;
}

interface PusherMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'moderator' | 'system';
  name: string;
  userId: string;
  timestamp: number;
}

export function usePusherChat({
  chatId,
  userId,
  userName,
  userPhotoURL,
  enabled = true
}: UsePusherChatOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<PusherUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<PusherUser[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [availableChats, setAvailableChats] = useState<any[]>([]);
  
  const channelRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { addMessage, receiveRealtimeMessage } = useChatStore();

  useEffect(() => {
    console.log('Pusher hook effect triggered:', { enabled, chatId, userId, userName });
    
    if (!enabled) {
      console.log('Pusher disabled:', { enabled });
      return;
    }

    if (!chatId) {
      console.log('No chatId provided:', { chatId });
      return;
    }

    // Ensure Pusher is initialized
    console.log('Initializing Pusher chat hook for:', { chatId, userId, userName });
    
    const pusherInstance = pusher || initializePusher(userId, userName, userPhotoURL);
    if (!pusherInstance) {
      console.error('Pusher not initialized - check environment variables');
      return;
    }

    console.log('Pusher instance found, proceeding with connection...');

    console.log('Initializing Pusher connection for chat:', { chatId, userId, userName });

    // Connect to Pusher
    pusherInstance.connection.bind('connected', () => {
      console.log('✅ Pusher connected successfully!');
      setIsConnected(true);
    });

    pusherInstance.connection.bind('disconnected', () => {
      console.log('❌ Pusher disconnected');
      setIsConnected(false);
      setActiveUsers([]);
      setTypingUsers([]);
    });

    pusherInstance.connection.bind('error', (error: any) => {
      console.error('❌ Pusher connection error:', error);
      setIsConnected(false);
    });

    pusherInstance.connection.bind('state_change', (states: any) => {
      console.log('🔄 Pusher state changed:', states);
    });

    // Check current connection state
    console.log('Current Pusher connection state:', pusherInstance.connection.state);
    if (pusherInstance.connection.state === 'connected') {
      console.log('✅ Pusher already connected');
      setIsConnected(true);
    }

    // Join the chat channel
    console.log('Subscribing to channel:', `chat-${chatId}`);
    const channel = pusherInstance.subscribe(`chat-${chatId}`);
    channelRef.current = channel;

    channel.bind('pusher:subscription_succeeded', () => {
      console.log('✅ Successfully subscribed to chat channel:', `chat-${chatId}`);
    });

    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('❌ Failed to subscribe to chat channel:', error);
    });

    // Subscribe to presence channel for user tracking
    console.log('Subscribing to presence channel for user tracking:', `presence-${chatId}`);
    const presenceChannel = pusherInstance.subscribe(`presence-${chatId}`);
    presenceChannelRef.current = presenceChannel;
    
    presenceChannel.bind('pusher:subscription_succeeded', (data: any) => {
      console.log('✅ Successfully subscribed to presence channel');
      console.log('Current members:', data.members);
      
      // Initialize active users from current members
      const members = data.members || {};
      const userList = Object.keys(members).map(userId => ({
        userId,
        userName: members[userId].name || `User ${userId.slice(0, 6)}`,
        userPhotoURL: members[userId].photoURL
      }));
      setActiveUsers(userList);
      console.log('Initial active users:', userList);
    });

    presenceChannel.bind('pusher:member_added', (member: any) => {
      console.log('👤 User joined:', member);
      setActiveUsers(prev => {
        const exists = prev.find(u => u.userId === member.id);
        if (!exists) {
          const newUser = {
            userId: member.id,
            userName: member.info?.name || `User ${member.id.slice(0, 6)}`,
            userPhotoURL: member.info?.photoURL
          };
          console.log('Adding new user to active list:', newUser);
          return [...prev, newUser];
        }
        return prev;
      });
    });

    presenceChannel.bind('pusher:member_removed', (member: any) => {
      console.log('👋 User left:', member);
      setActiveUsers(prev => {
        const filtered = prev.filter(u => u.userId !== member.id);
        console.log('Removed user from active list, remaining:', filtered);
        return filtered;
      });
    });

    presenceChannel.bind('pusher:subscription_error', (error: any) => {
      console.error('❌ Failed to subscribe to presence channel:', error);
      // Fallback to regular channel if presence fails
      console.log('Falling back to regular channel for user tracking');
    });

    // Handle new messages
    channel.bind('new-message', (data: PusherMessage) => {
      console.log('📨 New Pusher message received:', { 
        messageId: data.id, 
        userId: data.userId, 
        userName: data.name,
        text: data.text?.substring(0, 50) + '...',
        chatId 
      });
      
      // Add message to chat store
      receiveRealtimeMessage(chatId, data);
    });

    // Handle client messages (for real-time messaging between tabs)
    channel.bind('client-new-message', (data: PusherMessage) => {
      console.log('📨 New client message received:', { 
        messageId: data.id, 
        userId: data.userId, 
        userName: data.name, 
        text: data.text?.substring(0, 50) + '...',
        chatId 
      });
      
      // Add message to chat store
      receiveRealtimeMessage(chatId, data);
    });

    // Handle typing indicators (client events)
    channel.bind('client-user-typing', (data: { userId: string; userName: string; userPhotoURL?: string }) => {
      console.log('⌨️ User typing received:', { userId: data.userId, userName: data.userName });
      setTypingUsers(prev => {
        const exists = prev.find(u => u.userId === data.userId);
        if (!exists) {
          return [...prev, data];
        }
        return prev;
      });

      // Clear typing indicator after 3 seconds
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
      }, 3000);
    });

    channel.bind('client-user-stopped-typing', (data: { userId: string }) => {
      console.log('⌨️ User stopped typing:', { userId: data.userId });
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    // Handle AI thinking updates
    channel.bind('ai-thinking-update', (data: { isThinking: boolean }) => {
      console.log('🤖 AI thinking update:', { isThinking: data.isThinking });
      setIsAiThinking(data.isThinking);
    });

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up Pusher chat hook for:', chatId);
      if (pusherInstance && channelRef.current) {
        pusherInstance.unsubscribe(`chat-${chatId}`);
      }
      if (pusherInstance && presenceChannelRef.current) {
        pusherInstance.unsubscribe(`presence-${chatId}`);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chatId, userId, userName, userPhotoURL, enabled, receiveRealtimeMessage]);

  // Send message function
  const sendMessage = async (message: PusherMessage) => {
    const pusherInstance = pusher || initializePusher(userId, userName, userPhotoURL);
    if (!pusherInstance || !isConnected || !channelRef.current) {
      console.log('❌ Pusher not connected, skipping real-time broadcast:', message);
      return;
    }

    try {
      console.log('📤 Sending message via Pusher:', message);
      
      // Use Pusher's trigger method directly instead of API call
      channelRef.current.trigger('client-new-message', message);
      
      console.log('✅ Message sent successfully via Pusher');
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  };

  // Start typing function
  const startTyping = () => {
    const pusherInstance = pusher || initializePusher(userId, userName, userPhotoURL);
    if (!pusherInstance || !isConnected || !channelRef.current) {
      console.log('❌ Pusher not connected, skipping typing indicator');
      return;
    }

    console.log('⌨️ Sending typing indicator:', { userId, userName });
    channelRef.current.trigger('client-user-typing', {
      userId,
      userName,
      userPhotoURL
    });
  };

  // Stop typing function
  const stopTyping = () => {
    const pusherInstance = pusher || initializePusher(userId, userName, userPhotoURL);
    if (!pusherInstance || !isConnected || !channelRef.current) {
      console.log('❌ Pusher not connected, skipping typing stop');
      return;
    }

    console.log('⌨️ Sending typing stop indicator:', { userId });
    channelRef.current.trigger('client-user-stopped-typing', {
      userId
    });
  };

  // Join chat function (placeholder for future presence features)
  const joinChat = () => {
    console.log('Join chat function called (presence features disabled)');
  };

  // Leave chat function (placeholder for future presence features)
  const leaveChat = () => {
    console.log('Leave chat function called (presence features disabled)');
  };

  return {
    isConnected,
    activeUsers,
    typingUsers,
    isAiThinking,
    availableChats,
    sendMessage,
    startTyping,
    stopTyping,
    joinChat,
    leaveChat
  };
}
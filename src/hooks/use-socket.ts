"use client";

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketUser {
  userId: string;
  userName: string;
  userPhotoURL?: string;
  chatId?: string;
}

interface SocketMessage {
  id: string;
  sender: 'user' | 'bot' | 'moderator' | 'system';
  text: string;
  name: string;
  timestamp: number;
  userId?: string;
  isJoinMessage?: boolean;
}

interface UseSocketOptions {
  chatId: string;
  userId?: string;
  userName?: string;
  userPhotoURL?: string;
  enabled?: boolean;
}

interface ChatInfo {
  chatId: string;
  title: string;
  userCount: number;
  lastMessage?: {
    text: string;
    timestamp: number;
    sender: string;
  };
  isActive: boolean;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  activeUsers: SocketUser[];
  typingUsers: SocketUser[];
  isAiThinking: boolean;
  availableChats: ChatInfo[];
  sendMessage: (message: SocketMessage) => void;
  startTyping: () => void;
  stopTyping: () => void;
  switchIdentity: (newUserId: string, newUserName: string) => void;
  joinChat: () => void;
  leaveChat: () => void;
}

export function useSocket({
  chatId,
  userId,
  userName,
  userPhotoURL,
  enabled = true
}: UseSocketOptions): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<SocketUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<SocketUser[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [availableChats, setAvailableChats] = useState<ChatInfo[]>([]);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentUserIdRef = useRef<string | undefined>(userId);
  const currentUserNameRef = useRef<string | undefined>(userName);
  const currentUserPhotoURLRef = useRef<string | undefined>(userPhotoURL);

  // Update refs when props change
  useEffect(() => {
    console.log('Updating socket refs:', { userId, userName, userPhotoURL, userNameType: typeof userName });
    currentUserIdRef.current = userId;
    currentUserNameRef.current = userName;
    currentUserPhotoURLRef.current = userPhotoURL;
    console.log('Refs updated - currentUserNameRef:', currentUserNameRef.current, 'currentUserPhotoURLRef:', currentUserPhotoURLRef.current);
  }, [userId, userName, userPhotoURL]);

  useEffect(() => {
    if (!enabled || !chatId) {
      console.log('Socket disabled or no chatId:', { enabled, chatId });
      return;
    }
    
    console.log('Initializing Socket.IO connection for chat:', { chatId, userId, userName });

    // Initialize socket connection
    const newSocket = io(process.env.NODE_ENV === 'production' 
      ? 'https://www.courseconnectai.com' 
      : 'http://localhost:9002', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      
      // Join the chat room
      const userId = currentUserIdRef.current || 'guest';
      const userName = currentUserNameRef.current || 'Guest User';
      const userPhotoURL = currentUserPhotoURLRef.current;
      
      console.log('Joining chat room:', { chatId, userId, userName, userPhotoURL });
      newSocket.emit('join-chat', {
        chatId,
        userId,
        userName,
        userPhotoURL
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      setActiveUsers([]);
      setTypingUsers([]);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Chat event handlers
    newSocket.on('active-users', (users: SocketUser[]) => {
      console.log('Active users updated:', users);
      // Deduplicate users by userId to prevent duplicate key errors
      const uniqueUsers = users.filter((user, index, self) => 
        index === self.findIndex(u => u.userId === user.userId)
      );
      setActiveUsers(uniqueUsers);
    });

    newSocket.on('user-joined', (user: SocketUser) => {
      console.log('User joined:', user);
      setActiveUsers(prev => {
        // Remove any existing user with same userId first, then add the new one
        const filtered = prev.filter(u => u.userId !== user.userId);
        return [...filtered, user];
      });
    });

    newSocket.on('user-left', (user: SocketUser) => {
      console.log('User left:', user);
      setActiveUsers(prev => prev.filter(u => u.userId !== user.userId));
      setTypingUsers(prev => prev.filter(u => u.userId !== user.userId));
    });

    newSocket.on('user-typing', (user: SocketUser) => {
      console.log('User typing received:', user);
      console.log('userName value:', user.userName, 'type:', typeof user.userName);
      console.log('userPhotoURL value:', user.userPhotoURL, 'type:', typeof user.userPhotoURL);
      setTypingUsers(prev => {
        const exists = prev.some(u => u.userId === user.userId);
        if (!exists) {
          const userWithFallback = {
            ...user,
            userName: user.userName || 'Guest User'
          };
          console.log('Adding typing user:', userWithFallback);
          return [...prev, userWithFallback];
        }
        return prev;
      });
    });

    newSocket.on('user-stopped-typing', (user: SocketUser) => {
      console.log('User stopped typing:', user);
      setTypingUsers(prev => prev.filter(u => u.userId !== user.userId));
    });

    newSocket.on('new-message', (message: SocketMessage) => {
      console.log('New real-time message received:', { 
        messageId: message.id, 
        userId: message.userId, 
        userName: message.name, 
        text: message.text?.substring(0, 50) + '...',
        chatId 
      });
      // Import the chat store dynamically to avoid circular dependencies
      import('@/hooks/use-chat-store').then(({ useChatStore }) => {
        const { receiveRealtimeMessage } = useChatStore.getState();
        receiveRealtimeMessage(chatId, message);
      });
    });

    newSocket.on('ai-thinking-update', (data: { isThinking: boolean }) => {
      setIsAiThinking(data.isThinking);
    });

    newSocket.on('rate-limit-exceeded', (data: {
      type: 'message' | 'typing';
      reason: string;
      retryAfter: number;
    }) => {
      console.log('Rate limit exceeded:', data);
      
      // Show user-friendly rate limit message
      if (data.type === 'message') {
        alert(`Rate limit exceeded: ${data.reason}. Please wait ${data.retryAfter} seconds before sending another message.`);
      } else if (data.type === 'typing') {
        console.log('Typing rate limited, ignoring typing events for now');
      }
    });

    newSocket.on('abuse-detected', (data: { reason: string }) => {
      console.log('Abuse detected:', data);
      alert(`Message blocked: ${data.reason}. Please follow chat guidelines.`);
    });

    newSocket.on('user-banned', (data: { reason: string }) => {
      console.log('User banned:', data);
      alert(`You have been banned: ${data.reason}`);
      // Optionally redirect to a banned page or disable chat
    });

    // Real-time chat list updates
    newSocket.on('chat-list-update', (chats: ChatInfo[]) => {
      console.log('Chat list updated:', chats);
      setAvailableChats(chats);
    });

    newSocket.on('chat-created', (chat: ChatInfo) => {
      console.log('New chat created:', chat);
      setAvailableChats(prev => {
        const exists = prev.some(c => c.chatId === chat.chatId);
        if (!exists) {
          return [...prev, chat];
        }
        return prev;
      });
    });

    newSocket.on('chat-updated', (chat: ChatInfo) => {
      console.log('Chat updated:', chat);
      setAvailableChats(prev => 
        prev.map(c => c.chatId === chat.chatId ? chat : c)
      );
    });

    newSocket.on('chat-deleted', (chatId: string) => {
      console.log('Chat deleted:', chatId);
      setAvailableChats(prev => prev.filter(c => c.chatId !== chatId));
    });

    newSocket.on('user-identity-changed', (data: {
      oldUserId: string;
      newUserId: string;
      newUserName: string;
    }) => {
      setActiveUsers(prev => prev.map(user => 
        user.userId === data.oldUserId 
          ? { ...user, userId: data.newUserId, userName: data.newUserName }
          : user
      ));
    });

    return () => {
      newSocket.close();
      setSocket(null);
      setIsConnected(false);
      setActiveUsers([]);
      setTypingUsers([]);
    };
  }, [enabled, chatId]);

  const sendMessage = (message: SocketMessage) => {
    if (socket && isConnected) {
      socket.emit('send-message', {
        chatId,
        message
      });
    }
  };

  const startTyping = () => {
    console.log('startTyping called:', { 
      socket: !!socket, 
      isConnected, 
      userId: currentUserIdRef.current, 
      userName: currentUserNameRef.current,
      chatId 
    });
    
    if (socket && isConnected) {
      const userId = currentUserIdRef.current || 'guest';
      const userName = currentUserNameRef.current || 'Guest User';
      const userPhotoURL = currentUserPhotoURLRef.current;
      
      console.log('Emitting typing-start:', {
        chatId,
        userId,
        userName,
        userPhotoURL
      });
      socket.emit('typing-start', {
        chatId,
        userId,
        userName,
        userPhotoURL
      });

      // Auto-stop typing after 3 seconds
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 3000);
    }
  };

  const stopTyping = () => {
    console.log('stopTyping called:', { 
      socket: !!socket, 
      isConnected, 
      userId: currentUserIdRef.current,
      chatId 
    });
    
    if (socket && isConnected) {
      const userId = currentUserIdRef.current || 'guest';
      
      console.log('Emitting typing-stop:', {
        chatId,
        userId
      });
      socket.emit('typing-stop', {
        chatId,
        userId
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  const switchIdentity = (newUserId: string, newUserName: string) => {
    if (socket && isConnected && currentUserIdRef.current) {
      socket.emit('switch-identity', {
        oldUserId: currentUserIdRef.current,
        newUserId,
        newUserName
      });
      
      currentUserIdRef.current = newUserId;
      currentUserNameRef.current = newUserName;
    }
  };

  const joinChat = () => {
    if (socket && isConnected && currentUserIdRef.current && currentUserNameRef.current) {
      socket.emit('join-chat', {
        chatId,
        userId: currentUserIdRef.current,
        userName: currentUserNameRef.current
      });
    }
  };

  const leaveChat = () => {
    if (socket && isConnected) {
      socket.emit('leave-chat', { chatId });
    }
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    socket,
    isConnected,
    activeUsers,
    typingUsers,
    isAiThinking,
    availableChats,
    sendMessage,
    startTyping,
    stopTyping,
    switchIdentity,
    joinChat,
    leaveChat
  };
}

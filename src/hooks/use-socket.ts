import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketUser {
  userId: string;
  username: string;
  avatar?: string;
  joinedAt: number;
}

interface TypingUser {
  userId: string;
  username: string;
  timestamp: number;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  name: string;
  text: string;
  timestamp: number;
  userId?: string;
  avatar?: string;
}

interface UseSocketProps {
  room: string | null;
  userId: string;
  username: string;
  avatar?: string;
  onMessageReceived?: (message: Message) => void;
  onAIResponse?: (message: Message, aiResponse: string) => void;
  onUserJoined?: (user: SocketUser) => void;
  onUserLeft?: (user: { userId: string; username: string; timestamp: number }) => void;
  onOnlineUsers?: (users: SocketUser[]) => void;
  onTypingStart?: (user: TypingUser) => void;
  onTypingStop?: (userId: string) => void;
  onPresenceUpdate?: (userId: string, status: 'online' | 'away' | 'offline') => void;
  onAIThinkingStart?: (user: { userId: string; username: string; timestamp: number }) => void;
  onAIThinkingStop?: () => void;
}

export const useSocket = ({
  room,
  userId,
  username,
  avatar,
  onMessageReceived,
  onAIResponse,
  onUserJoined,
  onUserLeft,
  onOnlineUsers,
  onTypingStart,
  onTypingStop,
  onPresenceUpdate,
  onAIThinkingStart,
  onAIThinkingStop
}: UseSocketProps) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only initialize socket if room is provided (for public/class chats)
    if (!room) {
      return;
    }

    // Initialize socket connection
    const socket = io(process.env.NODE_ENV === 'production' 
      ? 'https://yourdomain.com' 
      : 'http://localhost:9002', {
      path: '/api/socketio',
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      
      // Join the room
      socket.emit('join-room', {
        room,
        userId,
        username,
        avatar
      });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Room events
    socket.on('user-joined', (user: SocketUser) => {
      console.log('User joined:', user);
      onUserJoined?.(user);
    });

    socket.on('user-left', (user: { userId: string; username: string; timestamp: number }) => {
      console.log('User left:', user);
      onUserLeft?.(user);
      setOnlineUsers(prev => prev.filter(u => u.userId !== user.userId));
    });

    socket.on('online-users', (users: SocketUser[]) => {
      console.log('Online users:', users);
      setOnlineUsers(users);
      onOnlineUsers?.(users);
    });

    // Message events
    socket.on('message-received', (message: Message) => {
      console.log('Message received:', message);
      onMessageReceived?.(message);
    });

    socket.on('ai-response', (data: { message: Message; aiResponse: string }) => {
      console.log('AI response:', data);
      onAIResponse?.(data.message, data.aiResponse);
    });

    // Typing events
    socket.on('user-typing', (user: TypingUser) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.userId !== user.userId);
        return [...filtered, user];
      });
      onTypingStart?.(user);
    });

    socket.on('user-stopped-typing', (data: { userId: string }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
      onTypingStop?.(data.userId);
    });

    // Presence events
    socket.on('presence-updated', (data: { userId: string; status: 'online' | 'away' | 'offline'; timestamp: number }) => {
      onPresenceUpdate?.(data.userId, data.status);
    });

    // AI thinking events
    socket.on('ai-thinking-start', (user: { userId: string; username: string; timestamp: number }) => {
      console.log('AI thinking started by:', user);
      onAIThinkingStart?.(user);
    });

    socket.on('ai-thinking-stop', () => {
      console.log('AI thinking stopped');
      onAIThinkingStop?.();
    });

    return () => {
      socket.disconnect();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [room, userId, username, avatar]);

  // Socket methods
  const sendMessage = (message: Message) => {
    if (socketRef.current && isConnected && room) {
      socketRef.current.emit('new-message', {
        room,
        message
      });
    }
  };

  const sendAIResponse = (message: Message, aiResponse: string) => {
    if (socketRef.current && isConnected && room) {
      socketRef.current.emit('ai-mention', {
        room,
        message,
        aiResponse
      });
    }
  };

  const startTyping = () => {
    if (socketRef.current && isConnected && room) {
      socketRef.current.emit('typing-start', {
        room,
        userId,
        username
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
    if (socketRef.current && isConnected && room) {
      socketRef.current.emit('typing-stop', {
        room,
        userId
      });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const updatePresence = (status: 'online' | 'away' | 'offline') => {
    if (socketRef.current && isConnected && room) {
      socketRef.current.emit('update-presence', {
        room,
        userId,
        status
      });
    }
  };

  const startAIThinking = () => {
    if (socketRef.current && isConnected && room) {
      socketRef.current.emit('ai-thinking-start', {
        room,
        userId,
        username,
        timestamp: Date.now()
      });
    }
  };

  const stopAIThinking = () => {
    if (socketRef.current && isConnected && room) {
      socketRef.current.emit('ai-thinking-stop', {
        room
      });
    }
  };

  return {
    isConnected,
    onlineUsers,
    typingUsers,
    sendMessage,
    sendAIResponse,
    startTyping,
    stopTyping,
    updatePresence,
    startAIThinking,
    stopAIThinking
  };
};

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

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
  onUserCountUpdate?: (count: number) => void;
  onTypingStart?: (userId: string) => void;
  onTypingStop?: (userId: string) => void;
  onAIThinkingStart?: () => void;
  onAIThinkingStop?: () => void;
}

export const useSocket = ({
  room,
  userId,
  username,
  avatar,
  onMessageReceived,
  onAIResponse,
  onUserCountUpdate,
  onTypingStart,
  onTypingStop,
  onAIThinkingStart,
  onAIThinkingStop
}: UseSocketProps) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
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

    // User count events
    socket.on('user-count-update', (count: number) => {
      console.log('User count updated:', count);
      setUserCount(count);
      onUserCountUpdate?.(count);
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
    socket.on('user-typing', (data: { userId: string }) => {
      setTypingUsers(prev => {
        if (!prev.includes(data.userId)) {
          return [...prev, data.userId];
        }
        return prev;
      });
      onTypingStart?.(data.userId);
    });

    socket.on('user-stopped-typing', (data: { userId: string }) => {
      setTypingUsers(prev => prev.filter(id => id !== data.userId));
      onTypingStop?.(data.userId);
    });

    // AI thinking events
    socket.on('ai-thinking-start', () => {
      console.log('AI thinking started');
      setIsAIThinking(true);
      onAIThinkingStart?.();
    });

    socket.on('ai-thinking-stop', () => {
      console.log('AI thinking stopped');
      setIsAIThinking(false);
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
    userCount,
    typingUsers,
    isAIThinking,
    sendMessage,
    sendAIResponse,
    startTyping,
    stopTyping,
    startAIThinking,
    stopAIThinking
  };
};
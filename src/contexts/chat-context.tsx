'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatContextType {
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  unreadCount: number;
  markAsRead: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm CourseConnect's AI assistant. I can help you with questions about our platform, features, or anything else. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Load messages from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedMessages = localStorage.getItem('courseconnect-chat-messages');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.error('Failed to load chat messages:', error);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (messages.length > 1) { // Only save if there are messages beyond the initial greeting
      try {
        localStorage.setItem('courseconnect-chat-messages', JSON.stringify(messages));
      } catch (error) {
        console.warn('Error saving chat messages:', error);
      }
    }
  }, [messages]);

  // Mark as read when chat is opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
    
    // Increment unread count if chat is closed and message is from assistant
    if (!isOpen && message.role === 'assistant') {
      setUnreadCount(prev => prev + 1);
    }
  };

  const clearMessages = () => {
    const initialMessage: Message = {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm CourseConnect's AI assistant. I can help you with questions about our platform, features, or anything else. How can I assist you today?",
      timestamp: new Date()
    };
    setMessages([initialMessage]);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('courseconnect-chat-messages');
      }
    } catch (error) {
      console.warn('Error clearing chat messages:', error);
    }
    setUnreadCount(0);
  };

  const markAsRead = () => {
    setUnreadCount(0);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        addMessage,
        clearMessages,
        unreadCount,
        markAsRead,
        isOpen,
        setIsOpen
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

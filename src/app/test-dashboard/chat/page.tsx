"use client";

import { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/hooks/use-chat-store";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { auth } from '@/lib/firebase/client-simple';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Upload, Send, Bot, User } from "lucide-react";
import BotResponse from "@/components/bot-response";
import { ExpandableUserMessage } from "@/components/expandable-user-message";
import { MessageTimestamp } from "@/components/message-timestamp";
import { TypingIndicator } from "@/components/typing-indicator";

// Type assertion for auth
const authInstance = auth as any;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  name: string;
  timestamp: number;
  sources?: any[];
  file?: {
    name: string;
    size: number;
    type: string;
    url: string;
  };
}

export default function TestChatPage() {
  const { chats, addMessage, currentTab } = useChatStore();
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { stats } = useDashboardStats(user);

  const classCount = Object.keys(chats).filter(key => key !== 'general-chat').length;

  // Handle both guest and authenticated users
  useEffect(() => {
    try {
      if (authInstance && typeof authInstance.onAuthStateChanged === 'function') {
        const unsubscribe = authInstance.onAuthStateChanged(
          (user: any) => {
            if (user) {
              localStorage.removeItem('guestUser');
              setUser(user);
            } else {
              const guestUserData = localStorage.getItem('guestUser');
              if (guestUserData) {
                try {
                  const guestUser = JSON.parse(guestUserData);
                  setUser(guestUser);
                } catch (error) {
                  localStorage.removeItem('guestUser');
                  createGuestUser();
                }
              } else {
                createGuestUser();
              }
            }
          }
        );
        return unsubscribe;
      } else {
        const guestUserData = localStorage.getItem('guestUser');
        if (guestUserData) {
          try {
            const guestUser = JSON.parse(guestUserData);
            setUser(guestUser);
          } catch (error) {
            createGuestUser();
          }
        } else {
          createGuestUser();
        }
      }
    } catch (authError) {
      const guestUserData = localStorage.getItem('guestUser');
      if (guestUserData) {
        try {
          const guestUser = JSON.parse(guestUserData);
          setUser(guestUser);
        } catch (error) {
          createGuestUser();
        }
      } else {
        createGuestUser();
      }
    }

    function createGuestUser() {
      const autoGuestUser = {
        uid: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        displayName: "Guest User",
        email: null,
        photoURL: null,
        isAnonymous: true,
        isGuest: true
      };
      
      localStorage.setItem('guestUser', JSON.stringify(autoGuestUser));
      setUser(autoGuestUser);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCopy = async (messageId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const messageText = inputValue.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      name: user?.displayName || 'Guest User',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call the actual AI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: messageText,
          context: 'Test Chat',
          conversationHistory: messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          })),
          shouldCallAI: true,
          isPublicChat: false,
          userId: user?.uid,
          chatId: 'test-chat',
          chatTitle: 'Test Chat'
        }),
      });

      const data = await response.json();
      
      if (data.success && data.answer) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.answer,
          sender: 'bot',
          name: 'CourseConnect AI',
          timestamp: Date.now(),
          sources: data.sources
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Fallback response
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm having trouble connecting to the AI service right now. Please try again in a moment!",
          sender: 'bot',
          name: 'CourseConnect AI',
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, fallbackMessage]);
      }
    } catch (error) {
      console.error('Error calling AI:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again!",
        sender: 'bot',
        name: 'CourseConnect AI',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    
    try {
      // Simulate file processing with actual API call
      const formData = new FormData();
      formData.append('file', file);
      formData.append('prompt', 'Analyze this file and provide insights');
      
      const response = await fetch('/api/ai/analyze-document', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      const fileMessage: Message = {
        id: Date.now().toString(),
        text: data?.analysis || data?.response || `I've analyzed your file: ${file.name}. What would you like to know about it?`,
        sender: 'bot',
        name: 'CourseConnect AI',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, fileMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: `I received your file: ${file.name}. I can help you analyze it! What would you like to know?`,
        sender: 'bot',
        name: 'CourseConnect AI',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">CourseConnect AI</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Test Chat Interface</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{classCount} Courses</Badge>
            <Badge variant="outline">{stats?.studyStreak || 0} Day Streak</Badge>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to CourseConnect AI!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                I'm your intelligent study assistant. Ask me anything about your courses, assignments, or academic topics!
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                <Button variant="outline" onClick={() => setInputValue("Help me with calculus derivatives")}>
                  Math Help
                </Button>
                <Button variant="outline" onClick={() => setInputValue("Explain photosynthesis")}>
                  Science Help
                </Button>
                <Button variant="outline" onClick={() => setInputValue("Study strategies for exams")}>
                  Study Tips
                </Button>
                <Button variant="outline" onClick={() => setInputValue("Write an essay outline")}>
                  Writing Help
                </Button>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={message.sender === 'user' ? user?.photoURL : undefined} />
                  <AvatarFallback className={message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'}>
                    {message.sender === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`rounded-2xl px-4 py-2 ${
                  message.sender === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-md' 
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md shadow-sm'
                }`}>
                  {message.sender === 'user' ? (
                    <ExpandableUserMessage content={message.text} />
                  ) : (
                    <BotResponse content={message.text} />
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <MessageTimestamp timestamp={message.timestamp} />
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                        message.sender === 'user' ? 'text-blue-100 hover:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                      onClick={() => handleCopy(message.id, message.text)}
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gray-500 text-white">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-md shadow-sm px-4 py-2">
                  <TypingIndicator users={[]} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your studies..."
                className="pr-12 rounded-full"
                disabled={isLoading}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleFileUpload(file);
                  };
                  input.click();
                }}
                disabled={isLoading}
              >
                <Upload className="w-4 h-4" />
              </Button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="rounded-full w-10 h-10 p-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

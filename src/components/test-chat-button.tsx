'use client';

import { MessageCircle, X, Bot, User, Send, Trash2, Loader2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Removed renderMessageContent - was causing issues

export function TestChatButton() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm CourseConnect's AI assistant. I can help you with questions about our platform, features, or anything else. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unreadCount = 0;

  const addMessage = (msg: Message) => setMessages(prev => [...prev, msg]);
  const clearMessages = () => setMessages([messages[0]]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    addMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          context: `CourseConnect Support Chat

You are CourseConnect AI's helpful support assistant. Answer questions about the CourseConnect platform.

Key information:
- Website: https://courseconnectai.com
- AI-powered study platform for students
- Features: AI syllabus analysis, homework help, study groups, AI tutoring
- Pricing: Free tier available, Premium plans starting at $9.99/month
- Privacy: FERPA compliant, end-to-end encrypted
- Support: 24/7 AI support available
- Mobile: Fully responsive, works on all devices
- Study Groups: Connect with classmates in your courses
- AI Tutor: Step-by-step explanations for any subject

IMPORTANT: When providing links, always use https://courseconnectai.com as the base domain.
Examples:
- Features: https://courseconnectai.com/features
- About: https://courseconnectai.com/about
- Sign Up: https://courseconnectai.com/dashboard

Be friendly, concise, and helpful. Give short answers (2-3 sentences max). If unsure, suggest contacting courseconnect.noreply@gmail.com.`,
          conversationHistory: messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          shouldCallAI: true,
          isPublicChat: false
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || data.response || data.message || 'I apologize, but I encountered an issue. Please try again or use the contact form below.',
        timestamp: new Date()
      };

      addMessage(aiMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment or use the contact form below for assistance.",
        timestamp: new Date()
      };

      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as React.FormEvent);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 z-40 group relative hover:scale-105 transition-transform"
          size="icon"
        >
          <MessageCircle className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
          
          {/* Online indicator */}
          {unreadCount === 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
          )}
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[480px] h-[600px] shadow-2xl z-50 flex flex-col border-2 border-blue-200 dark:border-blue-800">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10 border-2 border-white">
                    <AvatarFallback className="bg-white text-blue-600">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                </div>
                <div>
                  <CardTitle className="text-white text-lg">AI Support</CardTitle>
                  <p className="text-xs text-blue-100">Online • Instant replies</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearMessages}
                  className="text-white hover:bg-white/20 h-8 w-8"
                  title="Clear chat history"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3 items-start',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-2 shadow-sm',
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-gray-700'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className={cn(
                    "text-xs mt-1",
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  )}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-gray-300 dark:bg-gray-700">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 items-start justify-start">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-[75%] rounded-2xl px-4 py-2 shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Typing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                type="text"
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      )}
    </>
  );
}
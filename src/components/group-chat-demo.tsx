'use client';

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bot, Users, MessageSquare } from 'lucide-react';

interface GroupMessage {
  id: number;
  sender: string;
  senderType: 'student' | 'ai';
  message: string;
  timestamp: string;
  avatar?: string;
}

export function GroupChatDemo() {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const [charIndex, setCharIndex] = useState(0);

  const groupMessages: GroupMessage[] = [
    {
      id: 1,
      sender: 'Alex Chen',
      senderType: 'student',
      message: 'Hey everyone! I\'m struggling with the chain rule in calculus. Can someone help?',
      timestamp: '2:30 PM',
      avatar: 'AC'
    },
    {
      id: 2,
      sender: 'Sarah Johnson',
      senderType: 'student',
      message: 'I can help! The chain rule is f\'(g(x)) × g\'(x). What specific problem are you working on?',
      timestamp: '2:32 PM',
      avatar: 'SJ'
    },
    {
      id: 3,
      sender: 'CourseConnect AI',
      senderType: 'ai',
      message: 'Great question! The chain rule helps you find derivatives of composite functions. Think of it as "derivative of the outside times derivative of the inside." For example, if f(x) = (x² + 1)³, the derivative is 3(x² + 1)² × 2x.',
      timestamp: '2:33 PM'
    },
    {
      id: 4,
      sender: 'Mike Rodriguez',
      senderType: 'student',
      message: 'Thanks AI! That makes sense. So for (2x + 3)⁴, it would be 4(2x + 3)³ × 2?',
      timestamp: '2:35 PM',
      avatar: 'MR'
    },
    {
      id: 5,
      sender: 'CourseConnect AI',
      senderType: 'ai',
      message: 'Exactly right, Mike! You\'ve got it. The derivative is 4(2x + 3)³ × 2 = 8(2x + 3)³. Great work!',
      timestamp: '2:36 PM'
    }
  ];

  useEffect(() => {
    const startDemo = setTimeout(() => {
      setIsTyping(true);
      setTypingMessage(groupMessages[0].message);
      setCharIndex(0);
    }, 1000);

    return () => clearTimeout(startDemo);
  }, []);

  useEffect(() => {
    if (isTyping && charIndex < typingMessage.length) {
      const timer = setTimeout(() => {
        setCharIndex(charIndex + 1);
      }, 50);
      return () => clearTimeout(timer);
    } else if (isTyping && charIndex >= typingMessage.length) {
      // Message complete, add to messages and move to next
      setTimeout(() => {
        setMessages(prev => [...prev, groupMessages[currentMessageIndex]]);
        setCurrentMessageIndex(prev => prev + 1);
        setIsTyping(false);
        setCharIndex(0);
        
        // Start next message if available
        if (currentMessageIndex + 1 < groupMessages.length) {
          setTimeout(() => {
            setIsTyping(true);
            setTypingMessage(groupMessages[currentMessageIndex + 1].message);
          }, 1000);
        }
      }, 500);
    }
  }, [isTyping, charIndex, typingMessage, currentMessageIndex]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span className="font-semibold">Study Group Chat</span>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white">
            <MessageSquare className="h-3 w-3 mr-1" />
            Live Demo
          </Badge>
        </div>
        <p className="text-sm text-blue-100 mt-1">CS-101 Study Squad • 4 members online</p>
      </div>

      {/* Chat Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.senderType === 'ai' ? 'justify-end' : ''}`}>
            {msg.senderType === 'student' && (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                  {msg.avatar}
                </AvatarFallback>
              </Avatar>
            )}
            
            <div className={`max-w-xs ${msg.senderType === 'ai' ? 'order-first' : ''}`}>
              <div className={`rounded-2xl px-4 py-2 ${
                msg.senderType === 'ai' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}>
                <p className="text-sm font-medium mb-1">{msg.sender}</p>
                <p className="text-sm">{msg.message}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-2">{msg.timestamp}</p>
            </div>

            {msg.senderType === 'ai' && (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="max-w-xs">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl px-4 py-2">
                <p className="text-sm font-medium mb-1">CourseConnect AI</p>
                <p className="text-sm">
                  {typingMessage.substring(0, charIndex)}
                  <span className="animate-pulse">|</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex -space-x-2">
            <Avatar className="h-6 w-6 border-2 border-white">
              <AvatarFallback className="text-xs bg-blue-100 text-blue-600">AC</AvatarFallback>
            </Avatar>
            <Avatar className="h-6 w-6 border-2 border-white">
              <AvatarFallback className="text-xs bg-green-100 text-green-600">SJ</AvatarFallback>
            </Avatar>
            <Avatar className="h-6 w-6 border-2 border-white">
              <AvatarFallback className="text-xs bg-purple-100 text-purple-600">MR</AvatarFallback>
            </Avatar>
            <Avatar className="h-6 w-6 border-2 border-white">
              <AvatarFallback className="text-xs bg-orange-100 text-orange-600">+2</AvatarFallback>
            </Avatar>
          </div>
          <span>4 students collaborating with AI</span>
        </div>
      </div>
    </div>
  );
}

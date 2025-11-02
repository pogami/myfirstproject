"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Upload, Bot, User, Clock, CheckCircle, AlertCircle, BookOpen, FileText, Calendar, Target } from "lucide-react";
import { useChatStore } from "@/hooks/use-chat-store";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { auth } from '@/lib/firebase/client-simple';
import { useState as useStateReact, useEffect as useEffectReact } from "react";

// Type assertion for auth
const authInstance = auth as any;

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'assignment' | 'exam' | 'general' | 'study_tip';
  metadata?: {
    course?: string;
    difficulty?: string;
    estimatedTime?: string;
  };
}

export default function TestChatPage() {
  const { chats } = useChatStore();
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: classCount > 0 
          ? `Hi! I'm your AI study assistant. I can help you with assignments, exam prep, study planning, and explaining topics. What would you like to work on today?`
          : `Welcome! I'm here to help you succeed in your studies. Upload your syllabus to get started, or ask me anything about studying!`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'general'
      };
      setMessages([welcomeMessage]);
    }
  }, [classCount]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: 'general'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(inputValue),
        sender: 'ai',
        timestamp: new Date(),
        type: 'general',
        metadata: {
          course: selectedCourse || 'General',
          difficulty: 'Medium',
          estimatedTime: '5-10 minutes'
        }
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('assignment') || input.includes('homework')) {
      return `I can help you with assignments! Based on your courses, I can:\n\n• Break down complex problems into steps\n• Explain concepts you're struggling with\n• Create study schedules for upcoming deadlines\n• Provide practice questions\n\nWhat specific assignment are you working on?`;
    }
    
    if (input.includes('exam') || input.includes('test')) {
      return `Great! Let's prepare for your exam. I can help you:\n\n• Create a study plan based on your syllabus\n• Explain difficult topics in simple terms\n• Generate practice questions\n• Review key concepts\n\nWhich course is the exam for, and when is it scheduled?`;
    }
    
    if (input.includes('study') || input.includes('learn')) {
      return `I'd love to help you study more effectively! Here are some strategies I can assist with:\n\n• Active recall techniques\n• Spaced repetition scheduling\n• Concept mapping\n• Practice problem generation\n\nWhat subject or topic would you like to focus on?`;
    }
    
    if (input.includes('schedule') || input.includes('plan')) {
      return `I can help you create an effective study schedule! Let me know:\n\n• Your available study time\n• Upcoming deadlines\n• Which subjects need the most attention\n• Your preferred study methods\n\nI'll create a personalized plan that works for you!`;
    }
    
    return `That's a great question! I'm here to help you succeed in your studies. I can assist with:\n\n• Assignment help and problem-solving\n• Exam preparation and study planning\n• Concept explanations and tutoring\n• Study schedule creation\n• Academic writing and research\n\nWhat specific area would you like to focus on today?`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { text: "What assignments are due this week?", icon: Calendar },
    { text: "Help me study for my upcoming exam", icon: BookOpen },
    { text: "Create a study schedule for me", icon: Clock },
    { text: "Explain this topic to me", icon: FileText }
  ];

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">AI Study Assistant</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {classCount > 0 ? `${classCount} course${classCount !== 1 ? 's' : ''} loaded` : 'Ready to help'}
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">{stats?.studyStreak || 0}</div>
              <div className="text-xs text-gray-500">Streak</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-green-600 dark:text-green-400">{stats?.assignmentsCompleted || 0}</div>
              <div className="text-xs text-gray-500">Done</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.sender === 'ai' && (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-first' : ''}`}>
                  <Card className={`${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800'}`}>
                    <CardContent className="p-4">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      
                      {message.metadata && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs">
                              {message.metadata.course}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {message.metadata.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {message.metadata.estimatedTime}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <div className={`text-xs text-gray-500 mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                
                {message.sender === 'user' && (
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <Card className="bg-white dark:bg-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
                      <span className="text-sm text-gray-500 ml-2">AI is thinking...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputValue(action.text)}
                    className="h-10 justify-start text-left"
                  >
                    <action.icon className="w-4 h-4 mr-2" />
                    {action.text}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your studies..."
                  className="pr-12 h-12"
                  disabled={isLoading}
                />
                <Button
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  disabled={isLoading}
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="h-12 px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

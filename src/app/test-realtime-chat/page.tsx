'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { TypingIndicator } from '@/components/typing-indicator';
import { OnlineUsersIndicator } from '@/components/online-users-indicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Users, Brain, BookOpen, Send, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  name: string;
  text: string;
  timestamp: number;
  userId?: string;
}

interface TestUser {
  id: string;
  name: string;
  avatar?: string;
}

export default function TestRealtimeChatPage() {
  const [currentRoom, setCurrentRoom] = useState('public-general-chat');
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    'public-general-chat': [],
    'private-general-chat': [],
    'class-math-101': [],
    'class-physics-201': []
  });
  const [inputValue, setInputValue] = useState('');
  const [currentUser, setCurrentUser] = useState<TestUser>({
    id: `user-${Date.now()}`,
    name: 'Test User'
  });
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Socket.IO connection for real-time features
  const socket = useSocket({
    room: currentRoom,
    userId: currentUser.id,
    username: currentUser.name,
    avatar: currentUser.avatar,
    onMessageReceived: (message) => {
      setMessages(prev => ({
        ...prev,
        [currentRoom]: [...(prev[currentRoom] || []), message]
      }));
    },
    onAIResponse: (message, aiResponse) => {
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'bot',
        name: 'CourseConnect AI',
        text: aiResponse,
        timestamp: Date.now()
      };
      setMessages(prev => ({
        ...prev,
        [currentRoom]: [...(prev[currentRoom] || []), aiMessage]
      }));
    },
    onUserJoined: (user) => {
      toast({
        title: "User Joined",
        description: `${user.username} joined the chat`,
      });
    },
    onUserLeft: (user) => {
      toast({
        title: "User Left",
        description: `${user.username} left the chat`,
      });
    },
    onOnlineUsers: (users) => {
      console.log('Online users updated:', users);
    },
    onTypingStart: (user) => {
      console.log('User typing:', user);
    },
    onTypingStop: (userId) => {
      console.log('User stopped typing:', userId);
    },
    onPresenceUpdate: (userId, status) => {
      console.log('Presence updated:', userId, status);
    }
  });

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages[currentRoom]]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      name: currentUser.name,
      text: inputValue.trim(),
      timestamp: Date.now(),
      userId: currentUser.id
    };

    // Add to local state
    setMessages(prev => ({
      ...prev,
      [currentRoom]: [...(prev[currentRoom] || []), message]
    }));

    // Send via Socket.IO
    socket.sendMessage(message);

    // Stop typing indicator
    socket.stopTyping();

    // Clear input
    setInputValue('');

    // Handle @ai mentions
    if (inputValue.includes('@ai')) {
      setTimeout(() => {
        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          sender: 'bot',
          name: 'CourseConnect AI',
          text: `Hello! I'm CourseConnect AI. You mentioned me in your message: "${inputValue}". How can I help you today?`,
          timestamp: Date.now()
        };
        setMessages(prev => ({
          ...prev,
          [currentRoom]: [...(prev[currentRoom] || []), aiResponse]
        }));
        socket.sendAIResponse(message, aiResponse.text);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    // Handle typing indicators
    if (e.target.value.length > 0) {
      socket.startTyping();
    } else {
      socket.stopTyping();
    }
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const simulateMultiUser = () => {
    const users = ['Alice', 'Bob', 'Charlie', 'Diana'];
    const messages = [
      'Hey everyone! 👋',
      'How is everyone doing?',
      'Working on the math homework',
      'Anyone want to study together?',
      'I can help with physics!',
      'Thanks for the help!',
      'No problem! 😊'
    ];

    users.forEach((user, userIndex) => {
      setTimeout(() => {
        const message: Message = {
          id: `sim-${Date.now()}-${userIndex}`,
          sender: 'user',
          name: user,
          text: messages[userIndex % messages.length],
          timestamp: Date.now(),
          userId: `user-${user.toLowerCase()}`
        };

        setMessages(prev => ({
          ...prev,
          [currentRoom]: [...(prev[currentRoom] || []), message]
        }));

        socket.sendMessage(message);
      }, userIndex * 2000);
    });
  };

  const getRoomInfo = (roomId: string) => {
    const roomInfo = {
      'public-general-chat': { title: 'Public General Chat', icon: Users, description: 'Global chat for all users' },
      'private-general-chat': { title: 'Private AI Chat', icon: Brain, description: 'Personal AI assistant' },
      'class-math-101': { title: 'Math 101', icon: BookOpen, description: 'Math class discussion' },
      'class-physics-201': { title: 'Physics 201', icon: BookOpen, description: 'Physics class discussion' }
    };
    return roomInfo[roomId as keyof typeof roomInfo] || { title: roomId, icon: MessageSquare, description: 'Custom chat' };
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Real-Time Chat Demo</h1>
          <p className="text-muted-foreground">
            Test the hybrid real-time chat system with Socket.IO + Firestore
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* User Controls */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Test Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Your Name</label>
                <Input
                  value={currentUser.name}
                  onChange={(e) => setCurrentUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Connection Status</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${socket.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm">
                    {socket.isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              <Button onClick={simulateMultiUser} className="w-full" variant="outline">
                Simulate Multi-User Chat
              </Button>

              <div className="text-xs text-muted-foreground">
                <p>• Open multiple tabs to test real-time sync</p>
                <p>• Type @ai to test AI mentions</p>
                <p>• Watch typing indicators</p>
                <p>• See online users</p>
              </div>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Tabs value={currentRoom} onValueChange={setCurrentRoom}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="public-general-chat" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Public</span>
                </TabsTrigger>
                <TabsTrigger value="private-general-chat" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline">Private</span>
                </TabsTrigger>
                <TabsTrigger value="class-math-101" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Math</span>
                </TabsTrigger>
                <TabsTrigger value="class-physics-201" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Physics</span>
                </TabsTrigger>
              </TabsList>

              {Object.keys(messages).map((roomId) => {
                const roomInfo = getRoomInfo(roomId);
                const Icon = roomInfo.icon;
                
                return (
                  <TabsContent key={roomId} value={roomId} className="mt-0">
                    <Card className="h-[600px] flex flex-col">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          {roomInfo.title}
                          <Badge variant="secondary" className="ml-auto">
                            {messages[roomId]?.length || 0} messages
                          </Badge>
                          <OnlineUsersIndicator 
                            onlineUsers={socket.onlineUsers}
                            currentUserId={currentUser.id}
                            showCount={true}
                            maxVisible={3}
                          />
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{roomInfo.description}</p>
                      </CardHeader>
                      
                      <CardContent className="flex-1 flex flex-col p-0">
                        <ScrollArea className="flex-1 px-4">
                          <div className="space-y-4 pb-4">
                            {messages[roomId]?.map((message) => (
                              <div
                                key={message.id}
                                className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                {message.sender === 'bot' && (
                                  <Avatar className="w-8 h-8 flex-shrink-0">
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                      <Brain className="h-4 w-4" />
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                
                                <div className={`max-w-[70%] ${message.sender === 'user' ? 'order-first' : ''}`}>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium">{message.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(message.timestamp).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  
                                  <div className="group relative">
                                    <div className={`rounded-lg px-3 py-2 ${
                                      message.sender === 'user' 
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-muted'
                                    }`}>
                                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                    </div>
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                      onClick={() => copyToClipboard(message.text, message.id)}
                                    >
                                      {copiedMessageId === message.id ? (
                                        <Check className="h-3 w-3" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                                
                                {message.sender === 'user' && (
                                  <Avatar className="w-8 h-8 flex-shrink-0">
                                    <AvatarFallback className="bg-secondary">
                                      {message.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                            ))}
                            
                            {/* Typing Indicator */}
                            <TypingIndicator 
                              typingUsers={socket.typingUsers}
                              currentUserId={currentUser.id}
                            />
                            
                            <div ref={messagesEndRef} />
                          </div>
                        </ScrollArea>
                        
                        {/* Input Area */}
                        <div className="p-4 border-t">
                          <div className="flex gap-2">
                            <Input
                              value={inputValue}
                              onChange={handleInputChange}
                              onKeyPress={handleKeyPress}
                              placeholder={`Message ${roomInfo.title}...`}
                              className="flex-1"
                            />
                            <Button 
                              onClick={handleSendMessage}
                              disabled={!inputValue.trim()}
                              size="sm"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

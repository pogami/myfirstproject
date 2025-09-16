"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, User, MessageSquare, Users, BookOpen } from "lucide-react";
import { useChatStore } from "@/hooks/use-chat-store";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInDepthAnalysis } from "@/ai/services/dual-ai-service";

export default function ChatPage() {
    const { chats, addMessage, setCurrentTab, currentTab, addChat } = useChatStore();
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [user] = useAuthState(auth);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Get current chat
    const currentChat = currentTab ? chats[currentTab] : null;

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [currentChat?.messages]);

    // Initialize general chat if it doesn't exist
    useEffect(() => {
        if (!chats['general-chat'] && !isLoading) {
            addChat(
                'General Chat',
                { 
                    sender: 'bot', 
                    name: 'CourseConnect AI', 
                    text: 'Welcome to the General Chat! This is where you can ask questions about any subject or get help with general academic topics. Feel free to ask about math, science, English, history, computer science, or any other subject!', 
                    timestamp: Date.now() 
                }
            );
        }
    }, [chats, addChat, isLoading]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !currentTab) return;

        const userMessage = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            name: user?.displayName || 'Anonymous',
            timestamp: Date.now()
        };

        // Add user message
        await addMessage(currentTab, userMessage);
        setInputValue("");
        setIsLoading(true);

        try {
            // Get AI response
            const aiResponse = await getInDepthAnalysis(inputValue, 'General');
            
            const aiMessage = {
                id: (Date.now() + 1).toString(),
                text: aiResponse,
                sender: 'bot',
                name: 'CourseConnect AI',
                timestamp: Date.now()
            };

            // Add AI response
            await addMessage(currentTab, aiMessage);
        } catch (error) {
            console.error('AI Error:', error);
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                text: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
                sender: 'bot',
                name: 'CourseConnect AI',
                timestamp: Date.now()
            };
            await addMessage(currentTab, errorMessage);
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

    // Get class chats (non-general chats)
    const classChats = Object.entries(chats).filter(([id, chat]) => id !== 'general-chat');
    const generalChat = chats['general-chat'];

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto p-4 max-w-6xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Class Chat</h1>
                    <p className="text-muted-foreground">
                        Join class discussions, ask questions, and collaborate with classmates
                    </p>
                </div>

                <Tabs value={currentTab || 'general-chat'} onValueChange={setCurrentTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 mb-6">
                        {generalChat && (
                            <TabsTrigger value="general-chat" className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                <span className="hidden sm:inline">General Chat</span>
                            </TabsTrigger>
                        )}
                        {classChats.map(([id, chat]) => (
                            <TabsTrigger key={id} value={id} className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                <span className="hidden sm:inline truncate">{chat.title}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {generalChat && (
                        <TabsContent value="general-chat" className="mt-0">
                            <Card className="h-[600px] flex flex-col">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5" />
                                        General Chat
                                        <Badge variant="secondary" className="ml-auto">
                                            <Users className="h-3 w-3 mr-1" />
                                            All Users
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col p-0">
                                    <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
                                        <div className="space-y-4 pb-4">
                                            {generalChat.messages.map((message, index) => (
                                                <div key={message.id || index} className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`flex gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarImage src={message.sender === 'user' ? user?.photoURL || '' : ''} />
                                                            <AvatarFallback className="text-xs">
                                                                {message.sender === 'user' ? (user?.displayName?.[0] || 'U') : 'AI'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className={`rounded-lg p-3 ${
                                                            message.sender === 'user' 
                                                                ? 'bg-primary text-primary-foreground' 
                                                                : 'bg-muted'
                                                        }`}>
                                                            <div className="text-xs opacity-70 mb-1">
                                                                {message.name}
                                                            </div>
                                                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {isLoading && (
                                                <div className="flex gap-3">
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarFallback className="text-xs">AI</AvatarFallback>
                                                    </Avatar>
                                                    <div className="bg-muted rounded-lg p-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-muted-foreground border-t-transparent"></div>
                                                            <span className="text-sm text-muted-foreground">AI is thinking...</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    </ScrollArea>
                                    <div className="p-6 border-t">
                                        <div className="flex gap-2">
                                            <Input
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                placeholder="Ask a question or start a discussion..."
                                                onKeyPress={handleKeyPress}
                                                disabled={isLoading}
                                                className="flex-1"
                                            />
                                            <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    {classChats.map(([id, chat]) => (
                        <TabsContent key={id} value={id} className="mt-0">
                            <Card className="h-[600px] flex flex-col">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5" />
                                        {chat.title}
                                        <Badge variant="outline" className="ml-auto">
                                            <Users className="h-3 w-3 mr-1" />
                                            Class Chat
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col p-0">
                                    <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
                                        <div className="space-y-4 pb-4">
                                            {chat.messages.map((message, index) => (
                                                <div key={message.id || index} className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`flex gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarImage src={message.sender === 'user' ? user?.photoURL || '' : ''} />
                                                            <AvatarFallback className="text-xs">
                                                                {message.sender === 'user' ? (user?.displayName?.[0] || 'U') : 'AI'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className={`rounded-lg p-3 ${
                                                            message.sender === 'user' 
                                                                ? 'bg-primary text-primary-foreground' 
                                                                : 'bg-muted'
                                                        }`}>
                                                            <div className="text-xs opacity-70 mb-1">
                                                                {message.name}
                                                            </div>
                                                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {isLoading && (
                                                <div className="flex gap-3">
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarFallback className="text-xs">AI</AvatarFallback>
                                                    </Avatar>
                                                    <div className="bg-muted rounded-lg p-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-muted-foreground border-t-transparent"></div>
                                                            <span className="text-sm text-muted-foreground">AI is thinking...</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    </ScrollArea>
                                    <div className="p-6 border-t">
                                        <div className="flex gap-2">
                                            <Input
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                placeholder={`Ask about ${chat.title}...`}
                                                onKeyPress={handleKeyPress}
                                                disabled={isLoading}
                                                className="flex-1"
                                            />
                                            <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>

                {Object.keys(chats).length === 0 && (
                    <Card className="h-[400px] flex items-center justify-center">
                        <div className="text-center">
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No Chats Available</h3>
                            <p className="text-muted-foreground mb-4">
                                Upload a syllabus to create a class chat or start with the general chat.
                            </p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
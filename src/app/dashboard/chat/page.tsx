"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, User, MessageSquare, Users, BookOpen, Upload, MoreVertical, Download, RotateCcw, Trash2 } from "lucide-react";
import { useChatStore } from "@/hooks/use-chat-store";
import { auth } from "@/lib/firebase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MobileNavigation } from "@/components/mobile-navigation";
import { MobileButton } from "@/components/ui/mobile-button";
import { MobileInput } from "@/components/ui/mobile-input";

export default function ChatPage() {
    const { chats, addMessage, setCurrentTab, currentTab, addChat, isStoreLoading, initializeAuthListener, exportChat, resetChat, deleteChat } = useChatStore();
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [forceLoad, setForceLoad] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const { toast } = useToast();

    // Ensure auth listener is initialized with offline handling
    useEffect(() => {
        try {
            // Check if we're online before initializing auth listener
            if (navigator.onLine) {
                initializeAuthListener();
            } else {
                console.log('Offline mode - skipping auth listener initialization');
            }
        } catch (error) {
            console.warn('Failed to initialize auth listener:', error);
        }
    }, [initializeAuthListener]);

    // Handle online/offline state changes
    useEffect(() => {
        const handleOnline = () => {
            console.log('Back online - reinitializing auth listener');
            try {
                initializeAuthListener();
            } catch (error) {
                console.warn('Failed to reinitialize auth listener:', error);
            }
        };

        const handleOffline = () => {
            console.log('Gone offline - continuing in offline mode');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [initializeAuthListener]);

    // Safely handle auth state
    useEffect(() => {
        try {
            if (auth && typeof auth.onAuthStateChanged === 'function') {
                const unsubscribe = auth.onAuthStateChanged(
                    (user) => setUser(user),
                    (error) => {
                        console.warn("Auth state error in chat page:", error);
                        setUser(null);
                    }
                );
                return unsubscribe;
            } else {
                setUser(null);
            }
        } catch (authError) {
            console.warn("Auth initialization error in chat page:", authError);
            setUser(null);
        }
    }, []);

    // Get current chat
    const currentChat = currentTab ? chats[currentTab] : null;

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        const scrollToBottom = () => {
            if (scrollAreaRef.current) {
                const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
                if (viewport) {
                    // Use requestAnimationFrame to ensure DOM is updated
                    requestAnimationFrame(() => {
                        viewport.scrollTo({ 
                            top: viewport.scrollHeight, 
                            behavior: 'smooth' 
                        });
                    });
                }
            }
        };
        
        // Small delay to ensure message is rendered
        const timeoutId = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timeoutId);
    }, [currentChat?.messages, isLoading]);

    // Initialize general chat if it doesn't exist and set current tab
    useEffect(() => {
        if (!chats['general-chat']) {
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
        
        // Set current tab to general-chat if no tab is selected
        if (!currentTab && chats['general-chat']) {
            setCurrentTab('general-chat');
        }
    }, [chats, addChat, currentTab, setCurrentTab]);

    // Force load after 5 seconds to prevent infinite loading
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isStoreLoading) {
                console.log('ChatPage - Force loading after timeout');
                setForceLoad(true);
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, [isStoreLoading]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !currentTab) return;

        const messageText = inputValue.trim();
        const userMessage = {
            id: Date.now().toString(),
            text: messageText,
            sender: 'user',
            name: user?.displayName || 'Anonymous',
            timestamp: Date.now()
        };

        // Clear input immediately to prevent spam
        setInputValue("");
        setIsLoading(true);

        // Add user message
        await addMessage(currentTab, userMessage);

        try {
            // Get AI response with error handling and timeout
            let aiResponse;
            try {
                const { getInDepthAnalysis } = await import("@/ai/services/simple-ai-service");
                
                // Add timeout to prevent long waits
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('AI response timeout')), 10000)
                );
                
                const aiPromise = getInDepthAnalysis({
                    question: messageText,
                    context: 'General'
                });
                
                aiResponse = await Promise.race([aiPromise, timeoutPromise]);
            } catch (importError) {
                console.warn("AI service import failed, using fallback:", importError);
                aiResponse = {
                    response: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
                    sources: [],
                    confidence: 0.5
                };
            }
            
            // Debug logging to see what aiResponse contains
            console.log('ChatPage - aiResponse:', aiResponse, 'type:', typeof aiResponse, 'answer type:', typeof aiResponse.answer);

            // Ensure we always have a string for the message text
            let messageText = 'I apologize, but I couldn\'t generate a response.';
            
            if (aiResponse && typeof aiResponse === 'object') {
                if (aiResponse.response && typeof aiResponse.response === 'string') {
                    messageText = aiResponse.response;
                } else if (aiResponse.answer && typeof aiResponse.answer === 'string') {
                    messageText = aiResponse.answer;
                } else if (aiResponse.answer && typeof aiResponse.answer === 'object') {
                    // If answer is an object, try to extract text from it
                    if (aiResponse.answer.text) {
                        messageText = aiResponse.answer.text;
                    } else if (aiResponse.answer.content) {
                        messageText = aiResponse.answer.content;
                    } else {
                        messageText = 'I apologize, but I couldn\'t generate a proper response.';
                    }
                } else {
                    messageText = 'I apologize, but I couldn\'t generate a proper response.';
                }
            } else if (typeof aiResponse === 'string') {
                messageText = aiResponse;
            }

            const aiMessage = {
                id: (Date.now() + 1).toString(),
                text: messageText || 'I apologize, but I couldn\'t generate a response.',
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

    // Handler functions for menu actions
    const handleExportChat = () => {
        if (!currentTab) return;
        try {
            exportChat(currentTab);
            toast({
                title: "Chat Exported",
                description: "Chat has been exported and downloaded.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Export Failed",
                description: "Could not export the chat. Please try again.",
            });
        }
    };

    const handleResetChat = async () => {
        if (!currentTab) return;
        try {
            await resetChat(currentTab);
            toast({
                title: "Chat Reset",
                description: "Chat has been reset to its initial state.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Reset Failed",
                description: "Could not reset the chat. Please try again.",
            });
        } finally {
            setShowResetDialog(false);
        }
    };

    const handleDeleteChat = async () => {
        if (!currentTab) return;
        try {
            await deleteChat(currentTab);
            toast({
                title: "Chat Deleted",
                description: "Chat has been permanently deleted.",
            });
            // Redirect to dashboard after deletion
            window.location.href = '/dashboard';
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Delete Failed",
                description: "Could not delete the chat. Please try again.",
            });
        } finally {
            setShowDeleteDialog(false);
        }
    };

    // Get class chats (non-general chats)
    const classChats = Object.entries(chats).filter(([id, chat]) => id !== 'general-chat');
    const generalChat = chats['general-chat'];

    // Debug logging
    console.log('ChatPage - isStoreLoading:', isStoreLoading, 'forceLoad:', forceLoad, 'chats:', Object.keys(chats), 'currentTab:', currentTab);

    // Show loading state while chat store is initializing (but not if force loaded)
    if (isStoreLoading && !forceLoad) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <LoadingSpinner size="xl" text="Loading Chat..." />
            </div>
        );
    }

    return (
        <>
        <div className="min-h-screen bg-transparent">
            {/* Mobile Header */}
            <div className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/20">
                <div className="flex items-center justify-between px-4 py-3">
                    <h1 className="text-lg font-bold text-primary">Class Chat</h1>
                    <MobileNavigation user={user} />
                </div>
            </div>

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
                                <span className="truncate max-w-[120px] sm:max-w-[200px]">{chat.title}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {generalChat && (
                        <TabsContent value="general-chat" className="mt-0">
                            <Card className="h-[600px] flex flex-col overflow-hidden relative">
                                <CardHeader className="pb-3 flex-shrink-0">
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5" />
                                        General Chat
                                        <Badge variant="secondary" className="ml-auto">
                                            <Users className="h-3 w-3 mr-1" />
                                            All Users
                                        </Badge>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" className="h-8 w-8 p-0 ml-2">
                                                    <MoreVertical className="h-4 w-4" />
                                                    <span className="sr-only">Chat options</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={handleExportChat}>
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Export Chat
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setShowResetDialog(true)}>
                                                    <RotateCcw className="h-4 w-4 mr-2" />
                                                    Reset Chat
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
                                    <ScrollArea className="flex-1 px-6 pb-20" ref={scrollAreaRef}>
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
                                                            <p className="text-sm whitespace-pre-wrap">
                                                                {typeof message.text === 'string' ? message.text : JSON.stringify(message.text)}
                                                            </p>
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
                                        </div>
                                    </ScrollArea>
                                    <div className="p-4 sm:p-6 border-t flex-shrink-0 bg-background absolute bottom-0 left-0 right-0 z-10">
                                        <div className="flex gap-2">
                                            <MobileInput
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                placeholder="Ask a question or start a discussion..."
                                                onKeyPress={handleKeyPress}
                                                disabled={isLoading}
                                                className="flex-1"
                                                mobileSize="md"
                                                fullWidthOnMobile={false}
                                            />
                                            <MobileButton 
                                                onClick={handleSendMessage} 
                                                disabled={isLoading || !inputValue.trim()}
                                                mobileSize="md"
                                                className="px-3"
                                            >
                                                <Send className="h-4 w-4" />
                                            </MobileButton>
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
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" className="h-8 w-8 p-0 ml-2">
                                                    <MoreVertical className="h-4 w-4" />
                                                    <span className="sr-only">Chat options</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={handleExportChat}>
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Export Chat
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setShowResetDialog(true)}>
                                                    <RotateCcw className="h-4 w-4 mr-2" />
                                                    Reset Chat
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    onClick={() => setShowDeleteDialog(true)}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete Chat
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col p-0">
                                    <ScrollArea className="flex-1 px-6 pb-20" ref={scrollAreaRef}>
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
                                                            <p className="text-sm whitespace-pre-wrap">
                                                                {typeof message.text === 'string' ? message.text : JSON.stringify(message.text)}
                                                            </p>
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
                                        </div>
                                    </ScrollArea>
                                    <div className="p-6 border-t flex-shrink-0">
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
                            <Button asChild>
                                <Link href="/dashboard/upload">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Syllabus
                                </Link>
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
        </div>

        {/* Reset Chat Confirmation Dialog */}
        <Dialog open={showResetDialog} onOpenChange={(open) => {
            if (!open) {
                setShowResetDialog(false);
            }
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <RotateCcw className="h-5 w-5 text-orange-500" />
                        Reset Chat
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to reset this chat? This will clear all messages except the welcome message and guidelines. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => setShowResetDialog(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleResetChat}
                    >
                        Reset Chat
                    </Button>
                </div>
            </DialogContent>
        </Dialog>

        {/* Delete Chat Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={(open) => {
            if (!open) {
                setShowDeleteDialog(false);
            }
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-destructive" />
                        Delete Chat
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to permanently delete this chat? This will remove all messages and cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => setShowDeleteDialog(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDeleteChat}
                    >
                        Delete Chat
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
        </>
    );
}
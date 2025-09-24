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
import { FuturisticChatInput } from "@/components/futuristic-chat-input";
import BotResponse from "@/components/bot-response";
import { CourseConnectLogo } from "@/components/icons/courseconnect-logo";
import { RippleText } from "@/components/ripple-text";

export default function ChatPage() {
    const { chats, addMessage, setCurrentTab, currentTab, addChat, isStoreLoading, initializeAuthListener, exportChat, resetChat, deleteChat, initializeGeneralChat } = useChatStore();
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [forceLoad, setForceLoad] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const { toast } = useToast();

    // Auto-scroll to bottom function
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Auto-scroll when page loads or messages change (but not when switching tabs)
    useEffect(() => {
        // Only auto-scroll when chats change, not when currentTab changes
        const timer = setTimeout(() => {
            scrollToBottom();
        }, 100);
        return () => clearTimeout(timer);
    }, [chats]);

    // Auto-scroll when new messages are added
    useEffect(() => {
        if (currentTab && chats[currentTab]) {
            scrollToBottom();
        }
    }, [chats]);

    // Auto-scroll when switching to a different tab
    useEffect(() => {
        if (currentTab && chats[currentTab]) {
            // Small delay to ensure the new tab content is rendered
            const timer = setTimeout(() => {
                scrollToBottom();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [currentTab]);

    // Initialize general chat when component mounts
    useEffect(() => {
        initializeGeneralChat();
    }, [initializeGeneralChat]);

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
                    (user: any) => setUser(user),
                    (error: any) => {
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
                    name: 'AI', 
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

    // Force load after 3 seconds to prevent infinite loading
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isStoreLoading) {
                console.log('ChatPage - Force loading after timeout');
                setForceLoad(true);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [isStoreLoading]);

    // Generate unique message ID
    const generateMessageId = () => {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !currentTab) return;

        const messageText = inputValue.trim();
        const userMessage = {
            id: generateMessageId(),
            text: messageText,
            sender: 'user' as const,
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
                const { provideStudyAssistanceWithFallback } = await import("@/ai/services/dual-ai-service");
                
                // Add timeout to prevent long waits
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('AI response timeout')), 15000)
                );
                
                const aiPromise = provideStudyAssistanceWithFallback({
                    question: messageText,
                    context: chats[currentTab!]?.title || 'General Chat',
                    conversationHistory: chats[currentTab!]?.messages?.slice(-10).map(msg => ({
                        role: msg.sender === 'user' ? 'user' : 'assistant',
                        content: typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)
                    })) || []
                });
                
                aiResponse = await Promise.race([aiPromise, timeoutPromise]);
            } catch (importError) {
                console.warn("AI service import failed, using fallback:", importError);
                aiResponse = {
                    answer: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
                    provider: 'fallback'
                };
            }
            
            // Debug logging to see what aiResponse contains
            console.log('ChatPage - aiResponse:', aiResponse, 'type:', typeof aiResponse, 'answer type:', typeof (aiResponse as any)?.answer);

            // Ensure we always have a string for the message text
            let responseText = 'I apologize, but I couldn\'t generate a response.';
            
            if (aiResponse && typeof aiResponse === 'object') {
                const responseObj = aiResponse as any;
                if (responseObj.answer && typeof responseObj.answer === 'string') {
                    responseText = responseObj.answer;
                } else if (responseObj.response && typeof responseObj.response === 'string') {
                    responseText = responseObj.response;
                } else {
                    responseText = 'I apologize, but I couldn\'t generate a proper response.';
                }
            } else if (typeof aiResponse === 'string') {
                responseText = aiResponse;
            }

            const aiMessage = {
                id: generateMessageId(),
                text: responseText || 'I apologize, but I couldn\'t generate a response.',
                sender: 'bot' as const,
                name: 'CourseConnect AI',
                timestamp: Date.now()
            };

            // Add AI response
            await addMessage(currentTab, aiMessage);
        } catch (error) {
            console.error('AI Error:', error);
            const errorMessage = {
                id: generateMessageId(),
                text: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
                sender: 'bot' as const,
                name: 'CourseConnect AI',
                timestamp: Date.now()
            };
            await addMessage(currentTab, errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        if (!currentTab) return;

        // Show loading state
        setIsLoading(true);

        try {
            // Create a message indicating file upload
            const uploadMessage = {
                id: generateMessageId(),
                text: `📎 Uploaded file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
                sender: 'user' as const,
                name: user?.displayName || 'Anonymous',
                timestamp: Date.now(),
                file: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    url: URL.createObjectURL(file)
                }
            };

            // Add upload message
            await addMessage(currentTab, uploadMessage);

            // Simulate AI processing of the file
            const aiResponse = {
                id: generateMessageId(),
                text: `I've received your file "${file.name}". I can help you analyze documents, images, or other content. What would you like to know about this file?`,
                sender: 'bot' as const,
                name: 'CourseConnect AI',
                timestamp: Date.now()
            };

            await addMessage(currentTab, aiResponse);

            toast({
                title: "File uploaded successfully",
                description: `${file.name} has been uploaded and is ready for analysis.`,
            });

        } catch (error) {
            console.error('File upload error:', error);
            toast({
                title: "Upload failed",
                description: "There was an error uploading your file. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
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
        
        // Close dialog immediately
        setShowResetDialog(false);
        
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
        }
    };

    const handleDeleteChat = async () => {
        if (!currentTab) return;
        
        // Close dialog immediately
        setShowDeleteDialog(false);
        
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
        }
    };

    // Get class chats (non-general chats)
    const classChats = Object.entries(chats).filter(([id, chat]) => id !== 'general-chat');
    const generalChat = chats['general-chat'];

    // Debug logging
    console.log('ChatPage - isStoreLoading:', isStoreLoading, 'forceLoad:', forceLoad, 'chats:', Object.keys(chats), 'currentTab:', currentTab);
    console.log('ChatPage - classChats:', classChats);
    console.log('ChatPage - generalChat:', generalChat);

    // Show loading state while chat store is initializing (but not if force loaded)
    if (isStoreLoading && !forceLoad) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted border-t-primary mx-auto mb-4"></div>
                    <h2 className="text-lg font-semibold mb-2">Loading Chat</h2>
                    <p className="text-sm text-muted-foreground mb-4">Please wait while we prepare your chat</p>
                    <div className="text-xs text-muted-foreground">
                        Taking too long? <button 
                            className="text-primary hover:underline" 
                            onClick={() => setForceLoad(true)}
                        >
                            Click here to continue
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="min-h-screen bg-transparent flex flex-col">
            {/* Mobile Header */}
            <div className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/20">
                <div className="flex items-center justify-between px-4 py-3">
                    <h1 className="text-lg font-bold text-primary">Class Chat</h1>
                    <MobileNavigation user={user} />
                </div>
            </div>

            <div className="container mx-auto p-6 max-w-7xl flex-1 flex flex-col">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Class Chat</h1>
                    <p className="text-muted-foreground">
                        Join class discussions, ask questions, and collaborate with classmates
                    </p>
                </div>

                <Tabs value={currentTab || 'general-chat'} onValueChange={setCurrentTab} className="w-full flex-1 flex flex-col">
                    <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 mb-6">
                        <TabsTrigger value="general-chat" className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            <span className="hidden sm:inline">General Chat</span>
                        </TabsTrigger>
                        {classChats.map(([id, chat]) => (
                            <TabsTrigger key={id} value={id} className="flex items-center gap-2">
                                <span className="truncate max-w-[120px] sm:max-w-[200px]">{chat.title}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <TabsContent value="general-chat" className="mt-0 flex-1 flex flex-col">
                        <Card className="flex-1 flex flex-col overflow-hidden relative">
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
                                <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden chat-container">
                                    <ScrollArea className="h-[calc(100vh-300px)] px-4" ref={scrollAreaRef}>
                                        <div className="space-y-6 pb-4 max-w-full overflow-hidden chat-message">
                                            {generalChat?.messages?.map((message, index) => (
                                                <div key={`${message.id || 'msg'}-${index}-${message.timestamp}`} className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'} max-w-full`}>
                                                    <div className={`flex gap-3 max-w-[85%] min-w-0 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                        <Avatar className="w-8 h-8 flex-shrink-0">
                                                            <AvatarImage src={message.sender === 'user' ? user?.photoURL || '' : ''} />
                                                            <AvatarFallback className="text-xs">
                                                                {message.sender === 'user' ? (user?.displayName?.[0] || 'U') : (
                                                                    <CourseConnectLogo className="w-4 h-4" />
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        {message.sender === 'user' ? (
                                                            <div className="text-right min-w-0">
                                                                <div className="text-xs text-muted-foreground mb-1">
                                                                    {message.name}
                                                                </div>
                                                                <div className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-br-md max-w-full overflow-hidden user-message-bubble">
                                                                    <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                                                        {typeof message.text === 'string' ? message.text : JSON.stringify(message.text)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-left min-w-0">
                                                                <div className="text-xs text-muted-foreground mb-1">
                                                                    {message.name}
                                                                </div>
                                                                <BotResponse 
                                                                    content={typeof message.text === 'string' ? message.text : JSON.stringify(message.text)}    
                                                                    className="text-sm ai-response leading-relaxed max-w-full overflow-hidden"                                                                         
                                                                />
                                                            </div>
                                                        )}
                                                        {message.file && (
                                                            <div className="mt-2 p-3 bg-muted/30 rounded-lg border border-border/50">                           
                                                                <div className="flex items-center gap-2">                                                   
                                                                    <Upload className="h-4 w-4" />                                                          
                                                                    <span className="text-sm font-medium">{message.file.name}</span>                        
                                                                    <span className="text-xs text-muted-foreground">                                                   
                                                                        ({(message.file.size / 1024).toFixed(1)} KB)                                        
                                                                    </span>
                                                                </div>
                                                                <a 
                                                                    href={message.file.url}                                                                 
                                                                    target="_blank"                                                                         
                                                                    rel="noopener noreferrer"                                                               
                                                                    className="text-xs text-primary hover:text-primary/80 underline mt-1 block"              
                                                                >
                                                                    View File                                                                               
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {/* Scroll target for auto-scroll */}
                                            <div ref={messagesEndRef} />
                                            
                                            {/* AI Thinking Animation */}
                                            {isLoading && generalChat?.messages?.at(-1)?.sender !== 'bot' && (                                                    
                                                <div className="flex items-start gap-3 w-full max-w-full">
                                                    <Avatar className="w-6 h-6 flex-shrink-0">
                                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary/80">
                                                            <CourseConnectLogo className="w-3 h-3" />
                                                        </div>
                                                    </Avatar>
                                                    <div className="text-left min-w-0">
                                                        <div className="text-xs text-muted-foreground mb-1">
                                                            CourseConnect AI
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            <RippleText text="thinking..." className="opacity-70" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                    <div className="p-4 sm:p-6 border-t flex-shrink-0 bg-background h-20">
                                        <FuturisticChatInput
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onSend={handleSendMessage}
                                            onFileUpload={handleFileUpload}
                                            placeholder="Ask AI anything"
                                            disabled={isLoading}
                                            className="w-full"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                    {classChats.map(([id, chat]) => (
                        <TabsContent key={id} value={id} className="mt-0 flex-1 flex flex-col">
                            <Card className="flex-1 flex flex-col overflow-hidden">
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
                                <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden chat-container">
                                    <ScrollArea className="h-[calc(100vh-300px)] px-4" ref={scrollAreaRef}>
                                        <div className="space-y-6 pb-4 max-w-full overflow-hidden chat-message">
                                            {chat?.messages?.map((message, index) => (
                                                <div key={`${message.id || 'msg'}-${index}-${message.timestamp}`} className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'} max-w-full`}>
                                                    <div className={`flex gap-3 max-w-[85%] min-w-0 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                        <Avatar className="w-8 h-8 flex-shrink-0">
                                                            <AvatarImage src={message.sender === 'user' ? user?.photoURL || '' : ''} />
                                                            <AvatarFallback className="text-xs">
                                                                {message.sender === 'user' ? (user?.displayName?.[0] || 'U') : (
                                                                    <CourseConnectLogo className="w-4 h-4" />
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        {message.sender === 'user' ? (
                                                            <div className="text-right min-w-0">
                                                                <div className="text-xs text-muted-foreground mb-1">
                                                                    {message.name}
                                                                </div>
                                                                <div className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-br-md max-w-full overflow-hidden user-message-bubble">
                                                                    <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                                                        {typeof message.text === 'string' ? message.text : JSON.stringify(message.text)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-left min-w-0">
                                                                <div className="text-xs text-muted-foreground mb-1">
                                                                    {message.name}
                                                                </div>
                                                                <BotResponse 
                                                                    content={typeof message.text === 'string' ? message.text : JSON.stringify(message.text)}
                                                                    className="text-sm ai-response leading-relaxed max-w-full overflow-hidden"
                                                                />
                                                            </div>
                                                        )}
                                                        {message.file && (
                                                            <div className="mt-2 p-3 bg-muted/30 rounded-lg border border-border/50">
                                                                <div className="flex items-center gap-2">
                                                                    <Upload className="h-4 w-4" />
                                                                    <span className="text-sm font-medium">{message.file.name}</span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        ({(message.file.size / 1024).toFixed(1)} KB)
                                                                    </span>
                                                                </div>
                                                                <a 
                                                                    href={message.file.url} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs text-primary hover:text-primary/80 underline mt-1 block"
                                                                >
                                                                    View File
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {/* Scroll target for auto-scroll */}
                                            <div ref={messagesEndRef} />
                                            
                                            {/* AI Thinking Animation */}
                                            {isLoading && chat?.messages?.at(-1)?.sender !== 'bot' && (
                                                <div className="flex items-start gap-3 w-full max-w-full">
                                                    <Avatar className="w-6 h-6 flex-shrink-0">
                                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary/80">
                                                            <CourseConnectLogo className="w-3 h-3" />
                                                        </div>
                                                    </Avatar>
                                                    <div className="text-left min-w-0">
                                                        <div className="text-xs text-muted-foreground mb-1">
                                                            CourseConnect AI
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            <RippleText text="thinking..." className="opacity-70" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                    <div className="p-4 sm:p-6 border-t flex-shrink-0 bg-background h-20">
                                        <FuturisticChatInput
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onSend={handleSendMessage}
                                            onFileUpload={handleFileUpload}
                                            placeholder={chat.title === 'General Chat' ? 'Ask anything...' : `Ask about ${chat.title}...`}
                                            disabled={isLoading}
                                            className="w-full"
                                        />
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
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <RotateCcw className="h-5 w-5 text-orange-500" />
                        Reset Chat
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to reset this chat? This will clear all messages and conversation history. The AI will no longer remember previous questions or context from this conversation. This action cannot be undone.
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
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-destructive" />
                        Delete Chat
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to permanently delete this chat? This will remove all messages and conversation history. The AI will no longer remember any previous questions or context from this conversation. This action cannot be undone.
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
"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isMathOrPhysicsContent } from '@/utils/math-detection';
import { AIResponse } from '@/components/ai-response';
import { MessageSquare, Users, MoreVertical, Download, RotateCcw, Upload, BookOpen, Trash2, Brain, Copy, Check } from "lucide-react";
import { useChatStore } from "@/hooks/use-chat-store";
import { useTextExtraction } from "@/hooks/use-text-extraction";
import { useSmartDocumentAnalysis } from "@/hooks/use-smart-document-analysis";
import { useSocket } from "@/hooks/use-socket";
import { TypingIndicator } from "@/components/typing-indicator";
import { LiveUserCount } from "@/components/live-user-count";
import { ChatSidebar } from "@/components/chat-sidebar";
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
import { MobileButton } from "@/components/ui/mobile-button";
import { MobileInput } from "@/components/ui/mobile-input";
import { ExpandableUserMessage } from "@/components/expandable-user-message";
import { EnhancedChatInput } from "@/components/enhanced-chat-input";
import { MessageTimestamp } from "@/components/message-timestamp";
import BotResponse from "@/components/bot-response";
import { CourseConnectLogo } from "@/components/icons/courseconnect-logo";
import { RippleText } from "@/components/ripple-text";
import { useSidebar } from "@/hooks/use-sidebar";
import { InDepthAnalysis } from "@/components/in-depth-analysis";
import { JoinMessage } from "@/components/join-message";

export default function ChatPage() {
    const searchParams = useSearchParams();
    const { 
        chats, 
        addMessage, 
        setCurrentTab, 
        currentTab, 
        addChat, 
        addUserJoinMessage,
        isStoreLoading, 
        initializeAuthListener, 
        exportChat, 
        resetChat, 
        deleteChat, 
        initializeGeneralChats,
        subscribeToChat,
        typingUsers,
        setTypingUsers,
        setSocketConnected
    } = useChatStore();
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [userCount, setUserCount] = useState(0);
    const [activeChatId, setActiveChatId] = useState('public-general-chat');
    
    // Real chat data from chat store
    const availableChats = [
        {
            id: 'public-general-chat',
            name: 'General Chat',
            type: 'public' as const,
            lastMessage: generalChat?.messages?.[generalChat.messages.length - 1]?.text || 'Welcome to the general chat!',
            lastMessageTime: generalChat?.messages?.[generalChat.messages.length - 1]?.timestamp || Date.now(),
            unreadCount: 0,
            isActive: activeChatId === 'public-general-chat',
            isPinned: true,
            isStarred: false,
            userCount: userCount,
            isPermanent: true, // Cannot be deleted
            canReset: true,
            canExport: true
        },
        // Add other chats from your chat store here
        ...Object.entries(chats || {}).map(([chatId, chat]) => ({
            id: chatId,
            name: chat.name || `Chat ${chatId}`,
            type: chat.type || 'public' as const,
            lastMessage: chat.messages?.[chat.messages.length - 1]?.text || 'No messages yet',
            lastMessageTime: chat.messages?.[chat.messages.length - 1]?.timestamp || Date.now(),
            unreadCount: 0,
            isActive: activeChatId === chatId,
            isPinned: false,
            isStarred: false,
            userCount: 1,
            isPermanent: false,
            canReset: true,
            canExport: true
        }))
    ];
    
    const [forceLoad, setForceLoad] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Chat navigation handlers
    const handleChatSelect = (chatId: string) => {
        setActiveChatId(chatId);
        // In a real app, you would load the chat messages here
        console.log('Switching to chat:', chatId);
    };

    const handleCreateChat = () => {
        // In a real app, you would open a create chat dialog
        console.log('Create new chat');
    };

    const handleResetChat = (chatId: string) => {
        if (chatId === 'public-general-chat') {
            setShowResetDialog(true);
        } else {
            // Reset other chats
            resetChat(chatId);
        }
    };

    const handleExportChat = (chatId: string) => {
        exportChat(chatId);
    };

    const handleDeleteChat = (chatId: string) => {
        if (chatId === 'public-general-chat') {
            // General chat cannot be deleted
            return;
        }
        setShowDeleteDialog(true);
    };
    const { toast } = useToast();

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

    // Auto-scroll to bottom function
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Determine if current chat should have real-time features
    // For this page, we're always showing public general chat, so enable real-time
    const shouldHaveRealtime = true;

    // Socket.IO connection for real-time features (only for public and class chats)
    const socket = useSocket({
        room: 'public-general-chat',
        userId: user?.uid || `guest-${Date.now()}`,
        username: user?.displayName || 'Anonymous',
        avatar: user?.photoURL,
        onMessageReceived: (message) => {
            // Add message to local state for instant display
            addMessage('public-general-chat', message);
        },
        onAIResponse: (message, aiResponse) => {
            // Handle AI responses in real-time
            const aiMessage = {
                id: `ai-${Date.now()}`,
                sender: 'bot' as const,
                name: 'CourseConnect AI',
                text: aiResponse,
                timestamp: Date.now()
            };
            addMessage('public-general-chat', aiMessage);
        },
        onUserCountUpdate: (count) => {
            setUserCount(count);
        },
        onTypingStart: (userId) => {
            setTypingUsers(prev => [...prev.filter(id => id !== userId), userId]);
        },
        onTypingStop: (userId) => {
            setTypingUsers(prev => prev.filter(id => id !== userId));
        },
        onAIThinkingStart: () => {
            console.log('AI thinking started');
            setIsLoading(true);
        },
        onAIThinkingStop: () => {
            console.log('AI thinking stopped');
            setIsLoading(false);
        }
    });

    // Global realtime subscription for public-general-chat (always active)
    useEffect(() => {
        console.log('ChatPage: Setting up GLOBAL subscription for public-general-chat');
        const unsubscribe = subscribeToChat('public-general-chat');
        console.log('ChatPage: GLOBAL subscription setup complete, unsubscribe function:', unsubscribe);
        return () => {
            console.log('ChatPage: Cleaning up GLOBAL subscription');
            try { unsubscribe?.(); } catch {}
        };
    }, [subscribeToChat]);

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

    // Initialize general chats when component mounts
    useEffect(() => {
        initializeGeneralChats();
    }, [initializeGeneralChats]);

    // Handle URL parameters for specific chat tabs
    useEffect(() => {
        const tabParam = searchParams.get('tab');
            if (tabParam && chats[tabParam]) {
                setCurrentTab(tabParam);
            }
    }, [searchParams, chats, setCurrentTab]);

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

    // Get current chat (moved up to avoid redeclaration)
    const generalChat = chats['public-general-chat'];

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
    }, [generalChat?.messages, isLoading]);

    // Initialize general chat if it doesn't exist and set current tab
    useEffect(() => {
        // Initialize general chats if they don't exist
        initializeGeneralChats();
        
        // Set current tab to private-general-chat if no tab is selected
        if (!currentTab) {
            setCurrentTab('private-general-chat');
        }
    }, [initializeGeneralChats, currentTab, setCurrentTab]);

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

    // Helper function to highlight @ai mentions in messages
    const highlightAIMentions = (text: string) => {
        return text.replace(/(?<!\w)@ai(?!\w)/gi, (match) => 
            `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">${match}</span>`
        );
    };

    const handleSendMessage = async (shouldCallAI: boolean = true) => {
        if (!inputValue.trim()) return;

        const messageText = inputValue.trim();
        const isPublicChat = true; // This page is always public chat
        const isClassChat = false;

        // Enhanced AI mention detection: standalone @ai token with punctuation support
        const hasAIMention = /(?<!\w)@ai(?!\w)/i.test(messageText);
        
        // For public chats, only call AI if explicitly mentioned
        const shouldCallAIFinal = isPublicChat ? hasAIMention : shouldCallAI;
        
        console.log('@ai detection debug:', {
            messageText,
            hasAIMention,
            isPublicChat,
            shouldCallAI,
            shouldCallAIFinal
        });

        const userMessage = {
            id: generateMessageId(),
            text: messageText,
            sender: 'user' as const,
            name: user?.displayName || 'Anonymous',
            userId: user?.uid || 'guest',
            timestamp: Date.now()
        };

        // Clear input immediately to prevent spam
        setInputValue("");

        // Add user message first
        await addMessage('public-general-chat', userMessage);

        // Send message via Socket.IO for real-time delivery
        socket.sendMessage(userMessage);

        // Set loading state for built-in animation (no placeholder message)
        if (shouldCallAIFinal) {
            console.log('Setting isLoading to true for message:', messageText);
            setIsLoading(true);
            // Broadcast AI thinking to other users
            socket.startAIThinking();
        }

        // Only get AI response if appropriate
        if (shouldCallAIFinal) {
            try {
                // Get AI response via API call with enhanced error handling
                let aiResponse;
                try {
                    console.log('Making API call to /api/chat...');
                    
                    const response = await fetch('/api/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'User-Agent': 'CourseConnect-Client/1.0',
                        },
                        body: JSON.stringify({
                            question: messageText,
                            context: 'Public General Chat',
                            conversationHistory: generalChat?.messages?.slice(-10).map(msg => ({
                                role: msg.sender === 'user' ? 'user' : 'assistant',
                                content: typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)
                            })) || [],
                            shouldCallAI: shouldCallAIFinal,
                            isPublicChat,
                            hasAIMention
                        }),
                        // Add timeout for better device compatibility
                        signal: AbortSignal.timeout(35000) // 35 second timeout
                    });

                    console.log('API response status:', response.status);

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('API error response:', errorText);
                        throw new Error(`API call failed: ${response.status} - ${errorText}`);
                    }

                    const data = await response.json();
                    console.log('API response data:', { 
                        success: data.success, 
                        provider: data.provider, 
                        answerLength: data.answer?.length || 0,
                        sourcesCount: data.sources?.length || 0
                    });
                    
                    aiResponse = data;
                } catch (apiError) {
                    console.warn("API call failed, using enhanced fallback:", apiError);
                    
                    // Enhanced fallback based on error type
                    let fallbackMessage = "Hey! I'm CourseConnect AI, your friendly study buddy! I'm having a small technical hiccup right now, but I'm still here to help! I can assist with:\n\n📚 Academic subjects and homework\n💡 Study strategies and tips\n📝 Writing and research\n🧠 Problem-solving\n💬 General questions and conversation\n\nWhat's on your mind? What would you like to talk about or get help with?";
                    
                    if (apiError instanceof Error) {
                        if (apiError.name === 'TimeoutError' || apiError.message.includes('timeout')) {
                            fallbackMessage = "Hey there! I'm taking a bit longer than usual to respond, but I'm still here to help! I can assist with:\n\n📚 Academic subjects and homework\n💡 Study strategies and tips\n📝 Writing and research\n🧠 Problem-solving\n💬 General questions and conversation\n\nWhat would you like to talk about?";
                        } else if (apiError.message.includes('network') || apiError.message.includes('fetch')) {
                            fallbackMessage = "Hey! I'm having some network connectivity issues right now, but I'm still here to help! I can assist with:\n\n📚 Academic subjects and homework\n💡 Study strategies and tips\n📝 Writing and research\n🧠 Problem-solving\n💬 General questions and conversation\n\nWhat's on your mind?";
                        }
                    }
                    
                    aiResponse = {
                        answer: fallbackMessage,
                        provider: 'fallback',
                        success: true
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
                    timestamp: Date.now(),
                    sources: aiResponse?.sources
                };

                // Add AI response (no replacement so user message stays)
                await addMessage('public-general-chat', aiMessage);

                // Send AI response via Socket.IO for real-time delivery
                socket.sendAIResponse(userMessage, responseText || 'I apologize, but I couldn\'t generate a response.');
            } catch (error) {
                console.error('AI Error:', error);
                const errorMessage = {
                    id: generateMessageId(),
                    text: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
                    sender: 'bot' as const,
                    name: 'CourseConnect AI',
                    timestamp: Date.now()
                };
                // Add error message
                await addMessage('public-general-chat', errorMessage);
            } finally {
                console.log('Setting isLoading to false');
                setIsLoading(false);
                // Stop AI thinking broadcast
                socket.stopAIThinking();
            }
        }
    };

    const { extractText, isExtracting } = useTextExtraction({
        onExtractionComplete: async (result, fileName) => {
            // Add extracted text as a message
            const extractedTextMessage = {
                id: generateMessageId(),
                text: `📄 **Text extracted from ${fileName}**\n\n${result.text}`,
                sender: 'bot' as const,
                name: 'CourseConnect AI',
                timestamp: Date.now()
            };
            await addMessage('public-general-chat', extractedTextMessage);
        },
        onExtractionError: (error, fileName) => {
            console.error('Text extraction failed:', error);
        }
    });

    const { analyzeDocument, isAnalyzing } = useSmartDocumentAnalysis({
        onAnalysisComplete: async (result, fileName) => {
            // Store the extracted text for chat context
            const currentChatId = 'public-general-chat';
            const storageKey = `document-content-${currentChatId}`;
            const documentData = {
                fileName,
                extractedText: result.extractedText,
                summary: result.summary,
                fileType: result.fileType,
                metadata: result.metadata,
                timestamp: Date.now()
            };
            
            console.log('💾 STORING DOCUMENT DATA:', {
                fileName: documentData.fileName,
                extractedTextLength: documentData.extractedText?.length || 0,
                extractedTextPreview: documentData.extractedText?.substring(0, 300) || 'NO CONTENT',
                summary: documentData.summary,
                storageKey: storageKey,
                chatId: currentChatId
            });
            
            sessionStorage.setItem(storageKey, JSON.stringify(documentData));

            // Verify storage worked
            const verificationCheck = sessionStorage.getItem(storageKey);
            if (verificationCheck) {
                const verifiedData = JSON.parse(verificationCheck);
                console.log('✅ VERIFICATION: Document stored successfully');
                console.log('Verified extracted text length:', verifiedData.extractedText?.length || 0);
                console.log('Verified filename:', verifiedData.fileName);
            } else {
                console.error('❌ VERIFICATION FAILED: Document not stored in sessionStorage');
            }

            // Add AI analysis as a message with proper formatting
            const analysisMessage = {
                id: generateMessageId(),
                text: `**📄 Document Analysis: ${fileName}**\n\n${result.summary || result.content || 'Analysis completed successfully.'}\n\n*Document content loaded - ask me anything about it!*`,
                sender: 'bot' as const,
                name: 'CourseConnect AI',
                timestamp: Date.now()
            };
            await addMessage('public-general-chat', analysisMessage);
        },
        onAnalysisError: (error, fileName) => {
            console.error('Document analysis failed:', error);
            // Add error message
            const errorMessage = {
                id: generateMessageId(),
                text: `❌ **Analysis Failed for ${fileName}**\n\nSorry, I couldn't analyze this file. Please try uploading a different file or check if the file format is supported.`,
                sender: 'bot' as const,
                name: 'CourseConnect AI',
                timestamp: Date.now()
            };
            addMessage('public-general-chat', errorMessage);
        }
    });

    const handleFileUpload = async (file: File) => {
        // Show loading state
        setIsLoading(true);

        try {
            // Create a message indicating file upload with file preview
            const uploadMessage = {
                id: generateMessageId(),
                text: `📎 **File Uploaded: ${file.name}**\n\n**File Details:**\n• Size: ${(file.size / 1024 / 1024).toFixed(2)} MB\n• Type: ${file.type}\n• Status: Processing...`,
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
            await addMessage('public-general-chat', uploadMessage);

            // Use smart document analysis
            await analyzeDocument(file);

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
        try {
            exportChat('public-general-chat');
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
        // Close dialog immediately
        setShowResetDialog(false);
        
        try {
            await resetChat('public-general-chat');
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
        // Close dialog immediately
        setShowDeleteDialog(false);
        
        try {
            await deleteChat('public-general-chat');
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
    const classChats = Object.entries(chats).filter(([id, chat]) => id !== 'private-general-chat' && id !== 'public-general-chat');

    // Debug logging
    console.log('ChatPage - isStoreLoading:', isStoreLoading, 'forceLoad:', forceLoad, 'chats:', Object.keys(chats), 'currentTab:', currentTab);
    console.log('ChatPage - classChats:', classChats);
    console.log('ChatPage - generalChat:', generalChat);
    console.log('ChatPage - isLoading:', isLoading, 'lastMessageSender:', generalChat?.messages?.at(-1)?.sender);

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
        <div className="min-h-screen bg-transparent flex">
            {/* Chat Sidebar */}
            <ChatSidebar
                chats={availableChats}
                activeChatId={activeChatId}
                onChatSelect={handleChatSelect}
                onCreateChat={handleCreateChat}
                onResetChat={handleResetChat}
                onExportChat={handleExportChat}
                onDeleteChat={handleDeleteChat}
                userCount={userCount}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h1 className="text-2xl font-bold mb-1">
                        {availableChats.find(chat => chat.id === activeChatId)?.name || 'Chat'}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {availableChats.find(chat => chat.id === activeChatId)?.type === 'public' 
                            ? 'Public discussion channel' 
                            : availableChats.find(chat => chat.id === activeChatId)?.type === 'group'
                            ? 'Group conversation'
                            : 'Private conversation'
                        }
                    </p>
                </div>

                {/* Chat Interface */}
                <div className="flex-1 flex flex-col p-6">

                    {/* General Chat Interface */}
                        <Card className="flex-1 flex flex-col overflow-hidden relative">
                                <CardHeader className="pb-3 flex-shrink-0">
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5" />
                                        Public General Chat
                                        <Badge variant="secondary" className="ml-auto mr-2">
                                            <Users className="h-3 w-3 mr-1" />
                                            {generalChat?.messages?.filter(m => m.sender === 'user').length || 0} Users
                                        </Badge>
                                        {/* Live User Count */}
                                        <div className="mr-2">
                                                <LiveUserCount userCount={userCount} />
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" className="h-8 w-8 p-0 hover:bg-transparent hover:text-current">
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
                                    <ScrollArea className="h-[calc(100vh-200px)] px-4" ref={scrollAreaRef}>
                                        <div className="space-y-6 pb-4 max-w-full overflow-hidden chat-message">
                                            {generalChat?.messages?.map((message, index) => {
                                                // Handle system messages (join notifications)
                                                if (message.sender === 'system') {
                                                    return (
                                                        <JoinMessage 
                                                            key={`${message.id || 'msg'}-${index}-${message.timestamp}`}
                                                            message={message}
                                                        />
                                                    );
                                                }
                                                
                                                return (
                                                <div key={`${message.id || 'msg'}-${index}-${message.timestamp}`} className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'} max-w-full`}>
                                                    <div className={`flex gap-3 max-w-[85%] min-w-0 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                        <Avatar className="w-8 h-8 flex-shrink-0">
                                                            <AvatarImage src={message.sender === 'user' ? user?.photoURL || '' : ''} />
                                                            <AvatarFallback className="text-xs">
                                                                {message.sender === 'user' ? (message.name?.[0] || user?.displayName?.[0] || user?.email?.[0] || 'U') : (
                                                                    <CourseConnectLogo className="w-4 h-4" />
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        {message.sender === 'user' ? (
                                                            <div className="text-right min-w-0 group">
                                                                <div className="flex items-center justify-end gap-2 mb-1">
                                                                    <MessageTimestamp timestamp={message.timestamp} />
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {message.name}
                                                                    </div>
                                                                </div>
                                                                <div className="relative inline-block bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-br-md max-w-full overflow-hidden user-message-bubble">
                                                                    <ExpandableUserMessage 
                                                                        content={typeof message.text === 'string' ? message.text : JSON.stringify(message.text)}
                                                                        className="text-primary-foreground"
                                                                    />
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-opacity duration-200 hover:bg-transparent text-muted-foreground"
                                                                        onClick={() => copyToClipboard(typeof message.text === 'string' ? message.text : JSON.stringify(message.text), message.id || `msg-${index}`)}
                                                                    >
                                                                        {copiedMessageId === (message.id || `msg-${index}`) ? (
                                                                            <Check className="h-3 w-3 text-green-500" />
                                                                        ) : (
                                                                            <Copy className="h-3 w-3" />
                                                                        )}
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-left min-w-0 group">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                                        {message.name}
                                                                        {(() => {
                                                                            // Check if this is a bot message and if the previous user message contained math
                                                                            const previousMessage = index > 0 ? generalChat?.messages[index - 1] : null;
                                                                            const userAskedMathQuestion = previousMessage && 
                                                                                previousMessage.sender === 'user' && 
                                                                                isMathOrPhysicsContent(typeof previousMessage.text === 'string' ? previousMessage.text : JSON.stringify(previousMessage.text));
                                                                            
                                                                            // Show math analysis if user asked a math question (regardless of bot response content)
                                                                            const shouldShowMathAnalysis = userAskedMathQuestion;
                                                                            
                                                                            return shouldShowMathAnalysis ? (
                                                                                <InDepthAnalysis 
                                                                                    question={typeof previousMessage.text === 'string' ? previousMessage.text : JSON.stringify(previousMessage.text)}
                                                                                    conversationHistory={generalChat?.messages || []}
                                                                                    userName={previousMessage.name}
                                                                                />
                                                                            ) : null;
                                                                        })()}
                                                                    </div>
                                                                    {message.timestamp && <MessageTimestamp timestamp={message.timestamp} />}
                                                                </div>
                                                                <BotResponse 
                                                                    content={typeof message.text === 'string' ? message.text : JSON.stringify(message.text)}    
                                                                    className="text-sm ai-response leading-relaxed max-w-full overflow-hidden"
                                                                    sources={message.sources}
                                                                />
                                                            </div>
                                                        )}
                                                                </div>
                                                            </div>
                                            );
                                            })}
                                            
                                            {/* Typing Indicator */}
                                            <TypingIndicator 
                                                typingUsers={typingUsers}
                                                currentUserId={user?.uid || `guest-${Date.now()}`}
                                            />
                                            
                                            {/* Scroll target for auto-scroll */}
                                            <div ref={messagesEndRef} />
                                            
                                            {/* AI Thinking Animation */}
                                            {isLoading && generalChat?.messages?.at(-1)?.sender !== 'bot' && (
                                                <div className="flex items-start gap-3 w-full max-w-full animate-in slide-in-from-bottom-2 duration-300">
                                                    <Avatar className="w-8 h-8 flex-shrink-0">
                                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary/80">
                                                            <CourseConnectLogo className="w-4 h-4" />
                                                        </div>
                                                    </Avatar>
                                                    <div className="text-left min-w-0">
                                                        <div className="text-xs text-muted-foreground mb-1">
                                                            CourseConnect AI
                                                        </div>
                                                        <div className="text-sm font-medium">
                                                            <RippleText text="thinking..." className="text-primary" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                    <div className="p-4 sm:p-6 flex-shrink-0 bg-background pb-safe">
                                        <EnhancedChatInput
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onSend={handleSendMessage}
                                            onFileUpload={handleFileUpload}
                                            placeholder="Ask AI anything or chat with classmates"
                                            disabled={false}
                                            className="w-full"
                                            isPublicChat={true}
                                            isClassChat={false}
                                            onTypingStart={socket.startTyping}
                                            onTypingStop={socket.stopTyping}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
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
        </div>
    );
}
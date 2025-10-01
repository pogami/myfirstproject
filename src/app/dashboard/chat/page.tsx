"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isMathOrPhysicsContent } from '@/utils/math-detection';
import { AIResponse } from '@/components/ai-response';
import { MessageSquare, Users, MoreVertical, Download, RotateCcw, Upload, BookOpen, Trash2, Brain, Copy, Check, Globe } from "lucide-react";
import { useChatStore } from "@/hooks/use-chat-store";
import { useTextExtraction } from "@/hooks/use-text-extraction";
import { useSmartDocumentAnalysis } from "@/hooks/use-smart-document-analysis";
import { auth } from "@/lib/firebase/client";
import { useSocket } from "@/hooks/use-socket";
import { TypingIndicator } from "@/components/typing-indicator";
import { OnlineUsersIndicator } from "@/components/online-users-indicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MobileNavigation } from "@/components/mobile-navigation";
import { MobileButton } from "@/components/ui/mobile-button";
import { MobileInput } from "@/components/ui/mobile-input";
import { ExpandableUserMessage } from "@/components/expandable-user-message";
import { EnhancedChatInput } from "@/components/enhanced-chat-input";
import { MessageTimestamp } from "@/components/message-timestamp";
import BotResponse from "@/components/bot-response";
import { CourseConnectLogo } from "@/components/icons/courseconnect-logo";
import { RippleText } from "@/components/ripple-text";
import { InDepthAnalysis } from "@/components/in-depth-analysis";
import { JoinMessage } from "@/components/join-message";
import { WelcomeCard } from "@/components/welcome-card";

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
        // Socket.IO state
        socket,
        isSocketConnected,
        activeUsers,
        typingUsers,
        isAiThinking,
        setSocket,
        setSocketConnected,
        setActiveUsers,
        setTypingUsers,
        setAiThinking,
        sendRealtimeMessage,
        startTyping,
        stopTyping
    } = useChatStore();
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isGuest, setIsGuest] = useState(false);
    const [forceLoad, setForceLoad] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    // New chat creation is disabled here (only via Upload Syllabus)
    const [unreadById, setUnreadById] = useState<Record<string, number>>({});
    const [prevLengths, setPrevLengths] = useState<Record<string, number>>({});
    const { toast } = useToast();

    // Socket.IO integration
    const {
        socket: socketInstance,
        isConnected: socketConnected,
        activeUsers: socketActiveUsers,
        typingUsers: socketTypingUsers,
        isAiThinking: socketAiThinking,
        availableChats: socketAvailableChats,
        sendMessage: socketSendMessage,
        startTyping: socketStartTyping,
        stopTyping: socketStopTyping,
        joinChat,
        leaveChat
    } = useSocket({
        chatId: currentTab || '',
        userId: user?.uid || 'guest',
        userName: user?.displayName || user?.email || 'Guest User',
        userPhotoURL: !isGuest ? user?.photoURL : undefined,
        enabled: !!currentTab
    });

    // Debug user state changes
    useEffect(() => {
        console.log('User state changed:', { 
            user: user ? { uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL } : null,
            userName: user?.displayName || user?.email || 'Guest User',
            userPhotoURL: user?.photoURL
        });
    }, [user]);

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

    // Sync Socket.IO state with chat store
    useEffect(() => {
        setSocket(socketInstance);
        setSocketConnected(socketConnected);
        setActiveUsers(socketActiveUsers);
        setTypingUsers(socketTypingUsers);
        setAiThinking(socketAiThinking);
    }, [socketInstance, socketConnected, socketActiveUsers, socketTypingUsers, socketAiThinking, setSocket, setSocketConnected, setActiveUsers, setTypingUsers, setAiThinking]);

    // Initialize general chats when component mounts
    useEffect(() => {
        initializeGeneralChats();
    }, [initializeGeneralChats]);

    // Handle URL parameters for specific chat tabs
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam) {
            if (chats[tabParam]) {
                setCurrentTab(tabParam);
                try { localStorage.setItem('cc-active-tab', tabParam); } catch {}
            } else {
                const start = Date.now();
                const interval = setInterval(() => {
                    if (chats[tabParam] || Date.now() - start > 3000) {
                        if (chats[tabParam]) setCurrentTab(tabParam);
                        clearInterval(interval);
                    }
                }, 150);
                return () => clearInterval(interval);
            }
        }
    }, [searchParams, chats, setCurrentTab]);

    // Ensure auth listener is initialized with offline handling
    useEffect(() => {
        try {
            console.log('Initializing auth listener...');
            // Check if we're online before initializing auth listener
            if (navigator.onLine) {
                const unsubscribe = initializeAuthListener();
                console.log('Auth listener initialized, unsubscribe function:', typeof unsubscribe);
            } else {
                console.log('Offline mode - skipping auth listener initialization');
            }
        } catch (error) {
            console.warn('Failed to initialize auth listener:', error);
            // Force load if auth fails
            setTimeout(() => {
                console.log('Auth failed, forcing load');
                setForceLoad(true);
            }, 1000);
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
                    (user: any) => {
                        setUser(user);
                        // Check if user is guest/anonymous
                        setIsGuest(user?.isAnonymous || user?.isGuest || false);
                    },
                    (error: any) => {
                        console.warn("Auth state error in chat page:", error);
                        setUser(null);
                        setIsGuest(false);
                    }
                );
                return unsubscribe;
            } else {
                setUser(null);
                setIsGuest(false);
            }
        } catch (authError) {
            console.warn("Auth initialization error in chat page:", authError);
            setUser(null);
            setIsGuest(false);
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

    // Track unread counts per chat
    useEffect(() => {
        const nextPrev: Record<string, number> = { ...prevLengths };
        const nextUnread: Record<string, number> = { ...unreadById };
        for (const [id, chat] of Object.entries(chats)) {
            const len = chat.messages?.length || 0;
            const prev = nextPrev[id] ?? 0;
            if (len > prev) {
                const delta = len - prev;
                if (id !== (currentTab || 'private-general-chat')) {
                    nextUnread[id] = Math.min(99, (nextUnread[id] ?? 0) + delta);
                }
                nextPrev[id] = len;
            }
        }
        setPrevLengths(nextPrev);
        setUnreadById(nextUnread);
    }, [chats, currentTab]);

    // Clear unread when switching to a tab
    useEffect(() => {
        if (!currentTab) return;
        setUnreadById((m) => ({ ...m, [currentTab]: 0 }));
    }, [currentTab]);


    // Initialize general chat if it doesn't exist and set current tab
    useEffect(() => {
        // Initialize general chats if they don't exist
        initializeGeneralChats();
        
        // Prefer last used tab or public-general-chat
        if (!currentTab) {
            let last = '';
            try { last = localStorage.getItem('cc-active-tab') || ''; } catch {}
            if (last && chats[last]) setCurrentTab(last);
            else if (chats['public-general-chat']) setCurrentTab('public-general-chat');
            else setCurrentTab('private-general-chat');
        }
    }, [initializeGeneralChats, currentTab, setCurrentTab]);

    // Force load after 2 seconds to prevent infinite loading
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isStoreLoading) {
                console.log('ChatPage - Force loading after timeout');
                setForceLoad(true);
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [isStoreLoading]);

    // Generate unique message ID with better uniqueness
    const generateMessageId = () => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const sessionId = Math.random().toString(36).substr(2, 4);
        return `${timestamp}-${random}-${sessionId}`;
    };

    // Keyboard shortcuts for tab switching and focusing input
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const isMod = e.ctrlKey || e.metaKey;
            if (!isMod) return;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                const ids = Object.keys(chats);
                if (ids.length === 0) return;
                const current = currentTab || 'private-general-chat';
                const idx = Math.max(0, ids.indexOf(current));
                const next = e.key === 'ArrowRight' ? ids[Math.min(idx + 1, ids.length - 1)] : ids[Math.max(idx - 1, 0)];
                if (next) { setCurrentTab(next); try { localStorage.setItem('cc-active-tab', next); } catch {} }
            }
            if (e.key.toLowerCase() === 'enter') {
                const input = document.querySelector('input[type="text"]') as HTMLInputElement | null;
                input?.focus();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [chats, currentTab, setCurrentTab]);

    const handleSendMessage = async (shouldCallAI: boolean = true) => {
        if (!inputValue.trim()) return;

        const messageText = inputValue.trim();
        const currentChat = chats[currentTab || 'private-general-chat'];
        const isPublicChat = currentChat?.chatType === 'public' || currentChat?.chatType === 'class';
        const isClassChat = currentChat?.chatType === 'class';

        // Determine if this message mentions AI
        const hasAIMention = messageText.includes('@ai') || messageText.includes('@AI');
        
        // For public chats, only call AI if explicitly mentioned
        const shouldCallAIFinal = isPublicChat ? hasAIMention : shouldCallAI;

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

        // Stop typing indicator when message is sent
        if (currentTab) {
            stopTyping(currentTab);
        }

        // Set loading state immediately for instant thinking animation
        if (shouldCallAIFinal) {
            console.log('Setting isLoading to true for message:', messageText);
            setIsLoading(true);
        }

        // Add user message
        await addMessage(currentTab || 'private-general-chat', userMessage);

        // Real-time message broadcasting is now handled in the chat store

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
                            context: currentChat?.title || 'General Chat',
                            conversationHistory: currentChat?.messages?.slice(-10).map(msg => ({
                                role: msg.sender === 'user' ? 'user' : 'assistant',
                                content: typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)
                            })) || [],
                            shouldCallAI: shouldCallAIFinal,
                            isPublicChat
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
                        sourcesCount: data.sources?.length || 0,
                        sources: data.sources
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
                    sources: aiResponse?.sources || undefined
                };
                
                console.log('💬 Creating AI message with sources:', aiMessage.sources?.length || 0, aiMessage.sources);

                // Add AI response
                await addMessage(currentTab || 'private-general-chat', aiMessage);

                // Real-time AI response broadcasting is now handled in the chat store
            } catch (error) {
                console.error('AI Error:', error);
                const errorMessage = {
                    id: generateMessageId(),
                    text: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
                    sender: 'bot' as const,
                    name: 'CourseConnect AI',
                    timestamp: Date.now()
                };
                await addMessage(currentTab || 'private-general-chat', errorMessage);
            } finally {
                console.log('Setting isLoading to false');
                setIsLoading(false);
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
            await addMessage(currentTab || 'private-general-chat', extractedTextMessage);
        },
        onExtractionError: (error, fileName) => {
            console.error('Text extraction failed:', error);
        }
    });

    const { analyzeDocument, isAnalyzing } = useSmartDocumentAnalysis({
        onAnalysisComplete: async (result, fileName) => {
            // Store the extracted text for chat context
            const currentChatId = currentTab || 'private-general-chat';
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
            await addMessage(currentTab || 'private-general-chat', analysisMessage);
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
            addMessage(currentTab || 'private-general-chat', errorMessage);
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
            await addMessage(currentTab || 'private-general-chat', uploadMessage);

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
            exportChat(currentTab || 'private-general-chat');
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
            await resetChat(currentTab || 'private-general-chat');
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
            const toDelete = currentTab || 'private-general-chat';
            await deleteChat(toDelete);
            toast({
                title: "Chat Deleted",
                description: "Chat has been permanently deleted.",
            });
            // Redirect to another available chat instead of dashboard
            const ids = Object.keys(chats).filter(id => id !== toDelete);
            const fallback = ids.includes('public-general-chat')
                ? 'public-general-chat'
                : (ids.includes('private-general-chat') ? 'private-general-chat' : ids[0]);
            if (fallback) {
                setCurrentTab(fallback);
                try { localStorage.setItem('cc-active-tab', fallback); } catch {}
            } else {
                // If none, fallback to private-general-chat implicitly
                setCurrentTab('private-general-chat');
                try { localStorage.setItem('cc-active-tab', 'private-general-chat'); } catch {}
            }
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
    const generalChat = chats[currentTab || 'private-general-chat'];

    // Debug logging
    console.log('ChatPage - isStoreLoading:', isStoreLoading, 'forceLoad:', forceLoad, 'chats:', Object.keys(chats), 'currentTab:', currentTab);
    console.log('ChatPage - classChats:', classChats);
    console.log('ChatPage - generalChat:', generalChat);
    console.log('ChatPage - isLoading:', isLoading, 'lastMessageSender:', generalChat?.messages?.at(-1)?.sender);
    console.log('ChatPage - Socket.IO state:', { isSocketConnected, activeUsers: activeUsers.length, typingUsers: typingUsers.length, isAiThinking });

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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{currentTab === 'public-general-chat' ? 'Community' : 'Class Chat'}</h1>
                            <p className="text-muted-foreground">
                                Join class discussions, ask questions, and collaborate with classmates
                            </p>
                        </div>
                        {/* Real-time status indicator */}
                        {currentTab === 'public-general-chat' && (
                            <OnlineUsersIndicator 
                                users={activeUsers}
                                isConnected={isSocketConnected}
                                showAvatars={true}
                                maxVisible={5}
                            />
                        )}
                    </div>
                </div>


                {/* Chat Interface with Sidebar */}
                <div className="w-full flex-1 flex gap-4">
                    {/* Chat Sidebar */}
                    <div className="w-64 flex-shrink-0">
                        <Card className="h-full flex flex-col">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <MessageSquare className="h-5 w-5" />
                                    Chats
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden p-0">
                                <div className="h-full overflow-y-auto">
                                    <div className="p-4 space-y-2">
                                        {(() => {
                                            // Always show permanent chats first
                                            const permanentChats = [
                                                {
                                                    chatId: 'private-general-chat',
                                                    title: 'General Chat',
                                                    userCount: 1, // Always show as available
                                                    isActive: true,
                                                    isPermanent: true
                                                },
                                                {
                                                    chatId: 'public-general-chat',
                                                    title: 'Community',
                                                    userCount: socketAvailableChats.find(c => c.chatId === 'public-general-chat')?.userCount || 0,
                                                    isActive: true,
                                                    isPermanent: true
                                                }
                                            ];

                                            // Get other active chats from socket
                                            const otherChats = socketAvailableChats
                                                .filter(chat => chat.isActive && !chat.chatId.includes('general-chat'))
                                                .sort((a, b) => {
                                                    // Sort by user count (descending), then by title
                                                    if (a.userCount !== b.userCount) {
                                                        return b.userCount - a.userCount;
                                                    }
                                                    return a.title.localeCompare(b.title);
                                                });

                                            // Combine permanent chats with other chats
                                            const allChats = [...permanentChats, ...otherChats];

                                            return allChats.map(chat => {
                                                const isPublic = chat.chatId === 'public-general-chat';
                                                const isPrivate = chat.chatId === 'private-general-chat';
                                                const unread = unreadById[chat.chatId] ?? 0;
                                                const isActive = currentTab === chat.chatId;
                                                
                                                return (
                                                    <button
                                                        key={chat.chatId}
                                                        onClick={() => { 
                                                            setCurrentTab(chat.chatId); 
                                                            try { localStorage.setItem('cc-active-tab', chat.chatId); } catch {} 
                                                        }}
                                                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 hover:bg-muted/50 ${
                                                            isActive 
                                                                ? 'bg-primary/10 border border-primary/20 text-primary' 
                                                                : 'hover:bg-muted/30'
                                                        }`}
                                                    >
                                                        <div className="flex-shrink-0">
                                                            {isPrivate ? (
                                                                <MessageSquare className="h-4 w-4" />
                                                            ) : isPublic ? (
                                                                <Globe className="h-4 w-4" />
                                                            ) : (
                                                                <BookOpen className="h-4 w-4" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium truncate">
                                                                    {chat.title}
                                                                </span>
                                                                {isPublic && (
                                                                    <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                                                        Live
                                                                    </span>
                                                                )}
                                                                {isPrivate && (
                                                                    <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400">
                                                                        AI
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground truncate">
                                                                {isPrivate ? (
                                                                    'AI Assistant • Private'
                                                                ) : isPublic ? (
                                                                    <>
                                                                        <div className="font-medium text-muted-foreground/80 mb-0.5">
                                                                            Connect with students • Share knowledge • Study together
                                                                        </div>
                                                                        <div>
                                                                            {chat.userCount} user{chat.userCount !== 1 ? 's' : ''} online
                                                                            {socketAvailableChats.find(c => c.chatId === chat.chatId)?.lastMessage && (
                                                                                <span className="ml-2">
                                                                                    • {socketAvailableChats.find(c => c.chatId === chat.chatId)?.lastMessage?.text.length > 30 
                                                                                        ? socketAvailableChats.find(c => c.chatId === chat.chatId)?.lastMessage?.text.substring(0, 30) + '...' 
                                                                                        : socketAvailableChats.find(c => c.chatId === chat.chatId)?.lastMessage?.text}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {chat.userCount} user{chat.userCount !== 1 ? 's' : ''} online
                                                                        {socketAvailableChats.find(c => c.chatId === chat.chatId)?.lastMessage && (
                                                                            <span className="ml-2">
                                                                                • {socketAvailableChats.find(c => c.chatId === chat.chatId)?.lastMessage?.text.length > 30 
                                                                                    ? socketAvailableChats.find(c => c.chatId === chat.chatId)?.lastMessage?.text.substring(0, 30) + '...' 
                                                                                    : socketAvailableChats.find(c => c.chatId === chat.chatId)?.lastMessage?.text}
                                                                            </span>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {unread > 0 && (
                                                            <div className="flex-shrink-0">
                                                                <span className="inline-flex items-center justify-center text-[10px] min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white font-medium">
                                                                    {unread > 9 ? '9+' : unread}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chat Content */}
                    <div className="flex-1 flex flex-col">
                        <Card className="flex-1 flex flex-col overflow-hidden relative">
                                <CardHeader className="pb-3 flex-shrink-0">
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5" />
                                        {currentTab === 'public-general-chat' ? 'Community' : 'General Chat'}
                                        <Badge variant="secondary" className="ml-auto mr-2">
                                            <Users className="h-3 w-3 mr-1" />
                                            All Users
                                        </Badge>
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
                                                {currentTab !== 'private-general-chat' && currentTab !== 'public-general-chat' && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete Chat
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden chat-container">
                    {/* New chat modal removed: chats are created via Upload Syllabus only */}
                                    <ScrollArea className="h-[calc(100vh-200px)] px-4" ref={scrollAreaRef}>
                                        <div className="space-y-6 pb-4 max-w-full overflow-hidden chat-message">
                                            {/* Welcome Card - only show for first message and if it's a welcome message */}
                                            {generalChat?.messages?.length === 1 && 
                                             generalChat.messages[0]?.sender === 'bot' && 
                                             generalChat.messages[0]?.text?.includes('Welcome') && (
                                                <WelcomeCard 
                                                    chatType={currentTab === 'public-general-chat' ? 'community' : 'general'}
                                                    onQuickAction={(action) => {
                                                        setInputValue(action);
                                                        // Focus on input after setting value
                                                        setTimeout(() => {
                                                            const input = document.querySelector('textarea[placeholder*="message"]') as HTMLTextAreaElement;
                                                            if (input) {
                                                                input.focus();
                                                                input.setSelectionRange(input.value.length, input.value.length);
                                                            }
                                                        }, 100);
                                                    }}
                                                />
                                            )}
                                            
                                            {generalChat?.messages?.map((message, index) => {
                                                // Handle system messages (join notifications)
                                                if (message.sender === 'system') {
                                                    return (
                                                        <JoinMessage 
                                                            key={`join-${message.id || `fallback-${index}-${message.timestamp}`}`}
                                                            message={message}
                                                        />
                                                    );
                                                }
                                                
                                                // Skip the welcome message - we show the interactive card instead
                                                if (message.sender === 'bot' && message.text?.includes('Welcome')) {
                                                    return null;
                                                }
                                                
                                                return (
                                                <div key={`msg-${message.id || `fallback-${index}-${message.timestamp}`}`} className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'} max-w-full`}>
                                                    <div className={`flex gap-3 max-w-[85%] min-w-0 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                        <Avatar className="w-8 h-8 flex-shrink-0">
                                                            {message.sender === 'user' && !isGuest && user?.photoURL ? (
                                                                <AvatarImage src={user.photoURL} />
                                                            ) : null}
                                                            <AvatarFallback className="text-xs">
                                                                {message.sender === 'user' ? (
                                                                    isGuest ? 'G' : (user?.displayName?.[0] || user?.email?.[0] || 'U')
                                                                ) : (
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
                                                                            <img src="/copy-icon.svg" alt="Copy" className="h-3 w-3" />
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
                                                                            
                                                                            // Only show math analysis if bot responded to a math question AND response contains math
                                                                            const shouldShowMathAnalysis = userAskedMathQuestion && 
                                                                                isMathOrPhysicsContent(typeof message.text === 'string' ? message.text : JSON.stringify(message.text));
                                                                            
                                                                            return shouldShowMathAnalysis ? (
                                                                                <InDepthAnalysis 
                                                                                    question={typeof message.text === 'string' ? message.text : JSON.stringify(message.text)}
                                                                                    conversationHistory={generalChat?.messages || []}
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

                                            {/* Real-time typing indicator - compact design */}
                                            {typingUsers.length > 0 && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                                    className="flex gap-2 justify-start max-w-full"
                                                >
                                                    <div className="flex gap-2 max-w-[85%] min-w-0 flex-row">
                                                        <Avatar className="w-6 h-6 flex-shrink-0">
                                                            <AvatarImage src="" />
                                                            <AvatarFallback className="bg-muted/50 text-muted-foreground text-xs">
                                                                <Users className="w-2.5 h-2.5" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="bg-muted/30 dark:bg-muted/20 rounded-lg px-2 py-1.5 border border-border/30">
                                                                <TypingIndicator users={typingUsers} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                    <div className="p-4 sm:p-6 flex-shrink-0 bg-background pb-safe">
                                        <EnhancedChatInput
                                            value={inputValue}
                                            onChange={(e) => {
                                                setInputValue(e.target.value);
                                                // Start typing indicator
                                                if (currentTab && e.target.value.length > 0) {
                                                    startTyping(currentTab);
                                                } else if (currentTab) {
                                                    stopTyping(currentTab);
                                                }
                                            }}
                                            onSend={handleSendMessage}
                                            onFileUpload={handleFileUpload}
                                        placeholder="Ask AI anything or chat with classmates"
                                            disabled={false}
                                            className="w-full"
                                            isPublicChat={currentTab === 'public-general-chat'}
                                            isClassChat={false}
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
        </>
    );
}
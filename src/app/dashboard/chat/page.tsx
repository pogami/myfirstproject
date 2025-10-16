"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isMathOrPhysicsContent } from '@/utils/math-detection';
import { AIResponse } from '@/components/ai-response';
import { MessageSquare, Users, MoreVertical, Download, RotateCcw, Upload, BookOpen, Trash2, Brain, Copy, Check, Globe, FileText } from "lucide-react";
import { useChatStore } from "@/hooks/use-chat-store";
import { useTextExtraction } from "@/hooks/use-text-extraction";
import { useSmartDocumentAnalysis } from "@/hooks/use-smart-document-analysis";
import { useFeatureFlags } from "@/hooks/use-feature-flags";
import { FeatureDisabled } from "@/components/feature-disabled";
import { auth, db } from "@/lib/firebase/client-simple";
import { doc, getDoc } from "firebase/firestore";
// Pusher removed - real-time features coming soon
// import { usePusherChat } from "@/hooks/use-pusher-chat";
import { TypingIndicator } from "@/components/typing-indicator";
import { OnlineUsersIndicator } from "@/components/online-users-indicator";

// Helper function to get guest display name from localStorage
const getGuestDisplayName = (): string => {
  if (typeof window === 'undefined') return 'Guest User';
  
  try {
    const guestUser = localStorage.getItem('guestUser');
    if (guestUser) {
      const parsed = JSON.parse(guestUser);
      return parsed.displayName || 'Guest User';
    }
  } catch (error) {
    console.warn('Failed to parse guest user from localStorage:', error);
  }
  
  return 'Guest User';
};

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Skeleton } from "@/components/ui/skeleton";
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
import { createWelcomeNotification, createAIResponseNotification, createStudyEncouragementNotification, createAssignmentReminderNotification, isFirstGuestVisit, markGuestAsVisited } from "@/lib/guest-notifications";
import { useNotifications } from "@/hooks/use-notifications";

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
        sendRealtimeMessage,
        startTyping,
        stopTyping
    } = useChatStore();
    const { isFeatureEnabled } = useFeatureFlags();
    const { createNotification } = useNotifications(null as any);
    const [inputValue, setInputValue] = useState("");
    const [deletedMessageIds, setDeletedMessageIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    // Animated analyzing steps for AI response while processing images/files
    const analyzingSteps = ["Analyzing...", "Extracting...", "Preparing response..."];
    const [analyzingStepIndex, setAnalyzingStepIndex] = useState(0);
    const [isMessagesLoading, setIsMessagesLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [isGuest, setIsGuest] = useState(false);
    const [userProfilePicture, setUserProfilePicture] = useState<string>("");
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

    // Auto-create welcome notification for guests on first visit
    useEffect(() => {
        if (isGuest && isFirstGuestVisit()) {
            createWelcomeNotification();
            markGuestAsVisited();
        }
    }, [isGuest]);

    // Track if user is away from chat to create AI response notifications
    const [isUserAway, setIsUserAway] = useState(false);
    const [lastAIMessageTime, setLastAIMessageTime] = useState<number>(0);
    
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsUserAway(document.hidden);
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // Monitor AI responses and create notifications when user is away
    useEffect(() => {
        const currentChat = chats[currentTab || 'private-general-chat'];
        if (!currentChat?.messages) return;
        
        const aiMessages = currentChat.messages.filter(msg => msg.sender === 'ai');
        if (aiMessages.length > 0) {
            const latestAIMessage = aiMessages[aiMessages.length - 1];
            const messageTime = latestAIMessage.timestamp || Date.now();
            
            // If AI responded and user was away, create notification
            if (messageTime > lastAIMessageTime && isUserAway) {
                if (isGuest) {
                  createAIResponseNotification();
                } else {
                  // Logged-in: create Firestore notification
                  createNotification({
                    title: 'New message from AI',
                    description: 'Your AI assistant has replied while you were away.',
                    type: 'message',
                    priority: 'low',
                  } as any);
                }
                setLastAIMessageTime(messageTime);
            }
        }
    }, [chats, currentTab, isGuest, isUserAway, lastAIMessageTime, createNotification]);

    // Create study encouragement notifications based on class chats
    useEffect(() => {
        const classChats = Object.values(chats).filter(chat => chat.chatType === 'class');
        if (classChats.length === 0) return;

        const classNames = classChats.map(chat => chat.courseData?.courseName || 'Unknown Course').filter(Boolean);
        
        // Create study encouragement notification for guests
        if (isGuest) {
            // Check if enough time has passed since last study reminder (5 minutes)
            const lastStudyReminder = localStorage.getItem('last-study-reminder');
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;
            
            if (!lastStudyReminder || (now - parseInt(lastStudyReminder)) > fiveMinutes) {
                // 40% chance to create study reminder
                const shouldCreateReminder = Math.random() < 0.4;
                if (shouldCreateReminder) {
                    createStudyEncouragementNotification(classNames);
                    localStorage.setItem('last-study-reminder', now.toString());
                }
            }
        }
        
        // For logged-in users, we could add similar logic here
        // but we'd need to use the useNotifications hook
    }, [chats, isGuest]);

    // Pusher integration disabled - real-time features coming soon
    const pusherConnected = false;
    const pusherActiveUsers: any[] = [];
    const pusherTypingUsers: any[] = [];
    const pusherIsAiThinking = false;
    const pusherAvailableChats: any[] = [];
    const pusherSendMessage = () => {};
    const pusherStartTyping = () => {};
    const pusherStopTyping = () => {};
    const joinChat = () => {};
    const leaveChat = () => {};

    // Debug user state changes
    // Force sidebar re-render ONLY when chat count changes (not on every message)
    const chatCount = Object.keys(chats).length;
    const prevChatCountRef = useRef(chatCount);
    
    useEffect(() => {
        if (chatCount !== prevChatCountRef.current) {
            prevChatCountRef.current = chatCount;
            setForceLoad(prev => !prev);
        }
    }, [chatCount]);

    // Loading state for messages
    useEffect(() => {
        // Show skeleton loading when chat changes
        setIsMessagesLoading(true);
        const timer = setTimeout(() => {
            setIsMessagesLoading(false);
        }, 500); // Short delay for smooth loading
        return () => clearTimeout(timer);
    }, [currentTab]);

    useEffect(() => {
        console.log('User state changed:', { 
            user: user ? { uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL } : null,
            userName: user?.displayName || user?.email || 'Guest User',
            userPhotoURL: user?.photoURL
        });
    }, [user]);

    // Debug Pusher state - disabled (real-time features coming soon)
    // useEffect(() => {
    //     console.log('Pusher state changed:', {
    //         isConnected: pusherConnected,
    //         activeUsers: pusherActiveUsers.length,
    //         typingUsers: pusherTypingUsers.length,
    //         isAiThinking: pusherIsAiThinking,
    //         currentTab
    //     });
    // }, [pusherConnected, pusherActiveUsers, pusherTypingUsers, pusherIsAiThinking, currentTab]);

    // Track if we're in a reset operation
    const isResettingRef = useRef(false);
    
    // Immediate fallback to set currentTab if undefined (only on initial load, not during reset)
    useEffect(() => {
        if (!currentTab && !isStoreLoading && Object.keys(chats).length > 0 && !isResettingRef.current) {
            console.log('Immediate fallback: Setting currentTab to public-general-chat');
            setCurrentTab('public-general-chat');
        }
    }, [currentTab, isStoreLoading, setCurrentTab, chats]);

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

    // Pusher state is managed directly by the usePusherChat hook

    // Initialize general chats when component mounts
    useEffect(() => {
        initializeGeneralChats();
    }, [initializeGeneralChats]);

    // Handle URL parameters for specific chat tabs (only on initial load)
    const urlProcessedRef = useRef(false);
    useEffect(() => {
        // Only process URL parameters once on initial load
        if (urlProcessedRef.current) return;
        
        const tabParam = searchParams.get('tab');
        const chatIdParam = searchParams.get('chatId');
        const targetChatId = chatIdParam || tabParam;
        
        if (targetChatId && !isStoreLoading) {
            urlProcessedRef.current = true;
            console.log('URL parameter found (initial load):', { tabParam, chatIdParam, targetChatId });
            if (chats[targetChatId]) {
                console.log('Chat exists, switching to:', targetChatId);
                setCurrentTab(targetChatId);
                try { localStorage.setItem('cc-active-tab', targetChatId); } catch {}
            } else {
                console.log('Chat not found, waiting for it to be created:', targetChatId);
                const start = Date.now();
                const interval = setInterval(() => {
                    if (chats[targetChatId] || Date.now() - start > 5000) {
                        if (chats[targetChatId]) {
                            console.log('Chat created, switching to:', targetChatId);
                            setCurrentTab(targetChatId);
                            try { localStorage.setItem('cc-active-tab', targetChatId); } catch {}
                        } else {
                            console.log('Chat creation timeout, staying on current tab');
                        }
                        clearInterval(interval);
                    }
                }, 150);
                return () => clearInterval(interval);
            }
        } else if (!targetChatId && !isStoreLoading) {
            // No URL parameter, mark as processed
            urlProcessedRef.current = true;
        }
    }, [searchParams, chats, setCurrentTab, isStoreLoading]);

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
                    async (user: any) => {
                        setUser(user);
                        // Check if user is guest/anonymous
                        setIsGuest(user?.isAnonymous || user?.isGuest || false);
                        
                        // Load profile picture from Firestore for authenticated users
                        if (user && !user.isGuest && !user.isAnonymous) {
                            try {
                                const userDocRef = doc(db, "users", user.uid);
                                const userDocSnap = await getDoc(userDocRef);
                                if (userDocSnap.exists()) {
                                    const userData = userDocSnap.data();
                                    if (userData.profilePicture) {
                                        setUserProfilePicture(userData.profilePicture);
                                    }
                                }
                            } catch (error) {
                                console.error("Error loading profile picture:", error);
                            }
                        } else if (user && (user.isGuest || user.isAnonymous)) {
                            // Load profile picture from localStorage for guest users
                            try {
                                const guestData = localStorage.getItem('guestUser');
                                if (guestData) {
                                    const parsed = JSON.parse(guestData);
                                    if (parsed.profilePicture) {
                                        setUserProfilePicture(parsed.profilePicture);
                                    }
                                }
                            } catch (error) {
                                console.error("Error loading guest profile picture:", error);
                            }
                        } else {
                            setUserProfilePicture("");
                        }
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

    // Listen for profile picture changes
    useEffect(() => {
        const handleProfilePictureChange = (event: CustomEvent) => {
            const { profilePicture } = event.detail;
            if (profilePicture) {
                setUserProfilePicture(profilePicture);
            }
        };

        window.addEventListener('profilePictureChanged', handleProfilePictureChange as EventListener);
        
        return () => {
            window.removeEventListener('profilePictureChanged', handleProfilePictureChange as EventListener);
        };
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
            if (isStoreLoading || !currentTab) {
                console.log('ChatPage - Force loading after timeout, currentTab:', currentTab);
                setForceLoad(true);
                // Also initialize auth listener as fallback
                try {
                    initializeAuthListener();
                } catch (error) {
                    console.warn('Failed to initialize auth listener as fallback:', error);
                }
                
                // Force set currentTab if it's undefined
                if (!currentTab) {
                    console.log('Force setting currentTab to public-general-chat');
                    setCurrentTab('public-general-chat');
                }
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [isStoreLoading, currentTab, initializeAuthListener, setCurrentTab]);

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
        const isPublicChat = currentChat?.chatType === 'public';
        const isClassChat = currentChat?.chatType === 'class';

        // Check if AI chat is disabled
        if (!isFeatureEnabled('aiChat') && shouldCallAI) {
            const userMessage = {
                id: generateMessageId(),
                text: messageText,
                sender: 'user' as const,
                name: user?.displayName || 'Anonymous',
                userId: user?.uid || 'guest',
                timestamp: Date.now(),
            };
            
            const botMessage = {
                id: `system-${Date.now()}`,
                text: "⚠️ **AI Chat is Currently Unavailable**\n\nOur AI assistant is temporarily disabled for maintenance. We're working to bring it back online as soon as possible.\n\nPlease check back later. Thank you for your patience! 🛠️",
                sender: 'bot' as const,
                name: 'System',
                timestamp: Date.now(),
            };
            
            addMessage(currentTab || 'private-general-chat', userMessage);
            setTimeout(() => {
                addMessage(currentTab || 'private-general-chat', botMessage);
            }, 300);
            
            setInputValue('');
            return;
        }

        // Check if community chat is disabled
        if (!isFeatureEnabled('communityChat') && isPublicChat) {
            const userMessage = {
                id: generateMessageId(),
                text: messageText,
                sender: 'user' as const,
                name: user?.displayName || 'Anonymous',
                userId: user?.uid || 'guest',
                timestamp: Date.now(),
            };
            
            const botMessage = {
                id: `system-${Date.now()}`,
                text: "⚠️ **Community Chat is Currently Unavailable**\n\nCommunity chat is temporarily disabled for maintenance. We're working to restore it as soon as possible.\n\nPlease try again later. Thank you for your understanding! 🛠️",
                sender: 'bot' as const,
                name: 'System',
                timestamp: Date.now(),
            };
            
            addMessage(currentTab || 'private-general-chat', userMessage);
            setTimeout(() => {
                addMessage(currentTab || 'private-general-chat', botMessage);
            }, 300);
            
            setInputValue('');
            return;
        }

        // Determine if this message mentions AI
        const hasAIMention = messageText.includes('@ai') || messageText.includes('@AI');
        
        // For public chats, only call AI if explicitly mentioned
        // For class chats (syllabus-based), always call AI
        // For private chats, use shouldCallAI setting
        const shouldCallAIFinal = isClassChat ? true : (isPublicChat ? hasAIMention : shouldCallAI);

        console.log('Chat type detection:', {
            chatType: currentChat?.chatType,
            isClassChat,
            isPublicChat,
            hasAIMention,
            shouldCallAIFinal,
            message: messageText.substring(0, 50)
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

        // Stop typing indicator when message is sent
        if (currentTab) {
            pusherStopTyping();
        }

        // Set loading state immediately for instant thinking animation
        if (shouldCallAIFinal) {
            console.log('Setting isLoading to true for message:', messageText);
            setIsLoading(true);
        }

        // Send message via Pusher for real-time broadcasting (this will update other tabs)
        pusherSendMessage(userMessage);

        // Add user message immediately for instant UI response (non-blocking)
        addMessage(currentTab || 'private-general-chat', userMessage).catch(console.error);

        // Only get AI response if appropriate
        if (shouldCallAIFinal) {
            try {
                // Get AI response via API call with enhanced error handling
                let aiResponse;
                try {
                    // Determine if this is a class chat and use appropriate endpoint
                    const apiEndpoint = isClassChat ? '/api/chat/class' : '/api/chat';
                    console.log(`Making API call to ${apiEndpoint}...`, { isClassChat, hasCourseData: !!currentChat?.courseData });
                    
                    // Get userId from logged-in user (notifications only work for authenticated users)
                    const effectiveUserId = user?.uid;
                    
                    const requestBody: any = {
                            question: messageText,
                            context: currentChat?.title || 'General Chat',
                            conversationHistory: currentChat?.messages?.slice(-10).map(msg => ({
                                role: msg.sender === 'user' ? 'user' : 'assistant',
                                content: typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)
                            })) || [],
                            shouldCallAI: shouldCallAIFinal,
                        isPublicChat: isPublicChat, // Only true for community chat, not class chats
                        userId: effectiveUserId, // Add userId for notification (works for both guest and logged-in users)
                        chatId: currentTab, // Add chatId for notification
                        chatTitle: currentChat?.title // Add chatTitle for notification
                    };

                    // Add course data for class chats
                    if (isClassChat && currentChat?.courseData) {
                        requestBody.courseData = currentChat.courseData;
                        requestBody.chatId = currentTab;
                        requestBody.metadata = currentChat.metadata; // Send metadata for persistent memory
                        console.log('Including course data:', {
                            courseName: currentChat.courseData.courseName,
                            courseCode: currentChat.courseData.courseCode,
                            hasMetadata: !!currentChat.metadata
                        });
                    }
                    
                    // For General Chat: Include ALL syllabi from all class chats
                    if (currentTab === 'private-general-chat') {
                        const allClassChats = Object.values(chats).filter(chat => chat.chatType === 'class' && chat.courseData);
                        if (allClassChats.length > 0) {
                            requestBody.allSyllabi = allClassChats.map(chat => ({
                                courseName: chat.courseData?.courseName || chat.title,
                                courseCode: chat.courseData?.courseCode,
                                professor: chat.courseData?.professor,
                                description: chat.courseData?.description,
                                topics: chat.courseData?.topics,
                                exams: chat.courseData?.exams,
                                assignments: chat.courseData?.assignments,
                                gradingPolicy: chat.courseData?.gradingPolicy,
                                officeHours: chat.courseData?.officeHours
                            }));
                            console.log('General Chat: Including ALL syllabi from', allClassChats.length, 'class chats');
                        }
                    }
                    
                    const response = await fetch(apiEndpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'User-Agent': 'CourseConnect-Client/1.0',
                        },
                        body: JSON.stringify(requestBody),
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
                        sources: data.sources,
                        metadata: data.metadata
                    });
                    
                    // Track conversation metadata for class chats
                    if (isClassChat && data.metadata && currentTab) {
                        const currentMetadata = currentChat.metadata || {};
                        
                        // Update topics covered
                        const existingTopics = currentMetadata.topicsCovered || [];
                        const newTopics = data.metadata.topicsCovered || [];
                        const mergedTopics = Array.from(new Set([...existingTopics, ...newTopics]));
                        
                        // Update complexity level
                        const updatedMetadata = {
                            ...currentMetadata,
                            topicsCovered: mergedTopics,
                            questionComplexityLevel: data.metadata.questionComplexity || currentMetadata.questionComplexityLevel,
                            // Add struggling topics if confusion detected
                            strugglingWith: data.metadata.isConfused && newTopics.length > 0
                                ? Array.from(new Set([...(currentMetadata.strugglingWith || []), ...newTopics]))
                                : currentMetadata.strugglingWith
                        };
                        
                        // Update chat metadata in store (this would need to be persisted to Firebase in production)
                        console.log('Updated conversation metadata:', updatedMetadata);
                    }
                    
                    aiResponse = data;
                } catch (apiError) {
                    console.warn("API call failed, using enhanced fallback:", apiError);
                    
                    // Enhanced fallback based on error type
                    let fallbackMessage = "I'm having some trouble connecting right now, but don't worry! 🤔\n\n**Here's what you can do:**\n\n📚 Review your syllabus and course materials in the sidebar\n📝 Check your upcoming assignments and exam dates\n🔍 Browse through your course topics\n⏰ Try asking me again in a moment\n\nI'll be back up and running soon!";
                    
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
                text: `**📄 Document Analysis: ${fileName}**\n\n${result.summary || 'Analysis completed successfully.'}\n\n*Document content loaded - ask me anything about it!*`,
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
        try {
            // Check if the file is an image
            const isImage = file.type.startsWith('image/');
            const fileUrl = URL.createObjectURL(file);
            
            // Get the user's message text (if any)
            const userText = inputValue.trim();

            // Create message with both image and text
            const uploadMessage = {
                id: generateMessageId(),
                text: userText, // Include user's typed message
                sender: 'user' as const,
                name: user?.displayName || 'Anonymous',
                timestamp: Date.now(),
                file: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    url: fileUrl
                }
            };

            // Clear input field
            setInputValue('');

            // Add upload message immediately (non-blocking)
            await addMessage(currentTab || 'private-general-chat', uploadMessage);

            // Handle image files with GPT-4o Vision
            if (isImage) {
                // Show loading state only for AI analysis
                setIsLoading(true);
                
                // Convert image to base64
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const base64Image = e.target?.result as string;
                        const base64Data = base64Image.split(',')[1]; // Remove data:image/...;base64, prefix

                        console.log('🖼️ Analyzing image...');

                        // Use user's text as prompt if provided, otherwise use default
                        const analysisPrompt = userText || 'Solve this problem or explain what is shown. Use LaTeX for all math.';

                        // Call vision API
                        const response = await fetch('/api/chat/vision', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                message: analysisPrompt,
                                image: base64Data,
                                mimeType: file.type,
                            }),
                        });

                        if (!response.ok) {
                            throw new Error('Vision API request failed');
                        }

                        const data = await response.json();
                        console.log('✅ Analysis complete!');

                        // Add AI response message
                        const analysisMessage = {
                            id: generateMessageId(),
                            text: data.response,
                            sender: 'bot' as const,
                            name: 'CourseConnect AI',
                            timestamp: Date.now()
                        };
                        await addMessage(currentTab || 'private-general-chat', analysisMessage);

                    } catch (error) {
                        console.error('🚨 Analysis error:', error);
                        const errorMessage = {
                            id: generateMessageId(),
                            text: `❌ **Analysis Failed**\n\nSorry, I couldn't analyze this image. Please try again.`,
                            sender: 'bot' as const,
                            name: 'CourseConnect AI',
                            timestamp: Date.now()
                        };
                        await addMessage(currentTab || 'private-general-chat', errorMessage);
                    } finally {
                        setIsLoading(false);
                    }
                };
                reader.readAsDataURL(file);
            } else {
                // Use smart document analysis for non-image files
                setIsLoading(true);
            await analyzeDocument(file);
                setIsLoading(false);
            }

        } catch (error) {
            console.error('File upload error:', error);
            toast({
                title: "Upload failed",
                description: "There was an error uploading your file. Please try again.",
                variant: "destructive",
            });
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
        
        const chatToReset = currentTab || 'private-general-chat';
        
        try {
            // Set flag to prevent any navigation during reset
            isResettingRef.current = true;
            
            // Store current tab to ensure it doesn't change
            const preservedTab = chatToReset;
            
            console.log('🔄 RESET CHAT STARTED:', chatToReset);
            console.log('🔄 Messages before reset:', chats[chatToReset]?.messages?.length || 0);
            console.log('🔄 Setting reset flag to prevent navigation');
            
            // Force set currentTab BEFORE reset to lock it in place
            setCurrentTab(preservedTab);
            
            await resetChat(chatToReset);
            
            console.log('🔄 RESET CHAT COMPLETED');
            console.log('🔄 Messages after reset:', chats[chatToReset]?.messages?.length || 0);
            
            // Force currentTab again after reset
            setCurrentTab(preservedTab);
            
            // Save to localStorage explicitly multiple times to ensure it sticks
            try {
                localStorage.setItem('cc-active-tab', preservedTab);
                console.log('🔄 Saved active tab to localStorage:', preservedTab);
            } catch {}
            
            // Wait for state to settle, then clear the flag
            setTimeout(() => {
                isResettingRef.current = false;
                console.log('🔄 Reset flag cleared');
                
                // Final check - if somehow tab changed, force it back
                if (currentTab !== preservedTab) {
                    console.log('🔄 Final tab restore to:', preservedTab);
                    setCurrentTab(preservedTab);
                }
            }, 1000);
            
            toast({
                title: "Chat Reset",
                description: "Chat has been reset to its initial state.",
            });
            
            // Scroll to top to show welcome message
            setTimeout(() => {
                if (messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        } catch (error) {
            isResettingRef.current = false;
            console.error('❌ Reset chat error:', error);
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
    // console.log('ChatPage - Pusher state:', { isConnected: pusherConnected, activeUsers: pusherActiveUsers.length, typingUsers: pusherTypingUsers.length, isAiThinking: pusherIsAiThinking });

    // Show loading state while chat store is initializing (but not if force loaded)
    if (isStoreLoading && !forceLoad) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted border-t-primary mx-auto mb-4"></div>
                    <h2 className="text-lg font-semibold mb-2">Loading Chat</h2>
                    <p className="text-sm text-muted-foreground mb-4">Please wait while we prepare your chat</p>
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
                                Get AI help with your coursework (Student collaboration coming soon)
                            </p>
                        </div>
                        {/* Real-time status indicator */}
                        {currentTab === 'public-general-chat' && (
                            <OnlineUsersIndicator 
                                users={pusherActiveUsers}
                                isConnected={pusherConnected}
                                showAvatars={true}
                                maxVisible={5}
                            />
                        )}
                    </div>
                </div>


                {/* Chat Interface with Sidebar */}
                <div className="w-full flex-1 flex gap-4">
                    {/* Chat Sidebar */}
                    <div className="w-64 flex-shrink-0 chat-sidebar">
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
                                                }
                                                // Community chat hidden
                                                // {
                                                //     chatId: 'public-general-chat',
                                                //     title: (typeof window !== 'undefined' && 
                                                //            (window.location.hostname === 'localhost' || 
                                                //             localStorage.getItem('dev-mode') === 'true'))
                                                //            ? 'Community (Dev Mode)' 
                                                //            : 'Community (Coming Soon)',
                                                //     userCount: 0,
                                                //     isActive: true,
                                                //     isPermanent: true,
                                                //     disabled: !(typeof window !== 'undefined' && 
                                                //                (window.location.hostname === 'localhost' || 
                                                //                 localStorage.getItem('dev-mode') === 'true'))
                                                // }
                                            ];

                                            // Get other active chats from pusher
                                            const otherChats = pusherAvailableChats
                                                .filter(chat => chat.isActive && !chat.chatId.includes('general-chat'))
                                                .sort((a, b) => {
                                                    // Sort by user count (descending), then by title
                                                    if (a.userCount !== b.userCount) {
                                                        return b.userCount - a.userCount;
                                                    }
                                                    return a.title.localeCompare(b.title);
                                                });

                                            // Get local class chats that aren't in pusher chats yet
                                            console.log('🔍 SIDEBAR: All chats:', Object.keys(chats));
                                            console.log('🔍 SIDEBAR: Chats with details:', Object.entries(chats).map(([id, chat]) => ({
                                                id,
                                                title: chat.title,
                                                chatType: chat.chatType,
                                                hasCourseData: !!chat.courseData
                                            })));
                                            
                                            const localClassChats = Object.values(chats)
                                                .filter(chat => {
                                                    // Show if it has courseData (it's a class chat) OR if chatType is 'class'
                                                    const isClass = chat.chatType === 'class' || !!chat.courseData;
                                                    const notInPusher = !otherChats.some(pusherChat => pusherChat.chatId === chat.id);
                                                    const notGeneralChat = chat.id !== 'private-general-chat' && 
                                                                          chat.id !== 'public-general-chat' &&
                                                                          chat.id !== 'private-general-chat-guest' &&
                                                                          !chat.id.includes('private-general-chat-');
                                                    
                                                    console.log(`🔍 SIDEBAR: Chat "${chat.title}" (${chat.id}):`);
                                                    console.log(`  chatType: "${chat.chatType}", hasCourseData: ${!!chat.courseData}`);
                                                    console.log(`  ✓ isClass: ${isClass}`);
                                                    console.log(`  ✓ notInPusher: ${notInPusher}`);
                                                    console.log(`  ✓ notGeneralChat: ${notGeneralChat}`);
                                                    console.log(`  ➡️ SHOULD SHOW: ${isClass && notInPusher && notGeneralChat}`);
                                                    
                                                    return isClass && notInPusher && notGeneralChat;
                                                })
                                                .map(chat => ({
                                                    chatId: chat.id,
                                                    title: chat.title,
                                                    userCount: 1,
                                                    isActive: true,
                                                    isPermanent: false
                                                }))
                                                .sort((a, b) => a.title.localeCompare(b.title));
                                            
                                            console.log('🔍 SIDEBAR: Local class chats filtered:', localClassChats);


                                            // Combine permanent chats with other chats and local class chats
                                            const allChats = [...permanentChats, ...otherChats, ...localClassChats];

                                            return allChats.map(chat => {
                                                const isPublic = chat.chatId === 'public-general-chat';
                                                const isPrivate = chat.chatId === 'private-general-chat';
                                                const unread = unreadById[chat.chatId] ?? 0;
                                                const isActive = currentTab === chat.chatId;
                                                
                                                // Determine category and color for class chats
                                                const getCategory = (title: string) => {
                                                    const lowerTitle = title.toLowerCase();
                                                    if (lowerTitle.includes('music') || lowerTitle.includes('mua')) return { name: 'Music', color: 'purple' };
                                                    if (lowerTitle.includes('math') || lowerTitle.includes('calculus') || lowerTitle.includes('algebra') || lowerTitle.includes('geometry')) return { name: 'Math', color: 'blue' };
                                                    if (lowerTitle.includes('english') || lowerTitle.includes('literature') || lowerTitle.includes('writing') || lowerTitle.includes('eng')) return { name: 'English', color: 'pink' };
                                                    if (lowerTitle.includes('science') || lowerTitle.includes('biology') || lowerTitle.includes('chemistry') || lowerTitle.includes('physics')) return { name: 'Science', color: 'green' };
                                                    if (lowerTitle.includes('history') || lowerTitle.includes('social') || lowerTitle.includes('hist')) return { name: 'History', color: 'amber' };
                                                    if (lowerTitle.includes('art') || lowerTitle.includes('design') || lowerTitle.includes('drawing')) return { name: 'Art', color: 'rose' };
                                                    if (lowerTitle.includes('computer') || lowerTitle.includes('coding') || lowerTitle.includes('programming') || lowerTitle.includes('cs')) return { name: 'Tech', color: 'cyan' };
                                                    return { name: 'Class', color: 'slate' };
                                                };
                                                
                                                const isClassChat = !isPublic && !isPrivate;
                                                const category = isClassChat ? getCategory(chat.title) : null;
                                                
                                                const getCategoryColorClasses = (color: string) => {
                                                    const colors: Record<string, string> = {
                                                        purple: 'bg-purple-500/20 text-purple-700 dark:bg-purple-500/30 dark:text-purple-300 border border-purple-500/30',
                                                        blue: 'bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-300 border border-blue-500/30',
                                                        pink: 'bg-pink-500/20 text-pink-700 dark:bg-pink-500/30 dark:text-pink-300 border border-pink-500/30',
                                                        green: 'bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-300 border border-green-500/30',
                                                        amber: 'bg-amber-500/20 text-amber-700 dark:bg-amber-500/30 dark:text-amber-300 border border-amber-500/30',
                                                        rose: 'bg-rose-500/20 text-rose-700 dark:bg-rose-500/30 dark:text-rose-300 border border-rose-500/30',
                                                        cyan: 'bg-cyan-500/20 text-cyan-700 dark:bg-cyan-500/30 dark:text-cyan-300 border border-cyan-500/30',
                                                        slate: 'bg-slate-500/20 text-slate-700 dark:bg-slate-500/30 dark:text-slate-300 border border-slate-500/30'
                                                    };
                                                    return colors[color] || colors.slate;
                                                };
                                                
                                                return (
                                                    <button
                                                        key={chat.chatId}
                                                        onClick={() => { 
                                                            setCurrentTab(chat.chatId); 
                                                            try { localStorage.setItem('cc-active-tab', chat.chatId); } catch {} 
                                                        }}
                                                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 !bg-transparent ${
                                                            isActive 
                                                                ? 'border-2 border-dotted border-blue-500 dark:border-blue-400' 
                                                                : 'border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-700'
                                                        }`}
                                                        style={{ background: 'transparent !important' }}
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
                                                                    <span className="inline-flex items-center text-[10px] px-2 py-1 rounded-md font-semibold bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/30 dark:text-emerald-300 border border-emerald-500/30">
                                                                        Live
                                                                    </span>
                                                                )}
                                                                {isPrivate && (
                                                                    <span className="inline-flex items-center text-[10px] px-2 py-1 rounded-md font-semibold bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-300 border border-blue-500/30">
                                                                        AI
                                                                    </span>
                                                                )}
                                                                {category && (
                                                                    <span className={`inline-flex items-center text-[10px] px-2 py-1 rounded-md font-semibold ${getCategoryColorClasses(category.color)}`}>
                                                                        {category.name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs truncate text-muted-foreground">
                                                                {isPrivate ? (
                                                                    'AI Assistant • Private'
                                                                ) : isPublic ? (
                                                                    <>
                                                                        <div className="font-medium mb-0.5 text-muted-foreground/80">
                                                                            Connect with students • Share knowledge • Study together
                                                                        </div>
                                                                        <div>
                                                                            {chat.userCount} user{chat.userCount !== 1 ? 's' : ''} online
                                                                            {pusherAvailableChats.find((c: any) => c.chatId === chat.chatId)?.lastMessage && (
                                                                                <span className="ml-2">
                                                                                    • {pusherAvailableChats.find((c: any) => c.chatId === chat.chatId)?.lastMessage?.text.length > 30 
                                                                                        ? pusherAvailableChats.find((c: any) => c.chatId === chat.chatId)?.lastMessage?.text.substring(0, 30) + '...' 
                                                                                        : pusherAvailableChats.find((c: any) => c.chatId === chat.chatId)?.lastMessage?.text}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {chat.userCount} user{chat.userCount !== 1 ? 's' : ''} online
                                                                        {pusherAvailableChats.find((c: any) => c.chatId === chat.chatId)?.lastMessage && (
                                                                            <span className="ml-2">
                                                                                • {pusherAvailableChats.find((c: any) => c.chatId === chat.chatId)?.lastMessage?.text.length > 30 
                                                                                    ? pusherAvailableChats.find((c: any) => c.chatId === chat.chatId)?.lastMessage?.text.substring(0, 30) + '...' 
                                                                                    : pusherAvailableChats.find((c: any) => c.chatId === chat.chatId)?.lastMessage?.text}
                                                                            </span>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {unread > 0 && (
                                                            <div className="flex-shrink-0">
                                                                <span className="inline-flex items-center justify-center text-[10px] min-w-[18px] h-[18px] px-1 rounded-full bg-white text-red-600 font-extrabold shadow-lg border-2 border-red-600 dark:bg-red-500 dark:text-white dark:border-red-500">
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
                                        {currentTab === 'public-general-chat' 
                                            ? 'Community' 
                                            : currentTab === 'private-general-chat' 
                                            ? 'General Chat' 
                                            : (currentTab && chats[currentTab]?.title) || 'Chat'}
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
                                                {!currentChat?.disabled && (
                                                <DropdownMenuItem onClick={() => setShowResetDialog(true)}>
                                                    <RotateCcw className="h-4 w-4 mr-2" />
                                                    Reset Chat
                                                </DropdownMenuItem>
                                                )}
                                                {currentTab !== 'private-general-chat' && currentTab !== 'private-general-chat-guest' && !currentTab?.startsWith('private-general-chat-') && currentTab !== 'public-general-chat' && (
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
                                            {/* Skeleton Loading */}
                                            {isMessagesLoading ? (
                                                <div className="space-y-6 py-4">
                                                    {/* Bot Message Skeleton */}
                                                    <div className="flex gap-3 items-start">
                                                        <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                                                        <div className="flex-1 space-y-2">
                                                            <Skeleton className="h-4 w-24" />
                                                            <div className="space-y-2">
                                                                <Skeleton className="h-4 w-full" />
                                                                <Skeleton className="h-4 w-[90%]" />
                                                                <Skeleton className="h-4 w-[80%]" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* User Message Skeleton */}
                                                    <div className="flex gap-3 items-start justify-end">
                                                        <div className="flex-1 space-y-2 flex flex-col items-end">
                                                            <Skeleton className="h-4 w-24" />
                                                            <Skeleton className="h-16 w-[60%]" />
                                                        </div>
                                                        <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                                                    </div>
                                                    {/* Bot Message Skeleton */}
                                                    <div className="flex gap-3 items-start">
                                                        <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                                                        <div className="flex-1 space-y-2">
                                                            <Skeleton className="h-4 w-24" />
                                                            <div className="space-y-2">
                                                                <Skeleton className="h-4 w-full" />
                                                                <Skeleton className="h-4 w-[95%]" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
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
                                                const messageKey = message.id || `fallback-${index}-${message.timestamp}`;
                                                if (deletedMessageIds.has(messageKey)) {
                                                    return (
                                                        <div key={`msg-${messageKey}`} className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'} max-w-full`}>
                                                            <div className={`flex gap-3 ${message.sender === 'user' ? 'max-w-[70%]' : 'max-w-[90%]'} min-w-0 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                                {message.sender === 'bot' ? (
                                                                    <img src="/favicon-32x32.png" alt="AI" className="w-8 h-8 flex-shrink-0 object-contain" />
                                                                ) : (
                                                                    <Avatar className="w-8 h-8 flex-shrink-0">
                                                                        {message.sender === 'user' && !isGuest && userProfilePicture ? (
                                                                            <AvatarImage src={userProfilePicture} />
                                                                        ) : null}
                                                                        <AvatarFallback className="text-xs">
                                                                            {message.sender === 'user' ? (
                                                                                isGuest ? 'G' : (user?.displayName?.[0] || user?.email?.[0] || 'U')
                                                                            ) : null}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                )}
                                                                <div className={`${message.sender === 'user' ? 'text-right' : 'text-left'} min-w-0`}>
                                                                    <div className="bg-muted/30 border border-border/50 rounded-2xl px-3 py-2 text-xs italic text-muted-foreground">
                                                                        You deleted this message
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                // Handle system messages (join notifications)
                                                if (message.sender === 'system') {
                                                    return (
                                                        <JoinMessage 
                                                            key={`join-${messageKey}`}
                                                            message={message}
                                                        />
                                                    );
                                                }
                                                
                                                // Skip the welcome message - we show the interactive card instead
                                                if (message.sender === 'bot' && message.text?.includes('Welcome')) {
                                                    return null;
                                                }
                                                
                                                return (
                                                <div key={`msg-${messageKey}`} className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'} max-w-full`}>
                                                    <div className={`flex gap-3 ${message.sender === 'user' ? 'max-w-[70%]' : 'max-w-[90%]'} min-w-0 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                        {message.sender === 'bot' ? (
                                                            <img src="/favicon-32x32.png" alt="AI" className="w-8 h-8 flex-shrink-0 object-contain" />
                                                        ) : (
                                                            <Avatar className="w-8 h-8 flex-shrink-0">
                                                                {message.sender === 'user' && !isGuest && userProfilePicture ? (
                                                                    <AvatarImage src={userProfilePicture} />
                                                                ) : null}
                                                                <AvatarFallback className="text-xs">
                                                                    {message.sender === 'user' ? (
                                                                        isGuest ? 'G' : (user?.displayName?.[0] || user?.email?.[0] || 'U')
                                                                    ) : null}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        )}
                                                        {message.sender === 'user' ? (
                                                            <ContextMenu>
                                                            <ContextMenuTrigger asChild>
                                                            <div className="text-right min-w-0 group">
                                                                <div className="flex items-center justify-end gap-2 mb-1">
                                                                    <MessageTimestamp timestamp={message.timestamp} />
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {message.name}
                                                                    </div>
                                                                </div>
                                                                {/* Show file preview and/or text bubble */}
                                                                <div className="flex flex-col items-end gap-2">
                                                                    {/* Show file(s) preview if exists */}
                                                                    {((message as any).files || (message as any).file) && (
                                                                        <div className="grid grid-cols-2 gap-2 max-w-sm">
                                                                            {/* Support old single-file shape */}
                                                                            {((message as any).files || [(message as any).file]).filter(Boolean).map((f: any, idx: number) => (
                                                                                <div key={idx} className="relative rounded-xl overflow-hidden shadow-md border border-primary/20">
                                                                                    {f.type?.startsWith('image/') ? (
                                                                                        <img src={f.url} alt={f.name} className="w-full h-32 object-cover" />
                                                                                    ) : (
                                                                                        <div className="px-3 py-2 flex items-center gap-2 text-xs bg-primary/10">
                                                                                            <FileText className="h-4 w-4 text-primary" />
                                                                                            <span className="font-medium truncate">{f.name}</span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    {/* Show text bubble if text exists */}
                                                                    {message.text && message.text.trim() && (
                                                                        <div className="relative inline-block bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-br-md max-w-full overflow-hidden user-message-bubble shadow-md">
                                                                            <ExpandableUserMessage 
                                                                                content={typeof message.text === 'string' ? message.text : JSON.stringify(message.text)}
                                                                                className="text-primary-foreground"
                                                                            />
                                                                            {/* Remove copy button on user messages; use context menu instead */}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            </ContextMenuTrigger>
                                                            <ContextMenuContent>
                                                                <ContextMenuItem onClick={() => copyToClipboard(typeof message.text === 'string' ? message.text : JSON.stringify(message.text), messageKey)}>Copy</ContextMenuItem>
                                                                <ContextMenuItem onClick={() => setDeletedMessageIds(prev => new Set(prev).add(messageKey))}>Delete</ContextMenuItem>
                                                            </ContextMenuContent>
                                                            </ContextMenu>
                                                        ) : (
                                                            <ContextMenu>
                                                            <ContextMenuTrigger asChild>
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
                                                                                    conversationHistory={(generalChat?.messages || []).map(msg => ({
                                                                                        sender: msg.sender === 'system' ? 'bot' : msg.sender,
                                                                                        text: typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)
                                                                                    }))}
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
                            messageId={message.id}
                            onSendMessage={async (msg) => {
                              // Automatically send quiz results to AI (without showing in input field)
                              const currentChat = chats[currentTab || 'private-general-chat'];
                              const isClassChat = currentChat?.chatType === 'class';
                              
                              // Add user message immediately
                              const userMessage = {
                                id: generateMessageId(),
                                text: msg,
                                sender: 'user' as const,
                                name: user?.displayName || 'Anonymous',
                                userId: user?.uid || 'guest',
                                timestamp: Date.now()
                              };
                              
                              await addMessage(currentTab || 'private-general-chat', userMessage);
                              setIsLoading(true);
                              
                              try {
                                // Get AI response
                                const apiEndpoint = isClassChat ? '/api/chat/class' : '/api/chat';
                                
                                // Get userId from logged-in user (notifications only work for authenticated users)
                                const effectiveUserId = user?.uid;
                                
                                const requestBody: any = {
                                  question: msg,
                                  context: currentChat?.title || 'General Chat',
                                  conversationHistory: currentChat?.messages?.slice(-10).map(m => ({
                                    role: m.sender === 'user' ? 'user' : 'assistant',
                                    content: typeof m.text === 'string' ? m.text : JSON.stringify(m.text)
                                  })) || [],
                                  shouldCallAI: true,
                                  isPublicChat: false,
                                  userId: effectiveUserId, // Add userId for notification
                                  chatId: currentTab, // Add chatId for notification
                                  chatTitle: currentChat?.title // Add chatTitle for notification
                                };
                                
                                if (isClassChat && currentChat?.courseData) {
                                  requestBody.courseData = currentChat.courseData;
                                  requestBody.chatId = currentTab;
                                  requestBody.metadata = currentChat.metadata;
                                }
                                
                                const response = await fetch(apiEndpoint, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(requestBody),
                                  signal: AbortSignal.timeout(35000)
                                });
                                
                                const data = await response.json();
                                
                                if (data.response) {
                                  const aiMessage = {
                                    id: generateMessageId(),
                                    text: data.response,
                                    sender: 'bot' as const,
                                    name: 'CourseConnect AI',
                                    timestamp: Date.now()
                                  };
                                  
                                  await addMessage(currentTab || 'private-general-chat', aiMessage);
                                  
                                  // Update metadata if provided
                                  if (data.metadata && currentTab) {
                                    updateChatMetadata(currentTab, data.metadata);
                                  }
                                }
                              } catch (error) {
                                console.error('Failed to get AI response:', error);
                                toast({
                                  title: "Error",
                                  description: "Failed to get AI response. Please try again.",
                                  variant: "destructive"
                                });
                              } finally {
                                setIsLoading(false);
                              }
                            }}
                            onFeedback={(feedback) => {
                              // Store feedback in localStorage
                              console.log('📊 Feedback callback triggered:', feedback);
                              try {
                                const existingFeedback = JSON.parse(localStorage.getItem('cc-ai-feedback') || '[]');
                                console.log('📊 Existing feedback:', existingFeedback);
                                const newFeedback = {
                                  ...feedback,
                                  chatId: currentTab,
                                  timestamp: Date.now()
                                };
                                existingFeedback.push(newFeedback);
                                localStorage.setItem('cc-ai-feedback', JSON.stringify(existingFeedback));
                                console.log('📊 Feedback saved successfully! Total count:', existingFeedback.length);
                                console.log('📊 Saved feedback data:', newFeedback);
                                
                                // Trigger custom event for real-time updates
                                window.dispatchEvent(new CustomEvent('feedbackAdded', { detail: newFeedback }));
                              } catch (e) {
                                console.error('❌ Failed to save feedback:', e);
                              }
                            }}
                                                                />
                                                            </div>
                                                            </ContextMenuTrigger>
                                                            <ContextMenuContent>
                                                                <ContextMenuItem onClick={() => copyToClipboard(typeof message.text === 'string' ? message.text : JSON.stringify(message.text), messageKey)}>Copy</ContextMenuItem>
                                                            </ContextMenuContent>
                                                            </ContextMenu>
                                                        )}
                                                                </div>
                                                            </div>
                                            );
                                            })}
                                            </>
                                            )}
                                            
                                            {/* Scroll target for auto-scroll */}
                                            <div ref={messagesEndRef} />
                                            
                                            {/* AI Thinking Animation - Blue ripple text */}
                                            {isLoading && generalChat?.messages?.at(-1)?.sender !== 'bot' && (
                                                <div className="flex items-start gap-3 w-full max-w-[90%] animate-in slide-in-from-bottom-2 duration-300">
                                                    <img src="/favicon-32x32.png" alt="AI" className="w-8 h-8 flex-shrink-0 object-contain" />
                                                    <div className="text-left min-w-0">
                                                        <div className="text-xs text-muted-foreground mb-1">CourseConnect AI</div>
                                                        <div className="bg-muted/50 dark:bg-muted/30 px-5 py-3 rounded-2xl rounded-tl-md border border-border/40 shadow-sm">
                                                            <RippleText text="Thinking…" className="text-sm" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Real-time typing indicator - compact design */}
                                            {pusherTypingUsers.length > 0 && (
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
                                                            <TypingIndicator users={pusherTypingUsers.filter(typingUser => typingUser.userId !== (user?.uid || 'guest'))} />
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
                                                    pusherStartTyping();
                                                } else if (currentTab) {
                                                    pusherStopTyping();
                                                }
                                            }}
                                            onSend={handleSendMessage}
                                            onFileUpload={handleFileUpload}
                                            onFileProcessed={async (payload: any) => {
                                                // payload: { files: File[], text: string }
                                                const files: File[] = payload?.files || [];
                                                const userText = (payload?.text || inputValue || '').trim();
                                                if (files.length === 0) return;

                                                // Build one user message with a grid of attachments
                                                const attachments = await Promise.all(files.map(async (f) => ({
                                                    name: f.name,
                                                    size: f.size,
                                                    type: f.type,
                                                    url: URL.createObjectURL(f)
                                                })));

                                                const uploadMessage = {
                                                    id: generateMessageId(),
                                                    text: userText,
                                                    sender: 'user' as const,
                                                    name: user?.displayName || 'Anonymous',
                                                    timestamp: Date.now(),
                                                    files: attachments
                                                };

                                                setInputValue('');
                                                await addMessage(currentTab || 'private-general-chat', uploadMessage);

                                                // If the first file is an image, trigger vision analysis (uses existing flow)
                                                const first = files[0];
                                                if (first && first.type.startsWith('image/')) {
                                                    setIsLoading(true);
                                                    const reader = new FileReader();
                                                    reader.onload = async (e) => {
                                                        try {
                                                            const base64Image = e.target?.result as string;
                                                            const base64Data = base64Image.split(',')[1];
                                                            const analysisPrompt = userText || 'Describe this image and extract relevant info.';
                                                            await fetch('/api/chat/vision', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ message: analysisPrompt, image: base64Data, mimeType: first.type })
                                                            }).then(res => res.json()).then(async (data) => {
                                                                const aiText = data?.answer || data?.response || 'I analyzed the attachments.';
                                                                await addMessage(currentTab || 'private-general-chat', { id: generateMessageId(), text: aiText, sender: 'bot', name: 'CourseConnect AI', timestamp: Date.now() });
                                                            }).catch(async () => {
                                                                await addMessage(currentTab || 'private-general-chat', { id: generateMessageId(), text: 'Failed to analyze the image.', sender: 'bot', name: 'CourseConnect AI', timestamp: Date.now() });
                                                            }).finally(() => setIsLoading(false));
                                                        } catch {
                                                            setIsLoading(false);
                                                        }
                                                    };
                                                    reader.readAsDataURL(first);
                                                }
                                            }}
                                            placeholder={
                                                currentChat?.disabled 
                                                    ? "🚧 Community Chat coming soon! Use General Chat for AI help."
                                                    : currentChat?.chatType === 'class' 
                                                    ? `Ask anything about ${currentChat?.title || 'this course'}...`
                                                    : currentTab === 'private-general-chat'
                                                    ? 'Ask anything about your courses...'
                                                    : 'Chat with classmates or @ai for help...'
                                            }
                                            disabled={currentChat?.disabled || false}
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

        {/* Admin dashboard available at /dashboard/admin - for developers only */}
        </>
    );
}

"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User, AlertTriangle, MessageCircle, Info, Upload, ChevronDown, ChevronUp, Copy, Check, BookOpen, Loader2, X, Download, RotateCcw, Trash2, MoreVertical } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
// import { moderateChatMessage } from "@/ai/flows/moderate-chat-message";
// import { provideStudyAssistance } from "@/ai/flows/provide-study-assistance";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useTextExtraction } from "@/hooks/use-text-extraction";
import { useSmartDocumentAnalysis } from "@/hooks/use-smart-document-analysis";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EnhancedFileDisplay } from "@/components/enhanced-file-display";
import { fileAnalysisService } from "@/ai/services/file-analysis-service";
import { AIResponseRenderer } from "@/components/ai-response-renderer";
import Link from "next/link";
import { useChatStore, Message } from "@/hooks/use-chat-store";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase/client-simple";
import { doc, getDoc } from "firebase/firestore";
import { getInDepthAnalysis } from "@/ai/services/dual-ai-service";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FuturisticChatInput } from "@/components/futuristic-chat-input";
import { RealTimeSearchAnimation } from "@/components/real-time-search-animation";
import { RippleText } from "@/components/ripple-text";
import { ProfileHoverCard, ProfileData } from "@/components/profile-hover-card";
import dynamic from 'next/dynamic';

const DigitalClock = dynamic(() => import('@/components/digital-clock').then(mod => ({ default: mod.DigitalClock })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
      <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
      <span className="font-mono">--:--:--</span>
    </div>
  )
});

// Sample profile data for demonstration
const sampleProfiles: Record<string, ProfileData> = {
    'ai-tutor': {
        id: 'ai-tutor',
        name: 'CourseConnect AI',
        role: 'ai-tutor',
        bio: 'Advanced AI tutor specializing in personalized learning. I can help with homework, explain complex concepts, create study plans, and provide exam preparation across all subjects.',
        capabilities: ['Homework Assistance', 'Concept Explanation', 'Study Planning', 'Exam Prep', 'Research Help', 'Writing Support'],
        subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English Literature', 'History', 'Computer Science', 'Economics'],
        experience: '24/7 Available'
    },
    'student-alex': {
        id: 'student-alex',
        name: 'Alex Johnson',
        role: 'student',
        school: 'University of California, Berkeley',
        major: 'Computer Science',
        year: 'Junior',
        skills: ['Python Programming', 'Machine Learning', 'Data Analysis', 'Web Development', 'Database Design', 'Software Engineering']
    },
    'instructor-sarah': {
        id: 'instructor-sarah',
        name: 'Dr. Sarah Chen',
        role: 'instructor',
        school: 'Massachusetts Institute of Technology',
        subjects: ['Calculus I & II', 'Linear Algebra', 'Statistics', 'Discrete Mathematics', 'Probability Theory'],
        coursesCreated: 8
    }
};

export default function ChatInterface() {
    const { chats, addMessage, setCurrentTab, currentTab, addChat, isGuest, isStoreLoading, resetChat, exportChat, deleteChat } = useChatStore();
    const [inputValue, setInputValue] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [collapsedMessages, setCollapsedMessages] = useState<Set<number>>(new Set());
    const [copiedMessages, setCopiedMessages] = useState<Set<number>>(new Set());
    const [analyzingMessages, setAnalyzingMessages] = useState<Set<number>>(new Set());
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [analysisContent, setAnalysisContent] = useState("");
    const [analysisQuestion, setAnalysisQuestion] = useState("");
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [chatToManage, setChatToManage] = useState<string | null>(null);
    const [messageQueue, setMessageQueue] = useState<Array<{id: string, text: string, timestamp: number}>>([]);
    const [isProcessingQueue, setIsProcessingQueue] = useState(false);
    const [lastMessageTime, setLastMessageTime] = useState<number>(0);
    const [messageCount, setMessageCount] = useState<number>(0);
    const [showQueueInfo, setShowQueueInfo] = useState<boolean>(false);
    const [recentMessages, setRecentMessages] = useState<string[]>([]);
    const [spamWarnings, setSpamWarnings] = useState<number>(0);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [muteEndTime, setMuteEndTime] = useState<number>(0);
    const [userProfiles, setUserProfiles] = useState<Record<string, { photoURL?: string; displayName?: string }>>({});
    const [showRealTimeSearch, setShowRealTimeSearch] = useState(false);
    const [currentSearchQuery, setCurrentSearchQuery] = useState("");
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const [user, setUser] = useState<any>(null);
    const [visitedChats, setVisitedChats] = useState<Set<string>>(new Set());
    const [inDepthUsageCount, setInDepthUsageCount] = useState<number>(0);
    const [lastUsageResetDate, setLastUsageResetDate] = useState<string>(new Date().toDateString());
    
    // Function to get profile data for a message sender
    const getProfileForSender = (sender: string, name?: string): ProfileData | null => {
        console.log('getProfileForSender called with:', { sender, name });
        
        // Always return AI tutor profile for bot messages
        if (sender === 'bot' || name === 'CourseConnect AI' || name === 'AI') {
            console.log('Returning AI tutor profile');
            return sampleProfiles['ai-tutor'];
        }
        
        // For demo purposes, assign profiles based on name patterns
        if (name?.includes('Alex')) {
            console.log('Returning Alex student profile');
            return sampleProfiles['student-alex'];
        }
        if (name?.includes('Dr.') || name?.includes('Sarah')) {
            console.log('Returning Sarah instructor profile');
            return sampleProfiles['instructor-sarah'];
        }
        
        // Default student profile for ALL users (including current user)
        console.log('Returning default student profile for:', name);
        return {
            id: sender,
            name: name || 'Student',
            role: 'student',
            school: 'University',
            major: 'Undecided',
            year: 'Freshman',
            skills: ['Learning', 'Studying', 'Academic Work']
        };
    };
    
    useEffect(() => {
        // Safely handle auth state
        try {
            if (auth && typeof auth.onAuthStateChanged === 'function') {
                const unsubscribe = auth.onAuthStateChanged(
                    (user: any) => setUser(user),
                    (error: any) => {
                        console.warn("Auth state error in chat interface (offline mode):", error);
                        setUser(null);
                    }
                );
                return unsubscribe;
            } else {
                // Mock auth - no user
                setUser(null);
            }
        } catch (authError) {
            console.warn("Auth initialization error in chat interface (offline mode):", authError);
            setUser(null);
        }
    }, []);

    const getInitials = (name: string | null | undefined) => {
        if (!name) return "U";
        const parts = name.split(' ');
        if (parts.length > 1) {
            return parts[0][0] + parts[parts.length - 1][0];
        }
        return name[0];
    };

    const fetchUserProfile = async (userId: string) => {
        if (userProfiles[userId]) return userProfiles[userId];
        
        try {
            const userDocRef = doc(db, "users", userId);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                const profile = {
                    photoURL: userData.profilePicture || userData.photoURL,
                    displayName: userData.displayName
                };
                setUserProfiles(prev => ({ ...prev, [userId]: profile }));
                return profile;
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
        
        return { photoURL: undefined, displayName: undefined };
    };

     useEffect(() => {
        const setupGeneralChat = async () => {
            if (isGuest && !chats['general-chat']) {
                 addChat('General Chat', { 
                    sender: 'bot', 
                    name: 'AI', 
                    text: 'Hey there! 👋 Welcome to General Chat!\n\nI\'m CourseConnect AI, your study buddy. I can help with homework, explain tricky concepts, or just chat about anything academic.\n\nWhat\'s on your mind today? Try asking:\n• "Help me understand calculus derivatives"\n• "Explain photosynthesis in simple terms"\n• "What\'s the best way to study for exams?"',
                });
            }
        }
        setupGeneralChat();

        if (Object.keys(chats).length > 0 && !currentTab) {
            const firstChatId = Object.keys(chats)[0];
            setCurrentTab(firstChatId);
        } else if (Object.keys(chats).length === 0 && !isGuest) {
            // Handle case where a logged-in user has no chats yet
             addChat('General Chat', { 
                sender: 'bot', 
                name: 'CourseConnect AI', 
                text: 'Hey there! 👋 Welcome to General Chat!\n\nI\'m CourseConnect AI, your study buddy. I can help with homework, explain tricky concepts, or just chat about anything academic.\n\nWhat\'s on your mind today? Try asking:\n• "Help me understand calculus derivatives"\n• "Explain photosynthesis in simple terms"\n• "What\'s the best way to study for exams?"',
            });
             setCurrentTab('general-chat');
        }

    }, [isGuest, chats, currentTab, setCurrentTab, addChat]);

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
    }, [chats, currentTab]);

    // Handle welcome notifications when user joins a chat
    useEffect(() => {
        if (currentTab && user && !visitedChats.has(currentTab)) {
            const currentChat = chats[currentTab];
            if (currentChat && currentTab !== 'general-chat') {
                try {
                    // Add welcome notification
                    const welcomeMessage: Message = {
                        sender: "bot",
                        text: `Welcome ${user.displayName || user.email || 'Student'} to ${currentChat.title}! 🎓\n\nFeel free to ask questions, collaborate with classmates, and get AI assistance with your studies.`,
                        name: "AI",
                        timestamp: Date.now()
                    };
                    
                    // Mark as visited first to prevent infinite loop
                    setVisitedChats(prev => new Set(prev).add(currentTab));
                    
                    // Add message asynchronously
                    addMessage(currentTab, welcomeMessage).catch(error => {
                        console.error('Failed to add welcome message:', error);
                    });
                    
                    toast({
                        title: "Welcome to Class Chat!",
                        description: `You've joined ${currentChat.title}`,
                    });
                } catch (error) {
                    console.error('Error in welcome notification:', error);
                }
            }
        }
    }, [currentTab, user, visitedChats, chats, addMessage, toast]);

    // Reset daily usage count
    useEffect(() => {
        const today = new Date().toDateString();
        if (lastUsageResetDate !== today) {
            setInDepthUsageCount(0);
            setLastUsageResetDate(today);
        }
    }, [lastUsageResetDate]);

    // Helper functions for message management
    const toggleMessageCollapse = (index: number) => {
        setCollapsedMessages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const copyMessage = async (text: string, index: number) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedMessages(prev => new Set(prev).add(index));
            toast({
                title: "Copied!",
                description: "Message copied to clipboard",
            });
            setTimeout(() => {
                setCopiedMessages(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(index);
                    return newSet;
                });
            }, 2000);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Copy Failed",
                description: "Could not copy message to clipboard",
            });
        }
    };

    const isLongMessage = (text: string) => text.length > 300;
    const getPreviewText = (text: string) => {
        if (text.length <= 300) return text;
        return text.substring(0, 300) + "...";
    };

    const handleResetChat = async () => {
        if (!chatToManage) return;
        try {
            await resetChat(chatToManage);
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
            setChatToManage(null);
        }
    };

    const handleDeleteChat = async () => {
        if (!chatToManage) return;
        try {
            await deleteChat(chatToManage);
            toast({
                title: "Chat Deleted",
                description: "Chat has been permanently deleted.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Delete Failed",
                description: "Could not delete the chat. Please try again.",
            });
        } finally {
            setShowDeleteDialog(false);
            setChatToManage(null);
        }
    };

    const handleExportChat = () => {
        if (!chatToManage) return;
        try {
            exportChat(chatToManage);
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
        setChatToManage(null);
    };

    // Check for spam patterns
    const checkForSpam = (message: string): boolean => {
        const normalizedMessage = message.toLowerCase().trim();
        
        // Check if message is too short (likely spam)
        if (normalizedMessage.length < 2) return true;
        
        // Check for repeated messages in recent history
        const recentCount = recentMessages.filter(msg => 
            msg.toLowerCase().trim() === normalizedMessage
        ).length;
        
        // If same message appears 3+ times in recent history, it's spam
        if (recentCount >= 2) return true;
        
        // Check for excessive repetition of characters
        const charCounts: { [key: string]: number } = {};
        for (const char of normalizedMessage) {
            charCounts[char] = (charCounts[char] || 0) + 1;
        }
        
        // If any character appears more than 70% of the message, it's likely spam
        const maxCharCount = Math.max(...Object.values(charCounts));
        if (maxCharCount / normalizedMessage.length > 0.7) return true;
        
        return false;
    };

    // Mute user for specified duration
    const muteUser = (duration: number) => {
        setIsMuted(true);
        setMuteEndTime(Date.now() + duration);
        
        toast({
            variant: "destructive",
            title: "🔇 You've been muted",
            description: `You've been temporarily muted for ${duration / 1000} seconds due to spam. Please wait before sending more messages.`,
        });
        
        // Auto-unmute after duration
        setTimeout(() => {
            setIsMuted(false);
            setMuteEndTime(0);
            setSpamWarnings(0);
            setRecentMessages([]);
            
            toast({
                title: "🔊 Unmuted",
                description: "You can now send messages again. Please be respectful!",
            });
        }, duration);
    };

    // Cancel a message from the queue
    const cancelMessage = (messageId: string) => {
        setMessageQueue(prev => prev.filter(msg => msg.id !== messageId));
        toast({
            title: "Message Cancelled",
            description: "The message has been removed from the queue.",
        });
    };

    // Process messages from the queue
    const processMessageQueue = async () => {
        if (isProcessingQueue || messageQueue.length === 0 || !currentTab) return;
        
        setIsProcessingQueue(true);
        
        while (messageQueue.length > 0) {
            const messageToProcess = messageQueue[0];
            setMessageQueue(prev => prev.slice(1)); // Remove first message from queue
            
            try {
                // Import AI functions dynamically to avoid build issues
                const { provideStudyAssistanceWithFallback } = await import("@/ai/services/dual-ai-service");
                
                const context = chats[currentTab!]?.title || 'General Chat';
                // Call the chat API directly to get sources
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        question: messageToProcess.text,
                        context: context,
                        conversationHistory: chats[currentTab!]?.messages?.slice(-10).map(msg => ({
                            role: msg.sender === 'bot' ? 'assistant' as const : 'user' as const,
                            content: msg.text
                        })) || [],
                        shouldCallAI: true,
                        isPublicChat: currentTab?.includes('public'),
                        hasAIMention: messageToProcess.text.toLowerCase().includes('@ai')
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Chat API failed');
                }
                
                const result = await response.json();
                
                const assistanceMessage: Message = {
                    sender: "bot",
                    text: result.answer || 'I apologize, but I couldn\'t generate a response.',
                    name: "AI",
                    timestamp: Date.now(),
                    sources: result.sources
                };
                
                await addMessage(currentTab, assistanceMessage);
            } catch (aiError) {
                console.warn("AI assistance failed, using fallback:", aiError);
                
                // Provide contextual fallback response based on chat name
                const lowerQuestion = messageToProcess.text.toLowerCase();
                const chatName = chats[currentTab!]?.title || '';
                const lowerChatName = chatName.toLowerCase();
            
                let fallbackText = `I'd be happy to help with your question: "${messageToProcess.text}"\n\n`;
        
            // Determine subject based on chat name
            if (lowerChatName.includes('math') || lowerChatName.includes('calculus') || lowerChatName.includes('algebra') || lowerChatName.includes('statistics')) {
                fallbackText += `**Math Help:**\n\nI can help you with mathematical concepts! Here are some key areas:\n\n**Algebra:**\n- Solving equations and inequalities\n- Factoring and simplifying expressions\n- Working with functions and graphs\n\n**Calculus:**\n- Limits and continuity\n- Derivatives and applications\n- Integrals and area calculations\n\n**Statistics:**\n- Descriptive statistics\n- Probability distributions\n- Hypothesis testing\n\nWhat specific math topic would you like help with?`;
            } else if (lowerChatName.includes('science') || lowerChatName.includes('physics') || lowerChatName.includes('chemistry') || lowerChatName.includes('biology')) {
                fallbackText += `**Science Help:**\n\nI can help you with science concepts! Here are some key areas:\n\n**Physics:**\n- Mechanics and motion\n- Energy and work\n- Waves and oscillations\n\n**Chemistry:**\n- Atomic structure\n- Chemical bonding\n- Reactions and stoichiometry\n\n**Biology:**\n- Cell biology\n- Genetics and evolution\n- Ecology and ecosystems\n\nWhat specific science topic would you like help with?`;
            } else if (lowerChatName.includes('english') || lowerChatName.includes('literature') || lowerChatName.includes('writing')) {
                fallbackText += `**English & Literature Help:**\n\nI can help you with English and literature! Here are some key areas:\n\n**Writing:**\n- Essay structure and organization\n- Grammar and style\n- Research and citations\n\n**Literature:**\n- Literary analysis\n- Themes and symbolism\n- Character development\n\n**Reading Comprehension:**\n- Main ideas and details\n- Inference and interpretation\n- Critical thinking\n\nWhat specific English topic would you like help with?`;
            } else if (lowerChatName.includes('history') || lowerChatName.includes('social') || lowerChatName.includes('politics')) {
                fallbackText += `**History & Social Studies Help:**\n\nI can help you with history and social studies! Here are some key areas:\n\n**Historical Analysis:**\n- Cause and effect relationships\n- Historical context and significance\n- Primary and secondary sources\n\n**Geography:**\n- Physical and human geography\n- Maps and spatial analysis\n- Cultural regions\n\n**Government & Politics:**\n- Political systems\n- Constitutional principles\n- Current events\n\nWhat specific history or social studies topic would you like help with?`;
            } else if (lowerChatName.includes('cs') || lowerChatName.includes('computer') || lowerChatName.includes('programming') || lowerChatName.includes('code')) {
                fallbackText += `**Computer Science Help:**\n\nI can help you with programming and computer science! Here are some key areas:\n\n**Programming Fundamentals:**\n- Variables and data types\n- Control structures (loops, conditionals)\n- Functions and methods\n\n**Data Structures:**\n- Arrays and lists\n- Stacks and queues\n- Trees and graphs\n\n**Algorithms:**\n- Sorting and searching\n- Recursion\n- Complexity analysis\n\nWhat specific programming topic would you like help with?`;
        } else {
                // General academic help
                fallbackText += `**General Academic Help:**\n\nI'm here to help with any academic or study-related questions! I can assist with:\n\n**Study Strategies:**\n- Time management and organization\n- Note-taking techniques\n- Exam preparation\n\n**Academic Skills:**\n- Research methods\n- Critical thinking\n- Problem-solving approaches\n\n**Subject Areas:**\n- Math and science\n- English and literature\n- History and social studies\n- Computer science and programming\n\nWhat specific topic would you like help with?`;
        }
        
            // Add a short delay to show the animation
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const assistanceMessage: Message = {
            sender: "bot",
            text: fallbackText,
            name: "CourseConnect AI",
            timestamp: Date.now()
        };
        
        await addMessage(currentTab, assistanceMessage);
        }
        }
        
        setIsProcessingQueue(false);
    };

    // Process queue when new messages are added
    useEffect(() => {
        if (messageQueue.length > 0 && !isProcessingQueue) {
            processMessageQueue();
        }
    }, [messageQueue, isProcessingQueue, currentTab]);

    // Reset spam protection when switching chats
    useEffect(() => {
        setLastMessageTime(0);
        setMessageCount(0);
        setShowQueueInfo(false);
        setRecentMessages([]);
        setSpamWarnings(0);
        setIsMuted(false);
        setMuteEndTime(0);
    }, [currentTab]);

    // Fetch user profiles for messages
    useEffect(() => {
        if (currentTab && chats[currentTab]) {
            const currentChat = chats[currentTab];
            const uniqueUserIds = [...new Set(currentChat.messages
                .filter(msg => msg.sender === 'user' && msg.userId)
                .map(msg => msg.userId)
            )];
            
            uniqueUserIds.forEach(userId => {
                if (userId && !userProfiles[userId]) {
                    fetchUserProfile(userId);
                }
            });
        }
    }, [currentTab, chats, userProfiles]);

    const handleInDepthAnalysis = async (question: string, context: string, messageIndex: number) => {
        // Check usage limit
        if (inDepthUsageCount >= 10) {
            toast({
                variant: "destructive",
                title: "Daily Limit Reached",
                description: "You've used all 10 in-depth analyses for today. Would you like to continue?",
                action: (
                    <div className="flex gap-2">
                        <Button 
                            size="sm" 
                            onClick={() => {
                                // Redirect to pricing page
                                window.open('/pricing', '_blank');
                            }}
                        >
                            Upgrade
                        </Button>
                        <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                                // Just close the toast
                            }}
                        >
                            Maybe Later
                        </Button>
                    </div>
                ),
                duration: 10000,
            });
            return;
        }

        setAnalyzingMessages(prev => new Set(prev).add(messageIndex));
        setAnalysisQuestion(question);
        
        try {
            const result = await getInDepthAnalysis({
                question,
                context,
                conversationHistory: chats[currentTab!]?.messages?.slice(-10).map(msg => ({
                    role: msg.sender === 'bot' ? 'assistant' as const : 'user' as const,
                    content: msg.text
                })) || []
            });
            
            setAnalysisContent(result.answer || 'I apologize, but I couldn\'t generate a detailed analysis.');
            setIsAnalysisModalOpen(true);
            
            // Increment usage count
            setInDepthUsageCount(prev => prev + 1);
            
            toast({
                title: "Analysis Complete",
                description: `Detailed analysis generated by CourseConnect AI (${inDepthUsageCount + 1}/10 used today)`,
                duration: 3000,
            });
        } catch (error) {
            console.error("In-depth analysis failed:", error);
            toast({
                variant: "destructive",
                title: "Analysis Failed",
                description: "Could not generate detailed analysis. Please try again.",
            });
        } finally {
            setAnalyzingMessages(prev => {
                const newSet = new Set(prev);
                newSet.delete(messageIndex);
                return newSet;
            });
        }
    };

    const { extractText, isExtracting } = useTextExtraction({
        onExtractionComplete: async (result, fileName) => {
            // Add extracted text as a message
            const extractedTextMessage = {
                id: (Date.now() + 2).toString(),
                text: `📄 **Text extracted from ${fileName}**\n\n${result.text}`,
                sender: 'bot' as const,
                name: 'CourseConnect AI',
                timestamp: Date.now() + 2
            };
            await addMessage(currentTab!, extractedTextMessage);
        },
        onExtractionError: (error, fileName) => {
            console.error('Text extraction failed:', error);
        }
    });

    const { analyzeDocument, isAnalyzing } = useSmartDocumentAnalysis({
        onAnalysisComplete: async (result, fileName) => {
            // Add AI analysis as a message
            const analysisMessage = {
                id: (Date.now() + 3).toString(),
                text: `🤖 **AI Analysis of ${fileName}**\n\n${result.summary}`,
                sender: 'bot' as const,
                name: 'CourseConnect AI',
                timestamp: Date.now() + 3
            };
            await addMessage(currentTab!, analysisMessage);
        },
        onAnalysisError: (error, fileName) => {
            console.error('Document analysis failed:', error);
        }
    });

    const handleFileUpload = async (file: File) => {
        if (!currentTab) return;

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast({
                variant: "destructive",
                title: "File Too Large",
                description: "Please upload files smaller than 10MB.",
            });
            return;
        }

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/plain',
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/gif',
            'image/webp'
        ];

        if (!allowedTypes.includes(file.type)) {
            toast({
                variant: "destructive",
                title: "Invalid File Type",
                description: "Please upload PDF, Word documents, Excel files, text files, or images.",
            });
            return;
        }

        // Create file message
        const fileMessage = {
            id: Date.now().toString(),
            text: `📎 Uploaded file: ${file.name}`,
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

        // Add file message to chat
        await addMessage(currentTab, fileMessage);

        // Use smart document analysis
        await analyzeDocument(file);
    };

    const handleFileWithText = async (file: File, userPrompt: string) => {
        if (!currentTab) return;

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast({
                variant: "destructive",
                title: "File Too Large",
                description: "Please upload files smaller than 10MB.",
            });
            return;
        }

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/plain',
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/gif',
            'image/webp'
        ];

        if (!allowedTypes.includes(file.type)) {
            toast({
                variant: "destructive",
                title: "Invalid File Type",
                description: "Please upload PDF, Word documents, Excel files, text files, or images.",
            });
            return;
        }

        // Create combined message
        const combinedMessage = {
            id: Date.now().toString(),
            text: `📎 **${file.name}** + "${userPrompt}"`,
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

        // Add combined message to chat
        await addMessage(currentTab, combinedMessage);

        // Use smart document analysis with user prompt
        await analyzeDocument(file, userPrompt);
    };

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isSending || !currentTab) return;

        // Set sending state to true immediately to disable input
        console.log('Setting isSending to true');
        setIsSending(true);

        // Check if user is muted
        if (isMuted) {
            const remainingTime = Math.ceil((muteEndTime - Date.now()) / 1000);
            toast({
                variant: "destructive",
                title: "🔇 You're muted",
                description: `You're muted for ${remainingTime} more seconds. Please wait before sending messages.`,
            });
            setIsSending(false);
            return;
        }

        const now = Date.now();
        const timeSinceLastMessage = now - lastMessageTime;
        
        // Spam protection: prevent sending messages too quickly
        if (timeSinceLastMessage < 1000) { // 1 second minimum between messages
            toast({
                variant: "destructive",
                title: "Slow down!",
                description: "Please wait a moment before sending another message.",
            });
            setIsSending(false);
            return;
        }

        // Check for spam patterns
        if (checkForSpam(inputValue)) {
            setSpamWarnings(prev => prev + 1);
            
            if (spamWarnings >= 2) {
                // Mute user for 30 seconds after 3 spam warnings
                muteUser(30000);
                setIsSending(false);
                return;
            } else {
                toast({
                    variant: "destructive",
                    title: "⚠️ Spam detected",
                    description: `Please don't repeat messages. Warning ${spamWarnings + 1}/3. You'll be muted if you continue.`,
                });
                setIsSending(false);
                return;
            }
        }

        const userMessage: Message = {
            sender: "user",
            text: inputValue,
            name: user?.displayName || "You",
            userId: user?.uid,
            timestamp: now
        };

        const messageToProcess = inputValue.trim();
        console.log('Setting isSending to true for message:', messageToProcess);
        setIsSending(true);
        setInputValue(""); // Clear input immediately to prevent spam
        await addMessage(currentTab, userMessage);

        // Try to use AI assistance first, fallback to contextual responses
        try {
            // Show real-time search animation
            setShowRealTimeSearch(true);
            setCurrentSearchQuery(messageToProcess);
            
            // Import AI functions dynamically to avoid build issues
            const { provideStudyAssistanceWithFallback } = await import("@/ai/services/dual-ai-service");
            
            const context = chats[currentTab!]?.title || 'General Chat';
            
            // Check for stored document content and intelligently integrate it
            let documentContext = '';
            const currentChatId = currentTab || 'private-general-chat';
            const storageKey = `document-content-${currentChatId}`;
            const storedDocument = sessionStorage.getItem(storageKey);
            
            if (storedDocument) {
                try {
                    const docData = JSON.parse(storedDocument);
                    // Smart truncation: Keep document name, summary, and first 10000 chars of content
                    const truncatedContent = docData.extractedText && docData.extractedText.length > 10000 
                        ? docData.extractedText.substring(0, 10000) + "... [Content truncated for context window]"
                        : docData.extractedText;
                    
                    documentContext = `\n\nDOCUMENT CONTEXT - You have access to this document:\nDocument: ${docData.fileName}\nSummary: ${docData.summary}\nContent: ${truncatedContent}\n\nInstructions: You can reference this document content to answer questions about it. Use specific information from the document when relevant to the user's question. If you need to find specific information like professor name, look for it in the document content above.`;
                    console.log('🔍 DOCUMENT DEBUG INFO:');
                    console.log('Document name:', docData.fileName);
                    console.log('Document summary:', docData.summary);
                    console.log('Content length:', docData.extractedText?.length || 0);
                    console.log('Content preview (first 200 chars):', docData.extractedText?.substring(0, 200) || 'No content');
                    console.log('Full document context being sent:', documentContext.substring(0, 500) + '...');
                } catch (e) {
                    console.error('❌ Failed to parse stored document:', e);
                    console.log('Raw stored document:', storedDocument);
                }
            } else {
                console.log('❌ No stored document found for chat:', currentChatId);
            }
            
            // Build conversation history from recent messages
            const currentChat = chats[currentTab!];
            const recentMessages = currentChat?.messages.slice(-10) || []; // Last 10 messages for context
            const conversationHistory = recentMessages.map(msg => ({
                role: msg.sender === 'bot' ? 'assistant' as const : 'user' as const,
                content: msg.text
            }));
            
            const fullContext = documentContext ? `${context}\n\n${documentContext}` : context;
            
            console.log('🤖 AI SERVICE REQUEST DEBUG:');
            console.log('Question:', messageToProcess);
            console.log('Context length:', fullContext.length);
            console.log('Document context exists:', !!documentContext);
            console.log('Context preview:', fullContext.substring(0, 300) + '...');
            
            // Determine if AI should respond based on chat type and @ai mention
            const isPublicChat = currentTab?.includes('public');
            const hasAIMention = messageToProcess.toLowerCase().includes('@ai');
            const shouldCallAI = isPublicChat ? hasAIMention : true;
            
            console.log('AI Response Logic:', {
                isPublicChat,
                hasAIMention,
                shouldCallAI,
                messageToProcess
            });
            
            // Call the chat API directly to get sources
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: messageToProcess,
                    context: fullContext,
                    conversationHistory: conversationHistory,
                    shouldCallAI: shouldCallAI,
                    isPublicChat: isPublicChat,
                    hasAIMention: hasAIMention
                })
            });
            
            if (!response.ok) {
                throw new Error('Chat API failed');
            }
            
            const result = await response.json();
            
            const assistanceMessage: Message = {
                sender: "bot",
                text: result.answer || 'I apologize, but I couldn\'t generate a response.',
                name: "CourseConnect AI",
                timestamp: Date.now(),
                sources: result.sources
            };
            
            await addMessage(currentTab, assistanceMessage);
        } catch (aiError) {
            console.warn("AI assistance failed, using fallback:", aiError);
            
            // Provide contextual fallback response based on chat name
            const lowerQuestion = messageToProcess.toLowerCase();
            const chatName = chats[currentTab!]?.title || '';
            const lowerChatName = chatName.toLowerCase();
        
            let fallbackText = `I'd be happy to help with your question: "${messageToProcess}"\n\n`;
            
            // Determine subject based on chat name
            if (lowerChatName.includes('math') || lowerChatName.includes('calculus') || lowerChatName.includes('algebra') || lowerChatName.includes('statistics')) {
                fallbackText += `**Math Help:**\n\nI can help you with mathematical concepts! Here are some key areas:\n\n**Algebra:**\n- Solving equations and inequalities\n- Factoring and simplifying expressions\n- Working with functions and graphs\n\n**Calculus:**\n- Limits and continuity\n- Derivatives and applications\n- Integrals and area calculations\n\n**Statistics:**\n- Descriptive statistics\n- Probability distributions\n- Hypothesis testing\n\nWhat specific math topic would you like help with?`;
            } else if (lowerChatName.includes('science') || lowerChatName.includes('physics') || lowerChatName.includes('chemistry') || lowerChatName.includes('biology')) {
                fallbackText += `**Science Help:**\n\nI can help you with science concepts! Here are some key areas:\n\n**Physics:**\n- Mechanics and motion\n- Energy and work\n- Waves and oscillations\n\n**Chemistry:**\n- Atomic structure\n- Chemical bonding\n- Reactions and stoichiometry\n\n**Biology:**\n- Cell biology\n- Genetics and evolution\n- Ecology and ecosystems\n\nWhat specific science topic would you like help with?`;
            } else if (lowerChatName.includes('english') || lowerChatName.includes('literature') || lowerChatName.includes('writing')) {
                fallbackText += `**English & Literature Help:**\n\nI can help you with English and literature! Here are some key areas:\n\n**Writing:**\n- Essay structure and organization\n- Grammar and style\n- Research and citations\n\n**Literature:**\n- Literary analysis\n- Themes and symbolism\n- Character development\n\n**Reading Comprehension:**\n- Main ideas and details\n- Inference and interpretation\n- Critical thinking\n\nWhat specific English topic would you like help with?`;
            } else if (lowerChatName.includes('history') || lowerChatName.includes('social') || lowerChatName.includes('politics')) {
                fallbackText += `**History & Social Studies Help:**\n\nI can help you with history and social studies! Here are some key areas:\n\n**Historical Analysis:**\n- Cause and effect relationships\n- Historical context and significance\n- Primary and secondary sources\n\n**Geography:**\n- Physical and human geography\n- Maps and spatial analysis\n- Cultural regions\n\n**Government & Politics:**\n- Political systems\n- Constitutional principles\n- Current events\n\nWhat specific history or social studies topic would you like help with?`;
            } else if (lowerChatName.includes('cs') || lowerChatName.includes('computer') || lowerChatName.includes('programming') || lowerChatName.includes('code')) {
                fallbackText += `**Computer Science Help:**\n\nI can help you with programming and computer science! Here are some key areas:\n\n**Programming Fundamentals:**\n- Variables and data types\n- Control structures (loops, conditionals)\n- Functions and methods\n\n**Data Structures:**\n- Arrays and lists\n- Stacks and queues\n- Trees and graphs\n\n**Algorithms:**\n- Sorting and searching\n- Recursion\n- Complexity analysis\n\nWhat specific programming topic would you like help with?`;
            } else {
                // General academic help
                fallbackText += `**General Academic Help:**\n\nI'm here to help with any academic or study-related questions! I can assist with:\n\n**Study Strategies:**\n- Time management and organization\n- Note-taking techniques\n- Exam preparation\n\n**Academic Skills:**\n- Research methods\n- Critical thinking\n- Problem-solving approaches\n\n**Subject Areas:**\n- Math and science\n- English and literature\n- History and social studies\n- Computer science and programming\n\nWhat specific topic would you like help with?`;
            }
            
            // Add a short delay to show the animation
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const assistanceMessage: Message = {
                sender: "bot",
                text: fallbackText,
                name: "CourseConnect AI",
                timestamp: Date.now()
            };
            
            await addMessage(currentTab, assistanceMessage);
        }
        
        // Update spam protection state
        setLastMessageTime(now);
        setMessageCount(prev => prev + 1);
        
        // Add to recent messages for spam detection
        setRecentMessages(prev => {
            const newMessages = [...prev, inputValue];
            // Keep only last 10 messages for spam detection
            return newMessages.slice(-10);
        });
        
        console.log('Setting isSending to false');
        setIsSending(false);
        setShowRealTimeSearch(false);
    };

    const hasChats = Object.keys(chats).length > 0;
    const currentChat = currentTab ? chats[currentTab] : null;
    
    // Debug logging
    console.log('ChatInterface render - isSending:', isSending, 'currentTab:', currentTab, 'lastMessageSender:', currentChat?.messages?.at(-1)?.sender);
    
    if (isStoreLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingSpinner size="lg" text="Loading chats..." />
            </div>
        );
    }

    return (
        <>
            <RealTimeSearchAnimation 
                query={currentSearchQuery}
                onComplete={() => setShowRealTimeSearch(false)}
                isVisible={showRealTimeSearch}
            />
            <div className="space-y-4 sm:space-y-6">
            <Card className="h-[70vh] sm:h-[75vh] flex flex-col shadow-2xl border border-border/50 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-background to-muted/20">
                <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                    <CardTitle className="flex items-center gap-2 font-bold text-lg sm:text-xl">
                        <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <span className="truncate">Class Chats</span>
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-muted-foreground/80">Collaborate with students in your classes.</CardDescription>
                        </div>
                        {currentTab && chats[currentTab] && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                        <span className="sr-only">Chat options</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => {
                                        setChatToManage(currentTab);
                                        handleExportChat();
                                    }}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Export Chat
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                        setChatToManage(currentTab);
                                        setShowResetDialog(true);
                                    }}>
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Reset Chat
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        onClick={() => {
                                            setChatToManage(currentTab);
                                            setShowDeleteDialog(true);
                                        }}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Chat
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col min-h-0 px-3 sm:px-6 pb-3 sm:pb-6">
                    {hasChats ? (
                    <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-grow flex flex-col min-h-0">
                        <TabsList className="grid w-full rounded-xl sm:rounded-2xl bg-muted/30 p-0.5 sm:p-1 overflow-x-auto" style={{gridTemplateColumns: `repeat(${Object.keys(chats).length}, minmax(0, 1fr))`}}>
                            {Object.keys(chats).map(key => (
                                <TabsTrigger 
                                    key={key} 
                                    value={key}
                                    className="rounded-lg sm:rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                                >
                                    <span className="truncate">{chats[key].title}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {currentChat && currentTab && (
                             <TabsContent key={currentTab} value={currentTab} className="flex-grow mt-3 sm:mt-4 flex flex-col min-h-0">
                                 <ScrollArea className="flex-grow pr-2 sm:pr-4 -mr-2 sm:-mr-4" ref={scrollAreaRef}>
                                     <div className="space-y-4 sm:space-y-6 pb-4">
                                        {currentChat.messages.map((msg, index) => {
                                            const isCollapsed = collapsedMessages.has(index);
                                            const isLong = isLongMessage(msg.text);
                                            const isCopied = copiedMessages.has(index);
                                            const isAnalyzing = analyzingMessages.has(index);
                                            const isBotMessage = msg.sender === 'bot';
                                            
                                            // Find the corresponding user question for this bot response
                                            const userMessages = currentChat.messages.filter(m => m.sender === 'user');
                                            const botMessageIndex = currentChat.messages.slice(0, index).filter(m => m.sender === 'bot').length;
                                            const correspondingUserQuestion = userMessages[botMessageIndex - 1]?.text || '';
                                            
                                            return (
                                                <div key={index} className={cn("flex items-start gap-2 sm:gap-3 w-full mb-3 sm:mb-4", msg.userId === user?.uid && 'justify-end')}>
                                                {(() => {
                                                    const profile = getProfileForSender(msg.sender, msg.name);
                                                    console.log('Rendering profile card for:', { sender: msg.sender, name: msg.name, profile });
                                                    
                                                    // TEMPORARY TEST: Always render ProfileHoverCard for bot messages
                                                    if (msg.sender === 'bot') {
                                                        const testProfile = sampleProfiles['ai-tutor'];
                                                        console.log('FORCING ProfileHoverCard for bot message with profile:', testProfile);
                                                        return (
                                                            <ProfileHoverCard 
                                                                profile={testProfile}
                                                                placement="top"
                                                                delay={200}
                                                                onAction={() => {
                                                                    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                                                                    input?.focus();
                                                                }}
                                                            >
                                                                <div className="bg-red-500 text-white p-2 rounded">
                                                                    TEST AVATAR - HOVER ME
                                                                </div>
                                                            </ProfileHoverCard>
                                                        );
                                                    }
                                                    
                                                    return profile ? (
                                                        <ProfileHoverCard 
                                                            profile={profile}
                                                            placement="top"
                                                            delay={200}
                                                            onAction={() => {
                                                                if (profile.role === 'ai-tutor') {
                                                                    // Focus on input for AI tutor
                                                                    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                                                                    input?.focus();
                                                                } else {
                                                                    // For students/instructors, could open a profile modal or start a DM
                                                                    toast({
                                                                        title: `Connect with ${profile.name}`,
                                                                        description: `Starting a conversation with ${profile.name}...`,
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 flex-shrink-0 shadow-lg ring-2 ring-background cursor-pointer hover:ring-primary/50 transition-all duration-200">
                                                            {msg.sender === 'user' && userProfiles[msg.userId || '']?.photoURL ? (
                                                                <AvatarImage 
                                                                    src={userProfiles[msg.userId || ''].photoURL} 
                                                                    alt={userProfiles[msg.userId || ''].displayName || msg.name} 
                                                                />
                                                            ) : null}
                                                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                                                                {msg.sender === 'bot' && (
                                                                    <img 
                                                                        src="/courseconnect-logo-profile.png" 
                                                                        alt="AI" 
                                                                        className="size-6 object-contain"
                                                                    />
                                                                )}
                                                                {msg.sender === 'moderator' && <AlertTriangle className="size-6 text-destructive"/>}
                                                                {msg.sender === 'user' && (
                                                                    userProfiles[msg.userId || '']?.displayName 
                                                                        ? getInitials(userProfiles[msg.userId || ''].displayName)
                                                                        : <User className="size-5 text-primary-foreground" />
                                                                )}
                                                            </AvatarFallback>
                                                    </Avatar>
                                                        </ProfileHoverCard>
                                                    ) : (
                                                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 flex-shrink-0 shadow-lg ring-2 ring-background">
                                                            {msg.sender === 'user' && userProfiles[msg.userId || '']?.photoURL ? (
                                                                <AvatarImage 
                                                                    src={userProfiles[msg.userId || ''].photoURL} 
                                                                    alt={userProfiles[msg.userId || ''].displayName || msg.name} 
                                                                />
                                                            ) : null}
                                                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                                                                {msg.sender === 'bot' && (
                                                                    <img 
                                                                        src="/courseconnect-logo-profile.png" 
                                                                        alt="AI" 
                                                                        className="size-6 object-contain"
                                                                    />
                                                                )}
                                                                {msg.sender === 'moderator' && <AlertTriangle className="size-6 text-destructive"/>}
                                                                {msg.sender === 'user' && (
                                                                    userProfiles[msg.userId || '']?.displayName 
                                                                        ? getInitials(userProfiles[msg.userId || ''].displayName)
                                                                        : <User className="size-5 text-primary-foreground" />
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    );
                                                })()}
                                                    
                                                <div className={cn(
                                                        "max-w-[85%] sm:max-w-xs md:max-w-md lg:max-w-lg",
                                                        msg.userId === user?.uid 
                                                            ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-xl sm:rounded-2xl rounded-br-md shadow-lg ring-1 ring-black/5' 
                                                            : msg.sender === 'bot' 
                                                                ? 'text-foreground' // No bubble styling for AI responses
                                                                : 'bg-gradient-to-br from-background to-muted/30 text-foreground rounded-xl sm:rounded-2xl rounded-bl-md border border-border/50 shadow-lg ring-1 ring-black/5',
                                                        msg.sender === 'moderator' && 'bg-gradient-to-br from-destructive/10 to-destructive/5 text-destructive border border-destructive/20 shadow-lg ring-1 ring-black/5'
                                                    )}>
                                                        {/* Message Header */}
                                                        {msg.sender !== 'bot' && (
                                                            <div className="flex items-center justify-between p-2 sm:p-3 pb-1 sm:pb-2">
                                                                <div className="flex items-center gap-2">
                                                                    {(() => {
                                                                        const profile = getProfileForSender(msg.sender, msg.name);
                                                                        return profile ? (
                                                                            <ProfileHoverCard 
                                                                                profile={profile}
                                                                                placement="top"
                                                                                delay={200}
                                                                                onAction={() => {
                                                                                    if (profile.role === 'ai-tutor') {
                                                                                        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                                                                                        input?.focus();
                                                                                    } else {
                                                                                        toast({
                                                                                            title: `Connect with ${profile.name}`,
                                                                                            description: `Starting a conversation with ${profile.name}...`,
                                                                                        });
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <p className="font-semibold text-xs sm:text-sm opacity-90 cursor-pointer hover:opacity-100 transition-opacity">{msg.name}</p>
                                                                            </ProfileHoverCard>
                                                                        ) : (
                                                                    <p className="font-semibold text-xs sm:text-sm opacity-90">{msg.name}</p>
                                                                        );
                                                                    })()}
                                                                    <DigitalClock timestamp={msg.timestamp} />
                                                                </div>
                                                            <div className="flex items-center gap-1">
                                                                {isLong && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => toggleMessageCollapse(index)}
                                                                        className="h-6 w-6 p-0 hover:bg-transparent"
                                                                    >
                                                                        {isCollapsed ? (
                                                                            <ChevronDown className="h-3 w-3" />
                                                                        ) : (
                                                                            <ChevronUp className="h-3 w-3" />
                                                                        )}
                                                                    </Button>
                                                                )}
                                                                {isBotMessage && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            if (correspondingUserQuestion) {
                                                                                handleInDepthAnalysis(correspondingUserQuestion, chats[currentTab!]?.title || 'General Chat', index);
                                                                            }
                                                                        }}
                                                                        disabled={isAnalyzing}
                                                                        className="h-6 w-6 p-0 hover:bg-blue-100"
                                                                        title="Get detailed explanation"
                                                                    >
                                                                        {isAnalyzing ? (
                                                                            <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                                                                        ) : (
                                                                            <BookOpen className="h-3 w-3 text-blue-600" />
                                                                        )}
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => copyMessage(msg.text, index)}
                                                                    className="h-6 w-6 p-0 hover:bg-transparent"
                                                                >
                                                                    {isCopied ? (
                                                                        <Check className="h-3 w-3 text-green-500" />
                                                                    ) : (
                                                                        <Copy className="h-3 w-3" />
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        )}
                                                        
                                                        {/* AI Response Name */}
                                                        {msg.sender === 'bot' && (() => {
                                                            const profile = getProfileForSender(msg.sender, msg.name);
                                                            return profile ? (
                                                                <ProfileHoverCard 
                                                                    profile={profile}
                                                                    placement="top"
                                                                    delay={200}
                                                                    onAction={() => {
                                                                        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                                                                        input?.focus();
                                                                    }}
                                                                >
                                                                    <div className="text-xs text-muted-foreground mb-1 cursor-pointer hover:text-foreground transition-colors">
                                                                        {msg.name}
                                                                    </div>
                                                                </ProfileHoverCard>
                                                            ) : (
                                                            <div className="text-xs text-muted-foreground mb-1">
                                                                {msg.name}
                                                            </div>
                                                            );
                                                        })()}
                                                        
                                                        {/* Message Content */}
                                                        <div className={msg.sender === 'bot' ? '' : 'px-2 sm:px-3 pb-2 sm:pb-3'}>
                                                            {isLong && isCollapsed ? (
                                                                <div>
                                                                    <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed opacity-90">
                                                                        {getPreviewText(msg.text)}
                                                                    </p>
                                                                    <Button
                                                                        variant="link"
                                                                        size="sm"
                                                                        onClick={() => toggleMessageCollapse(index)}
                                                                        className="h-auto p-0 mt-1 sm:mt-2 text-xs font-medium hover:underline"
                                                                    >
                                                                        Show more...
                                                                    </Button>
                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <AIResponseRenderer 
                                                                        content={msg.text}
                                                                        className="text-xs sm:text-sm leading-relaxed opacity-90 ai-response"
                                                                        sources={msg.sources}
                                                                    />
                                                                    {msg.file && (
                                                                        <div className="mt-3">
                                                                            <EnhancedFileDisplay 
                                                                                file={msg.file} 
                                                                                compact={true}
                                                                                className="bg-white/5 border-white/10"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Message Footer */}
                                                        {isLong && !isCollapsed && msg.sender !== 'bot' && (
                                                            <div className="px-2 sm:px-3 pb-1 sm:pb-2">
                                                                <Button
                                                                    variant="link"
                                                                    size="sm"
                                                                    onClick={() => toggleMessageCollapse(index)}
                                                                    className="h-auto p-0 text-xs font-medium hover:underline"
                                                                >
                                                                    Show less
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                 {msg.userId === user?.uid && (
                                                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 flex-shrink-0 shadow-lg ring-2 ring-background">
                                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/80">
                                                                <User className="size-5 text-muted-foreground" />
                                                        </div>
                                                    </Avatar>
                                                )}
                                            </div>
                                            );
                                        })}
                                        {isSending && currentTab && chats[currentTab].messages.at(-1)?.sender !== 'bot' && (
                                             <div className="flex items-start gap-3 w-full mb-4 animate-in slide-in-from-bottom-2 duration-300">
                                                <Avatar className="h-10 w-10 border-2 flex-shrink-0 shadow-lg ring-2 ring-background">
                                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary/80">
                                                        <img 
                                                            src="/courseconnect-logo-profile.png" 
                                                            alt="AI" 
                                                            className="size-6 object-contain"
                                                        />
                                                    </div>
                                                </Avatar>
                                                <div className="px-3 pb-3">
                                                    <div className="text-xs text-muted-foreground mb-1">
                                                        CourseConnect AI
                                                    </div>
                                                    <RippleText text="thinking..." className="text-sm font-medium text-primary" />
                                                </div>
                                            </div>
                                        )}
                                     </div>
                                 </ScrollArea>
                                 
                                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50">
                                    <FuturisticChatInput
                                        value={inputValue}
                                        onChange={e => setInputValue(e.target.value)}
                                        onSend={() => handleSendMessage(new Event('submit') as any)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(new Event('submit') as any);
                                            }
                                        }}
                                        onFileUpload={handleFileUpload}
                                        onFileWithText={handleFileWithText}
                                        placeholder={
                                            isMuted 
                                                ? `You're muted for ${Math.ceil((muteEndTime - Date.now()) / 1000)}s...`
                                                : "Ask anything"
                                        }
                                        disabled={isSending || isMuted}
                                        isSending={isSending}
                                        className="w-full"
                                    />
                                </div>
                             </TabsContent>
                        )}
                    </Tabs>
                    ) : (
                         <div className="flex flex-col flex-grow items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 p-12 text-center">
                            <h3 className="text-xl font-semibold mb-2">No Class Chats Found</h3>
                            <p className="text-muted-foreground mb-4">
                                Upload a syllabus to find your classes and start chatting.
                            </p>
                            <Button asChild>
                                <Link href="/dashboard/upload">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Syllabus
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
            
            {/* In-Depth Analysis Modal */}
            <Dialog open={isAnalysisModalOpen} onOpenChange={setIsAnalysisModalOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            In-Depth Analysis
                        </DialogTitle>
                        <DialogDescription>
                            Detailed explanation for: "{analysisQuestion}"
                        </DialogDescription>
                    </DialogHeader>
                    <div className="overflow-y-auto max-h-[60vh] pr-4">
                        <div className="prose prose-sm max-w-none">
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                {analysisContent}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => setIsAnalysisModalOpen(false)}
                        >
                            Close
                        </Button>
                        <Button
                            onClick={() => {
                                navigator.clipboard.writeText(analysisContent);
                                toast({
                                    title: "Copied!",
                                    description: "Analysis copied to clipboard",
                                });
                            }}
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Analysis
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Reset Chat Confirmation Dialog */}
            <Dialog open={showResetDialog} onOpenChange={(open) => {
                if (!open) {
                    setShowResetDialog(false);
                    setChatToManage(null);
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
                    setChatToManage(null);
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
        </div>
        </>
    );
}


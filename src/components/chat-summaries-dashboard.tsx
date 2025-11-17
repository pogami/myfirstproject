"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, BookOpen, Loader2, ChevronRight, Check, Clock, TrendingUp } from 'lucide-react';
import BotResponse from '@/components/bot-response';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/hooks/use-chat-store';
import { auth } from '@/lib/firebase/client-simple';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatSummary {
  chatId: string;
  chatName: string;
  summary: string;
  messageCount: number;
  courseCode?: string;
}

export function ChatSummariesDashboard() {
  const [summaries, setSummaries] = useState<ChatSummary[]>([]);
  const [selectedSummary, setSelectedSummary] = useState<ChatSummary | null>(null);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { chats } = useChatStore();
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { toast } = useToast();
  const isFetchingRef = useRef(false);
  const lastChatsHashRef = useRef<string>('');
  const hasInitiallyFetchedRef = useRef(false);

  useEffect(() => {
    // Get user
    if (auth && typeof auth.onAuthStateChanged === 'function') {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        setUser(user);
      });
      return unsubscribe;
    } else {
      const guestUser = localStorage.getItem('guestUser');
      if (guestUser) {
        try {
          setUser(JSON.parse(guestUser));
        } catch (e) {
          setUser(null);
        }
      }
    }
  }, []);

  // Function to fetch summary for a single chat
  const fetchChatSummary = async (chat: any): Promise<ChatSummary | null> => {
    const messages = chat.messages || [];
    
    if (messages.length === 0) {
      return null;
    }

    try {
      // Limit message content to avoid huge payloads
      const recentMessages = messages.slice(-50); // Last 50 messages
      const chatContent = recentMessages
        .map((msg: any) => {
          const sender = msg.sender === 'user' ? 'You' : 'AI';
          const text = (msg.text || msg.content || '').substring(0, 500); // Limit message length
          return `${sender}: ${text}`;
        })
        .join('\n\n');

      // Add timeout to each request - reduced for faster feedback
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      // Determine chat title for API - explicitly handle general chat
      const isGeneralChatForAPI = chat.id === 'private-general-chat';
      const chatTitle = isGeneralChatForAPI 
        ? 'General Chat'
        : (chat.courseData?.courseCode || chat.title || 'General Chat');

      const response = await fetch('/api/chat/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chat.id,
          chatTitle: chatTitle,
          messages: chatContent,
          courseData: chat.courseData,
          chatType: chat.chatType
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      // Check if API returned an error
      if (!data.success || !data.summary) {
        return null;
      }
      
      // Determine chat name - explicitly handle general chat
      const isGeneralChat = chat.id === 'private-general-chat';
      const chatName = isGeneralChat 
        ? 'General Chat'
        : (chat.courseData?.courseCode || chat.title || 'General Chat');
      
      // Only return if we have a valid summary
      if (!data.summary || data.summary.trim().length === 0) {
        return null;
      }

      return {
        chatId: chat.id,
        chatName: chatName,
        summary: data.summary.trim(),
        messageCount: messages.length,
        courseCode: chat.courseData?.courseCode
      };
    } catch (error: any) {
      return null;
    }
  };

  useEffect(() => {
    // Don't fetch if user isn't loaded yet
    if (!user && !localStorage.getItem('guestUser')) {
      return;
    }

    // Create a hash of chat IDs and message counts to detect actual changes
    const chatsHash = Object.keys(chats)
      .sort()
      .map(chatId => {
        const chat = chats[chatId];
        return `${chatId}:${(chat.messages || []).length}:${chat.messages?.[chat.messages.length - 1]?.timestamp || 0}`;
      })
      .join('|');

    // Skip if already fetching
    if (isFetchingRef.current) {
      return;
    }

    // Always allow initial fetch, but skip if chats haven't changed after that
    if (hasInitiallyFetchedRef.current && chatsHash === lastChatsHashRef.current) {
      // But ensure loading is off if we have summaries
      if (summaries.length > 0) {
        setIsLoading(false);
      }
      return;
    }

    // Update the hash
    lastChatsHashRef.current = chatsHash;

    const fetchSummaries = async () => {
      // Prevent multiple simultaneous fetches
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      
      setIsLoading(true);
      const classChats = Object.values(chats).filter((chat: any) => chat.chatType === 'class');
      const generalChat = chats['private-general-chat'];

      if (classChats.length === 0 && (!generalChat || (generalChat.messages || []).length === 0)) {
        setIsLoading(false);
        isFetchingRef.current = false;
        return;
      }

      try {
        // Filter chats with messages and limit to most recent 5 chats (to make room for General Chat)
        const chatsWithMessages = classChats
          .filter((chat: any) => (chat.messages || []).length > 0)
          .sort((a: any, b: any) => {
            // Sort by most recent message
            const aLastMsg = a.messages?.[a.messages.length - 1]?.timestamp || 0;
            const bLastMsg = b.messages?.[b.messages.length - 1]?.timestamp || 0;
            return bLastMsg - aLastMsg;
          })
          .slice(0, 5); // Limit to 5 most recent chats (General Chat will be 6th)

        // Build list of all chats to fetch (General Chat first, then class chats)
        const chatsToFetch: any[] = [];
        if (generalChat && (generalChat.messages || []).length > 0) {
          chatsToFetch.push(generalChat);
        }
        chatsToFetch.push(...chatsWithMessages);

        // If no chats to fetch, clear loading immediately
        if (chatsToFetch.length === 0) {
          setIsLoading(false);
          isFetchingRef.current = false;
          return;
        }

        // Fetch summaries progressively - show results as they come in
        const allSummaries: ChatSummary[] = [];
        
        // Add overall timeout to prevent infinite loading (20 seconds total - reduced)
        const overallTimeout = setTimeout(() => {
          setIsLoading(false);
          isFetchingRef.current = false;
          // Show whatever summaries we have so far
          if (allSummaries.length > 0) {
            setSummaries(allSummaries);
          }
        }, 20000);
        
        try {
          // Process summaries one by one to show progressive loading
          for (let i = 0; i < chatsToFetch.length; i++) {
            const chat = chatsToFetch[i];
            
            try {
              const summary = await fetchChatSummary(chat);
              if (summary && summary.summary && summary.summary.trim().length > 0) {
                // Add to list maintaining order (General Chat first)
                const isGeneral = chat.id === 'private-general-chat';
                if (isGeneral) {
                  allSummaries.unshift(summary);
                } else {
                  allSummaries.push(summary);
                }
                
                // Update state immediately with partial results
                setSummaries([...allSummaries]);
                
                // Hide loading once we have at least one summary
                if (allSummaries.length === 1) {
                  setIsLoading(false);
                }
              }
            } catch (error) {
              // Skip failed summaries and continue
            }
          }
        } finally {
          // Always clear timeout and loading state
          clearTimeout(overallTimeout);
          setIsLoading(false);
          
          // Mark that we've done initial fetch
          hasInitiallyFetchedRef.current = true;
          
          // Final update with all summaries (even if empty)
          setSummaries(allSummaries);
        }
      } catch (err: any) {
        setIsLoading(false);
        isFetchingRef.current = false;
        hasInitiallyFetchedRef.current = true; // Mark as fetched even on error
        // Ensure we show empty state if there's an error
        setSummaries([]);
      } finally {
        // Double-check loading is off
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };

    // Debounce to avoid rapid successive calls
    const timer = setTimeout(fetchSummaries, 500);
    return () => clearTimeout(timer);
  }, [chats, user]);

  // Auto-update General Chat summary when messages change (no refresh needed)
  const lastGeneralChatMessageCountRef = useRef<number>(0);
  useEffect(() => {
    const generalChat = chats['private-general-chat'];
    if (!generalChat || (generalChat.messages || []).length === 0) {
      lastGeneralChatMessageCountRef.current = 0;
      return;
    }

    const currentMessageCount = (generalChat.messages || []).length;
    // Skip if message count hasn't changed
    if (currentMessageCount === lastGeneralChatMessageCountRef.current) {
      return;
    }

    lastGeneralChatMessageCountRef.current = currentMessageCount;

    // Debounce updates to avoid too frequent API calls
    const updateTimer = setTimeout(async () => {
      // Check if we're already fetching to avoid duplicate calls
      if (isFetchingRef.current) {
        return;
      }
      
      const newSummary = await fetchChatSummary(generalChat);
      if (newSummary) {
        setSummaries(prev => {
          // Only update if the summary actually changed
          const existing = prev.find(s => s.chatId === 'private-general-chat');
          if (existing && existing.messageCount === newSummary.messageCount) {
            return prev; // No change
          }
          // Update or add General Chat summary
          const otherSummaries = prev.filter(s => s.chatId !== 'private-general-chat');
          return [newSummary, ...otherSummaries];
        });
      }
    }, 2000); // Wait 2 seconds after last message change

    return () => clearTimeout(updateTimer);
  }, [chats['private-general-chat']?.messages?.length, chats['private-general-chat']?.messages?.[chats['private-general-chat']?.messages?.length - 1]?.timestamp]);

  // Loading state with AI message - Card style same as study focus suggestions
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Course Summaries</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Quick overview of what you've been discussing in each course
            </p>
          </div>
        </div>
        <Card className="border-2 border-dashed border-muted-foreground/30 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 relative overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center text-center p-8 space-y-6 min-h-[200px]">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 animate-pulse"></div>
            
            {/* Main animation */}
            <div className="relative z-10 space-y-6">
              {/* Elegant loading animation */}
              <div className="relative">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center shadow-lg">
                  <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
                <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-primary/20 to-primary/10 animate-ping"></div>
              </div>
              
              {/* Text content */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-primary">Generating Your Summaries</h3>
                <p className="text-muted-foreground">AI is analyzing your conversations to create helpful summaries...</p>
              </div>
              
              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state - only show if not loading and actually empty
  if (summaries.length === 0 && !isLoading) {
    const classChats = Object.values(chats).filter((chat: any) => chat.chatType === 'class');
    const hasClassChats = classChats.length > 0;
    const hasMessages = classChats.some((chat: any) => (chat.messages || []).length > 0);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Course Summaries</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Quick overview of what you've been discussing in each course
            </p>
          </div>
        </div>
        <Card className="border-dashed border-2 border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your summaries will appear here soon
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                  Once you've had a few conversations in your class chats, I'll create helpful summaries of what you've discussed. Keep the conversations going!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Course Summaries</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {summaries.length === 1 
                ? "Here's what you've been discussing"
                : `Here's what you've been discussing across ${summaries.length} ${summaries.length === 1 ? 'course' : 'courses'}`}
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {summaries.map((summary, idx) => {
            const isGeneralChat = summary.chatId === 'private-general-chat';
            // Get last message timestamp for recency
            const chat = chats[summary.chatId];
            const lastMessage = chat?.messages?.[chat.messages.length - 1];
            const lastMessageTime = lastMessage?.timestamp ? new Date(lastMessage.timestamp) : null;
            
            const getTimeAgo = (date: Date): string => {
              const now = new Date();
              const diffMs = now.getTime() - date.getTime();
              const diffMins = Math.floor(diffMs / 60000);
              const diffHours = Math.floor(diffMs / 3600000);
              const diffDays = Math.floor(diffMs / 86400000);
              
              if (diffMins < 60) {
                return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
              }
              if (diffHours < 24) {
                const remainingMins = diffMins % 60;
                if (remainingMins === 0) {
                  return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
                }
                return `${diffHours} hour${diffHours !== 1 ? 's' : ''} and ${remainingMins} min${remainingMins !== 1 ? 's' : ''} ago`;
              }
              if (diffDays < 7) {
                return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
              }
              return date.toLocaleDateString();
            };
            
            // Add visual variety - different colors per course
            const courseColors = [
              { bg: 'bg-slate-100 dark:bg-slate-900/30', icon: 'text-slate-700 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-800' },
              { bg: 'bg-cyan-100 dark:bg-cyan-900/30', icon: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800' },
              { bg: 'bg-violet-100 dark:bg-violet-900/30', icon: 'text-violet-700 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800' },
              { bg: 'bg-teal-100 dark:bg-teal-900/30', icon: 'text-teal-700 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800' },
              { bg: 'bg-indigo-100 dark:bg-indigo-900/30', icon: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' },
              { bg: 'bg-pink-100 dark:bg-pink-900/30', icon: 'text-pink-700 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800' }
            ];
            const courseColor = isGeneralChat 
              ? { bg: 'bg-purple-50/30 dark:bg-purple-950/20', icon: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' }
              : courseColors[idx % courseColors.length];
            
            return (
              <Card 
                key={summary.chatId} 
                className={`border ${isGeneralChat ? courseColor.border : courseColor.border} ${isGeneralChat ? courseColor.bg : ''} hover:shadow-lg transition-shadow duration-300 cursor-pointer flex flex-col h-full`}
                onClick={() => {
                  setSelectedSummary(summary);
                  setShowSummaryDialog(true);
                }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className={`p-1.5 rounded-md ${courseColor.bg}`}>
                      {isGeneralChat ? (
                        <MessageSquare className={`h-4 w-4 ${courseColor.icon}`} />
                      ) : (
                        <BookOpen className={`h-4 w-4 ${courseColor.icon}`} />
                      )}
                    </div>
                    <span className="truncate">{summary.chatName}</span>
                    {isGeneralChat && (
                      <span className="ml-auto text-xs font-normal text-purple-600 dark:text-purple-400">General</span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs flex items-center gap-2">
                    <span>{summary.messageCount} message{summary.messageCount !== 1 ? 's' : ''}</span>
                    {lastMessageTime && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(lastMessageTime)}
                        </span>
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed mb-3">
                  {summary.summary}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-full text-xs ${courseColor.icon} hover:opacity-80 mt-auto`}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/chat?tab=${summary.chatId}`);
                  }}
                >
                  View Chat
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </CardContent>
            </Card>
          );
          })}
        </div>
      </div>

      {/* Summary Detail Dialog */}
      <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSummary?.chatName} - Summary
            </DialogTitle>
            <DialogDescription>
              {(() => {
                const chat = selectedSummary ? chats[selectedSummary.chatId] : null;
                const lastMsg = chat?.messages?.[chat.messages.length - 1];
                const lastTime = lastMsg?.timestamp ? new Date(lastMsg.timestamp) : null;
                
                if (selectedSummary && lastTime) {
                  const getTimeAgo = (date: Date): string => {
                    const now = new Date();
                    const diffMs = now.getTime() - date.getTime();
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMs / 3600000);
                    const diffDays = Math.floor(diffMs / 86400000);
                    
                    if (diffMins < 60) {
                      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
                    }
                    if (diffHours < 24) {
                      const remainingMins = diffMins % 60;
                      if (remainingMins === 0) {
                        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
                      }
                      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} and ${remainingMins} min${remainingMins !== 1 ? 's' : ''} ago`;
                    }
                    if (diffDays < 7) {
                      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
                    }
                    return date.toLocaleDateString();
                  };
                  return `Summary generated from ${selectedSummary.messageCount} messages. Last updated ${getTimeAgo(lastTime)}.`;
                }
                return "AI-generated summary of your conversation";
              })()}
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            {selectedSummary && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <BotResponse 
                  content={selectedSummary.summary} 
                  className="text-sm text-gray-700 dark:text-gray-300"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowSummaryDialog(false)}
            >
              Close
            </Button>
            {selectedSummary && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedSummary.summary);
                    setCopiedSummary(true);
                    setTimeout(() => setCopiedSummary(false), 2000);
                    toast({
                      title: "Copied",
                      description: "Summary copied to clipboard",
                    });
                  }}
                >
                  {copiedSummary ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowSummaryDialog(false);
                    router.push(`/dashboard/chat?tab=${selectedSummary.chatId}`);
                  }}
                >
                  Open Chat
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


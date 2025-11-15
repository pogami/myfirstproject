"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageSquare, BookOpen, Loader2, ChevronRight, Check } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSummary, setSelectedSummary] = useState<ChatSummary | null>(null);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const { chats } = useChatStore();
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { toast } = useToast();

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

  useEffect(() => {
    const fetchSummaries = async () => {
      const classChats = Object.values(chats).filter((chat: any) => chat.chatType === 'class');
      
      if (classChats.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Filter chats with messages and limit to most recent 6 chats
        const chatsWithMessages = classChats
          .filter((chat: any) => (chat.messages || []).length > 0)
          .sort((a: any, b: any) => {
            // Sort by most recent message
            const aLastMsg = a.messages?.[a.messages.length - 1]?.timestamp || 0;
            const bLastMsg = b.messages?.[b.messages.length - 1]?.timestamp || 0;
            return bLastMsg - aLastMsg;
          })
          .slice(0, 6); // Limit to 6 most recent chats

        if (chatsWithMessages.length === 0) {
          setIsLoading(false);
          return;
        }

        // Fetch summaries for chats (with timeout per request)
        const summaryPromises = chatsWithMessages.map(async (chat: any) => {
          const messages = chat.messages || [];
          
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

            // Add timeout to each request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

            const response = await fetch('/api/chat/summarize', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                chatId: chat.id,
                chatTitle: chat.courseData?.courseCode || chat.title,
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
            
            return {
              chatId: chat.id,
              chatName: chat.courseData?.courseCode || chat.title || 'Unknown Course',
              summary: data.summary || '',
              messageCount: messages.length,
              courseCode: chat.courseData?.courseCode
            };
          } catch (error: any) {
            if (error.name === 'AbortError') {
              console.warn(`Summary timeout for ${chat.id}`);
            } else {
              console.error(`Error fetching summary for ${chat.id}:`, error);
            }
            return null;
          }
        });

        // Process summaries as they complete (don't wait for all)
        const results = await Promise.allSettled(summaryPromises);
        const validSummaries = results
          .filter((result): result is PromiseFulfilledResult<ChatSummary | null> => 
            result.status === 'fulfilled' && result.value !== null
          )
          .map(result => result.value)
          .filter((s): s is ChatSummary => s !== null);
        
        setSummaries(validSummaries);
      } catch (err: any) {
        console.error('Error fetching chat summaries:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to ensure chats are loaded
    const timer = setTimeout(fetchSummaries, 500);
    return () => clearTimeout(timer);
  }, [chats, user]);

  if (isLoading) {
    return (
      <Card className="border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Generating chat summaries...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (summaries.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Course Summaries</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Quick overview of what you've been discussing in each course
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {summaries.map((summary) => (
            <Card 
              key={summary.chatId} 
              className="border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all cursor-pointer"
              onClick={() => {
                setSelectedSummary(summary);
                setShowSummaryDialog(true);
              }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                    <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="truncate">{summary.chatName}</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  {summary.messageCount} message{summary.messageCount !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed mb-3">
                  {summary.summary}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
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
          ))}
        </div>
      </div>

      {/* Summary Detail Dialog */}
      <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              {selectedSummary?.chatName} - Summary
            </DialogTitle>
            <DialogDescription>
              AI-generated summary of your conversation
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            {selectedSummary && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedSummary.summary}
                </div>
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


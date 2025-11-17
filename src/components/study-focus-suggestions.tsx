"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BookOpen, Target, Lightbulb, ArrowRight, Loader2, TrendingUp, Check, Sparkles, Clock, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/hooks/use-chat-store';
import { auth } from '@/lib/firebase/client-simple';
import BotResponse from '@/components/bot-response';

interface StudySuggestion {
  title: string;
  description: string;
  course: string;
  actionUrl: string;
  type: 'topic' | 'assignment' | 'review' | 'focus';
  priority: 'high' | 'medium' | 'low';
  focusPoints?: string[];
  undiscussedTopics?: string[];
}

export function StudyFocusSuggestions() {
  const [suggestions, setSuggestions] = useState<StudySuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<StudySuggestion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { chats } = useChatStore();
  const [user, setUser] = useState<any>(null);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const router = useRouter();
  const isFetchingRef = useRef(false);
  const lastChatsHashRef = useRef<string>('');

  useEffect(() => {
    if (auth && typeof (auth as any).onAuthStateChanged === 'function') {
      const unsubscribe = (auth as any).onAuthStateChanged((user: any) => {
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

  // Calculate total message count to detect changes
  const currentMessageCount = Object.values(chats).reduce((total: number, chat: any) => {
    return total + (chat.messages?.length || 0);
  }, 0);

  useEffect(() => {
    // Create a hash of chat IDs and message counts to detect actual changes
    const chatsHash = Object.keys(chats)
      .sort()
      .map(chatId => {
        const chat = chats[chatId];
        return `${chatId}:${(chat.messages || []).length}`;
      })
      .join('|');

    // Skip if already fetching or if chats haven't actually changed
    if (isFetchingRef.current || (chatsHash === lastChatsHashRef.current && currentMessageCount === lastMessageCount)) {
      return;
    }

    // Update the hash
    lastChatsHashRef.current = chatsHash;

    const fetchSuggestions = async () => {
      if (Object.keys(chats).length === 0) {
        setIsLoading(false);
        return;
      }

      // Prevent multiple simultaneous fetches
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      setIsLoading(true);
      try {
        const response = await fetch('/api/dashboard/ai-suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chats,
            userId: user?.uid || 'guest'
          }),
        }).catch((fetchError) => {
          // Handle network errors
          throw new Error('Network error: Unable to connect to server');
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`Failed to fetch suggestions: ${response.status}`);
        }

        const data = await response.json().catch((parseError) => {
          throw new Error('Invalid response from server');
        });

        if (data.success && data.suggestions) {
          // Filter out study patterns and focus on chat-based suggestions
          const studySuggestions = data.suggestions
            .filter((s: any) => 
              s.type !== 'pattern' && // Remove study patterns
              (s.type === 'ai-recommendation' || 
               s.type === 'review' || 
               s.type === 'progression' ||
               s.type === 'topic' ||
               s.type === 'dependency')
            )
            .slice(0, 3) // Show top 3
            .map((s: any) => ({
              title: s.title,
              description: s.description,
              course: s.course || 'Course',
              actionUrl: s.actionUrl,
              type: s.type === 'review' ? 'review' : s.type === 'progression' ? 'topic' : 'focus',
              priority: s.priority || 'medium',
              focusPoints: s.focusPoints || [], // Add bullet points if available
              undiscussedTopics: s.undiscussedTopics || [] // Add undiscussed topics
            }));
          
          // Only update if suggestions actually changed
          setSuggestions(prev => {
            const prevHash = prev.map(s => `${s.title}:${s.course}`).sort().join('|');
            const newHash = studySuggestions.map(s => `${s.title}:${s.course}`).sort().join('|');
            if (prevHash === newHash) {
              return prev; // No change, return previous state
            }
            return studySuggestions;
          });
          setLastMessageCount(currentMessageCount);
        } else {
          // API returned success: false or no suggestions
          setSuggestions([]);
        }
      } catch (err: any) {
        // Silently fail - don't show error to user, just don't show suggestions
        setSuggestions([]);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };

    // Debounce to avoid rapid successive calls
    const timer = setTimeout(fetchSuggestions, 1000);
    return () => clearTimeout(timer);
  }, [chats, user, currentMessageCount, lastMessageCount]);

  // Loading state with AI message - Card style similar to flashcards
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Here's what's calling your attention
          </h2>
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
                <h3 className="text-xl font-semibold text-primary">Analyzing Your Conversations</h3>
                <p className="text-muted-foreground">AI is generating personalized suggestions...</p>
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
  if (suggestions.length === 0 && !isLoading) {
    const hasMessages = currentMessageCount > 0;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Here's what's calling your attention
          </h2>
        </div>
        <Card className="border-dashed border-2 border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Lightbulb className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your study suggestions will appear here soon
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                  Once you've had a few conversations, I'll highlight key topics and areas to focus on. Keep the chat going!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'review':
        return <Target className="h-5 w-5 text-orange-500 dark:text-orange-400" />;
      case 'topic':
        return <BookOpen className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      case 'focus':
        return <Lightbulb className="h-5 w-5 text-purple-500 dark:text-purple-400" />;
      default:
        return <TrendingUp className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />;
    }
  };

  // Check if a topic has been discussed in any chat and get metadata
  const getTopicInfo = (topic: string): { discussed: boolean; lastDiscussed?: Date; frequency: number } => {
    if (!topic || topic.trim().length === 0) return { discussed: false, frequency: 0 };
    
    // Normalize topic name for matching (lowercase, remove extra spaces)
    const normalizedTopic = topic.toLowerCase().trim();
    const topicWords = normalizedTopic.split(/\s+/).filter(w => w.length > 2); // Filter out short words
    
    // Get all messages from all chats with timestamps
    const allMessages = Object.values(chats).flatMap((chat: any) => 
      (chat.messages || []).map((msg: any) => ({
        text: (msg.text || msg.content || '').toLowerCase(),
        timestamp: msg.timestamp || 0
      }))
    );
    
    let discussed = false;
    let lastDiscussed: Date | undefined;
    let frequency = 0;
    
    // Check if topic appears in any message
    for (const message of allMessages) {
      const messageText = message.text;
      let matches = false;
      
      // Check for exact topic match (case-insensitive)
      if (messageText.includes(normalizedTopic)) {
        matches = true;
      } else {
        // Check if significant words from topic appear in message
        const matchingWords = topicWords.filter(word => 
          messageText.includes(word) || 
          messageText.includes(word + 's') || // Handle plurals
          messageText.includes(word + 'es') ||
          messageText.includes(word + 'ing')
        );
        
        if (topicWords.length >= 3) {
          // For longer topics, require at least 60% word match
          if (matchingWords.length >= Math.ceil(topicWords.length * 0.6)) {
            matches = true;
          }
        } else if (topicWords.length >= 2) {
          // For shorter topics, require at least 2 words to match
          if (matchingWords.length >= 2) {
            matches = true;
          }
        } else if (topicWords.length === 1) {
          // Single word topics - check for exact match or close variations
          const word = topicWords[0];
          if (messageText.includes(word) && word.length > 4) {
            matches = true;
          }
        }
      }
      
      if (matches) {
        discussed = true;
        frequency++;
        const msgDate = new Date(message.timestamp);
        if (!lastDiscussed || msgDate > lastDiscussed) {
          lastDiscussed = msgDate;
        }
      }
    }
    
    return { discussed, lastDiscussed, frequency };
  };

  const isTopicDiscussed = (topic: string): boolean => {
    return getTopicInfo(topic).discussed;
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Here's what's calling your attention
          </h2>
        </div>
        
        <div className="grid gap-5 md:gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {suggestions.map((suggestion, idx) => {
            const iconColors = [
              { bg: 'bg-amber-50 dark:bg-amber-950/20', icon: 'text-amber-600 dark:text-amber-500' },
              { bg: 'bg-emerald-50 dark:bg-emerald-950/20', icon: 'text-emerald-600 dark:text-emerald-500' },
              { bg: 'bg-rose-50 dark:bg-rose-950/20', icon: 'text-rose-600 dark:text-rose-500' }
            ];
            const iconColor = iconColors[idx % 3];
            
            return (
            <Card 
              key={idx}
              className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer group flex flex-col h-full"
              onClick={() => {
                setSelectedSuggestion(suggestion);
                setIsDialogOpen(true);
              }}
            >
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="flex items-center gap-3 text-base">
                  <div className={`p-2 rounded-lg ${iconColor.bg}`}>
                    <div className={iconColor.icon}>
                      {getIcon(suggestion.type)}
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors line-clamp-2">
                    {suggestion.title}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="flex-1 flex flex-col">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed line-clamp-2">
                    {suggestion.description}
                  </p>
                  
                  {/* Bullet points for focus areas - show first 2 in card */}
                  {suggestion.focusPoints && suggestion.focusPoints.length > 0 && (
                    <ul className="space-y-1 mb-3 flex-1">
                      {suggestion.focusPoints.slice(0, 2).map((point, idx) => (
                        <li key={idx} className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-blue-500 dark:text-blue-400 mt-1.5">•</span>
                          <span className="line-clamp-1">{point}</span>
                        </li>
                      ))}
                      {suggestion.focusPoints.length > 2 && (
                        <li className="text-xs text-gray-400 dark:text-gray-500 italic">
                          +{suggestion.focusPoints.length - 2} more
                        </li>
                      )}
                    </ul>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {suggestion.course}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (suggestion.actionUrl.startsWith('/')) {
                        router.push(suggestion.actionUrl);
                      } else {
                        window.location.href = suggestion.actionUrl;
                      }
                    }}
                  >
                    Open Chat
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      </div>

      {/* Dialog for full suggestion details */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
                {selectedSuggestion && getIcon(selectedSuggestion.type)}
              </div>
              <span>{selectedSuggestion?.title}</span>
            </DialogTitle>
            <DialogDescription>
              {selectedSuggestion?.course}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {selectedSuggestion?.description}
            </p>
            
            {/* Full bullet points list */}
            {selectedSuggestion?.focusPoints && selectedSuggestion.focusPoints.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Key areas to focus on:
                </h4>
                <ul className="space-y-2">
                  {selectedSuggestion.focusPoints.map((point, idx) => (
                    <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="text-blue-500 dark:text-blue-400 mt-1.5 flex-shrink-0">•</span>
                      <div className="flex-1">
                        <BotResponse content={point} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Clickable undiscussed topics */}
            {selectedSuggestion?.undiscussedTopics && selectedSuggestion.undiscussedTopics.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Topics waiting for you:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSuggestion.undiscussedTopics.map((topic, idx) => {
                    // Extract chatId from actionUrl
                    const chatIdMatch = selectedSuggestion.actionUrl.match(/tab=([^&]+)/);
                    const chatId = chatIdMatch ? chatIdMatch[1] : '';
                    const topicQuestion = `Help me understand ${topic}`;
                    const topicUrl = `/dashboard/chat?tab=${chatId}&prefill=${encodeURIComponent(topicQuestion)}`;
                    
                    const topicInfo = getTopicInfo(topic);
                    const discussed = topicInfo.discussed;
                    
                    // Format time ago - show hours and minutes when > 60 minutes
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
                    
                    return (
                      <div key={idx} className="relative group">
                        <Button
                          variant={discussed ? "default" : "outline"}
                          size="sm"
                          className={`text-xs transition-all relative ${
                            discussed 
                              ? "bg-green-600 hover:bg-green-700 text-white border-green-600 dark:bg-green-600 dark:hover:bg-green-700 dark:text-white" 
                              : "hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                          onClick={() => {
                            setIsDialogOpen(false);
                            router.push(topicUrl);
                          }}
                        >
                          {discussed ? (
                            <>
                              <Check className="h-3 w-3 mr-1.5" />
                              {topic}
                              {topicInfo.frequency > 1 && (
                                <span className="ml-1.5 text-xs opacity-90">({topicInfo.frequency}x)</span>
                              )}
                            </>
                          ) : (
                            <>
                              <BookOpen className="h-3 w-3 mr-1.5" />
                              {topic}
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  {(() => {
                    const discussedCount = selectedSuggestion.undiscussedTopics.filter(t => isTopicDiscussed(t)).length;
                    const totalCount = selectedSuggestion.undiscussedTopics.length;
                    
                    if (discussedCount === 0) {
                      return "You haven't chatted about these topics yet. Click any topic to start exploring!";
                    } else if (discussedCount === totalCount) {
                      return `Nice work! You've covered all ${totalCount} topics. Keep the momentum going! 🎉`;
                    } else {
                      return `You're making progress! ${discussedCount} of ${totalCount} topics covered. Keep going!`;
                    }
                  })()}
                </p>
                {/* Show last discussed topic info below progress message */}
                {(() => {
                  const discussedTopics = selectedSuggestion.undiscussedTopics
                    .map(topic => ({ topic, info: getTopicInfo(topic) }))
                    .filter(({ info }) => info.discussed && info.lastDiscussed)
                    .sort((a, b) => (b.info.lastDiscussed?.getTime() || 0) - (a.info.lastDiscussed?.getTime() || 0));
                  
                  if (discussedTopics.length > 0) {
                    const mostRecent = discussedTopics[0];
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
                    
                    return (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Last discussed: <span className="font-medium">{mostRecent.topic}</span> {getTimeAgo(mostRecent.info.lastDiscussed!)} 
                        {mostRecent.info.frequency > 1 && ` (${mostRecent.info.frequency}x)`}
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  if (selectedSuggestion) {
                    if (selectedSuggestion.actionUrl.startsWith('/')) {
                      router.push(selectedSuggestion.actionUrl);
                    } else {
                      window.location.href = selectedSuggestion.actionUrl;
                    }
                    setIsDialogOpen(false);
                  }
                }}
              >
                Open Chat
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


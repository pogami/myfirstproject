"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BookOpen, Target, Lightbulb, ArrowRight, Loader2, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/hooks/use-chat-store';
import { auth } from '@/lib/firebase/client-simple';

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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState<StudySuggestion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { chats } = useChatStore();
  const [user, setUser] = useState<any>(null);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const router = useRouter();

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
    const fetchSuggestions = async () => {
      if (Object.keys(chats).length === 0) {
        setIsLoading(false);
        return;
      }

      // Only show loading if this is the first fetch or if messages changed significantly
      if (lastMessageCount === 0 || Math.abs(currentMessageCount - lastMessageCount) >= 3) {
        setIsLoading(true);
      }

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
          console.error('Network error fetching suggestions:', fetchError);
          throw new Error('Network error: Unable to connect to server');
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error('API error response:', response.status, errorText);
          throw new Error(`Failed to fetch suggestions: ${response.status}`);
        }

        const data = await response.json().catch((parseError) => {
          console.error('Error parsing response:', parseError);
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
          
          setSuggestions(studySuggestions);
          setLastMessageCount(currentMessageCount);
        } else {
          // API returned success: false or no suggestions
          setSuggestions([]);
        }
      } catch (err: any) {
        console.error('Error fetching study suggestions:', err);
        // Silently fail - don't show error to user, just don't show suggestions
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce to avoid too frequent updates, but update when messages change
    const timer = setTimeout(fetchSuggestions, currentMessageCount !== lastMessageCount ? 1000 : 500);
    return () => clearTimeout(timer);
  }, [chats, user, currentMessageCount, lastMessageCount]);

  if (isLoading) {
    return (
      <Card className="border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Analyzing your study patterns...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return null;
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

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            What to Focus On
          </h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {suggestions.map((suggestion, idx) => (
            <Card 
              key={idx}
              className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
              onClick={() => {
                setSelectedSuggestion(suggestion);
                setIsDialogOpen(true);
              }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-base">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
                    {getIcon(suggestion.type)}
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {suggestion.title}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed line-clamp-2">
                  {suggestion.description}
                </p>
                
                {/* Bullet points for focus areas - show first 2 in card */}
                {suggestion.focusPoints && suggestion.focusPoints.length > 0 && (
                  <ul className="space-y-1 mb-3">
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
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {suggestion.course}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/50"
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
          ))}
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
                  Focus Areas:
                </h4>
                <ul className="space-y-2">
                  {selectedSuggestion.focusPoints.map((point, idx) => (
                    <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="text-blue-500 dark:text-blue-400 mt-1.5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Clickable undiscussed topics */}
            {selectedSuggestion?.undiscussedTopics && selectedSuggestion.undiscussedTopics.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Topics to Explore:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSuggestion.undiscussedTopics.map((topic, idx) => {
                    // Extract chatId from actionUrl
                    const chatIdMatch = selectedSuggestion.actionUrl.match(/tab=([^&]+)/);
                    const chatId = chatIdMatch ? chatIdMatch[1] : '';
                    const topicQuestion = `Help me understand ${topic}`;
                    const topicUrl = `/dashboard/chat?tab=${chatId}&prefill=${encodeURIComponent(topicQuestion)}`;
                    
                    return (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setIsDialogOpen(false);
                          router.push(topicUrl);
                        }}
                      >
                        <BookOpen className="h-3 w-3 mr-1.5" />
                        {topic}
                      </Button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Click any topic to start a conversation with your AI tutor
                </p>
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


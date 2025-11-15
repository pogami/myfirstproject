"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Loader2, Lightbulb, AlertCircle, BookOpen, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/hooks/use-chat-store';
import { auth } from '@/lib/firebase/client-simple';

interface AISuggestion {
  type: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  actionUrl: string;
  course?: string;
}

export function AIDashboardSuggestions() {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { chats } = useChatStore();
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Get user
    if (auth && typeof auth.onAuthStateChanged === 'function') {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        setUser(user);
      });
      return unsubscribe;
    } else {
      // Guest user
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
    const fetchSuggestions = async () => {
      if (Object.keys(chats).length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

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
        });

        if (!response.ok) {
          throw new Error('Failed to fetch suggestions');
        }

        const data = await response.json();
        if (data.success) {
          setSuggestions(data.suggestions || []);
          // Store course count for potential display
          if (data.courseCount) {
            // Could use this for course load context in UI
          }
        } else {
          throw new Error(data.error || 'Failed to load suggestions');
        }
      } catch (err: any) {
        console.error('Error fetching AI suggestions:', err);
        setError(err.message);
        // Set default suggestion on error
        setSuggestions([{
          type: 'general',
          priority: 'low',
          title: '📚 Review Your Courses',
          description: 'Check your assignments and exams, or ask your AI tutor questions.',
          action: 'View Dashboard',
          actionUrl: '/dashboard'
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to ensure chats are loaded
    const timer = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timer);
  }, [chats, user]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertCircle className="h-5 w-5 text-orange-500 dark:text-orange-400" />;
      case 'exam':
        return <Target className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      case 'study':
        return <BookOpen className="h-5 w-5 text-purple-500 dark:text-purple-400" />;
      case 'ai-recommendation':
        return <Lightbulb className="h-5 w-5 text-amber-500 dark:text-amber-400" />;
      default:
        return <Sparkles className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Analyzing your courses...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && suggestions.length === 0) {
    return null; // Don't show error state, just hide the component
  }

  if (suggestions.length === 0) {
    return null;
  }

  const primarySuggestion = suggestions[0];

  return (
    <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-700">
      <CardContent className="p-6">
        {/* Primary Suggestion */}
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 p-2 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 ring-1 ring-blue-100 dark:ring-blue-900/50">
              <div className="animate-pulse-slow">
                {getIcon(primarySuggestion.type)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
                {primarySuggestion.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 whitespace-normal break-words">
                {primarySuggestion.description}
              </p>
              <Button
                onClick={() => {
                  if (primarySuggestion.actionUrl.startsWith('/')) {
                    router.push(primarySuggestion.actionUrl);
                  } else {
                    window.location.href = primarySuggestion.actionUrl;
                  }
                }}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                {primarySuggestion.action}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Suggestions (if any) */}
        {suggestions.length > 1 && (
          <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
              More suggestions
            </p>
            <div className="space-y-2">
              {suggestions.slice(1).map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (suggestion.actionUrl.startsWith('/')) {
                      router.push(suggestion.actionUrl);
                    } else {
                      window.location.href = suggestion.actionUrl;
                    }
                  }}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-950/20 dark:hover:to-purple-950/20 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors">
                      <div className="group-hover:scale-110 transition-transform duration-200">
                        {getIcon(suggestion.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {suggestion.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed whitespace-normal break-words">
                        {suggestion.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


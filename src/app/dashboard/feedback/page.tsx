"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Clock, MessageSquare, Download, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface FeedbackItem {
  rating: 'positive' | 'negative';
  comment?: string;
  messageId: string;
  chatId: string;
  timestamp: number;
  aiContent?: string; // The AI's response that was rated
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [newFeedbackAlert, setNewFeedbackAlert] = useState(false);

  useEffect(() => {
    loadFeedback();
    
    // Listen for real-time feedback updates
    const handleFeedbackAdded = (event: any) => {
      console.log('🔔 New feedback received in real-time!', event.detail);
      loadFeedback(); // Reload all feedback
      
      // Show visual alert
      setNewFeedbackAlert(true);
      setTimeout(() => setNewFeedbackAlert(false), 3000);
    };
    
    window.addEventListener('feedbackAdded', handleFeedbackAdded);
    
    // Also listen for storage events (for cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cc-ai-feedback') {
        console.log('🔔 Feedback updated in another tab!');
        loadFeedback();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('feedbackAdded', handleFeedbackAdded);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadFeedback = () => {
    try {
      const stored = localStorage.getItem('cc-ai-feedback');
      if (stored) {
        const parsed = JSON.parse(stored);
        setFeedback(parsed);
        console.log('📊 Feedback loaded:', parsed.length, 'items');
      }
    } catch (e) {
      console.error('Failed to load feedback:', e);
    }
  };

  const clearFeedback = () => {
    if (confirm('Are you sure you want to clear all feedback data?')) {
      localStorage.removeItem('cc-ai-feedback');
      setFeedback([]);
    }
  };

  const exportFeedback = () => {
    const dataStr = JSON.stringify(feedback, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-feedback-${Date.now()}.json`;
    link.click();
  };

  const stats = {
    total: feedback.length,
    positive: feedback.filter(f => f.rating === 'positive').length,
    negative: feedback.filter(f => f.rating === 'negative').length,
    withComments: feedback.filter(f => f.comment && f.comment.trim()).length,
  };

  const positivePercentage = stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Real-time Feedback Alert */}
        {newFeedbackAlert && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl border-2 border-green-400 flex items-center gap-3 animate-bounce">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="font-semibold">🔔 New feedback received!</span>
          </div>
        )}
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/chat" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chat
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            📊 AI Feedback Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Developer view - Monitor user feedback to improve AI responses (Updates in real-time! 🔴)
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
                Positive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.positive}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {positivePercentage}% satisfaction
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">
                Negative
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {stats.negative}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Needs improvement
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 dark:border-purple-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400">
                With Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.withComments}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Detailed feedback
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <Button onClick={exportFeedback} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export JSON
          </Button>
          <Button onClick={clearFeedback} variant="destructive" className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Clear All Data
          </Button>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {feedback.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No feedback yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  User feedback will appear here when they rate AI responses
                </p>
              </CardContent>
            </Card>
          ) : (
            feedback.slice().reverse().map((item, index) => (
              <Card 
                key={index}
                className={`${
                  item.rating === 'positive' 
                    ? 'border-green-200 dark:border-green-900' 
                    : 'border-red-200 dark:border-red-900'
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {item.rating === 'positive' ? (
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <ThumbsUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <ThumbsDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                      )}
                      <div>
                        <span className={`text-sm font-semibold ${
                          item.rating === 'positive' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {item.rating === 'positive' ? 'Positive Feedback' : 'Negative Feedback'}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Response Being Rated */}
                  {item.aiContent && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-3 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">AI Response</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-4">
                        {item.aiContent}
                      </p>
                    </div>
                  )}

                  {/* User Comment */}
                  {item.comment && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">User Comment</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                        "{item.comment}"
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Chat: {item.chatId}</span>
                    <span>•</span>
                    <span>Message ID: {item.messageId.substring(0, 20)}...</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


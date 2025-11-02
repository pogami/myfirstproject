"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeedbackItem {
  rating: 'positive' | 'negative';
  comment?: string;
  messageId: string;
  chatId: string;
  timestamp: number;
}

export function FeedbackViewer() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadFeedback();
  }, []);

  // Reload feedback when viewer is opened
  useEffect(() => {
    if (isOpen) {
      loadFeedback();
    }
  }, [isOpen]);

  const loadFeedback = () => {
    try {
      const stored = localStorage.getItem('cc-ai-feedback');
      console.log('Loading feedback from localStorage:', stored);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Parsed feedback:', parsed);
        setFeedback(parsed);
      } else {
        console.log('No feedback found in localStorage');
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
    link.download = `feedback-${Date.now()}.json`;
    link.click();
  };

  const stats = {
    total: feedback.length,
    positive: feedback.filter(f => f.rating === 'positive').length,
    negative: feedback.filter(f => f.rating === 'negative').length,
    withComments: feedback.filter(f => f.comment && f.comment.trim()).length,
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 left-4 z-50"
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        View Feedback ({feedback.length})
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-96 max-h-[600px] bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">AI Feedback</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="bg-white/20 rounded p-2 text-center">
            <div className="font-bold">{stats.total}</div>
            <div className="opacity-80">Total</div>
          </div>
          <div className="bg-green-500/30 rounded p-2 text-center">
            <div className="font-bold">{stats.positive}</div>
            <div className="opacity-80">Positive</div>
          </div>
          <div className="bg-red-500/30 rounded p-2 text-center">
            <div className="font-bold">{stats.negative}</div>
            <div className="opacity-80">Negative</div>
          </div>
          <div className="bg-purple-500/30 rounded p-2 text-center">
            <div className="font-bold">{stats.withComments}</div>
            <div className="opacity-80">Comments</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex gap-2">
        <Button onClick={exportFeedback} size="sm" variant="outline" className="flex-1">
          Export JSON
        </Button>
        <Button onClick={clearFeedback} size="sm" variant="destructive" className="flex-1">
          Clear All
        </Button>
      </div>

      {/* Feedback List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {feedback.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No feedback yet</p>
          </div>
        ) : (
          feedback.slice().reverse().map((item, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {item.rating === 'positive' ? (
                    <ThumbsUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <ThumbsDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-xs font-semibold ${
                    item.rating === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.rating === 'positive' ? 'Positive' : 'Negative'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {new Date(item.timestamp).toLocaleDateString()}
                </div>
              </div>
              {item.comment && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 italic">
                  "{item.comment}"
                </p>
              )}
              <div className="mt-2 text-xs text-gray-500">
                Chat: {item.chatId.substring(0, 20)}...
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


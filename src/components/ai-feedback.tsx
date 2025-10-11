"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

interface AIFeedbackProps {
  messageId: string;
  aiContent: string; // The actual AI message being rated
  onFeedback?: (feedback: { rating: 'positive' | 'negative'; comment?: string; messageId: string; aiContent: string }) => void;
}

export function AIFeedback({ messageId, aiContent, onFeedback }: AIFeedbackProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRating = (newRating: 'positive' | 'negative') => {
    console.log('👍👎 Rating selected:', newRating, 'for message:', messageId);
    setRating(newRating);
    setIsOpen(true);
  };

  const handleSubmit = () => {
    console.log('✅ Submit button clicked. Rating:', rating, 'Comment:', comment.trim());
    if (rating && onFeedback) {
      console.log('✅ Calling onFeedback callback...');
      onFeedback({
        rating,
        comment: comment.trim(),
        messageId,
        aiContent
      });
      setIsSubmitted(true);
      // Keep popup open for 2.5 seconds to show thank you message
      setTimeout(() => {
        setIsOpen(false);
        setIsSubmitted(false);
        setRating(null);
        setComment('');
      }, 2500);
    } else {
      console.error('❌ Cannot submit: rating or onFeedback missing', { rating, hasCallback: !!onFeedback });
    }
  };

  const handleSkip = () => {
    console.log('⏭️ Skip button clicked. Rating:', rating);
    if (rating && onFeedback) {
      console.log('⏭️ Calling onFeedback callback (skip)...');
      onFeedback({
        rating,
        messageId,
        aiContent
      });
    }
    setIsSubmitted(true);
    // Keep popup open for 2.5 seconds to show thank you message
    setTimeout(() => {
      setIsOpen(false);
      setIsSubmitted(false);
      setRating(null);
      setComment('');
    }, 2500);
  };

  return (
    <div className="relative">
      {/* Rating Buttons */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => handleRating('positive')}
          className={`p-1.5 rounded-md transition-colors ${
            rating === 'positive'
              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-green-600 dark:hover:text-green-400'
          }`}
          title="Good response"
        >
          <ThumbsUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleRating('negative')}
          className={`p-1.5 rounded-md transition-colors ${
            rating === 'negative'
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-600 dark:hover:text-red-400'
          }`}
          title="Could be better"
        >
          <ThumbsDown className="w-4 h-4" />
        </button>
      </div>

      {/* Feedback Popup - Inline below message */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-[100] w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4"
          >
            {!isSubmitted ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {rating === 'positive' ? '👍 Glad it helped!' : '👎 Help us improve'}
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  {rating === 'positive'
                    ? 'What did you like? (optional)'
                    : 'What could be better? (optional)'}
                </p>

                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    rating === 'positive'
                      ? 'E.g., Clear explanation, good examples...'
                      : 'E.g., Too complex, missing examples...'
                  }
                  className="text-sm min-h-[70px] max-h-[100px] mb-3 resize-none bg-gray-50 dark:bg-gray-800"
                  autoFocus
                />

                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmit}
                    size="sm"
                    className="flex-1"
                  >
                    Submit Feedback
                  </Button>
                  <Button
                    onClick={handleSkip}
                    size="sm"
                    variant="outline"
                  >
                    Skip
                  </Button>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4 flex items-center justify-center gap-3"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-semibold text-base text-gray-900 dark:text-white">
                  Thanks for your feedback and improving the site!
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


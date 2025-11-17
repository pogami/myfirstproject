"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare, X, Sparkles, CheckCircle2, Heart } from "lucide-react";
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
    // Toggle off if the same rating is clicked again
    if (rating === newRating) {
      setRating(null);
      setIsOpen(false);
      return;
    }
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
          aria-pressed={rating === 'positive'}
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
          aria-pressed={rating === 'negative'}
        >
          <ThumbsDown className="w-4 h-4" />
        </button>
      </div>

      {/* Feedback Popup - Inline below message */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-[100] w-[360px] max-w-[85vw] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm p-5"
          >
            {!isSubmitted ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {rating === 'positive' ? (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                        <ThumbsUp className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                        <ThumbsDown className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {rating === 'positive' ? 'Glad it helped!' : 'Help us improve'}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {rating === 'positive'
                          ? 'What did you like? (optional)'
                          : 'What could be better? (optional)'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-1.5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    rating === 'positive'
                      ? 'E.g., Clear explanation, helpful examples, saved me time...'
                      : 'E.g., Too complex, missing context, could be clearer...'
                  }
                  className="text-sm min-h-[80px] max-h-[120px] mb-4 resize-none bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  autoFocus
                />

                <div className="flex gap-2.5">
                  <Button
                    onClick={handleSubmit}
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 font-medium"
                  >
                    Submit Feedback
                  </Button>
                  <Button
                    onClick={handleSkip}
                    size="sm"
                    variant="ghost"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Skip
                  </Button>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="py-6 flex flex-col items-center justify-center gap-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", damping: 15, stiffness: 300 }}
                  className="w-16 h-16 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/40"
                >
                  <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={2.5} />
                </motion.div>
                <div className="text-center">
                  <p className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                    Thank you!
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your feedback helps us improve
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


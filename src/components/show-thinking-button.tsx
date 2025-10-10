import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShowThinkingButtonProps {
  thinking: string;
  className?: string;
}

export function ShowThinkingButton({ thinking, className = "" }: ShowThinkingButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!thinking || thinking.trim().length === 0) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(thinking);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy thinking content:', error);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xs"
      >
        <Brain className="h-3 w-3" />
        {isExpanded ? (
          <>
            <EyeOff className="h-3 w-3" />
            Hide Thinking
          </>
        ) : (
          <>
            <Eye className="h-3 w-3" />
            Show Thinking
          </>
        )}
      </Button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  AI Thinking Process
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-6 w-6 p-0"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {thinking}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

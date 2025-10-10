import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Brain, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThinkingDropdownProps {
  thinking: string;
  isStreaming: boolean;
  status: string;
  className?: string;
}

export function ThinkingDropdown({ thinking, isStreaming, status, className }: ThinkingDropdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [displayedThinking, setDisplayedThinking] = useState('');

  // Update displayed thinking in real-time while streaming
  useEffect(() => {
    if (isStreaming && thinking) {
      setDisplayedThinking(thinking);
    }
  }, [thinking, isStreaming]);

  // Automatically expand when AI starts thinking/streaming
  useEffect(() => {
    if (isStreaming && !isExpanded) {
      setIsExpanded(true);
    }
  }, [isStreaming]); // Removed isExpanded from dependencies to prevent infinite loop

  // Automatically collapse when streaming is done and we have a response
  useEffect(() => {
    if (!isStreaming && thinking && isExpanded) {
      // Keep it open for a moment to show the final thinking, then close
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 3000); // Close after 3 seconds to let user see the final thinking
      
      return () => clearTimeout(timer);
    }
  }, [isStreaming, thinking, isExpanded]);

  // Don't show if not streaming or no thinking content
  if (!isStreaming && !thinking) {
    return null;
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Thinking Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleExpanded}
        className="w-full justify-between text-xs text-muted-foreground hover:text-primary transition-colors duration-200 border border-dashed border-muted-foreground/30 rounded-md p-2"
        disabled={!isStreaming && !thinking}
      >
        <div className="flex items-center gap-2">
          {isStreaming ? (
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
          ) : (
            <Brain className="h-3 w-3 text-primary" />
          )}
          <span className="font-medium">
            {isStreaming ? 'AI is thinking...' : 'View AI thinking process'}
          </span>
          {isStreaming && status && (
            <span className="text-xs opacity-70">({status})</span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </Button>

      {/* Expandable Thinking Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-muted-foreground/20">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                AI Thinking Process:
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-60 overflow-y-auto">
                {isStreaming ? (
                  <div className="space-y-1">
                    {displayedThinking.split('\n').map((line, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="leading-relaxed"
                      >
                        {line}
                      </motion.div>
                    ))}
                    {isStreaming && (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="inline-block w-2 h-4 bg-primary ml-1"
                      />
                    )}
                  </div>
                ) : (
                  <div className="leading-relaxed">
                    {thinking}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

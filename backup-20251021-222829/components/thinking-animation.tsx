"use client";

import { motion } from 'framer-motion';

interface ThinkingAnimationProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ThinkingAnimation({ className = "", size = 'md' }: ThinkingAnimationProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3', 
    lg: 'w-4 h-4'
  };

  const containerClasses = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2'
  };

  return (
    <div className={`flex items-center ${containerClasses[size]} ${className}`}>
      <motion.div
        className={`bg-blue-500 rounded-full ${sizeClasses[size]}`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: 0
        }}
      />
      <motion.div
        className={`bg-blue-500 rounded-full ${sizeClasses[size]}`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: 0.2
        }}
      />
      <motion.div
        className={`bg-blue-500 rounded-full ${sizeClasses[size]}`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: 0.4
        }}
      />
    </div>
  );
}

// Alternative thinking animation with text
export function ThinkingWithText({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <ThinkingAnimation size="sm" />
      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
        AI is thinking...
      </span>
    </div>
  );
}

// Full thinking bubble component
export function ThinkingBubble({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex-shrink-0">
        <ThinkingAnimation size="md" />
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">CourseConnect AI</span> is processing your question...
        </div>
      </div>
    </div>
  );
}
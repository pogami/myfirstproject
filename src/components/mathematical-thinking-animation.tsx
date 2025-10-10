"use client";

import { Calculator } from 'lucide-react';

interface MathematicalThinkingAnimationProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function MathematicalThinkingAnimation({ className = "", size = 'md', text = "Calculating solution..." }: MathematicalThinkingAnimationProps) {
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Calculator Icon */}
      <div className="relative">
        <Calculator className={`${iconSizes[size]} text-blue-600`} />
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
        {text}
      </span>
    </div>
  );
}

// Simple mathematical thinking indicator
export function MathematicalThinkingIndicator({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Calculator className="w-4 h-4 text-blue-600" />
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
        AI is calculating...
      </span>
    </div>
  );
}

// Simple mathematical thinking bubble
export function MathematicalThinkingBubble({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Calculator className="w-4 h-4 text-blue-600" />
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
        AI is calculating...
      </span>
    </div>
  );
}
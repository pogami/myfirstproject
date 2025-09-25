"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableUserMessageProps {
  content: string;
  className?: string;
}

export function ExpandableUserMessage({ content, className = "" }: ExpandableUserMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 150; // Characters to show before truncating

  // If content is short, don't show expand/collapse
  if (content.length <= maxLength) {
    return (
      <div className={`text-sm whitespace-pre-wrap break-words leading-relaxed ${className}`}>
        {content}
      </div>
    );
  }

  const truncatedContent = content.substring(0, maxLength);
  const remainingContent = content.substring(maxLength);

  return (
    <div className={`${className}`}>
      <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
        {isExpanded ? content : truncatedContent}
        {!isExpanded && (
          <>
            <span className="text-muted-foreground">...</span>
            <button
              onClick={() => setIsExpanded(true)}
              className="ml-2 inline-flex items-center justify-center w-6 h-6 bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
              title="Show more"
            >
              <ChevronDown className="h-3 w-3 text-primary" />
            </button>
          </>
        )}
      </div>
      {isExpanded && (
        <div className="mt-2 flex justify-end">
          <button
            onClick={() => setIsExpanded(false)}
            className="inline-flex items-center justify-center w-6 h-6 bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
            title="Show less"
          >
            <ChevronUp className="h-3 w-3 text-primary" />
          </button>
        </div>
      )}
    </div>
  );
}

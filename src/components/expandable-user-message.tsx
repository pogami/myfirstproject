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

  // Helper function to highlight @ai mentions
  const highlightAIMentions = (text: string) => {
    return text.replace(/(?<!\w)@ai(?!\w)/gi, (match) => 
      `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">${match}</span>`
    );
  };

  // If content is short, don't show expand/collapse
  if (content.length <= maxLength) {
    return (
      <div 
        className={`text-sm whitespace-pre-wrap break-words leading-relaxed ${className}`}
        dangerouslySetInnerHTML={{ __html: highlightAIMentions(content) }}
      />
    );
  }

  const truncatedContent = content.substring(0, maxLength);
  const remainingContent = content.substring(maxLength);

  return (
    <div className={`${className}`}>
      <div 
        className="text-sm whitespace-pre-wrap break-words leading-relaxed"
        dangerouslySetInnerHTML={{ 
          __html: highlightAIMentions(isExpanded ? content : truncatedContent) + 
            (!isExpanded ? '<span class="text-muted-foreground">...</span>' : '')
        }}
      />
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="ml-2 inline-flex items-center justify-center w-6 h-6 bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
          title="Show more"
        >
          <ChevronDown className="h-3 w-3 text-primary" />
        </button>
      )}
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

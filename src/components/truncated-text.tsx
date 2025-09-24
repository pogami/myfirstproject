"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

// Render math expressions properly with mobile optimization
function renderMathLine(line: string, i: number) {
  if (line.includes("$$")) {
    const expr = line.replace(/\$\$/g, "");
    return <BlockMath key={i} math={expr} className="mobile-math-display" />;
  } else if (line.includes("$")) {
    const expr = line.replace(/\$/g, "");
    return <InlineMath key={i} math={expr} className="mobile-math-inline" />;
  } else {
    return <p key={i} className="text-sm break-words max-w-full overflow-hidden mobile-text">{line}</p>;
  }
}

// Find a safe truncation point that doesn't break math expressions
function findSafeTruncationPoint(text: string, maxLength: number): number {
  if (text.length <= maxLength) return text.length;
  
  // Look for a good break point before maxLength
  let truncateAt = maxLength;
  
  // Don't truncate in the middle of math expressions
  const beforeTruncate = text.substring(0, maxLength);
  
  // Check if we're in the middle of a math expression
  const lastDollar = beforeTruncate.lastIndexOf('$');
  if (lastDollar !== -1) {
    // Count unclosed $ symbols
    const dollarCount = (beforeTruncate.match(/\$/g) || []).length;
    if (dollarCount % 2 === 1) {
      // We're in the middle of a math expression, find the end
      const nextDollar = text.indexOf('$', maxLength);
      if (nextDollar !== -1) {
        truncateAt = nextDollar + 1;
      }
    }
  }
  
  // Try to break at a sentence or paragraph boundary
  const sentences = text.substring(0, truncateAt).split(/[.!?]\s+/);
  if (sentences.length > 1) {
    const lastCompleteSentence = sentences.slice(0, -1).join('. ') + '.';
    if (lastCompleteSentence.length > maxLength * 0.7) { // At least 70% of max length
      truncateAt = lastCompleteSentence.length;
    }
  }
  
  return Math.min(truncateAt, text.length);
}

export function TruncatedText({ text, maxLength = 500, className = "" }: TruncatedTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Prevent scroll conflicts
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (scrollContainerRef.current && isExpanded) {
        const container = scrollContainerRef.current;
        const { scrollTop, scrollHeight, clientHeight } = container;
        
        // If scrolling up and at top, or scrolling down and at bottom
        if ((e.deltaY < 0 && scrollTop === 0) || 
            (e.deltaY > 0 && scrollTop + clientHeight >= scrollHeight)) {
          // Allow page scroll
          return;
        }
        
        // Otherwise, prevent page scroll and scroll within container
        e.preventDefault();
        container.scrollTop += e.deltaY;
      }
    };
    
    if (isExpanded && scrollContainerRef.current) {
      scrollContainerRef.current.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.removeEventListener('wheel', handleWheel);
        }
      };
    }
  }, [isExpanded]);
  
  // If text is shorter than maxLength, don't truncate
  if (text.length <= maxLength) {
    return (
      <div className={`whitespace-pre-wrap text-sm leading-relaxed ${className}`}>
        {text.split("\n").map((line, i) => renderMathLine(line, i))}
      </div>
    );
  }
  
  const safeTruncatePoint = findSafeTruncationPoint(text, maxLength);
  const truncatedText = text.substring(0, safeTruncatePoint);
  
  return (
    <div className={`${className} max-w-full overflow-hidden`}>
      <div className="whitespace-pre-wrap text-sm leading-relaxed">
        {isExpanded ? (
          <div 
            ref={scrollContainerRef}
            className="max-h-80 overflow-y-auto overflow-x-hidden pr-2 border border-border/20 rounded-md p-3 bg-muted/10 w-full max-w-full"
          >
            {text.split("\n").map((line, i) => renderMathLine(line, i))}
          </div>
        ) : (
          <>
            {truncatedText.split("\n").map((line, i) => renderMathLine(line, i))}
            <span className="text-muted-foreground">...</span>
            <button
              onClick={() => setIsExpanded(true)}
              className="ml-2 inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
            >
              Show more
              <ChevronDown className="h-3 w-3" />
            </button>
          </>
        )}
        {isExpanded && (
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => setIsExpanded(false)}
              className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
            >
              Show less
              <ChevronUp className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

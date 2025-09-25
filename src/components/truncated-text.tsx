"use client";

import React from 'react';
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

export function TruncatedText({ text, maxLength = 300, className = "" }: TruncatedTextProps) {
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
        {truncatedText.split("\n").map((line, i) => renderMathLine(line, i))}
        <span className="text-muted-foreground">...</span>
      </div>
    </div>
  );
}

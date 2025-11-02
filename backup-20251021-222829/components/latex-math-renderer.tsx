"use client";

import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface LatexMathRendererProps {
  text: string;
  className?: string;
}

export function LatexMathRenderer({ text, className = "" }: LatexMathRendererProps) {
  // Function to detect and render LaTeX math expressions
  const renderMath = (input: string) => {
    // Check if text contains any math delimiters
    const hasMath = input.includes("$$") || (input.includes("$") && input.includes("$")) || 
                    (input.includes("\\(") && input.includes("\\)")) || 
                    (input.includes("\\[") && input.includes("\\]"));
    
    if (!hasMath) {
      // No math, return as regular text
      return <span>{input}</span>;
    }

    // Split by LaTeX delimiters (both $ and \( formats)
    const parts = input.split(/(\$\$[\s\S]*?\$\$|\$[^$]*?\$|\\\[[\s\S]*?\\\]|\\\([^)]*?\\\))/);
    
    return parts.map((part, index) => {
      // Block math ($$...$$)
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const mathContent = part.slice(2, -2).trim();
        return (
          <BlockMath key={index} math={mathContent} />
        );
      }
      
      // Block math (\[...\])
      if (part.startsWith('\\[') && part.endsWith('\\]')) {
        const mathContent = part.slice(2, -2).trim();
        return (
          <BlockMath key={index} math={mathContent} />
        );
      }
      
      // Inline math ($...$)
      if (part.startsWith('$') && part.endsWith('$') && !part.startsWith('$$')) {
        const mathContent = part.slice(1, -1).trim();
        return (
          <InlineMath key={index} math={mathContent} />
        );
      }
      
      // Inline math (\(...\))
      if (part.startsWith('\\(') && part.endsWith('\\)')) {
        const mathContent = part.slice(2, -2).trim();
        return (
          <InlineMath key={index} math={mathContent} />
        );
      }
      
      // Regular text
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className={className}>
      {renderMath(text)}
    </div>
  );
}

// Helper function to detect if text contains math
export function containsMath(text: string): boolean {
  return /\$[\s\S]*?\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]/.test(text);
}

// Helper function to wrap math expressions in LaTeX delimiters
export function wrapMathExpressions(text: string): string {
  // Common math patterns to automatically wrap
  const mathPatterns = [
    // Fractions: a/b, (a+b)/c
    /(\d+|\w+)\/(\d+|\w+)/g,
    // Exponents: x^2, a^b
    /(\w+)\^(\d+|\w+)/g,
    // Square roots: sqrt(x), √x
    /sqrt\([^)]+\)/g,
    /√[^\s]+/g,
    // Integrals: ∫, derivatives: ∂
    /[∫∂∑∏]/g,
    // Greek letters: α, β, γ, etc.
    /[αβγδεζηθικλμνξοπρστυφχψω]/g,
    // Common math symbols: ±, ×, ÷, ≤, ≥, ≠, ≈, ∞
    /[±×÷≤≥≠≈∞]/g,
  ];

  let result = text;
  
  mathPatterns.forEach(pattern => {
    result = result.replace(pattern, (match) => {
      // Don't wrap if already wrapped
      if (match.startsWith('$') && match.endsWith('$')) {
        return match;
      }
      return `$${match}$`;
    });
  });

  return result;
}


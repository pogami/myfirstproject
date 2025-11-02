import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface FormattedMessageProps {
  text: string;
  className?: string;
}

export function FormattedMessage({ text, className = "" }: FormattedMessageProps) {
  // Function to clean up any remaining markdown formatting
  const cleanMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold** formatting
      .replace(/\*(.*?)\*/g, '$1')     // Remove *italic* formatting
      .replace(/##\s*/g, '')           // Remove ## headers
      .replace(/#\s*/g, '')            // Remove # headers
      .replace(/###\s*/g, '')          // Remove ### headers
      .replace(/####\s*/g, '');        // Remove #### headers
  };

  // Function to render text with math expressions
  const renderTextWithMath = (text: string) => {
    // Clean markdown first
    const cleanedText = cleanMarkdown(text);
    
    // Check if text contains any math delimiters
    const hasMath = cleanedText.includes("$$") || (cleanedText.includes("$") && cleanedText.includes("$")) || 
                    (cleanedText.includes("\\(") && cleanedText.includes("\\)")) || 
                    (cleanedText.includes("\\[") && cleanedText.includes("\\]"));
    
    if (!hasMath) {
      // No math, return as regular text
      return <span>{cleanedText}</span>;
    }
    
    // Split text by LaTeX math expressions (both $ and \( formats)
    const parts = cleanedText.split(/(\$\$[\s\S]*?\$\$|\$[^$]*?\$|\\\[[\s\S]*?\\\]|\\\([^)]*?\\\))/);
    
    return parts.map((part, index) => {
      // Block math ($$...$$)
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const mathContent = part.slice(2, -2).trim();
        return <BlockMath key={index} math={mathContent} />;
      }
      // Block math (\[...\])
      else if (part.startsWith('\\[') && part.endsWith('\\]')) {
        const mathContent = part.slice(2, -2).trim();
        return <BlockMath key={index} math={mathContent} />;
      }
      // Inline math ($...$)
      else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        const mathContent = part.slice(1, -1).trim();
        return <InlineMath key={index} math={mathContent} />;
      }
      // Inline math (\(...\))
      else if (part.startsWith('\\(') && part.endsWith('\\)')) {
        const mathContent = part.slice(2, -2).trim();
        return <InlineMath key={index} math={mathContent} />;
      }
      // Regular text
      else if (part.trim()) {
        return <span key={index}>{part}</span>;
      }
      return null;
    });
  };

  // Split text into lines and process each line
  const lines = text.split('\n');
  
  const formatLine = (line: string, index: number) => {
    // Clean markdown from the line first
    const cleanedLine = cleanMarkdown(line);
    
    // Handle numbered lists (1. 2. 3. etc.)
    if (/^\d+\.\s/.test(cleanedLine)) {
      return (
        <div key={index} className="flex items-start gap-2 mb-1">
          <span className="text-primary font-medium text-sm mt-0.5 min-w-[1.5rem]">
            {cleanedLine.match(/^\d+/)?.[0]}.
          </span>
          <span className="text-sm leading-relaxed">
            {renderTextWithMath(cleanedLine.replace(/^\d+\.\s/, ''))}
          </span>
        </div>
      );
    }
    
    // Handle bullet points (- or •)
    if (/^[-•]\s/.test(cleanedLine)) {
      return (
        <div key={index} className="flex items-start gap-2 mb-1">
          <span className="text-primary mt-1.5 text-xs">•</span>
          <span className="text-sm leading-relaxed">
            {renderTextWithMath(cleanedLine.replace(/^[-•]\s/, ''))}
          </span>
        </div>
      );
    }
    
    // Handle section headers (lines that end with colon and are short)
    if (cleanedLine.endsWith(':') && cleanedLine.length < 50 && !cleanedLine.includes('.')) {
      return (
        <div key={index} className="font-semibold text-primary text-sm mb-2 mt-3 first:mt-0">
          {cleanedLine}
        </div>
      );
    }
    
    // Handle regular paragraphs
    if (cleanedLine.trim()) {
      return (
        <p key={index} className="text-sm leading-relaxed mb-2 last:mb-0">
          {renderTextWithMath(cleanedLine)}
        </p>
      );
    }
    
    // Handle empty lines
    return <div key={index} className="h-2" />;
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {lines.map((line, index) => formatLine(line, index))}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { BlockMath, InlineMath } from "react-katex";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import "katex/dist/katex.min.css";
import { TruncatedText } from './truncated-text';
import { AIResponse } from './ai-response';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Detect if content looks like data points (array of {x, y})
function looksLikeGraph(content: string): boolean {
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) && parsed.every((p: any) => "x" in p && "y" in p);
  } catch {
    return false;
  }
}

// Detect math and render with KaTeX
function renderMathLine(line: string, i: number) {
  if (line.includes("$$")) {
    const expr = line.replace(/\$\$/g, "");
    return <BlockMath key={i} math={expr} />;
  } else if (line.includes("$")) {
    const expr = line.replace(/\$/g, "");
    return <InlineMath key={i} math={expr} />;
  } else {
    // Check if line contains boxed math answers
    if (line.includes("\\boxed{")) {
      // Extract boxed content and render it prominently
      const boxedMatch = line.match(/\\boxed\{([^}]+)\}/);
      if (boxedMatch) {
        const boxedContent = boxedMatch[1];
        const beforeBoxed = line.substring(0, boxedMatch.index);
        const afterBoxed = line.substring(boxedMatch.index! + boxedMatch[0].length);
        
        return (
          <div key={i} className="mb-2 flex items-center gap-2">
            {beforeBoxed && <span className="text-sm">{beforeBoxed}</span>}
            <div className="inline-flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 rounded-md px-2 py-0.5 min-h-[24px] text-sm">
              <InlineMath math={boxedContent} />
            </div>
            {afterBoxed && <span className="text-sm">{afterBoxed}</span>}
          </div>
        );
      }
    }
    return <p key={i} className="text-sm break-words ai-response mb-2">{line}</p>;
  }
}

// Function to break long text into paragraphs
function breakIntoParagraphs(text: string): string[] {
  // Split by double newlines first (paragraph breaks)
  let paragraphs = text.split('\n\n');
  
  // If no paragraph breaks, try to create them from long sentences
  if (paragraphs.length === 1) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const result: string[] = [];
    let currentParagraph = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (trimmedSentence.length === 0) continue;
      
      // If adding this sentence would make the paragraph too long, start a new one
      if (currentParagraph.length + trimmedSentence.length > 200 && currentParagraph.length > 0) {
        result.push(currentParagraph.trim());
        currentParagraph = trimmedSentence;
      } else {
        currentParagraph += (currentParagraph ? '. ' : '') + trimmedSentence;
      }
    }
    
    if (currentParagraph.trim()) {
      result.push(currentParagraph.trim());
    }
    
    return result.length > 0 ? result : [text];
  }
  
  return paragraphs.filter(p => p.trim().length > 0);
}

interface BotResponseProps {
  content: string;
  className?: string;
}

export default function BotResponse({ content, className = "" }: BotResponseProps) {
  const isGraph = useMemo(() => looksLikeGraph(content), [content]);
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (isGraph) {
    const data = JSON.parse(content);
    return (
      <div className={`p-4 bg-muted/30 rounded-lg border border-border/50 ${className}`}>
        <h3 className="text-lg font-semibold mb-2">Graph Output:</h3>
        <LineChart width={400} height={300} data={data}>
          <Line type="monotone" dataKey="y" stroke="#4F46E5" strokeWidth={2} />
          <CartesianGrid stroke="#E5E7EB" />
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
        </LineChart>
      </div>
    );
  }

  // Check if content contains code blocks (triple backticks)
  const hasCodeBlocks = content.includes('```');
  
  if (hasCodeBlocks) {
    // Use AIResponse for code highlighting
    return <AIResponse content={content} className={className} alwaysHighlight={false} />;
  }

  // Otherwise treat as text + math (original behavior)
  return (
    <div className={`relative leading-relaxed text-sm max-w-full overflow-hidden break-words ai-response ${className}`}>
      {breakIntoParagraphs(content).map((paragraph, i) => (
        <div key={i} className="mb-3">
          {paragraph.split("\n").map((line, j) => renderMathLine(line, j))}
        </div>
      ))}
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 h-8 w-8 p-0 opacity-60 hover:opacity-100 transition-opacity duration-200 hover:bg-transparent text-muted-foreground"
        onClick={copyToClipboard}
      >
        {isCopied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <img src="/copy-icon.svg" alt="Copy" className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

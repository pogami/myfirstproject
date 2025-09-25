"use client";

import { useMemo } from "react";
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

  // Otherwise treat as text + math
  return (
    <div className={`leading-relaxed text-sm max-w-full overflow-hidden break-words ai-response ${className}`}>
      {breakIntoParagraphs(content).map((paragraph, i) => (
        <div key={i} className="mb-3">
          {paragraph.split("\n").map((line, j) => renderMathLine(line, j))}
        </div>
      ))}
    </div>
  );
}

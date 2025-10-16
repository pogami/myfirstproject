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
import { SourceIcon } from './source-icon';
import { InteractiveQuiz } from './interactive-quiz';
import { FullExamModal } from './full-exam-modal';
import { AIFeedback } from './ai-feedback';
import { useFeatureFlags } from '@/hooks/use-feature-flags';
import { FeatureDisabled } from './feature-disabled';

// Detect if content looks like data points (array of {x, y})
function looksLikeGraph(content: string): boolean {
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) && parsed.every((p: any) => "x" in p && "y" in p);
  } catch {
    return false;
  }
}

// Detect if content contains quiz data
function extractQuizData(content: string): { type: 'quiz' | 'exam' | null, data: any } {
  try {
    // Look for QUIZ_DATA: or EXAM_DATA: markers
    // Capture everything from opening brace to end of line (single-line JSON)
    const quizMatch = content.match(/QUIZ_DATA:\s*(\{[^\n]*\})/);
    const examMatch = content.match(/EXAM_DATA:\s*(\{[^\n]*\})/);
    
    if (quizMatch) {
      console.log('Found QUIZ_DATA marker');
      const jsonStr = quizMatch[1].trim();
      console.log('Extracted JSON string (first 200 chars):', jsonStr.substring(0, 200) + '...');
      const data = JSON.parse(jsonStr);
      console.log('Successfully parsed quiz data with', data.questions?.length, 'questions');
      return { type: 'quiz', data };
    }
    
    if (examMatch) {
      console.log('Found EXAM_DATA marker');
      const jsonStr = examMatch[1].trim();
      console.log('Extracted JSON string (first 200 chars):', jsonStr.substring(0, 200) + '...');
      const data = JSON.parse(jsonStr);
      console.log('Successfully parsed exam data with', data.questions?.length, 'questions');
      return { type: 'exam', data };
    }
    
    return { type: null, data: null };
  } catch (error) {
    console.error('Failed to parse quiz data. Error:', error);
    console.error('Content preview:', content.substring(0, 500));
    return { type: null, data: null };
  }
}

// Helper function to highlight @ai mentions
const highlightAIMentions = (text: string) => {
  return text.replace(/(?<!\w)@ai(?!\w)/gi, (match) => 
    `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">${match}</span>`
  );
};

// Convert markdown links to actual clickable HTML links
const convertMarkdownLinks = (text: string) => {
  // Match [text](url) pattern
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-medium transition-colors" title="${url}">${linkText}</a>`;
  });
};

// Detect math and render with KaTeX
function renderMathLine(line: string, i: number) {
  // Check if line contains any math delimiters
  const hasMath = line.includes("$$") || (line.includes("$") && line.includes("$")) || 
                  (line.includes("\\(") && line.includes("\\)")) || 
                  (line.includes("\\[") && line.includes("\\]")) ||
                  line.includes("\\boxed{");
  
  if (!hasMath) {
    // No math, return as regular text with bold formatting
    let processedLine = line
      .replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*([^\*]+)\*/g, '<strong>$1</strong>'); // Convert italic to bold instead
    
    // Convert markdown links to clickable HTML links
    processedLine = convertMarkdownLinks(processedLine);
    
    return (
      <p key={i} className="text-sm not-italic break-words max-w-full overflow-hidden leading-7 font-sans" dangerouslySetInnerHTML={{ __html: processedLine }} />
    );
  }

  // Split the line by math expressions and render each part appropriately
  const parts = line.split(/(\$\$[\s\S]*?\$\$|\$[^$]*?\$|\\\[[\s\S]*?\\\]|\\\([^)]*?\\\)|\\boxed\{[^}]*\})/);
  
  return (
    <p key={i} className="text-sm not-italic break-words max-w-full overflow-hidden leading-7 font-sans">
      {parts.map((part, partIndex) => {
        // Block math ($$...$$)
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const mathContent = part.slice(2, -2).trim();
          return <BlockMath key={`${i}-${partIndex}`} math={mathContent} />;
        }
        // Block math (\[...\])
        else if (part.startsWith('\\[') && part.endsWith('\\]')) {
          const mathContent = part.slice(2, -2).trim();
          return <BlockMath key={`${i}-${partIndex}`} math={mathContent} />;
        }
        // Inline math ($...$)
        else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const mathContent = part.slice(1, -1).trim();
          return <InlineMath key={`${i}-${partIndex}`} math={mathContent} />;
        }
        // Inline math (\(...\))
        else if (part.startsWith('\\(') && part.endsWith('\\)')) {
          const mathContent = part.slice(2, -2).trim();
          return <InlineMath key={`${i}-${partIndex}`} math={mathContent} />;
        }
        // Boxed math
        else if (part.startsWith('\\boxed{') && part.endsWith('}')) {
          const boxedMatch = part.match(/\\boxed\{([^}]+)\}/);
          if (boxedMatch) {
            const boxedContent = boxedMatch[1];
            return (
              <span key={`${i}-${partIndex}`} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-md font-medium">
                <span className="text-green-600 dark:text-green-400">Answer:</span>
                <InlineMath math={boxedContent} />
              </span>
            );
          }
        }
        // Regular text with formatting
        else if (part.trim()) {
          let processedPart = part
            .replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*([^\*]+)\*/g, '<strong>$1</strong>'); // Convert italic to bold instead
          
          processedPart = convertMarkdownLinks(processedPart);
          
          return <span key={`${i}-${partIndex}`} dangerouslySetInnerHTML={{ __html: processedPart }} />;
        }
        return null;
      })}
    </p>
  );
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
  sources?: {
    title: string;
    url: string;
    snippet: string;
  }[];
  onSendMessage?: (message: string) => void;
  messageId?: string;
  onFeedback?: (feedback: { rating: 'positive' | 'negative'; comment?: string; messageId: string }) => void;
}

export default function BotResponse({ content, className = "", sources, onSendMessage, messageId, onFeedback }: BotResponseProps) {
  const isGraph = useMemo(() => looksLikeGraph(content), [content]);
  const quizData = useMemo(() => extractQuizData(content), [content]);
  const { isFeatureEnabled } = useFeatureFlags();
  const [isCopied, setIsCopied] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);

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

  // Render interactive quiz
  if (quizData.type === 'quiz' && quizData.data) {
    // Remove the QUIZ_DATA line from content
    const cleanContent = content.replace(/QUIZ_DATA:[^\n]+/, '').trim();
    return (
      <div className={`relative ${className}`}>
        {cleanContent && (
          <div className="relative bg-muted/50 dark:bg-muted/30 px-5 py-3 rounded-2xl rounded-tl-md border border-border/40 leading-relaxed text-sm max-w-full overflow-hidden break-words ai-response group shadow-sm mb-4">
            {breakIntoParagraphs(cleanContent).map((paragraph, i) => (
              <div key={i} className="mb-3 last:mb-0">
                {paragraph.split("\n").map((line, j) => renderMathLine(line, j))}
              </div>
            ))}
            
            {/* AI Feedback for text portion */}
            {messageId && onFeedback && (
              <div className="absolute bottom-2 right-2 z-10">
                <AIFeedback messageId={messageId} aiContent={content} onFeedback={onFeedback} />
              </div>
            )}
          </div>
        )}
        {isFeatureEnabled('interactiveQuizzes') ? (
          <InteractiveQuiz
            questions={quizData.data.questions}
            topic={quizData.data.topic || 'Quiz'}
            onQuizComplete={(results) => {
              if (onSendMessage) {
                const { score, total, wrongQuestions, topic } = results;
                const percentage = Math.round((score / total) * 100);
                let message = `I just completed the ${topic} quiz! I got ${score}/${total} (${percentage}%).`;
                
                if (wrongQuestions.length > 0) {
                  message += `\n\nQuestions I got wrong:\n${wrongQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;
                  message += `\n\nCan you help me understand these topics better so I can ace them next time?`;
                } else {
                  message += ` Perfect score! 🎉`;
                }
                
                onSendMessage(message);
              }
            }}
          />
        ) : (
          <FeatureDisabled featureName="Interactive Quizzes" />
        )}
      </div>
    );
  }

  // Render full exam modal
  if (quizData.type === 'exam' && quizData.data) {
    // Remove the EXAM_DATA line from content
    const cleanContent = content.replace(/EXAM_DATA:[^\n]+/, '').trim();
    return (
      <div className={`relative ${className}`}>
        {cleanContent && (
          <div className="relative bg-muted/50 dark:bg-muted/30 px-5 py-3 rounded-2xl rounded-tl-md border border-border/40 leading-relaxed text-sm max-w-full overflow-hidden break-words ai-response group shadow-sm mb-4">
            {breakIntoParagraphs(cleanContent).map((paragraph, i) => (
              <div key={i} className="mb-3 last:mb-0">
                {paragraph.split("\n").map((line, j) => renderMathLine(line, j))}
              </div>
            ))}
            
            {/* AI Feedback for text portion */}
            {messageId && onFeedback && (
              <div className="absolute bottom-2 right-2 z-10">
                <AIFeedback messageId={messageId} aiContent={content} onFeedback={onFeedback} />
              </div>
            )}
          </div>
        )}
        {isFeatureEnabled('fullExams') ? (
          <>
            <Button onClick={() => setShowExamModal(true)} className="w-full" size="lg">
              🎯 Start Practice Exam ({quizData.data.questions.length} Questions)
            </Button>
            <FullExamModal
              isOpen={showExamModal}
              onClose={() => setShowExamModal(false)}
              questions={quizData.data.questions}
              topic={quizData.data.topic || 'Practice Exam'}
              timeLimit={quizData.data.timeLimit || 30}
              onExamComplete={(results) => {
                if (onSendMessage) {
                  const { score, total, wrongQuestions, topic } = results;
                  const percentage = Math.round((score / total) * 100);
                  let message = `I just completed the ${topic} practice exam! I got ${score}/${total} (${percentage}%).`;
                  
                  if (wrongQuestions.length > 0) {
                    message += `\n\nQuestions I got wrong:\n${wrongQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;
                    message += `\n\nCan you help me understand these topics better so I can ace the real exam?`;
                  } else {
                message += ` Perfect score! 🎉`;
              }
              
              onSendMessage(message);
            }
          }}
        />
          </>
        ) : (
          <FeatureDisabled featureName="Practice Exams" />
        )}
      </div>
    );
  }

  if (isGraph) {
    const data = JSON.parse(content);
    return (
      <div className={`p-5 bg-muted/50 dark:bg-muted/30 rounded-2xl rounded-tl-md border border-border/40 shadow-sm ${className}`}>
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
    <div className={`relative bg-muted/50 dark:bg-muted/30 px-5 py-3 rounded-2xl rounded-tl-md border border-border/40 leading-relaxed text-sm max-w-full overflow-hidden break-words ai-response group shadow-sm ${className}`}>
      {breakIntoParagraphs(content).map((paragraph, i) => (
        <div key={i} className="mb-3 last:mb-0">
          {paragraph.split("\n").map((line, j) => renderMathLine(line, j))}
        </div>
      ))}
      
      {/* Source Icon */}
      <div className="absolute top-2 right-10 z-10">
        <SourceIcon sources={sources || []} />
      </div>
      
      {/* Copy Button */}
      <button
        className="absolute top-2 right-2 h-6 w-6 p-0 bg-transparent hover:bg-muted-foreground/10 rounded-md z-10 flex items-center justify-center transition-all duration-200 ease-in-out"
        onClick={copyToClipboard}
        title="Copy message"
      >
        <div className="relative">
          <Copy 
            className={`h-3.5 w-3.5 text-muted-foreground transition-all duration-300 ease-in-out ${
              isCopied ? 'opacity-0 scale-0 rotate-180' : 'opacity-100 scale-100 rotate-0'
            }`} 
          />
          <Check 
            className={`absolute inset-0 h-3.5 w-3.5 text-green-600 transition-all duration-300 ease-in-out ${
              isCopied ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 -rotate-180'
            }`} 
          />
        </div>
      </button>

      {/* AI Feedback */}
      {messageId && onFeedback && (
        <div className="absolute bottom-2 right-2 z-10">
          <AIFeedback messageId={messageId} aiContent={content} onFeedback={onFeedback} />
        </div>
      )}
    </div>
  );
}

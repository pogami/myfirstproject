"use client";

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { Copy, Check } from 'lucide-react';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface AIResponseProps {
  content: string;
  className?: string;
  alwaysHighlight?: boolean; // For Programming AI Tutor - always highlight code
}

export function AIResponse({ content, className = "", alwaysHighlight = false }: AIResponseProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  // Check if content contains code blocks (triple backticks)
  const hasCodeBlocks = content.includes('```');
  
  // For Programming AI Tutor, always use markdown rendering
  // For general chat, only use markdown if there are code blocks
  const shouldUseMarkdown = alwaysHighlight || hasCodeBlocks;

  // Simple hash function for stable block IDs
  const hashString = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  };

  const copyToClipboard = async (text: string, blockId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [blockId]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [blockId]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (!shouldUseMarkdown) {
    // Render as plain text for non-code content
    return (
      <div className={`whitespace-pre-wrap text-sm ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <div className={`bg-muted/50 dark:bg-muted/30 px-5 py-3 rounded-2xl rounded-tl-md border border-border/40 shadow-sm text-sm ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          a({ node, href, children, ...props }) {
            // Custom link styling - blue, underlined, opens in new tab
            return (
              <a 
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-medium transition-colors cursor-pointer"
                title={href}
                {...props}
              >
                {children}
              </a>
            );
          },
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeText = String(children).replace(/\n$/, '');
            // Use hash of code content for stable block ID
            const blockId = `code-${hashString(codeText)}`;
            const isCopied = copiedStates[blockId] || false;
            
            if (!inline && language) {
              // Code block with language
              return (
                <div className="relative group">
                  <SyntaxHighlighter
                    style={isDark ? oneDark : oneLight}
                    language={language}
                    PreTag="div"
                    className="rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm w-full overflow-x-auto"
                    customStyle={{
                      margin: '8px 0',
                      borderRadius: '8px',
                      fontSize: '12px',
                      lineHeight: '1.5',
                      padding: '12px',
                      border: '1px solid',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      maxHeight: '400px',
                      overflow: 'auto',
                      width: '100%',
                      maxWidth: '100%'
                    }}
                    {...props}
                  >
                    {codeText}
                  </SyntaxHighlighter>
                  <button
                    className="absolute top-2 right-2 h-6 w-6 p-0 bg-transparent hover:bg-muted-foreground/10 rounded-md z-10 flex items-center justify-center transition-all duration-200 ease-in-out"
                    onClick={() => copyToClipboard(codeText, blockId)}
                    title="Copy code"
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
                </div>
              );
            } else if (!inline) {
              // Code block without language
              return (
                <div className="relative group">
                  <SyntaxHighlighter
                    style={isDark ? oneDark : oneLight}
                    language="text"
                    PreTag="div"
                    className="rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm w-full overflow-x-auto"
                    customStyle={{
                      margin: '8px 0',
                      borderRadius: '8px',
                      fontSize: '12px',
                      lineHeight: '1.5',
                      padding: '12px',
                      border: '1px solid',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      maxHeight: '400px',
                      overflow: 'auto',
                      width: '100%',
                      maxWidth: '100%'
                    }}
                    {...props}
                  >
                    {codeText}
                  </SyntaxHighlighter>
                  <button
                    className="absolute top-2 right-2 h-6 w-6 p-0 bg-transparent hover:bg-muted-foreground/10 rounded-md z-10 flex items-center justify-center transition-all duration-200 ease-in-out"
                    onClick={() => copyToClipboard(codeText, blockId)}
                    title="Copy code"
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
                </div>
              );
            } else {
              // Inline code
              return (
                <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            }
          },
          // Style other markdown elements
          // Use div instead of p to avoid hydration errors with nested block elements
          p: ({ children }) => <div className="mb-2 last:mb-0">{children}</div>,
          h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold mb-2">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-sm">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-muted-foreground pl-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

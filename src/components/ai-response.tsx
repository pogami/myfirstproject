"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';

interface AIResponseProps {
  content: string;
  className?: string;
  alwaysHighlight?: boolean; // For Programming AI Tutor - always highlight code
}

export function AIResponse({ content, className = "", alwaysHighlight = false }: AIResponseProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Check if content contains code blocks (triple backticks)
  const hasCodeBlocks = content.includes('```');
  
  // For Programming AI Tutor, always use markdown rendering
  // For general chat, only use markdown if there are code blocks
  const shouldUseMarkdown = alwaysHighlight || hasCodeBlocks;

  if (!shouldUseMarkdown) {
    // Render as plain text for non-code content
    return (
      <div className={`whitespace-pre-wrap text-sm ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <div className={`text-sm ${className}`}>
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            if (!inline && language) {
              // Code block with language
              return (
                <SyntaxHighlighter
                  style={isDark ? oneDark : oneLight}
                  language={language}
                  PreTag="div"
                  className="rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm"
                  customStyle={{
                    margin: '12px 0',
                    borderRadius: '8px',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    padding: '16px',
                    border: '1px solid',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    background: isDark ? 'rgba(31, 41, 55, 0.8)' : 'rgba(249, 250, 251, 0.8)'
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              );
            } else if (!inline) {
              // Code block without language
              return (
                <SyntaxHighlighter
                  style={isDark ? oneDark : oneLight}
                  language="text"
                  PreTag="div"
                  className="rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm"
                  customStyle={{
                    margin: '12px 0',
                    borderRadius: '8px',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    padding: '16px',
                    border: '1px solid',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    background: isDark ? 'rgba(31, 41, 55, 0.8)' : 'rgba(249, 250, 251, 0.8)'
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
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
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
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

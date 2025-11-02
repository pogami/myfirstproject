'use client';

import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
// Removed Ollama import - now using API routes
import { cn } from '@/lib/utils';

interface ChatFileMessageProps {
  processedFile: any;
  onAskQuestion?: (question: string) => void;
  className?: string;
}

export function ChatFileMessage({ 
  processedFile, 
  onAskQuestion, 
  className 
}: ChatFileMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [question, setQuestion] = useState('');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(processedFile.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleAskQuestion = () => {
    if (question.trim() && onAskQuestion) {
      onAskQuestion(question);
      setQuestion('');
    }
  };

  const getFileTypeIcon = () => {
    switch (processedFile.contentType) {
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'image':
        return <FileText className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className={cn(
      "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20",
      "border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            {getFileTypeIcon()}
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">
              {processedFile.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
              <span>Processed with AI</span>
              <span className={cn(
                "px-2 py-0.5 rounded text-xs font-medium",
                getConfidenceBadge(processedFile.confidence)
              )}>
                {Math.round(processedFile.confidence * 100)}% confidence
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
            title="Copy summary"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-blue-600" />
            )}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-blue-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-blue-600" />
            )}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          AI Summary
        </h5>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {processedFile.summary}
        </p>
      </div>

      {/* Key Points */}
      {processedFile.keyPoints.length > 0 && (
        <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
          <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
            Key Points
          </h5>
          <ul className="space-y-1">
            {processedFile.keyPoints.map((point, index) => (
              <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <div className="space-y-3">
          {/* File Details */}
          <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
            <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              File Details
            </h5>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
              <div>Type: {processedFile.contentType}</div>
              <div>Size: {(processedFile.size / 1024).toFixed(1)} KB</div>
              <div>Processing Time: {processedFile.processingTime}ms</div>
              <div>Confidence: <span className={getConfidenceColor(processedFile.confidence)}>
                {Math.round(processedFile.confidence * 100)}%
              </span></div>
            </div>
          </div>

          {/* Extracted Text Preview */}
          {processedFile.extractedText && (
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
              <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Extracted Text (Preview)
              </h5>
              <div className="text-xs text-gray-600 dark:text-gray-400 max-h-32 overflow-y-auto">
                {processedFile.extractedText.substring(0, 500)}
                {processedFile.extractedText.length > 500 && '...'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ask Question Section */}
      {onAskQuestion && (
        <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
          <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
            Ask about this file
          </h5>
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about this file..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
            />
            <button
              onClick={handleAskQuestion}
              disabled={!question.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ask
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useStreamingChat } from '@/hooks/use-streaming-chat';
import { Send, Loader2, Brain, Search, CheckCircle } from 'lucide-react';

interface StreamingChatInterfaceProps {
  className?: string;
}

export function StreamingChatInterface({ className = '' }: StreamingChatInterfaceProps) {
  const [input, setInput] = useState('');
  const { status, content, isStreaming, sendMessage, clearChat } = useStreamingChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    
    await sendMessage(input.trim());
    setInput('');
  };

  const getStatusIcon = () => {
    if (status.includes('Thinking')) return <Brain className="w-4 h-4 animate-pulse" />;
    if (status.includes('Searching') || status.includes('Analyzing')) return <Search className="w-4 h-4 animate-spin" />;
    if (status.includes('Complete')) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status.includes('Error')) return <Loader2 className="w-4 h-4 text-red-500" />;
    return <Loader2 className="w-4 h-4 animate-spin" />;
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 ${className}`}>
      {/* Status Bar */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        {getStatusIcon()}
        <span className="text-sm text-gray-600 dark:text-gray-400">{status}</span>
        {isStreaming && (
          <div className="ml-auto flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {content ? (
          <div className="prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
              {content}
              {isStreaming && (
                <span className="inline-block w-2 h-5 bg-blue-500 animate-pulse ml-1"></span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-lg font-medium">Ask me anything!</p>
              <p className="text-sm">I'll search the web and provide real-time answers.</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about current events, news, or any topic..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send
          </button>
        </form>
        
        {content && (
          <button
            onClick={clearChat}
            className="mt-2 px-3 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            Clear Chat
          </button>
        )}
      </div>
    </div>
  );
}

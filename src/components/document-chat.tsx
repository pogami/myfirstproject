"use client";

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypePrismPlus from 'rehype-prism-plus';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, 
  Check, 
  BookOpen, 
  Brain, 
  FileText, 
  Send,
  Upload,
  Lightbulb,
  Target,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import 'katex/dist/katex.min.css';
import 'prismjs/themes/prism-tomorrow.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  name: string;
  timestamp: number;
  sources?: any[];
  file?: {
    name: string;
    size: number;
    type: string;
    url: string;
  };
}

interface DocumentChatProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onFileUpload: (file: File) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  currentTab?: string;
  user?: any;
}

export function DocumentChat({
  messages,
  isLoading,
  onSendMessage,
  onFileUpload,
  inputValue,
  setInputValue,
  currentTab,
  user
}: DocumentChatProps) {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      toast({
        title: "Copied to clipboard",
        description: "Message content has been copied.",
      });
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Could not copy to clipboard.",
      });
    }
  };

  const handleAction = (action: string, messageId: string, content: string) => {
    switch (action) {
      case 'summarize':
        onSendMessage(`Please summarize this: ${content}`);
        break;
      case 'quiz':
        onSendMessage(`Create a quiz based on this: ${content}`);
        break;
      case 'flashcards':
        onSendMessage(`Create flashcards for this: ${content}`);
        break;
      case 'explain':
        onSendMessage(`Explain this in simpler terms: ${content}`);
        break;
      default:
        break;
    }
  };

  const quickActions = [
    { text: "Explain calculus derivatives", icon: BookOpen, color: "bg-blue-500" },
    { text: "Create a study plan", icon: Target, color: "bg-green-500" },
    { text: "Help with assignments", icon: FileText, color: "bg-purple-500" },
    { text: "Exam preparation", icon: Lightbulb, color: "bg-orange-500" }
  ];

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Clean Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                CourseConnect AI
              </h1>
              <p className="text-sm text-slate-500">
                Intelligent Learning Assistant
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
            AI Active
          </Badge>
        </div>
      </div>

      {/* Messages Area - iMessage Style */}
      <ScrollArea className="flex-1 px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            /* Welcome Section */
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Your AI Learning Partner
              </h2>
              <p className="text-lg text-slate-700 mb-8 max-w-2xl mx-auto leading-relaxed">
                Transform your learning experience with intelligent assistance. Ask questions, get detailed explanations, and master any subject.
              </p>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => onSendMessage(action.text)}
                    className="group p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center`}>
                        <action.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                          {action.text}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all duration-200" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* iMessage Style Messages */
            messages.map((message, index) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`flex items-end gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-blue-500' 
                      : 'bg-gradient-to-br from-blue-500 to-purple-600'
                  }`}>
                    {message.sender === 'user' ? (
                      <span className="text-white font-semibold text-sm">
                        {user?.displayName?.charAt(0) || 'U'}
                      </span>
                    ) : (
                      <Sparkles className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`relative group ${
                    message.sender === 'user' ? 'ml-2' : 'mr-2'
                  }`}>
                    {message.sender === 'user' ? (
                      /* User Message - Right Side */
                      <div className="bg-blue-500 text-white rounded-2xl rounded-br-md px-4 py-3 shadow-sm">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.text}
                        </p>
                      </div>
                    ) : (
                      /* AI Message - Left Side */
                      <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-slate-200">
                        <div className="prose prose-sm text-slate-700 max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex, rehypePrismPlus]}
                            components={{
                              h1: ({ children }) => (
                                <h1 className="text-lg font-bold text-slate-900 mb-2 mt-3 first:mt-0">
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-base font-semibold text-slate-900 mb-2 mt-3">
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-sm font-semibold text-slate-900 mb-1 mt-2">
                                  {children}
                                </h3>
                              ),
                              p: ({ children }) => (
                                <p className="text-slate-700 mb-2 leading-relaxed text-sm">
                                  {children}
                                </p>
                              ),
                              code: ({ children, className }) => {
                                const match = /language-(\w+)/.exec(className || '');
                                return match ? (
                                  <code className={`language-${match[1]} bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-xs font-mono`}>
                                    {children}
                                  </code>
                                ) : (
                                  <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-xs font-mono">
                                    {children}
                                  </code>
                                );
                              },
                              pre: ({ children }) => (
                                <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto mb-2 text-xs">
                                  {children}
                                </pre>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc list-inside text-slate-700 mb-2 space-y-1 text-sm">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal list-inside text-slate-700 mb-2 space-y-1 text-sm">
                                  {children}
                                </ol>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-2 border-blue-500 pl-3 italic text-slate-600 mb-2 text-sm">
                                  {children}
                                </blockquote>
                              ),
                            }}
                          >
                            {message.text}
                          </ReactMarkdown>
                        </div>

                        {/* AI Actions - Hover Toolbar */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-2 flex gap-2">
                          <button 
                            onClick={() => handleAction('summarize', message.id, message.text)}
                            className="text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200"
                          >
                            📝 Summarize
                          </button>
                          <button 
                            onClick={() => handleAction('quiz', message.id, message.text)}
                            className="text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200"
                          >
                            🎲 Quiz
                          </button>
                          <button 
                            onClick={() => handleAction('flashcards', message.id, message.text)}
                            className="text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200"
                          >
                            📚 Flashcards
                          </button>
                          <button 
                            onClick={() => copyToClipboard(message.text, message.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200"
                          >
                            {copiedMessageId === message.id ? '✓ Copied' : '📋 Copy'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className={`text-xs text-slate-500 mt-1 ${
                      message.sender === 'user' ? 'text-right' : 'text-left'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span className="text-slate-600 text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything about your studies..."
                className="h-12 text-base border-slate-300 focus:border-blue-500 rounded-full px-4 pr-12 transition-all duration-200"
              />
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 hover:bg-slate-100 rounded-full"
              >
                <Upload className="w-4 h-4 text-slate-500" />
              </Button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="h-12 w-12 bg-blue-500 hover:bg-blue-600 rounded-full transition-all duration-200 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
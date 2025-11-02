'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const demoResponses: Record<string, string> = {
  'help': "I can help you with exam prep, homework questions, and understanding course topics! Try asking about your upcoming exam.",
  'exam': "Your Baroque Music exam is in 3 days! Want me to generate a practice quiz to help you prepare?",
  'quiz': "Great! Here's a quick quiz:\n\nQ1: Who composed 'The Four Seasons'?\nA) Bach\nB) Vivaldi ✓\nC) Mozart\nD) Beethoven",
  'assignment': "You have 2 assignments due this week:\n• Music Analysis Paper (Due: Oct 15)\n• Listening Journal (Due: Oct 17)",
  'default': "I'm your AI tutor! I know your entire syllabus, track your deadlines, and can help you study. Try asking: 'When's my next exam?' or 'Give me a quiz'"
};

export function InteractiveChatDemo() {
  const [messages, setMessages] = useState([
    { type: 'ai', text: "Hi! I'm your AI tutor. I've analyzed your Music 101 syllabus. Ask me anything!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { type: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Find matching response
    const lowerInput = input.toLowerCase();
    let response = demoResponses.default;
    
    for (const [key, value] of Object.entries(demoResponses)) {
      if (lowerInput.includes(key)) {
        response = value;
        break;
      }
    }

    // Simulate AI typing delay
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { type: 'ai', text: response }]);
    }, 1000);
  };

  const quickPrompts = [
    "When's my next exam?",
    "Give me a quiz",
    "What assignments are due?"
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">CourseConnect AI - Interactive Demo</span>
          </div>
          <p className="text-sm text-white/80 mt-1">Try asking about exams, quizzes, or assignments</p>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {msg.type === 'ai' && (
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">AI Tutor</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-line">{msg.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white dark:bg-gray-700 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-gray-500">AI is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick prompts */}
        <div className="px-4 py-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2 mb-2">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(prompt);
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about your course..."
              className="flex-1 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Demo notice */}
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
        ✨ This is a demo. The real AI knows your actual syllabus, deadlines, and course content.
      </p>
    </div>
  );
}


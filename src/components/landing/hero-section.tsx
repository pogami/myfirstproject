'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Users, Zap, Send, Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { RippleText } from '@/components/ripple-text';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function HeroSection() {
  const [demoMessage, setDemoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      message: 'Hi! I\'m CourseConnect AI. Ask me anything about calculus, homework, or study tips!',
      timestamp: '2:30 PM'
    }
  ]);

  const handleDemoSend = async () => {
    if (demoMessage.trim()) {
      const userMessage = {
        id: chatMessages.length + 1,
        sender: 'user',
        message: demoMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages([...chatMessages, userMessage]);
      const currentMessage = demoMessage;
      setDemoMessage('');
      setIsLoading(true);
      
      // Check if user has sent 3+ messages
      const userMessageCount = [...chatMessages, userMessage].filter(msg => msg.sender === 'user').length;
      
      try {
        // Use Ollama for demo with short, concise responses
        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'qwen2.5:1.5b',
            prompt: `You are CourseConnect AI in a demo. Keep responses SHORT and CONCISE (1-2 sentences max). Be helpful but brief.

Student asks: ${currentMessage}

Give a brief, helpful response:`,
            stream: false,
            options: {
              temperature: 0.7,
              max_tokens: 100, // Very short for demo
              num_ctx: 1024
            }
          })
        });

        if (response.ok) {
          const aiResult = await response.json();
          
          // Add real AI response
          setChatMessages(prev => [...prev, {
            id: chatMessages.length + 2,
            sender: 'bot',
            message: aiResult.response,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
          
          // Add signup prompt after 3+ user messages
          if (userMessageCount >= 3) {
            setTimeout(() => {
              setChatMessages(prev => [...prev, {
                id: chatMessages.length + 3,
                sender: 'bot',
                message: '🎉 You\'ve tried the demo! Ready for unlimited AI tutoring, study groups, and more? Sign up now to access the full CourseConnect experience!',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }]);
            }, 2000);
          }
        } else {
          throw new Error('Ollama not available');
        }
      } catch (error) {
        console.error('AI chat error:', error);
        
        // Add fallback response
        setChatMessages(prev => [...prev, {
          id: chatMessages.length + 2,
          sender: 'bot',
          message: 'Hi! I\'m CourseConnect AI. I can help with calculus, homework, and study tips. What would you like to know?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Connect with{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Classmates
            </span>
            <br />
            Get{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Tutoring
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Upload your syllabus, find classmates taking the same course, and get instant AI help with homework, assignments, and exam prep.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => window.location.href = '/auth'}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 text-lg font-semibold rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
              onClick={() => document.getElementById('live-demo')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Play className="mr-2 h-5 w-5" />
              Try Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                10,000+
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Active Students
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                500+
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Universities
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                95%
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Satisfaction Rate
              </div>
            </div>
          </motion.div>
        </div>

        {/* Live Demo Chat Interface */}
        <motion.div
          id="live-demo"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 relative"
        >
          <div className="relative max-w-4xl mx-auto">
            {/* Live Chat Interface */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  </div>
                  <div>
                    <h3 className="font-semibold">CourseConnect AI Demo</h3>
                    <p className="text-sm text-blue-100">Try our AI tutor right here!</p>
                  </div>
                </div>
              </div>
              
              {/* Chat Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'bot' && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-xs p-3 rounded-lg ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                    </div>
                    {msg.sender === 'user' && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-500 to-green-600">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {/* AI Thinking Animation */}
                {isLoading && chatMessages.at(-1)?.sender !== 'bot' && (
                  <div className="flex items-start gap-3 w-full max-w-full animate-in slide-in-from-bottom-2 duration-300">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    </Avatar>
                    <div className="text-left min-w-0">
                      <div className="text-xs text-muted-foreground mb-1">
                        CourseConnect AI
                      </div>
                      <div className="text-sm font-medium">
                        <RippleText text="thinking..." className="text-blue-600" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={demoMessage}
                    onChange={(e) => setDemoMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleDemoSend()}
                    placeholder="Ask about calculus, homework, or study tips..."
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={handleDemoSend} 
                    disabled={isLoading || !demoMessage.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  This is a live demo - try asking about calculus, homework, or study tips!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}

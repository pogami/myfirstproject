'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Users, Zap, Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { RippleText } from '@/components/ripple-text';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TypewriterText, StaticText } from '@/components/saas-typography';
import { GradientStar } from '@/components/icons/gradient-star';

export function HeroSection() {
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [aiTypingMessage, setAiTypingMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [aiCharIndex, setAiCharIndex] = useState(0);

  const demoMessages = [
    {
      id: 1,
      sender: 'user',
      message: 'Can you help me understand derivatives in calculus?',
      timestamp: ''
    },
    {
      id: 2,
      sender: 'bot',
      message: 'Absolutely! A derivative measures how fast a function changes at any given point. Think of it like checking your speedometer - it shows your speed at that exact moment.\n\nFor example, if f(x) = x², then f\'(x) = 2x. So at x = 3, the slope is 6.\n\nWould you like me to show you how to solve a derivative step-by-step?',
      timestamp: ''
    }
  ];

  // Start live demo after component mounts
  useEffect(() => {
    const startDemo = setTimeout(() => {
      setIsTyping(true);
    }, 2000);
    return () => clearTimeout(startDemo);
  }, []);

  // Handle typing animation
  useEffect(() => {
    if (!isTyping || messageIndex >= demoMessages.length) return;

    const currentMsg = demoMessages[messageIndex];
    
    if (charIndex < currentMsg.message.length) {
      const timer = setTimeout(() => {
        setCurrentMessage(currentMsg.message.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, currentMsg.sender === 'bot' ? 30 : 50);
      return () => clearTimeout(timer);
    } else {
      // Message complete, add to chat
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatMessages(prev => [...prev, {
        ...currentMsg,
        message: currentMessage,
        timestamp: currentTime
      }]);
      
      // Reset for next message
      setCurrentMessage('');
      setCharIndex(0);
      setIsTyping(false);
      
      // Start next message after delay
      const nextTimer = setTimeout(() => {
        setMessageIndex(prev => prev + 1);
        setIsTyping(true);
      }, currentMsg.sender === 'bot' ? 2000 : 1000);
      
      // If this was a user message, trigger AI response
      if (currentMsg.sender === 'user') {
        setTimeout(() => {
          triggerAiResponse(currentMsg.message);
        }, 1500); // Wait 1.5 seconds after user message completes
      }
      
      return () => clearTimeout(nextTimer);
    }
  }, [isTyping, messageIndex, charIndex]);

  // Handle AI typing animation
  useEffect(() => {
    if (!isAiTyping || !aiTypingMessage) return;

    if (aiCharIndex < aiTypingMessage.length) {
      const timer = setTimeout(() => {
        setAiCharIndex(aiCharIndex + 1);
      }, 30); // AI types at 30ms per character
      return () => clearTimeout(timer);
    } else {
      // AI message complete, add to chat
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatMessages(prev => [...prev, {
        id: chatMessages.length + 1,
        sender: 'bot',
        message: aiTypingMessage,
        timestamp: currentTime
      }]);
      
      // Reset AI typing state
      setAiTypingMessage('');
      setAiCharIndex(0);
      setIsAiTyping(false);
    }
  }, [isAiTyping, aiTypingMessage, aiCharIndex, chatMessages.length]);

  // Function to trigger AI response with typing animation
  const triggerAiResponse = async (userMessage: string) => {
    // Use static demo response for consistent demo experience
    const demoResponse = demoMessages.find(msg => msg.sender === 'bot')?.message || 'A derivative measures how fast a function changes.';
    
    setAiTypingMessage(demoResponse);
    setIsAiTyping(true);
    setAiCharIndex(0);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Background Visual Layer (image fallback) */}
      <div
        className="absolute inset-0 pointer-events-none select-none opacity-20 dark:opacity-25 bg-center bg-cover"
        style={{ backgroundImage: "url('/screenshots/desktop-dashboard.png')" }}
      />
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
            <StaticText 
              text="Connect with " 
              className="text-gray-900 dark:text-white"
            />
            <TypewriterText 
              text="Classmates" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              delay={500}
            />
            <br />
            <StaticText 
              text="Get " 
              className="text-gray-900 dark:text-white"
            />
            <TypewriterText 
              text="AI Tutoring" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
              delay={2000}
            />
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
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 mobile-stack"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto mobile-button mobile-full-width"
              onClick={() => window.location.href = '/login'}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 text-lg font-semibold rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 w-full sm:w-auto mobile-button mobile-full-width"
              onClick={() => document.getElementById('live-demo')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Play className="mr-2 h-5 w-5" />
              Try Demo
            </Button>
          </motion.div>

          {/* Logo strip removed */}

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                2,500+
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Active Students
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                150+
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Universities
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                87%
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Satisfaction Rate
              </div>
            </div>
          </motion.div>
        </div>

        {/* Live demo teaser removed */}

        {/* Live Demo Section */}
        <motion.div
          id="live-demo"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 relative"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              See CourseConnect AI in Action
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Watch how students get instant help with homework questions
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Individual AI Chat Demo */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <GradientStar className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Live Demo - Calculus Study Session</h3>
                    <p className="text-sm text-blue-100">Student asking about derivatives and chain rule</p>
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
                        <div className="flex h-full w-full items-center justify-center bg-transparent">
                          <GradientStar className="h-4 w-4" />
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
                      <div className="flex flex-col items-center">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" alt="Jordan Kim" />
                          <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white text-xs">
                            JK
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-gray-500 mt-1">Jordan Kim</p>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Live Typing Animation */}
                {isTyping && messageIndex < demoMessages.length && (
                  <div className={`flex items-start gap-3 ${
                    demoMessages[messageIndex]?.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    {demoMessages[messageIndex]?.sender === 'bot' && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <div className="flex h-full w-full items-center justify-center bg-transparent">
                          <GradientStar className="h-4 w-4" />
                        </div>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-xs p-3 rounded-lg ${
                        demoMessages[messageIndex]?.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <p className="text-sm">
                        {currentMessage}
                        <motion.span
                          className="inline-block w-0.5 h-4 bg-current ml-1"
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        />
                      </p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {demoMessages[messageIndex]?.sender === 'user' && (
                      <div className="flex flex-col items-center">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" alt="Jordan Kim" />
                          <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white text-xs">
                            JK
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-gray-500 mt-1">Jordan Kim</p>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Typing Animation */}
                {isAiTyping && aiTypingMessage && (
                  <div className="flex items-start gap-3 justify-start">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <div className="flex h-full w-full items-center justify-center bg-transparent">
                        <GradientStar className="h-4 w-4" />
                      </div>
                    </Avatar>
                    <div className="max-w-xs p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                      <p className="text-sm">
                        {aiTypingMessage.substring(0, aiCharIndex)}
                        <motion.span
                          className="inline-block w-0.5 h-4 bg-current ml-1"
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        />
                      </p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Demo Status */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center flex items-center justify-center">
                  {messageIndex >= demoMessages.length ? (
                    "✅ Demo Complete: This is how CourseConnect AI helps students!"
                  ) : (
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      LIVE: Watch the conversation happen in real-time above!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}

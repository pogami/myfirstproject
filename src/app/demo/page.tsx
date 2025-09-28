'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Upload, 
  Users, 
  MessageCircle, 
  FileText, 
  Clock, 
  CheckCircle,
  Bot,
  User,
  Send,
  Paperclip,
  Sparkles
} from 'lucide-react';
import { RippleText } from '@/components/ripple-text';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      message: 'Hi! I\'m your AI tutor. I can help you with MATH-2211 Calculus. What would you like to know?',
      timestamp: '2:30 PM'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const demoSteps = [
    {
      title: 'Upload Your Syllabus',
      description: 'Upload your course syllabus and let AI extract key information',
      icon: Upload,
      content: (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50 dark:bg-blue-950/20">
            <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-2">
              Drop your syllabus here
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Supports PDF, DOCX, TXT, and image files
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800 dark:text-green-200">AI Analysis Complete</span>
            </div>
            <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <p><strong>Course:</strong> MATH-2211 Calculus I</p>
              <p><strong>Instructor:</strong> Dr. Sarah Johnson</p>
              <p><strong>Semester:</strong> Fall 2025</p>
              <p><strong>University:</strong> Georgia State University</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Find Study Partners',
      description: 'Connect with classmates taking the same course',
      icon: Users,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Study Group Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      A
                    </div>
                    <div>
                      <p className="font-medium">Alex Chen</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Online now</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      M
                    </div>
                    <div>
                      <p className="font-medium">Maria Rodriguez</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Last seen 5 min ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      J
                    </div>
                    <div>
                      <p className="font-medium">Jordan Kim</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Last seen 1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-sm font-medium">Alex shared study notes</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">2 minutes ago</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <p className="text-sm font-medium">Maria asked about derivatives</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">15 minutes ago</p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <p className="text-sm font-medium">Jordan shared practice problems</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">1 hour ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: 'AI-Powered Tutoring',
      description: 'Get instant help with homework and exam prep',
      icon: null,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              </div>
              <div>
                <h3 className="font-semibold text-lg">AI Tutor Assistant</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Always available to help</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 max-w-xs">
                  <p className="text-sm">Can you explain the chain rule in calculus?</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
                  <p className="text-sm">The chain rule is used to find the derivative of composite functions. If you have f(g(x)), the derivative is f'(g(x)) × g'(x). Let me show you an example...</p>
                </div>
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium mb-1">24/7 Available</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get help anytime</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium mb-1">File Analysis</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upload documents for analysis</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Smart Responses</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Context-aware answers</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowChat(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const userMessage = {
        id: chatMessages.length + 1,
        sender: 'user',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages([...chatMessages, userMessage]);
      const currentMessage = newMessage;
      setNewMessage('');
      setIsLoading(true);
      
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

  if (showChat) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChat(false)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Demo
              </Button>
              <div>
                <h1 className="font-semibold">MATH-2211 Study Group</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">3 members online</p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/auth')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Get Started
            </Button>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-96 flex flex-col">
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
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

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask a question about calculus..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <Button onClick={handleSendMessage} size="sm" disabled={isLoading || !newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Header */}
      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">CourseConnect AI Demo</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Experience our AI-powered study platform</p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/auth')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {demoSteps[currentStep].title}
            </h2>
            <Badge variant="outline" className="text-sm">
              Step {currentStep + 1} of {demoSteps.length}
            </Badge>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  {React.createElement(demoSteps[currentStep].icon, { className: "h-6 w-6 text-white" })}
                </div>
                {demoSteps[currentStep].title}
              </CardTitle>
              <CardDescription className="text-lg">
                {demoSteps[currentStep].description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {demoSteps[currentStep].content}
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {demoSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-blue-600'
                    : index < currentStep
                    ? 'bg-blue-300'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {currentStep === demoSteps.length - 1 ? 'Try Live Chat' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
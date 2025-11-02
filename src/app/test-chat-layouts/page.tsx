"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, User, Bot, Send, Paperclip, Mic, Search, Plus, Menu, X, ChevronLeft, ChevronRight, Sparkles, Zap, Brain, BookOpen, Settings, Grid3X3, FolderPlus, DollarSign, Upload, Home, Users, FilePlus, Bell, GraduationCap, FileText, MessageCircle } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
  messageType?: 'text' | 'code' | 'quiz' | 'assignment' | 'study-plan' | 'flashcard';
  courseContext?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: string;
  relatedTopics?: string[];
}

export default function TestChatLayouts() {
  const [inputValue, setInputValue] = useState("");
  const [selectedTab, setSelectedTab] = useState("class-chats");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("CS 101 - Programming");
  const [studyStreak, setStudyStreak] = useState(7);
  const [currentGrade, setCurrentGrade] = useState(87);
  const [nextDeadline, setNextDeadline] = useState("Assignment 3 - Due Tomorrow");
  const [activeStudySession, setActiveStudySession] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data for our actual features
  const classChats = [
    "CS 101 - Programming",
    "MATH 2211 - Calculus", 
    "PHYS 2201 - Physics",
    "CHEM 101 - Chemistry",
    "ENG 101 - English"
  ];

  const generalChats = [
    "General AI Help",
    "Study Planning",
    "Assignment Help",
    "Exam Preparation"
  ];

  const notifications = [
    "New assignment posted",
    "Exam reminder - CS 101",
    "Grade posted - MATH 2211",
    "Syllabus updated - PHYS 2201"
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: selectedTab === "class-chats" 
          ? "Welcome to your Class Chats! Select a course from the sidebar to start chatting with your AI tutor."
          : selectedTab === "general-chat"
          ? "Hello! I'm your CourseConnect AI assistant. Ask me anything about your studies, assignments, or academic questions."
          : selectedTab === "classes-overview"
          ? "Welcome to Classes Overview! Here you can manage all your courses, assignments, and track your progress."
          : selectedTab === "flashcards"
          ? "Ready to study with flashcards! I can help you create and review flashcards for any of your courses."
          : "Welcome to Notifications! Here you'll see updates from your courses, assignments, and important announcements.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [selectedTab]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      content: 'AI is thinking...',
      sender: 'ai',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    // Simulate AI response delay
    setTimeout(() => {
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      
      // Generate contextual AI response
      const aiResponse = generateAIResponse(inputValue.trim(), selectedTab);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string, tab: string): string => {
    const responses = {
      "class-chats": [
        "That's a great question about programming! In Java, classes are blueprints for objects. Would you like me to explain more about object-oriented programming?",
        "I can help you with that CS 101 concept! Let me break it down step by step with examples.",
        "Perfect! Let's work through this programming problem together. Here's how I would approach it...",
        "Great question! This is a fundamental concept in computer science. Let me explain it clearly."
      ],
      "general-chat": [
        "I'd be happy to help you with that! As your AI study assistant, I can help with assignments, study planning, and academic questions.",
        "That's an interesting question! Let me provide you with a comprehensive answer and some study tips.",
        "I understand you're looking for help with your studies. Here's what I recommend based on your question...",
        "Great question! I can help you understand this concept and provide additional resources for your learning."
      ],
      "classes-overview": [
        "I can help you organize your courses and track your progress. Here's what I found about your current courses...",
        "Let me show you an overview of your assignments and upcoming deadlines.",
        "Based on your course load, here's a suggested study schedule and priority list.",
        "I can help you manage your courses better. Here are some organizational tips and progress tracking suggestions."
      ],
      "flashcards": [
        "Perfect! Let's create some flashcards for that topic. Here are some key concepts you should memorize...",
        "Great study strategy! I'll help you create effective flashcards. Here are the most important points to remember...",
        "Flashcards are excellent for retention! Let me help you create a set for this subject with spaced repetition in mind.",
        "I'll help you create comprehensive flashcards. Here are the essential concepts organized for optimal learning."
      ],
      "notifications": [
        "I can help you stay on top of your course updates. Here's what's new in your classes...",
        "Let me check your recent notifications and help you prioritize what needs attention.",
        "I'll help you manage your notifications and keep track of important deadlines.",
        "Here's a summary of your recent course updates and what you should focus on next."
      ]
    };

    const tabResponses = responses[tab as keyof typeof responses] || responses["general-chat"];
    const baseResponse = tabResponses[Math.floor(Math.random() * tabResponses.length)];
    
    // Add CourseConnect-specific enhancements
    const enhancements = [
      `\n\n📚 **Study Tip**: This concept is worth 15 minutes of focused practice.`,
      `\n\n🎯 **Difficulty**: Medium • ⏱️ **Est. Time**: 10-15 min`,
      `\n\n🔥 **Streak Bonus**: +1 day to your study streak!`,
      `\n\n📊 **Progress**: This helps with your ${currentGrade}% grade in ${selectedCourse}`,
      `\n\n⏰ **Next**: Don't forget about ${nextDeadline}`,
      `\n\n🧠 **Memory**: Try the spaced repetition technique for better retention.`
    ];
    
    return baseResponse + enhancements[Math.floor(Math.random() * enhancements.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col">
        {/* Top Section */}
        <div className="p-4 space-y-3">
          <Button className="w-full justify-start bg-transparent hover:bg-gray-800 text-white border border-gray-600">
            <FilePlus className="h-4 w-4 mr-2" />
            Add Course
              </Button>
          
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
              placeholder="Search courses..." 
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
            </div>
          
          <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800">
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          </div>
          
        {/* MY COURSES Section */}
        <div className="px-4 py-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">MY COURSES</h3>
          <div className="space-y-1">
            {classChats.map((course, index) => (
              <Button 
                key={index}
                variant="ghost" 
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 text-left"
              >
                <GraduationCap className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{course}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 py-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Navigation</h3>
          <div className="space-y-1">
            <Button 
              variant={selectedTab === "class-chats" ? "secondary" : "ghost"}
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => setSelectedTab("class-chats")}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Class Chats
            </Button>
            
            <Button 
              variant={selectedTab === "general-chat" ? "secondary" : "ghost"}
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => setSelectedTab("general-chat")}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              General Chat
            </Button>
            
            <Button 
              variant={selectedTab === "classes-overview" ? "secondary" : "ghost"}
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => setSelectedTab("classes-overview")}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Classes Overview
            </Button>
            
            <Button 
              variant={selectedTab === "flashcards" ? "secondary" : "ghost"}
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => setSelectedTab("flashcards")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Flashcards
            </Button>
            
            <Button 
              variant={selectedTab === "notifications" ? "secondary" : "ghost"}
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => setSelectedTab("notifications")}
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="px-4 py-2 flex-1">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recent Activity</h3>
          <div className="space-y-1">
            {selectedTab === "class-chats" && classChats.slice(0, 5).map((chat, index) => (
              <Button 
                key={index}
                variant="ghost" 
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 text-left"
              >
                <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{chat}</span>
                          </Button>
            ))}
            
            {selectedTab === "general-chat" && generalChats.map((chat, index) => (
              <Button 
                key={index}
                variant="ghost" 
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 text-left"
              >
                <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{chat}</span>
              </Button>
            ))}
            
            {selectedTab === "notifications" && notifications.map((notification, index) => (
              <Button 
                key={index}
                variant="ghost" 
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 text-left"
              >
                <Bell className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{notification}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Study Stats Section */}
        <div className="px-4 py-2 border-t border-gray-700">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Study Stats</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white text-xs">🔥</span>
              </div>
                <span className="text-white text-sm">Streak</span>
            </div>
              <span className="text-orange-400 font-bold">{studyStreak} days</span>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs">📊</span>
              </div>
                <span className="text-white text-sm">Grade</span>
            </div>
              <span className="text-green-400 font-bold">{currentGrade}%</span>
          </div>
          
            <div className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white text-xs">⏰</span>
          </div>
                <span className="text-white text-sm">Next Due</span>
        </div>
              <span className="text-red-400 text-xs">Tomorrow</span>
      </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
                        </div>
            <div className="flex-1">
              <div className="text-white text-sm font-medium">adam</div>
              <div className="text-gray-400 text-xs">Student • Level 3</div>
                      </div>
                  </div>
          
          <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
            <Sparkles className="h-4 w-4 mr-2" />
            Start Study Session
              </Button>
            </div>
            </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-gray-900">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-white">CourseConnect AI</h1>
              <div className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                <span className="text-green-400 text-xs font-medium">AI Tutor Active</span>
            </div>
          </div>
          
            {/* Course Selector */}
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-gray-400" />
              <select 
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {classChats.map((course, index) => (
                  <option key={index} value={course}>{course}</option>
                ))}
              </select>
              </div>
            </div>
            
          <div className="flex items-center gap-3">
            {/* Study Session Timer */}
            {activeStudySession && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-blue-400 text-sm">Study Session: 25:30</span>
              </div>
            )}
            
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
              <Brain className="h-4 w-4 mr-2" />
              AI Study Mode
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Menu className="h-4 w-4" />
            </Button>
        </div>
      </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                      : 'bg-gradient-to-r from-gray-400 to-gray-500'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`relative group ${
                    message.sender === 'user' ? 'ml-2' : 'mr-2'
                  }`}>
                    <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md'
                        : 'bg-gray-800 text-white rounded-bl-md border border-gray-700'
                    } ${message.isTyping ? 'animate-pulse' : ''}`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
            </p>
          </div>

                    {/* Timestamp */}
                    <div className={`text-xs text-gray-500 mt-1 ${
                      message.sender === 'user' ? 'text-right' : 'text-left'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
            </div>
            </div>
          </div>
          </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
      </div>

        {/* Input Area */}
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="flex items-center gap-3 bg-gray-800 rounded-2xl p-4 border border-gray-700">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Upload className="h-5 w-5" />
                          </Button>
                
                <div className="flex-1">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      selectedTab === "class-chats" ? "Ask about your course..." :
                      selectedTab === "general-chat" ? "Ask me anything..." :
                      selectedTab === "classes-overview" ? "Search classes..." :
                      selectedTab === "flashcards" ? "Create flashcards..." :
                      "Search notifications..."
                    }
                    disabled={isLoading}
                    className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
                  />
                        </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AI</span>
                      </div>
                        </Button>
                  
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Mic className="h-5 w-5" />
              </Button>
                  
          <Button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
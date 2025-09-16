"use client";

import { useState, useEffect } from "react";
import { Bot, MessageCircle, X, Sparkles, BookOpen, Users, GraduationCap, ArrowRight, CheckCircle, Zap, Target, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AIBotProps {
  className?: string;
}

export function AIBot({ className = "" }: AIBotProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);

  const messages = [
    {
      title: "Welcome to CourseConnect! 🎓",
      content: "I'm your AI study assistant! I can help you with homework, create flashcards, and connect you with study groups.",
      icon: <Sparkles className="w-5 h-5 text-yellow-500" />,
      action: "Get Started"
    },
    {
      title: "Upload Your Syllabus 📚",
      content: "Start by uploading your course syllabus. I'll analyze it and create personalized study materials for you!",
      icon: <BookOpen className="w-5 h-5 text-blue-500" />,
      action: "Upload Now"
    },
    {
      title: "Join Study Groups 👥",
      content: "Connect with classmates in your courses. Collaborate on assignments and study together with AI assistance.",
      icon: <Users className="w-5 h-5 text-green-500" />,
      action: "Find Groups"
    },
    {
      title: "AI-Powered Learning 🤖",
      content: "Get instant help with homework, explanations, and study tips. I'm available 24/7 to support your academic success!",
      icon: <GraduationCap className="w-5 h-5 text-purple-500" />,
      action: "Try AI Tutor"
    }
  ];

  const overviewSteps = [
    {
      title: "Step 1: Upload Your Syllabus",
      description: "Upload any course syllabus and get instant AI analysis",
      features: ["Smart topic extraction", "Study schedule suggestions", "Difficulty assessment"],
      icon: <BookOpen className="w-6 h-6 text-blue-500" />
    },
    {
      title: "Step 2: Join Study Groups",
      description: "Connect with classmates and collaborate on assignments",
      features: ["Auto-match with classmates", "Real-time collaboration", "Study session scheduling"],
      icon: <Users className="w-6 h-6 text-green-500" />
    },
    {
      title: "Step 3: Use AI Tools",
      description: "Access powerful AI features for better learning",
      features: ["24/7 homework help", "Auto-generated flashcards", "Grade predictions"],
      icon: <Zap className="w-6 h-6 text-purple-500" />
    },
    {
      title: "Step 4: Track Progress",
      description: "Monitor your academic performance and improve",
      features: ["Performance analytics", "Study time tracking", "Success insights"],
      icon: <Target className="w-6 h-6 text-orange-500" />
    }
  ];

  useEffect(() => {
    // Show bot after 3 seconds
    const showTimer = setTimeout(() => setIsVisible(true), 3000);
    
    // Show popup after 5 seconds
    const popupTimer = setTimeout(() => setShowPopup(true), 5000);
    
    return () => {
      clearTimeout(showTimer);
      clearTimeout(popupTimer);
    };
  }, []);

  useEffect(() => {
    if (showPopup && !showOverview) {
      // Cycle through messages every 8 seconds
      const messageTimer = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % messages.length);
      }, 8000);
      
      return () => clearInterval(messageTimer);
    }
  }, [showPopup, showOverview, messages.length]);

  const handleBotClick = () => {
    if (!showPopup) {
      setShowPopup(true);
    }
  };

  const handleAction = () => {
    if (currentMessage === 0) {
      // Redirect to upload page with slideshow
      window.location.href = "/dashboard/upload?showSlideshow=true";
    } else {
      // Close popup and redirect based on current message
      setShowPopup(false);
      
      switch (currentMessage) {
        case 1:
          window.location.href = "/dashboard/upload";
          break;
        case 2:
          window.location.href = "/dashboard/overview";
          break;
        case 3:
          // Fix: Redirect to demo chat instead of advanced AI
          window.location.href = "/dashboard/chat";
          break;
        default:
          window.location.href = "/dashboard";
      }
    }
  };

  const handleStartJourney = () => {
    setShowOverview(false);
    setShowPopup(false);
    window.location.href = "/dashboard/upload";
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* AI Bot Avatar */}
      <div 
        className={`relative transition-all duration-500 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
      >
        {/* Bot Body */}
        <div 
          className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-2xl border-4 border-white cursor-pointer hover:scale-105 transition-transform duration-200"
          onClick={handleBotClick}
        >
          {/* Eyes */}
          <div className="absolute top-3 left-3 w-2 h-2 bg-white rounded-full"></div>
          <div className="absolute top-3 right-3 w-2 h-2 bg-white rounded-full"></div>
          <div className="absolute top-4 left-4 w-1 h-1 bg-blue-600 rounded-full"></div>
          <div className="absolute top-4 right-4 w-1 h-1 bg-blue-600 rounded-full"></div>
          
          {/* Smile */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-6 h-3 border-2 border-white rounded-full border-t-transparent"></div>
          
          {/* Bot Icon */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
            <Bot className="w-6 h-6 text-white" />
          </div>
          
          {/* Pulsing Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-75"></div>
        </div>

        {/* Notification Badge */}
        {showPopup && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
            <span className="text-white text-xs font-bold">!</span>
          </div>
        )}
      </div>

      {/* Popup Message */}
      {showPopup && (
        <div className="absolute bottom-20 right-0 w-80 animate-in slide-in-from-bottom-2 duration-500">
          <Card className="bg-white/95 backdrop-blur-sm border-2 border-blue-200 shadow-2xl">
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-600">AI Assistant</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPopup(false)}
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Message Content */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  {messages[currentMessage].icon}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {messages[currentMessage].title}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {messages[currentMessage].content}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleAction}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {messages[currentMessage].action}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                {/* Message Indicators */}
                <div className="flex justify-center gap-1">
                  {messages.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                        index === currentMessage ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}

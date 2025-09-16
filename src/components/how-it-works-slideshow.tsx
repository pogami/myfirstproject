"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, BookOpen, Users, Zap, Target, CheckCircle, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SlideshowProps {
  onClose: () => void;
}

export function HowItWorksSlideshow({ onClose }: SlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to CourseConnect! 🎓",
      subtitle: "Your AI-powered study companion",
      content: "Let me show you how CourseConnect works and how it can help you succeed in your studies.",
      icon: <Sparkles className="w-16 h-16 text-yellow-500" />,
      bgColor: "from-yellow-50 to-orange-50"
    },
    {
      title: "Step 1: Upload Your Syllabus 📚",
      subtitle: "AI Analysis & Smart Processing",
      content: "Upload any course syllabus and our AI will instantly analyze it to extract key topics, create study schedules, and assess difficulty levels.",
      features: ["Smart topic extraction", "Study schedule suggestions", "Difficulty assessment"],
      icon: <BookOpen className="w-16 h-16 text-blue-500" />,
      bgColor: "from-blue-50 to-indigo-50"
    },
    {
      title: "Step 2: Join Study Groups 👥",
      subtitle: "Connect & Collaborate",
      content: "Automatically match with classmates in your courses. Collaborate on assignments and study together with AI assistance.",
      features: ["Auto-match with classmates", "Real-time collaboration", "Study session scheduling"],
      icon: <Users className="w-16 h-16 text-green-500" />,
      bgColor: "from-green-50 to-emerald-50"
    },
    {
      title: "Step 3: Use AI Tools 🤖",
      subtitle: "24/7 Learning Support",
      content: "Access powerful AI features including instant homework help, auto-generated flashcards, and grade predictions.",
      features: ["24/7 homework help", "Auto-generated flashcards", "Grade predictions"],
      icon: <Zap className="w-16 h-16 text-purple-500" />,
      bgColor: "from-purple-50 to-pink-50"
    },
    {
      title: "Step 4: Track Progress 📊",
      subtitle: "Monitor & Improve",
      content: "Monitor your academic performance with detailed analytics, study time tracking, and personalized success insights.",
      features: ["Performance analytics", "Study time tracking", "Success insights"],
      icon: <Target className="w-16 h-16 text-orange-500" />,
      bgColor: "from-orange-50 to-red-50"
    },
    {
      title: "Ready to Get Started? 🚀",
      subtitle: "Your academic success journey begins now",
      content: "CourseConnect combines AI-powered analysis with collaborative study tools to help you ace every class.",
      benefits: [
        { icon: <Clock className="w-5 h-5" />, text: "24/7 AI Support" },
        { icon: <Target className="w-5 h-5" />, text: "Personalized Learning" },
        { icon: <Users className="w-5 h-5" />, text: "Study Group Matching" },
        { icon: <Zap className="w-5 h-5" />, text: "Instant Homework Help" }
      ],
      icon: <Sparkles className="w-16 h-16 text-blue-500" />,
      bgColor: "from-blue-50 to-purple-50"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white/95 backdrop-blur-sm border-2 border-blue-200 shadow-2xl">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">How CourseConnect Works</h2>
                <p className="text-sm text-gray-600">Step {currentSlide + 1} of {slides.length}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Slide Content */}
          <div className={`p-8 bg-gradient-to-br ${currentSlideData.bgColor} min-h-[500px] flex flex-col items-center justify-center text-center`}>
            <div className="mb-8">
              {currentSlideData.icon}
            </div>
            
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              {currentSlideData.title}
            </h3>
            
            <p className="text-lg text-gray-600 mb-2">
              {currentSlideData.subtitle}
            </p>
            
            <p className="text-gray-600 mb-8 max-w-2xl">
              {currentSlideData.content}
            </p>

            {/* Features or Benefits */}
            {currentSlideData.features && (
              <div className="space-y-3 mb-8">
                {currentSlideData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {currentSlideData.benefits && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                {currentSlideData.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 text-gray-700">
                    <div className="text-blue-500">{benefit.icon}</div>
                    <span className="text-sm">{benefit.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Progress Indicators */}
            <div className="flex justify-center gap-2 mb-8">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index === currentSlide ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentSlide === slides.length - 1 ? (
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  Start Using CourseConnect
                </Button>
              ) : (
                <Button
                  onClick={nextSlide}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

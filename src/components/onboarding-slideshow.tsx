"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Upload, 
  MessageSquare, 
  Users, 
  Brain, 
  BookOpen, 
  Sparkles,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { useChatStore } from "@/hooks/use-chat-store";

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    id: "welcome",
    title: "Welcome to CourseConnect! 🎓",
    description: "Your AI-powered study companion is ready to help you succeed academically.",
    icon: <Sparkles className="size-12 text-purple-600" />,
    features: [
      "AI-powered homework assistance",
      "Smart syllabus analysis",
      "Collaborative study groups",
      "Automated flashcard generation"
    ],
    color: "from-purple-500 to-blue-600"
  },
  {
    id: "upload",
    title: "Upload Your Syllabus 📚",
    description: "Get instant analysis of your course materials and assignments.",
    icon: <Upload className="size-12 text-blue-600" />,
    features: [
      "Automatic assignment detection",
      "Due date tracking",
      "Study schedule suggestions",
      "Grade prediction insights"
    ],
    color: "from-blue-500 to-indigo-600"
  },
  {
    id: "ai-tutor",
    title: "AI Study Assistant 🤖",
    description: "Get personalized help with your coursework and assignments.",
    icon: <Brain className="size-12 text-indigo-600" />,
    features: [
      "24/7 homework help",
      "Step-by-step explanations",
      "Practice problem generation",
      "Concept clarification"
    ],
    color: "from-indigo-500 to-purple-600"
  },
  {
    id: "study-groups",
    title: "Join Study Groups 👥",
    description: "Connect with classmates and collaborate on assignments.",
    icon: <Users className="size-12 text-green-600" />,
    features: [
      "Find classmates in your courses",
      "Group chat and collaboration",
      "Shared study materials",
      "Peer support network"
    ],
    color: "from-green-500 to-emerald-600"
  },
  {
    id: "flashcards",
    title: "Smart Flashcards 📝",
    description: "Generate personalized flashcards from your course content.",
    icon: <BookOpen className="size-12 text-orange-600" />,
    features: [
      "Auto-generated from syllabus",
      "Spaced repetition learning",
      "Progress tracking",
      "Customizable study sets"
    ],
    color: "from-orange-500 to-red-600"
  }
];

interface OnboardingSlideshowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingSlideshow({ isOpen, onClose, onComplete }: OnboardingSlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { activateTrial } = useChatStore();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = () => {
    // Activate trial for new users
    activateTrial();
    handleClose();
    onComplete();
  };

  const handleSkip = () => {
    handleClose();
    onComplete();
  };

  if (!isOpen) return null;

  const currentSlideData = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <Card className={`w-full max-w-2xl mx-4 shadow-2xl border-0 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <CardContent className="p-0">
          {/* Header */}
          <div className="relative p-6 pb-4">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 h-8 w-8 p-0 hover:bg-transparent"
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
            </Button>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Step {currentSlide + 1} of {slides.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${currentSlideData.color} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Slide Content */}
            <div className="text-center space-y-6">
              {/* Icon */}
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${currentSlideData.color} shadow-lg`}>
                {currentSlideData.icon}
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-foreground">
                {currentSlideData.title}
              </h2>

              {/* Description */}
              <p className="text-muted-foreground text-lg leading-relaxed">
                {currentSlideData.description}
              </p>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentSlideData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="size-4 text-green-500 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentSlide === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                {slides.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? `bg-gradient-to-r ${currentSlideData.color}` 
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={handleNext}
                className={`bg-gradient-to-r ${currentSlideData.color} hover:opacity-90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2`}
              >
                {currentSlide === slides.length - 1 ? (
                  <>
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {/* Skip Option */}
            <div className="text-center mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="hover:bg-transparent text-muted-foreground hover:text-foreground"
              >
                Skip Tour
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

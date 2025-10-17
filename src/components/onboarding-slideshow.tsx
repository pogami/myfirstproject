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
    title: "Welcome to CourseConnect AI! 🎓",
    description: "Your AI-powered learning companion is ready to help you succeed",
    icon: <Sparkles className="size-12 text-purple-600" />,
    features: [
      "Upload your syllabus for personalized insights",
      "AI tutoring for each course",
      "Smart flashcards and study tools",
      "Track assignments and exams automatically"
    ],
    color: "from-purple-500 to-blue-600"
  },
  {
    id: "command-menu",
    title: "Command Menu (⌘K) ⚡",
    description: "Navigate instantly with keyboard shortcuts",
    icon: <ArrowRight className="size-12 text-purple-600" />,
    features: [
      "Press Ctrl+K (or ⌘K on Mac) anywhere",
      "Access all your course chats instantly",
      "Navigate between pages quickly",
      "Upload new syllabus on the fly"
    ],
    color: "from-purple-500 to-indigo-600"
  },
  {
    id: "upload",
    title: "Upload Your Syllabus 📚",
    description: "AI analyzes and creates your course chat automatically",
    icon: <Upload className="size-12 text-blue-600" />,
    features: [
      "Drag & drop or click to upload PDF",
      "AI extracts course info, exam dates, assignments",
      "Automatic deadline tracking",
      "Pro tip: Upload all syllabi at once!"
    ],
    color: "from-blue-500 to-indigo-600"
  },
  {
    id: "ai-tutor",
    title: "Class Chats 🤖",
    description: "AI tutoring for each course - knows your syllabus!",
    icon: <Brain className="size-12 text-indigo-600" />,
    features: [
      "Ask: 'When is my next exam?'",
      "Get help: 'Help me study for the midterm'",
      "Generate: 'Create a practice quiz on Chapter 3'",
      "Explain: 'Explain this concept in simple terms'"
    ],
    color: "from-indigo-500 to-purple-600"
  },
  {
    id: "interactive-learning",
    title: "Interactive Learning 🎯",
    description: "Quizzes, exams, and flashcards powered by AI",
    icon: <BookOpen className="size-12 text-green-600" />,
    features: [
      "Interactive quizzes (5-question quick tests)",
      "Practice exams (20-question timed tests)",
      "Smart flashcards from course content",
      "Just ask: 'Quiz me on Baroque music'"
    ],
    color: "from-green-500 to-emerald-600"
  },
  {
    id: "community",
    title: "Community & Chats 👥",
    description: "Connect with classmates and get AI help",
    icon: <Users className="size-12 text-orange-600" />,
    features: [
      "General AI chat for all courses",
      "Community chat with classmates (coming soon)",
      "Type @ai to call AI for help",
      "Get notified of new messages"
    ],
    color: "from-orange-500 to-red-600"
  },
  {
    id: "complete",
    title: "You're All Set! 🎉",
    description: "Start your learning journey with these quick steps",
    icon: <CheckCircle className="size-12 text-green-600" />,
    features: [
      "1. Upload your syllabi",
      "2. Try the command menu (⌘K)",
      "3. Ask the AI for help",
      "4. Generate a practice quiz"
    ],
    color: "from-green-500 to-emerald-600"
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
    // Set onboarding completion flags
    localStorage.setItem('onboarding-completed', 'true');
    
    // Also set guest-specific key if user is a guest
    try {
      const guestUserData = localStorage.getItem('guestUser');
      if (guestUserData) {
        const guestUser = JSON.parse(guestUserData);
        if (guestUser.isGuest || guestUser.isAnonymous) {
          localStorage.setItem('guest-onboarding-completed', 'true');
        }
      }
    } catch (error) {
      console.warn('Error checking guest status for onboarding:', error);
    }
    
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

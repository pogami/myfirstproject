"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  Upload,
  MessageSquare,
  BookOpen,
  Zap,
  GraduationCap,
  FileText,
  TrendingUp,
  CheckCircle,
  Sparkles,
  Bell,
  Users,
  Clock,
} from 'lucide-react';

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const onboardingSteps = [
  {
    icon: () => null,
    title: "Welcome to CourseConnect!",
    description: "Your AI-powered study companion",
    content: (
      <div className="space-y-3">
        <div className="flex items-center justify-center">
          <div className="p-0 rounded-full">
            <img src="/pageicon.png" alt="CourseConnect" className="h-14 w-14 rounded-full object-contain" />
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          CourseConnect helps you ace your classes with AI-powered tools, 
          smart study features, and a supportive community.
        </p>
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="text-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg mx-auto w-fit mb-1.5">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xs font-medium">AI Tutoring</p>
          </div>
          <div className="text-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg mx-auto w-fit mb-1.5">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-xs font-medium">Study Groups</p>
          </div>
          <div className="text-center">
            <div className="p-2 bg-green-100 dark:bg-green-950 rounded-lg mx-auto w-fit mb-1.5">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xs font-medium">Track Progress</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: GraduationCap,
    title: "Profile edits",
    description: "Edit Major, GPA, Credits, and more",
    content: (
      <div className="space-y-3 text-sm">
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>Major is now editable on the dashboard profile page</li>
          <li>GPA limited to 0–4.0; Credits limited to 0–130</li>
          <li>Guest placeholders: e.g., “Sign up to save your university”</li>
        </ul>
      </div>
    ),
  },
  {
    icon: Command,
    title: "Command Menu (⌘K)",
    description: "Navigate instantly with keyboard shortcuts",
    badge: { text: "Power Feature", color: "bg-purple-500" },
    content: (
      <div className="space-y-3">
        <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-lg border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-center gap-2 mb-2">
            <kbd className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-lg font-bold shadow-sm">
              ⌘
            </kbd>
            <span className="text-lg font-bold">+</span>
            <kbd className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-lg font-bold shadow-sm">
              K
            </kbd>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Press <strong>Ctrl+K</strong> (or <strong>⌘K</strong> on Mac) anywhere
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-xs">Instantly access:</h4>
          <ul className="space-y-1.5">
            {[
              { icon: MessageSquare, text: "All your course chats" },
              { icon: BookOpen, text: "Navigate between pages" },
              { icon: Upload, text: "Upload new syllabus" },
              { icon: GraduationCap, text: "Academic tools" },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-xs">
                <div className="p-1.5 bg-primary/10 rounded-md">
                  <item.icon className="h-3.5 w-3.5 text-primary" />
                </div>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    ),
  },
  {
    icon: Upload,
    title: "Upload Your Syllabus",
    description: "AI analyzes and creates your course chat",
    badge: { text: "Start Here", color: "bg-green-500" },
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6 rounded-xl border-2 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-lg">
              <Upload className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Drag & drop or click to upload your syllabus PDF
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">What the AI extracts:</h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: BookOpen, text: "Course info" },
              { icon: Clock, text: "Exam dates" },
              { icon: FileText, text: "Assignments" },
              { icon: Bell, text: "Deadlines" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm p-2 bg-muted rounded-lg">
                <item.icon className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mt-4">
          <p className="text-xs text-center">
            <strong>Pro Tip:</strong> Upload all your syllabi at once!
          </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: MessageSquare,
    title: "Class Chats",
    description: "AI tutoring for each course",
    badge: { text: "AI Powered", color: "bg-blue-500" },
    content: (
      <div className="space-y-3">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">AI knows your syllabus!</p>
              <p className="text-xs text-white/90">Ask anything about your course</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Try asking:</h4>
          <div className="space-y-2">
            {[
              "When is my next exam?",
              "Help me study for the midterm",
              "Generate a practice quiz on Chapter 3",
              "Explain this concept in simple terms",
            ].map((question, i) => (
              <div key={i} className="bg-muted p-3 rounded-lg text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">{question}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: GraduationCap,
    title: "Interactive Learning",
    description: "Quizzes, exams, and flashcards",
    badge: { text: "Study Tools", color: "bg-indigo-500" },
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-950/30 dark:to-pink-950/30 p-4 rounded-xl border-2 border-purple-200 dark:border-purple-800">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg w-fit mb-2">
              <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h5 className="font-semibold text-sm mb-1">Interactive Quizzes</h5>
            <p className="text-xs text-muted-foreground">5-question quick tests</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-950/30 dark:to-cyan-950/30 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg w-fit mb-2">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h5 className="font-semibold text-sm mb-1">Practice Exams</h5>
            <p className="text-xs text-muted-foreground">20-question timed tests</p>
          </div>
        </div>
        
        <div className="bg-muted p-4 rounded-xl">
          <h4 className="font-semibold text-sm mb-3">Just ask the AI:</h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm">"Quiz me on Baroque music"</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm">"Generate a practice exam"</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm">"Create flashcards for Chapter 5"</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-center">
            <strong>Pro Tip:</strong> The AI adapts to what you struggle with!
          </p>
        </div>
      </div>
    ),
  },
  {
    icon: Users,
    title: "Community & Chats",
    description: "Connect with classmates (Coming Soon)",
    badge: { text: "Coming Soon", color: "bg-gray-500" },
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800">
            <Badge className="mb-3 bg-blue-500">AI</Badge>
            <h5 className="font-semibold text-sm mb-1">General Chat</h5>
            <p className="text-xs text-muted-foreground">Ask AI about all your courses</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-4 rounded-xl border-2 border-green-200 dark:border-green-800">
            <Badge className="mb-3 bg-green-500">Live</Badge>
            <h5 className="font-semibold text-sm mb-1">Community</h5>
            <p className="text-xs text-muted-foreground">Chat with other students</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">In Community Chat:</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Users className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Connect with classmates in your courses (coming soon)</span>
            </li>
            <li className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Type <code className="bg-muted px-1 rounded">@ai</code> to call AI for help</span>
            </li>
            <li className="flex items-start gap-2">
              <Bell className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Get notified of new messages</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    icon: CheckCircle,
    title: "You're All Set!",
    description: "Start your learning journey",
    content: (
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="p-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl">
            <CheckCircle className="h-16 w-16 text-white" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-semibold text-center">Quick Start Guide:</h4>
          <div className="space-y-2">
            {[
              { num: "1", text: "Upload your syllabi", icon: Upload },
              { num: "2", text: "Try the command menu (⌘K)", icon: Command },
              { num: "3", text: "Ask the AI for help", icon: MessageSquare },
              { num: "4", text: "Generate a practice quiz", icon: GraduationCap },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex-shrink-0">
                  {step.num}
                </div>
                <step.icon className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium">{step.text}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl text-center">
          <p className="font-semibold mb-1">Need help anytime?</p>
          <p className="text-sm text-white/90">Access this tutorial from your profile menu</p>
        </div>
      </div>
    ),
  },
];

export function OnboardingTutorial({ isOpen, onClose }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [api, setApi] = useState<any>();

  const handleComplete = () => {
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
    
    onClose();
  };

  const handleNext = () => {
    if (api && currentStep < onboardingSteps.length - 1) {
      api.scrollNext();
    }
  };

  const handlePrev = () => {
    if (api && currentStep > 0) {
      api.scrollPrev();
    }
  };

  React.useEffect(() => {
    if (!api) return;

    api.on('select', () => {
      setCurrentStep(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <img src="/pageicon.png" alt="icon" className="h-5 w-5 rounded" />
            </div>
            <div>
              <DialogTitle className="text-lg flex items-center gap-2">
                {onboardingSteps[currentStep].title}
                {onboardingSteps[currentStep].badge && (
                  <Badge className={`${onboardingSteps[currentStep].badge.color} text-white text-xs`}>
                    {onboardingSteps[currentStep].badge.text}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs">{onboardingSteps[currentStep].description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            setApi={setApi}
            className="w-full"
          >
            <CarouselContent>
              {onboardingSteps.map((step, index) => (
                <CarouselItem key={index}>
                  <div className="flex flex-col">
                    {step.content}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t flex-shrink-0">
          <div className="flex items-center gap-1.5">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-6 bg-primary'
                    : index < currentStep
                    ? 'w-1.5 bg-primary/50'
                    : 'w-1.5 bg-muted'
                }`}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePrev}
              >
                Previous
              </Button>
            )}
            {currentStep < onboardingSteps.length - 1 ? (
              <Button 
                size="sm"
                onClick={handleNext}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleComplete} size="sm" className="bg-gradient-to-r from-green-500 to-emerald-600">
                <CheckCircle className="mr-2 h-4 w-4" />
                Get Started!
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


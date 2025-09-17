
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Brain, Target, Zap, Sparkles, BookOpen, ArrowRight, TrendingUp, Clock, CheckCircle } from "lucide-react";
import FlashcardGenerator from "@/components/flashcard-generator";
import { useState, useEffect } from "react";

const features = [
  {
    icon: <Brain className="size-5 text-purple-500" />,
    title: "AI-Generated Cards",
    description: "Smart flashcards created from your syllabus content"
  },
  {
    icon: <Target className="size-5 text-blue-500" />,
    title: "Spaced Repetition",
    description: "Optimized learning schedule for better retention"
  },
  {
    icon: <Zap className="size-5 text-yellow-500" />,
    title: "Quick Review",
    description: "Study anywhere, anytime with mobile-friendly interface"
  }
];

const studyTips = [
  "Review flashcards daily for best results",
  "Focus on difficult cards more frequently",
  "Use the shuffle feature to avoid memorizing order",
  "Take breaks between study sessions"
];

export default function FlashcardsPage() {
  const [progress, setProgress] = useState({
    cardsStudied: 0,
    accuracyRate: 0,
    studyStreak: 0,
    totalCards: 0,
    correctAnswers: 0,
    studyTime: 0
  });

  const [isStudying, setIsStudying] = useState(false);
  const [studyStartTime, setStudyStartTime] = useState<Date | null>(null);

  // Simulate real-time progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (isStudying && studyStartTime) {
        const elapsed = Math.floor((Date.now() - studyStartTime.getTime()) / 1000);
        setProgress(prev => ({
          ...prev,
          studyTime: elapsed
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isStudying, studyStartTime]);

  // Listen for flashcard events
  useEffect(() => {
    const handleFlashcardEvent = (event: CustomEvent) => {
      const { type, data } = event.detail;
      
      switch (type) {
        case 'card_studied':
          setProgress(prev => ({
            ...prev,
            cardsStudied: prev.cardsStudied + 1,
            totalCards: prev.totalCards + 1
          }));
          break;
        case 'correct_answer':
          setProgress(prev => ({
            ...prev,
            correctAnswers: prev.correctAnswers + 1,
            accuracyRate: Math.round(((prev.correctAnswers + 1) / (prev.cardsStudied + 1)) * 100)
          }));
          break;
        case 'study_started':
          setIsStudying(true);
          setStudyStartTime(new Date());
          break;
        case 'study_ended':
          setIsStudying(false);
          setStudyStartTime(null);
          break;
      }
    };

    window.addEventListener('flashcard-event', handleFlashcardEvent as EventListener);
    return () => window.removeEventListener('flashcard-event', handleFlashcardEvent as EventListener);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 border border-primary/20">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-primary/10">
                <GraduationCap className="size-6 text-primary" />
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                AI-Powered Learning
              </Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Smart Flashcards
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Transform your study materials into interactive flashcards. AI-generated questions 
              help you master concepts faster with spaced repetition learning.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {features.map((feature, index) => (
            <Card key={feature.title} className="border-0 bg-gradient-to-br from-card/50 to-card/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-2 rounded-lg bg-muted/50">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Flashcard Generator */}
          <div className="lg:col-span-2">
            <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-xl hover:shadow-2xl transition-all duration-500">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <Sparkles className="size-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Generate Flashcards
                </CardTitle>
                <CardDescription className="text-lg">
                  Create personalized flashcards from your syllabus content
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <FlashcardGenerator />
              </CardContent>
            </Card>
          </div>

          {/* Study Tips & Stats */}
          <div className="space-y-6">
            {/* Study Tips */}
            <Card className="border-0 bg-gradient-to-br from-card/50 to-card/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-5 text-primary" />
                  Study Tips
                </CardTitle>
                <CardDescription>
                  Maximize your learning potential
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {studyTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-muted-foreground">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 bg-gradient-to-br from-card/50 to-card/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="size-5 text-primary" />
                  Your Progress
                  {isStudying && (
                    <Badge variant="default" className="ml-2 bg-green-500 text-white animate-pulse">
                      <Clock className="size-3 mr-1" />
                      Studying
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Track your learning journey in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cards Studied</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{progress.cardsStudied}</span>
                      {progress.cardsStudied > 0 && (
                        <CheckCircle className="size-4 text-green-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Accuracy Rate</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{progress.accuracyRate}%</span>
                      {progress.accuracyRate >= 80 && (
                        <TrendingUp className="size-4 text-green-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Study Time</span>
                    <span className="font-semibold">{formatTime(progress.studyTime)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Study Streak</span>
                    <span className="font-semibold">{progress.studyStreak} days</span>
                  </div>
                  
                  {/* Progress Bar */}
                  {progress.cardsStudied > 0 && (
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Overall Progress</span>
                        <span className="font-medium">{Math.round((progress.correctAnswers / Math.max(progress.cardsStudied, 1)) * 100)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((progress.correctAnswers / Math.max(progress.cardsStudied, 1)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="border-0 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <GraduationCap className="size-8 text-primary" />
                  </div>
                </div>
                <h3 className="font-bold mb-2">Ready to Study?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate your first set of flashcards and start learning smarter.
                </p>
                <Badge variant="outline" className="text-xs">
                  <ArrowRight className="size-3 mr-1" />
                  Scroll up to get started
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

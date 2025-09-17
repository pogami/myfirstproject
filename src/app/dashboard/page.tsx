
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MessageSquare, Upload, BookOpen, Users, TrendingUp, Clock, Star, ArrowRight, Sparkles, Target, Zap, Crown } from "lucide-react";
import Notifications from "@/components/notifications";
import { StatCards } from "@/components/stat-cards";
import { useChatStore } from "@/hooks/use-chat-store";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

const quickActionCards = [
    {
        title: "Upload Syllabus",
        description: "Add a new class syllabus to join study groups and unlock AI-powered features",
        icon: <Upload className="size-8 text-primary" />,
        href: "/dashboard/upload",
        buttonText: "Upload Now",
        variant: "default" as const,
        gradient: "from-blue-500 to-purple-600",
        stats: "AI Analysis",
        features: ["Smart parsing", "Auto-class detection", "Study group matching"]
    },
    {
        title: "Join Class Chats",
        description: "Connect with classmates in real-time with AI-powered study assistance",
        icon: <MessageSquare className="size-8 text-green-500" />,
        href: "/dashboard/chat",
        buttonText: "Start Chatting",
        variant: "default" as const,
        gradient: "from-green-500 to-emerald-600",
        stats: "Live Support",
        features: ["Real-time chat", "AI tutoring", "Group collaboration"]
    },
    {
        title: "Browse Classes",
        description: "Discover all available classes and see student engagement metrics",
        icon: <BookOpen className="size-8 text-amber-500" />,
        href: "/dashboard/overview",
        buttonText: "Explore",
        variant: "default" as const,
        gradient: "from-amber-500 to-orange-600",
        stats: "Active Classes",
        features: ["Class discovery", "Student counts", "Activity tracking"]
    }
]

const featureHighlights = [
    {
        icon: <Sparkles className="size-6 text-purple-500" />,
        title: "AI-Powered Learning",
        description: "Get instant help with homework and study questions"
    },
    {
        icon: <Target className="size-6 text-blue-500" />,
        title: "Smart Flashcards",
        description: "Auto-generated flashcards from your syllabus content"
    },
    {
        icon: <Zap className="size-6 text-yellow-500" />,
        title: "Instant Notifications",
        description: "Stay updated with class announcements and deadlines"
    }
]

export default function DashboardPage() {
  const { chats } = useChatStore();
  const [user] = useAuthState(auth);
  const [isAdvancedDialogOpen, setIsAdvancedDialogOpen] = useState(false);
  const classCount = Object.keys(chats).filter(key => key !== 'general-chat').length;
  const totalMessages = Object.values(chats).reduce((sum, chat) => sum + chat.messages.length, 0);

  return (
    <div className="min-h-screen bg-transparent">
      <div className="animate-in fade-in-50 space-y-8">
        {/* Header with Notifications - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight mb-1 sm:mb-2 leading-tight">Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'Guest'}!</h1>
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed">
              Here's your academic overview and today's focus areas.
            </p>
          </div>
          
          {/* Notifications - Mobile positioned */}
          <div className="self-start sm:self-end">
            <Notifications />
          </div>
        </div>

        {/* Compact Welcome Section - Mobile Optimized */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-3 sm:p-4 lg:p-6 xl:p-8 border border-primary/20 mb-4 sm:mb-6">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative flex flex-col gap-3 sm:gap-4">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 lg:p-3 rounded-lg sm:rounded-xl bg-primary/10 flex-shrink-0">
                <Sparkles className="size-4 sm:size-5 lg:size-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 mb-1 sm:mb-2 text-xs sm:text-sm">
                  Welcome Back!
                </Badge>
                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed">
                  Your unified platform for college success. Connect with classmates, manage assignments, and stay organized with AI-powered tools.
                </p>
              </div>
            </div>
            
            {/* Advanced Features Button - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Dialog open={isAdvancedDialogOpen} onOpenChange={setIsAdvancedDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 h-12 sm:h-11 text-sm sm:text-base font-medium min-h-[48px] sm:min-h-[44px]">
                    <Crown className="h-4 w-4 mr-2" />
                    🚀 Try Pro Features Free
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                      <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                      Unlock Advanced Features
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm lg:text-base leading-relaxed">
                      Want to try our Pro features? Get access to advanced AI tutors, voice input, image analysis, grade predictions, and more!
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-purple-50 dark:bg-purple-950/20 p-3 sm:p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-purple-900 dark:text-purple-100 text-xs sm:text-sm lg:text-base">Pro Features Include:</h4>
                      <ul className="text-xs sm:text-sm text-purple-800 dark:text-purple-200 space-y-1">
                        <li>• Advanced AI Tutor with specialized subjects</li>
                        <li>• Voice input & image analysis</li>
                        <li>• Grade prediction system</li>
                        <li>• Google Calendar integration</li>
                        <li>• Spotify focus music</li>
                        <li>• Enhanced study groups</li>
                        <li>• Smart break reminders</li>
                      </ul>
                    </div>
                    <div className="flex flex-col gap-2 sm:gap-3">
                      <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 h-12 sm:h-11 text-sm sm:text-base font-medium min-h-[48px] sm:min-h-[44px]">
                        <Link href="/dashboard/advanced" onClick={() => setIsAdvancedDialogOpen(false)}>
                          <Crown className="h-4 w-4 mr-2" />
                          Try Pro Features - Free
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full h-12 sm:h-11 text-sm sm:text-base font-medium min-h-[48px] sm:min-h-[44px]">
                        <Link href="/pricing" onClick={() => setIsAdvancedDialogOpen(false)}>
                          Upgrade to Pro - $5.99/mo
                        </Link>
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              {/* Try Demo Button */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Trigger demo break
                  window.dispatchEvent(new CustomEvent('demo-break-trigger'));
                }}
                className="text-xs sm:text-sm w-full sm:w-auto h-12 sm:h-10 font-medium min-h-[48px] sm:min-h-[40px] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0"
              >
                ☕ Try Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview - Mobile Optimized */}
        <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-1.5 lg:p-2 rounded-lg bg-blue-500/10 flex-shrink-0">
                  <BookOpen className="size-3 sm:size-4 lg:size-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{classCount}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Active Classes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-1.5 lg:p-2 rounded-lg bg-green-500/10 flex-shrink-0">
                  <MessageSquare className="size-3 sm:size-4 lg:size-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{totalMessages}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Messages Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-1.5 lg:p-2 rounded-lg bg-purple-500/10 flex-shrink-0">
                  <TrendingUp className="size-3 sm:size-4 lg:size-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">98%</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-1.5 lg:p-2 rounded-lg bg-orange-500/10 flex-shrink-0">
                  <Clock className="size-3 sm:size-4 lg:size-5 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">24/7</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">AI Support</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <div>
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight">Quick Actions</h2>
            <Badge variant="outline" className="text-xs">Get Started</Badge>
          </div>
          <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {quickActionCards.map((card, index) => (
              <Card key={card.title} className="group relative overflow-hidden border-0 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 hover:bg-card/80">
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                <CardContent className="relative p-3 sm:p-4 lg:p-6">
                  <div className="flex items-start justify-between mb-2 sm:mb-3 lg:mb-4">
                    <div className={`p-1.5 sm:p-2 lg:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-lg flex-shrink-0`}>
                      {card.icon}
                    </div>
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary flex-shrink-0">
                      {card.stats}
                    </Badge>
                  </div>
                  
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-1 sm:mb-2 group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-muted-foreground mb-2 sm:mb-3 lg:mb-4 text-xs sm:text-sm leading-relaxed">
                    {card.description}
                  </p>
                  
                  <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4 lg:mb-6">
                    {card.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0"></div>
                        <span className="truncate">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button asChild className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 h-12 sm:h-11 text-sm sm:text-base font-medium min-h-[48px] sm:min-h-[44px]" variant="default">
                    <Link href={card.href} className="flex items-center justify-center gap-2 font-medium text-sm sm:text-base">
                      {card.buttonText}
                      <ArrowRight className="size-3 sm:size-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom Section - Mobile Optimized */}
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-1">
          <div>
            <Card className="border-0 bg-gradient-to-br from-card to-card/50">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Users className="size-4 sm:size-5 text-primary" />
                  Your Study Groups
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Connect with classmates and join study sessions</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                {classCount > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/30">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
                        <BookOpen className="size-3 sm:size-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base">You have {classCount} active class{classCount !== 1 ? 'es' : ''}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Click to view and join study groups</p>
                      </div>
                      <Button asChild size="sm" className="bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 text-primary border-primary/20 hover:border-primary/30 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md h-10 sm:h-9 text-xs sm:text-sm min-h-[40px] sm:min-h-[36px] flex-shrink-0">
                        <Link href="/dashboard/overview">View Classes</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <div className="p-3 sm:p-4 rounded-full bg-muted/30 w-fit mx-auto mb-3 sm:mb-4">
                      <BookOpen className="size-6 sm:size-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">No study groups yet</h3>
                    <p className="text-muted-foreground mb-3 sm:mb-4 text-xs sm:text-sm">Upload a syllabus to find and join study groups</p>
                    <Button asChild className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 font-medium h-12 sm:h-11 text-sm sm:text-base min-h-[48px] sm:min-h-[44px]">
                      <Link href="/dashboard/upload">
                        <Upload className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Upload Syllabus
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

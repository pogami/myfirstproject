
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MessageSquare, Upload, BookOpen, Users, TrendingUp, Clock, Sparkles, Crown } from "lucide-react";
import Notifications from "@/components/notifications";
import { StatCards } from "@/components/stat-cards";
import { useChatStore } from "@/hooks/use-chat-store";
import { auth } from "@/lib/firebase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { MobileNavigation } from "@/components/mobile-navigation";
import { MobileButton } from "@/components/ui/mobile-button";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";



export default function DashboardPage() {
  const { chats } = useChatStore();
  const [user, setUser] = useState<any>(null);
  const [isAdvancedDialogOpen, setIsAdvancedDialogOpen] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(12);
  const classCount = Object.keys(chats).filter(key => key !== 'general-chat').length;
  const totalMessages = Object.values(chats).reduce((sum, chat) => sum + chat.messages.length, 0);

  // Safely handle auth state
  useEffect(() => {
    try {
      if (auth && typeof auth.onAuthStateChanged === 'function') {
        const unsubscribe = auth.onAuthStateChanged(
          (user) => setUser(user),
          (error) => {
            console.warn("Auth state error in dashboard page:", error);
            setUser(null);
          }
        );
        return unsubscribe;
      } else {
        setUser(null);
      }
    } catch (authError) {
      console.warn("Auth initialization error in dashboard page:", authError);
      setUser(null);
    }
  }, []);

  // Calculate trial days left (this would normally come from your backend/database)
  useEffect(() => {
    // For demo purposes, we'll simulate a trial that started 2 days ago
    // In a real app, you'd fetch this from your user's trial data
    const trialStartDate = new Date();
    trialStartDate.setDate(trialStartDate.getDate() - 2); // Started 2 days ago
    
    const calculateDaysLeft = () => {
      const now = new Date();
      const trialEndDate = new Date(trialStartDate);
      trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial
      
      const timeDiff = trialEndDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      return Math.max(0, daysLeft);
    };
    
    setTrialDaysLeft(calculateDaysLeft());
    
    // Update every hour
    const interval = setInterval(() => {
      setTrialDaysLeft(calculateDaysLeft());
    }, 3600000); // 1 hour
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/20">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-primary">CourseConnect</h1>
          <MobileNavigation user={user} />
        </div>
      </div>

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

        {/* Scholar Features Status - Compact Square Card */}
        {trialDaysLeft > 0 && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-indigo-500/10 p-4 border border-purple-200/20 dark:border-purple-800/20 mb-4 max-w-sm mt-2">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-50"></div>
          <div className="relative">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 flex-shrink-0">
                <Crown className="size-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-600 text-white border-0 text-xs">
                    Scholar Active
                  </Badge>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Days Left */}
            <div className="text-center mb-3">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {trialDaysLeft}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                {trialDaysLeft === 1 ? 'day left' : 'days left'} in trial
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span>{Math.round(((14 - trialDaysLeft) / 14) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((14 - trialDaysLeft) / 14) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 h-8 text-xs font-medium"
                asChild
              >
                <Link href="/pricing">
                  Upgrade
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950 h-8 text-xs"
                onClick={() => {
                  // Enable demo mode when accessing features
                  const { setIsDemoMode } = useChatStore.getState();
                  setIsDemoMode(true);
                }}
                asChild
              >
                <Link href="/dashboard/advanced">
                  Features
                </Link>
              </Button>
            </div>
          </div>
        </div>
        )}

        {/* Today's Focus Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
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
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}


"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MessageSquare, Upload, BookOpen, Users, TrendingUp, Clock, Sparkles, Crown, Target, Calendar, Award, GraduationCap, FileText, Bell } from "lucide-react";
import { StatCards } from "@/components/stat-cards";
import { useChatStore } from "@/hooks/use-chat-store";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { auth } from "@/lib/firebase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { MobileNavigation } from "@/components/mobile-navigation";
import { MobileButton } from "@/components/ui/mobile-button";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import GeolocationGreeting from "@/components/geolocation-greeting";
import { NotificationTestPanel } from "@/components/notification-test-panel";
import dynamic from "next/dynamic";

// Lazy load heavy components
const Notifications = dynamic(() => import("@/components/notifications"), {
  loading: () => <div className="w-8 h-8 bg-muted rounded animate-pulse" />
});



export default function DashboardPage() {
  const { chats, trialActivated, trialDaysLeft, updateTrialDaysLeft, setIsDemoMode } = useChatStore();
  const [user, setUser] = useState<any>(null);
  const [isAdvancedDialogOpen, setIsAdvancedDialogOpen] = useState(false);
  const classCount = Object.keys(chats).filter(key => key !== 'general-chat').length;
  const totalMessages = Object.values(chats).reduce((sum, chat) => sum + chat.messages.length, 0);
  
  // Get real-time dashboard stats
  const { stats, isLoading: statsLoading } = useDashboardStats(user);


  // Function to handle Firebase operations with offline fallback
  const safeFirebaseOperation = async (operation: () => Promise<any>, fallback?: () => void) => {
    try {
      return await operation();
    } catch (error: any) {
      console.log("Firebase operation failed, using fallback:", error.message);
      if (fallback) fallback();
      return null;
    }
  };

  // Get user from layout context (no need for duplicate auth state)
  useEffect(() => {
    // Check for guest user in localStorage as fallback
    const guestUserData = localStorage.getItem('guestUser');
    if (guestUserData && !user) {
      try {
        const guestUser = JSON.parse(guestUserData);
        console.log("Dashboard page: Found guest user in localStorage:", guestUser);
        setUser(guestUser);
      } catch (error) {
        console.warn("Dashboard page: Error parsing guest user data:", error);
      }
    }
  }, [user]);

  // Update trial days left in real-time
  useEffect(() => {
    if (trialActivated) {
      // Update immediately
      updateTrialDaysLeft();
      
      // Update every hour to keep countdown accurate
      const interval = setInterval(() => {
        updateTrialDaysLeft();
      }, 3600000); // 1 hour
      
      return () => clearInterval(interval);
    }
  }, [trialActivated, updateTrialDaysLeft]);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/20">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-primary">CourseConnect</h1>
          <MobileNavigation user={user} />
        </div>
      </div>

      <div className="space-y-8">
        {/* Modern Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <GeolocationGreeting 
                  userName={user?.displayName || user?.email?.split('@')[0]} 
                  fallbackName="Guest" 
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Welcome back! Here's your academic overview.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Notifications />
          </div>
        </div>

        {/* Scholar Features Status - Only show if trial is activated */}
        {trialActivated && trialDaysLeft > 0 && (
        <Card className="border-0 bg-gradient-to-br from-card/80 to-card/40 shadow-xl mb-6 max-w-md mx-auto sm:mx-0">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 shadow-lg">
                  <Crown className="size-5 text-white" />
                </div>
                <div>
                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-600 text-white border-0 text-sm font-medium px-3 py-1">
                    Scholar Active
                  </Badge>
                </div>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
            </div>
            
            {/* Days Left */}
            <div className="text-center mb-6">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                {trialDaysLeft}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {trialDaysLeft === 1 ? 'day left' : 'days left'} in trial
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span className="font-medium">Progress</span>
                <span className="font-semibold">{Math.round(((14 - trialDaysLeft) / 14) * 100)}%</span>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-600 h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
                  style={{ width: `${((14 - trialDaysLeft) / 14) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                size="sm" 
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 h-10 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="/pricing">
                  Upgrade
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/30 h-10 text-sm font-medium transition-all duration-300 hover:scale-105"
                onClick={() => {
                  // Enable demo mode when accessing features
                  setIsDemoMode(true);
                }}
                asChild
              >
                <Link href="/dashboard/advanced">
                  Features
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Today's Focus Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        </div>


        {/* Pro Features CTA */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Unlock Pro Features</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get access to advanced AI tutors, voice input, and more</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Dialog open={isAdvancedDialogOpen} onOpenChange={setIsAdvancedDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                      <Crown className="h-4 w-4 mr-2" />
                      Try Free
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-purple-600" />
                        Unlock Advanced Features
                      </DialogTitle>
                      <DialogDescription>
                        Get access to advanced AI tutors, voice input, image analysis, grade predictions, and more!
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 text-purple-900 dark:text-purple-100">Pro Features Include:</h4>
                        <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                          <li>• Advanced AI Tutor with specialized subjects</li>
                          <li>• Voice input & image analysis</li>
                          <li>• Grade prediction system</li>
                          <li>• Google Calendar integration</li>
                          <li>• Spotify focus music</li>
                          <li>• Enhanced study groups</li>
                          <li>• Smart break reminders</li>
                        </ul>
                      </div>
                      <div className="flex flex-col gap-3">
                        <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                          <Link href="/dashboard/advanced" onClick={() => setIsAdvancedDialogOpen(false)}>
                            <Crown className="h-4 w-4 mr-2" />
                            Try Pro Features - Free
                          </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                          <Link href="/pricing" onClick={() => setIsAdvancedDialogOpen(false)}>
                            Upgrade to Pro - $5.99/mo
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('demo-break-trigger'));
                  }}
                  className="border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  ☕ Try Demo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modern Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statsLoading ? '...' : `${Math.floor(stats.studyTimeToday / 60)}h ${stats.studyTimeToday % 60}m`}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Study Time Today</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statsLoading ? '...' : stats.assignmentsCompleted}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Assignments Done</p>
                </div>
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/50">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statsLoading ? '...' : stats.studyStreak}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Day Streak</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statsLoading ? '...' : stats.upcomingDeadlines}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Due This Week</p>
                </div>
                <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/50">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Study Groups Section */}
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              Study Groups
            </CardTitle>
            <CardDescription>Connect with classmates and join study sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {classCount > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">You have {classCount} active class{classCount !== 1 ? 'es' : ''}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Click to view and join study groups</p>
                    </div>
                  </div>
                  <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Link href="/dashboard/overview">View Classes</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 w-fit mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">No study groups yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Upload a syllabus to find and join study groups</p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="/dashboard/upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Syllabus
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>


        {/* Development Test Panel - Only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6">
            <NotificationTestPanel />
          </div>
        )}
      </div>
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      
    </div>
  );
}

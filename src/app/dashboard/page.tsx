
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MessageSquare, Upload, BookOpen, Users, TrendingUp, Clock, Sparkles, Crown, Target, Calendar, Award, GraduationCap, FileText, Bell } from "lucide-react";
import { StatCards } from "@/components/stat-cards";
import { useChatStore } from "@/hooks/use-chat-store";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { auth } from "@/lib/firebase/client-simple";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { MobileNavigation } from "@/components/mobile-navigation";
import { MobileButton } from "@/components/ui/mobile-button";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import GeolocationGreeting from "@/components/geolocation-greeting";
import dynamic from "next/dynamic";



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

        {/* Assignments Table - Real-time from uploaded syllabi */}
        {Object.values(chats).some(chat => chat.chatType === 'class' && chat.courseData?.assignments && chat.courseData.assignments.length > 0) && (
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                All Assignments
              </CardTitle>
              <CardDescription>Real-time assignments from your uploaded syllabi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-semibold text-sm">Course</th>
                      <th className="text-left p-3 font-semibold text-sm">Assignment</th>
                      <th className="text-left p-3 font-semibold text-sm">Due Date</th>
                      <th className="text-left p-3 font-semibold text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(chats)
                      .filter(chat => chat.chatType === 'class' && chat.courseData?.assignments)
                      .flatMap(chat => 
                        (chat.courseData?.assignments || []).map((assignment: any, idx: number) => {
                          // Calculate days until due
                          const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
                          const today = new Date();
                          const daysUntil = dueDate ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
                          
                          // Determine status
                          let status = 'Not Started';
                          let statusColor = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
                          
                          if (daysUntil !== null) {
                            if (daysUntil < 0) {
                              status = 'Overdue';
                              statusColor = 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
                            } else if (daysUntil <= 2) {
                              status = 'Due Soon';
                              statusColor = 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
                            } else if (daysUntil <= 7) {
                              status = 'In Progress';
                              statusColor = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300';
                            }
                          }
                          
                          return (
                            <tr key={`${chat.id}-${idx}`} className="border-b hover:bg-muted/30 transition-colors">
                              <td className="p-3 text-sm font-medium">{chat.courseData?.courseCode || 'Unknown'}</td>
                              <td className="p-3 text-sm">{assignment.name}</td>
                              <td className="p-3 text-sm text-muted-foreground">
                                {assignment.dueDate || 'TBA'}
                                {daysUntil !== null && daysUntil >= 0 && (
                                  <span className="ml-2 text-xs">
                                    ({daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`})
                                  </span>
                                )}
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-1 text-xs rounded-full ${statusColor} font-medium`}>
                                  {status}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )
                      .sort((a, b) => {
                        // Sort by due date (soonest first)
                        const dateA = a.props.children[2].props.children[0];
                        const dateB = b.props.children[2].props.children[0];
                        if (!dateA || dateA === 'TBA') return 1;
                        if (!dateB || dateB === 'TBA') return -1;
                        return new Date(dateA).getTime() - new Date(dateB).getTime();
                      })}
                  </tbody>
                </table>
              </div>
              
              {/* View All Button */}
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/chat">
                    View in Class Chats
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exams Table - Real-time from uploaded syllabi */}
        {Object.values(chats).some(chat => chat.chatType === 'class' && chat.courseData?.exams && chat.courseData.exams.length > 0) && (
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                </div>
                Upcoming Exams
              </CardTitle>
              <CardDescription>Exam schedule from your courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-semibold text-sm">Course</th>
                      <th className="text-left p-3 font-semibold text-sm">Exam</th>
                      <th className="text-left p-3 font-semibold text-sm">Date</th>
                      <th className="text-left p-3 font-semibold text-sm">Time Until</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(chats)
                      .filter(chat => chat.chatType === 'class' && chat.courseData?.exams)
                      .flatMap(chat => 
                        (chat.courseData?.exams || []).map((exam: any, idx: number) => {
                          // Calculate days until exam
                          const examDate = exam.date ? new Date(exam.date) : null;
                          const today = new Date();
                          const daysUntil = examDate ? Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
                          
                          // Determine urgency color
                          let urgencyColor = 'text-gray-700 dark:text-gray-300';
                          if (daysUntil !== null) {
                            if (daysUntil < 0) {
                              urgencyColor = 'text-gray-500 dark:text-gray-500';
                            } else if (daysUntil <= 3) {
                              urgencyColor = 'text-red-600 dark:text-red-400 font-bold';
                            } else if (daysUntil <= 7) {
                              urgencyColor = 'text-orange-600 dark:text-orange-400 font-semibold';
                            } else if (daysUntil <= 14) {
                              urgencyColor = 'text-yellow-600 dark:text-yellow-400';
                            }
                          }
                          
                          return (
                            <tr key={`${chat.id}-exam-${idx}`} className="border-b hover:bg-muted/30 transition-colors">
                              <td className="p-3 text-sm font-medium">{chat.courseData?.courseCode || 'Unknown'}</td>
                              <td className="p-3 text-sm">{exam.name}</td>
                              <td className="p-3 text-sm text-muted-foreground">{exam.date || 'TBA'}</td>
                              <td className={`p-3 text-sm ${urgencyColor}`}>
                                {daysUntil !== null ? (
                                  daysUntil < 0 ? 'Passed' :
                                  daysUntil === 0 ? '🔴 Today!' :
                                  daysUntil === 1 ? '⚠️ Tomorrow' :
                                  daysUntil <= 3 ? `🔴 ${daysUntil} days` :
                                  daysUntil <= 7 ? `⚠️ ${daysUntil} days` :
                                  `${daysUntil} days`
                                ) : 'TBA'}
                              </td>
                            </tr>
                          );
                        })
                      )
                      .sort((a, b) => {
                        // Sort by exam date (soonest first)
                        const dateA = a.props.children[2].props.children;
                        const dateB = b.props.children[2].props.children;
                        if (!dateA || dateA === 'TBA') return 1;
                        if (!dateB || dateB === 'TBA') return -1;
                        return new Date(dateA).getTime() - new Date(dateB).getTime();
                      })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

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

      </div>
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      
    </div>
  );
}

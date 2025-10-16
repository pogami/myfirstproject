
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { MessageSquare, Upload, BookOpen, Users, TrendingUp, Clock, Sparkles, Crown, Target, Calendar, Award, GraduationCap, FileText, Bell } from "lucide-react";
import Image from "next/image";
import { StatCards } from "@/components/stat-cards";
import { useChatStore } from "@/hooks/use-chat-store";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { auth } from '@/lib/firebase/client-simple';
import { NotificationService } from '@/lib/notification-service';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client-simple';
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
  const [manualStatuses, setManualStatuses] = useState<{[key: string]: string}>({});
  const [showAllAssignments, setShowAllAssignments] = useState(false);
  
  // Function to create assignment notifications
  const createAssignmentNotification = async (assignmentName: string, newStatus: string, chatId: string) => {
    if (!user) {
      return;
    }
    
    try {
      // Get the class information for context
      const chat = chats[chatId];
      const courseCode = chat?.courseData?.courseCode || chat?.title || 'Unknown Class';
      const courseName = chat?.courseData?.courseName || chat?.title || 'Unknown Course';
      
      let title = '';
      let description = '';
      let priority: 'low' | 'medium' | 'high' = 'medium';
      
      switch (newStatus) {
        case 'Completed':
          title = '🎉 Assignment Completed!';
          description = `${courseCode}: "${assignmentName}" completed successfully. Great work!`;
          priority = 'high';
          break;
        case 'Overdue':
          title = '⚠️ Assignment Overdue';
          description = `${courseCode}: "${assignmentName}" is now overdue. Consider prioritizing this assignment.`;
          priority = 'high';
          break;
        case 'Due Soon':
          title = '⏰ Assignment Due Soon';
          description = `${courseCode}: "${assignmentName}" is due soon. Don't forget to complete it!`;
          priority = 'medium';
          break;
        case 'In Progress':
          title = '📝 Assignment Started';
          description = `${courseCode}: You've started working on "${assignmentName}". Keep going!`;
          priority = 'low';
          break;
        default:
          return; // Don't create notification for other statuses
      }
      
      // Handle guest users - store in localStorage
      if (user.isGuest) {
        console.log('🔔 Creating guest notification for:', title);
        const notification = {
          id: `guest-notification-${Date.now()}`,
          title,
          description,
          type: 'assignment',
          priority,
          classId: chatId,
          actionUrl: '/dashboard',
          isRead: false,
          createdAt: new Date().toISOString()
        };
        
        // Get existing notifications
        const existingNotifications = localStorage.getItem('guest-notifications');
        let notifications = [];
        if (existingNotifications) {
          try {
            notifications = JSON.parse(existingNotifications);
            console.log('🔔 Existing guest notifications:', notifications.length);
          } catch (error) {
            console.warn('Error parsing existing guest notifications:', error);
          }
        }
        
        // Add new notification
        notifications.unshift(notification);
        console.log('🔔 Total guest notifications after adding:', notifications.length);
        
        // Keep only last 50 notifications
        if (notifications.length > 50) {
          notifications = notifications.slice(0, 50);
        }
        
        localStorage.setItem('guest-notifications', JSON.stringify(notifications));
        console.log('🔔 Guest notification stored in localStorage:', title);
        return;
      }
      
      // Handle authenticated users - store in Firebase
      await NotificationService.createNotification({
        title,
        description,
        type: 'assignment',
        priority,
        classId: chatId,
        actionUrl: '/dashboard'
      }, user.uid);
      
      console.log('📢 Assignment notification created:', title);
    } catch (error) {
      console.error('Error creating assignment notification:', error);
    }
  };
  
  // Function to check for upcoming assignments and create notifications
  const checkUpcomingAssignments = async () => {
    if (!user) return;
    
    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      Object.values(chats).forEach(chat => {
        if (chat.chatType === 'class' && chat.courseData?.assignments) {
          const courseCode = chat.courseData.courseCode || chat.title;
          
          chat.courseData.assignments.forEach((assignment: any) => {
            if (assignment.dueDate && assignment.dueDate !== 'null' && assignment.status !== 'Completed') {
              const dueDate = new Date(assignment.dueDate);
              
              // Check if due tomorrow
              if (dueDate >= tomorrow && dueDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)) {
                createAssignmentNotification(assignment.name, 'Due Soon', chat.id);
              }
              
              // Check if overdue
              if (dueDate < now && assignment.status !== 'Overdue') {
                createAssignmentNotification(assignment.name, 'Overdue', chat.id);
              }
            }
          });
          
          // Check for upcoming exams
          if (chat.courseData?.exams) {
            chat.courseData.exams.forEach((exam: any) => {
              if (exam.date && exam.date !== 'null') {
                const examDate = new Date(exam.date);
                const daysUntil = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                
                // Notify if exam is within 7 days
                if (daysUntil <= 7 && daysUntil > 0) {
                  const notification = {
                    id: `guest-notification-${Date.now()}`,
                    title: `📅 Upcoming Exam`,
                    description: `${courseCode}: ${exam.name} in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
                    type: 'exam',
                    priority: daysUntil <= 2 ? 'high' : 'medium',
                    classId: chat.id,
                    actionUrl: '/dashboard',
                    isRead: false,
                    createdAt: new Date().toISOString()
                  };
                  
                  if (user.isGuest) {
                    const existingNotifications = localStorage.getItem('guest-notifications');
                    let notifications = [];
                    if (existingNotifications) {
                      try {
                        notifications = JSON.parse(existingNotifications);
                      } catch (error) {
                        console.warn('Error parsing existing guest notifications:', error);
                      }
                    }
                    
                    notifications.unshift(notification);
                    if (notifications.length > 50) {
                      notifications = notifications.slice(0, 50);
                    }
                    
                    localStorage.setItem('guest-notifications', JSON.stringify(notifications));
                  } else {
                    NotificationService.createNotification({
                      title: notification.title,
                      description: notification.description,
                      type: notification.type,
                      priority: notification.priority,
                      classId: notification.classId,
                      actionUrl: notification.actionUrl
                    }, user.uid);
                  }
                }
              }
            });
          }
        }
      });
    } catch (error) {
      console.error('Error checking upcoming assignments:', error);
    }
  };
  
  // Function to update assignment status in Firebase
  const updateAssignmentStatus = async (chatId: string, assignmentName: string, newStatus: string) => {
    try {
      console.log('📝 Updating assignment status:', assignmentName, 'to', newStatus, 'in chat', chatId);
      
      // For guest users, update local chat store immediately for real-time updates
      if (user && user.isGuest) {
        console.log('📝 Guest user - updating local chat store immediately');
        // Update the local chat store immediately
        const updatedChats = { ...chats };
        if (updatedChats[chatId] && updatedChats[chatId].courseData?.assignments) {
          updatedChats[chatId].courseData.assignments = updatedChats[chatId].courseData.assignments.map((assignment: any) => {
            if (assignment.name === assignmentName) {
              console.log('📝 Found assignment to update locally:', assignment.name);
              return { ...assignment, status: newStatus };
            }
            return assignment;
          });
          
          // Update the chat store
          // Note: This would require a method in useChatStore to update chats directly
          // For now, we'll rely on the Firebase update and the listener
        }
      }
      
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);
      
      if (chatSnap.exists()) {
        const chatData = chatSnap.data();
        if (chatData.courseData?.assignments) {
          const updatedAssignments = chatData.courseData.assignments.map((assignment: any) => {
            if (assignment.name === assignmentName) {
              console.log('📝 Found assignment to update:', assignment.name);
              return { ...assignment, status: newStatus };
            }
            return assignment;
          });
          
          await updateDoc(chatRef, {
            'courseData.assignments': updatedAssignments
          });
          console.log('📝 Successfully updated assignment status in Firebase');
          
          // For guest users, refresh stats immediately after Firebase update
          if (user && user.isGuest && refreshStats) {
            console.log('📝 Guest user - refreshing stats after Firebase update');
            setTimeout(() => refreshStats(), 100); // Small delay to ensure Firebase listener has fired
          }
          
          // Create notification for assignment status change
          await createAssignmentNotification(assignmentName, newStatus, chatId);
        }
      }
    } catch (error) {
      console.error('Error updating assignment status:', error);
    }
  };
  const classCount = Object.keys(chats).filter(key => key !== 'general-chat').length;
  const totalMessages = Object.values(chats).reduce((sum, chat) => sum + chat.messages.length, 0);
  
  // Count total assignments
  const totalAssignments = Object.values(chats)
    .filter(chat => chat.chatType === 'class' && chat.courseData?.assignments)
    .reduce((sum, chat) => sum + (chat.courseData?.assignments?.length || 0), 0);
  
  // Get real-time dashboard stats
  const { stats, isLoading: statsLoading, refreshStats } = useDashboardStats(user);
  const { toast } = useToast();
  const showTopicsReview = process.env.NEXT_PUBLIC_SHOW_TOPICS_REVIEW === 'true';
  
  // Create welcome notifications for new users
  useEffect(() => {
    if (user && !user.isGuest) {
      const createWelcomeNotifications = async () => {
        try {
          // Check if user already has notifications (to avoid creating duplicates)
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.hasWelcomeNotifications) {
              return; // Already created welcome notifications
            }
          }
          
          console.log('🔔 Creating welcome notifications for new user:', user.uid);
          
          // Create welcome notifications
          await NotificationService.createNotification({
            title: "🎉 Welcome to CourseConnect!",
            description: "You're all set up! Start by uploading your course syllabi to get personalized assignments and study reminders.",
            type: "system",
            priority: "high"
          }, user.uid);
          
          await NotificationService.createNotification({
            title: "📚 Upload Your Syllabi",
            description: "Upload your course syllabi to automatically track assignments, exams, and important dates.",
            type: "reminder",
            priority: "medium",
            actionUrl: "/dashboard/chat"
          }, user.uid);
          
          await NotificationService.createNotification({
            title: "💡 Pro Tip",
            description: "Use the AI chat to ask questions about your courses and get personalized study help!",
            type: "system",
            priority: "low",
            actionUrl: "/dashboard/chat"
          }, user.uid);
          
          // Mark that welcome notifications have been created
          await updateDoc(userDocRef, {
            hasWelcomeNotifications: true
          });
          
          console.log('🔔 Welcome notifications created successfully');
        } catch (error) {
          console.error('🔔 Error creating welcome notifications:', error);
        }
      };
      
      createWelcomeNotifications();
    }
  }, [user]);


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

  // Auto-update assignment statuses based on user activity
  useEffect(() => {
    const newManualStatuses: {[key: string]: string} = {};
    
    Object.values(chats).forEach(chat => {
      if (chat.chatType === 'class' && chat.courseData?.assignments) {
        chat.courseData.assignments.forEach((assignment: any) => {
          const assignmentKey = `${chat.id}-${assignment.name}`;
          
          // Check if user has been active in this chat recently
          const recentMessages = chat.messages?.filter(msg => {
            const messageTime = new Date(msg.timestamp);
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return messageTime > oneWeekAgo;
          }) || [];
          
          // Auto-detect if user is working on assignment
          const hasRecentActivity = recentMessages.some(msg => 
            msg.content?.toLowerCase().includes(assignment.name?.toLowerCase() || '') ||
            msg.content?.toLowerCase().includes('homework') ||
            msg.content?.toLowerCase().includes('assignment') ||
            msg.content?.toLowerCase().includes('problem') ||
            msg.content?.toLowerCase().includes('question')
          );
          
          // Auto-update status if user is active but hasn't manually set it
          if (hasRecentActivity && !manualStatuses[assignmentKey]) {
            newManualStatuses[assignmentKey] = 'In Progress';
          }
        });
      }
    });
    
    // Update manual statuses if we found new ones
    if (Object.keys(newManualStatuses).length > 0) {
      setManualStatuses(prev => ({ ...prev, ...newManualStatuses }));
    }
  }, [chats, manualStatuses]);

  // Handle both guest and authenticated users
  useEffect(() => {
    // Check for guest user first (faster than Firebase auth)
    const guestUserData = localStorage.getItem('guestUser');
    if (guestUserData) {
      try {
        const guestUser = JSON.parse(guestUserData);
        console.log("Dashboard: Found guest user in localStorage:", guestUser);
        setUser(guestUser);
        return; // Exit early for guest users
      } catch (error) {
        console.warn("Dashboard: Error parsing guest user data:", error);
        localStorage.removeItem('guestUser');
      }
    }

    // If no guest user exists, create one automatically
    console.log("Dashboard: No guest user found, creating one automatically");
    const autoGuestUser = {
      uid: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      displayName: "Guest User",
      email: null,
      photoURL: null,
      isAnonymous: true,
      isGuest: true
    };
    
    localStorage.setItem('guestUser', JSON.stringify(autoGuestUser));
    console.log("Dashboard: Created auto guest user:", autoGuestUser);
    setUser(autoGuestUser);
    return; // Exit early for auto-created guest users

    // Handle authenticated users
    try {
      if (auth && typeof auth.onAuthStateChanged === 'function') {
        console.log('Dashboard: Setting up auth state listener');
        const unsubscribe = auth.onAuthStateChanged(
          (user: any) => {
            console.log('Dashboard: Auth state changed - user:', user ? 'authenticated' : 'not authenticated');
            setUser(user);
          },
          (error: any) => {
            console.warn("Dashboard: Auth state error:", error);
            setUser(null);
          }
        );
        return unsubscribe;
      } else {
        setUser(null);
      }
    } catch (authError) {
      console.warn("Dashboard: Auth initialization error:", authError);
      setUser(null);
    }
  }, []);

  // Check for upcoming assignments and create notifications
  useEffect(() => {
    if (user && Object.keys(chats).length > 0) {
      // Check for upcoming assignments when chats are loaded (both guest and authenticated users)
      checkUpcomingAssignments();
    }
  }, [user, chats]);

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
            <div className="flex items-center gap-1">
              <div>
                <GeolocationGreeting 
                  userName={user?.displayName || user?.email?.split('@')[0]} 
                  fallbackName="Guest" 
                />
                <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mt-1 leading-snug">
                  {(() => {
                    // Check if user has uploaded any syllabi (class chats)
                    const classChats = Object.values(chats).filter((chat: any) => chat.chatType === 'class');
                    
                    if (classChats.length === 0) {
                      return `Upload your syllabus to see what you have upcoming and track all your assignments and upcoming exams!`;
                    }

                    // Compute next upcoming item (assignment/exam) from chats
                    try {
                      const now = new Date();
                      let nextItem: { name: string; date: Date } | null = null;

                      Object.values(chats).forEach((chat: any) => {
                        if (chat.chatType !== 'class' || !chat.courseData) return;

                        // Assignments
                        (chat.courseData.assignments || []).forEach((a: any) => {
                          if (!a?.dueDate || a?.dueDate === 'null' || a?.status === 'Completed') return;
                          const d = new Date(a.dueDate);
                          if (isNaN(d.getTime()) || d < now) return;
                          if (!nextItem || d < nextItem.date) nextItem = { name: a.name, date: d };
                        });

                        // Exams
                        (chat.courseData.exams || []).forEach((e: any) => {
                          if (!e?.date || e?.date === 'null') return;
                          const d = new Date(e.date);
                          if (isNaN(d.getTime()) || d < now) return;
                          if (!nextItem || d < nextItem.date) nextItem = { name: e.name || 'Exam', date: d };
                        });
                      });

                      if (!nextItem) {
                        return `No upcoming assignments or exams. Upload more syllabi to track additional courses!`;
                      }

                      const formatted = nextItem.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                      return `Next up: ${nextItem.name} on ${formatted}.`;
                    } catch {
                      return `Upload your syllabus to see what you have upcoming and track all your assignments and upcoming exams!`;
                    }
                  })()}
                </p>
                {/* Quick Major Editor (removed placeholder to avoid ReferenceError) */}
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
                <Link href="/features">
                  View Features
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
                <Link href="/features">
                  View Features
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Topics to Review (lightweight, signal-driven) */}
        {showTopicsReview && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-950/40">
                  <TrendingUp className="h-5 w-5 text-pink-600" />
                </div>
                Topics to review
              </CardTitle>
              <CardDescription>Based on your syllabus and recent chat activity</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                try {
                  const now = new Date();
                  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

                  // Collect topic candidates from syllabus across class chats
                  const topicSet = new Set<string>();
                  Object.values(chats).forEach((chat: any) => {
                    if (chat?.chatType === 'class' && Array.isArray(chat?.courseData?.topics)) {
                      chat.courseData.topics.forEach((t: any) => {
                        if (typeof t === 'string' && t.trim()) topicSet.add(t.trim());
                      });
                    }
                  });

                  const topics = Array.from(topicSet);
                  if (topics.length === 0) {
                    return (
                      <p className="text-sm text-muted-foreground">
                        Upload a syllabus to see suggested topics to review.
                      </p>
                    );
                  }

                  // Compute simple priority using recent user messages + upcoming assignments
                  const topicScores = topics.map((topic) => {
                    let frequency = 0; // count of user messages mentioning topic in last 7 days
                    let recencyBoost = 0; // +1 if mentioned in last 24h
                    let urgency = 0; // +1..+2 for assignments due soon mentioning topic

                    Object.values(chats).forEach((chat: any) => {
                      // Count message mentions (user only)
                      (chat?.messages || []).forEach((msg: any) => {
                        if (msg?.sender !== 'user') return;
                        const ts = msg?.timestamp ? new Date(msg.timestamp) : null;
                        const text = (typeof msg?.text === 'string' ? msg.text : '') || '';
                        if (!ts || ts < sevenDaysAgo) return;
                        if (text.toLowerCase().includes(topic.toLowerCase())) {
                          frequency += 1;
                          if ((now.getTime() - ts.getTime()) <= 24 * 60 * 60 * 1000) recencyBoost = 1;
                        }
                      });

                      // Urgency from assignments
                      (chat?.courseData?.assignments || []).forEach((a: any) => {
                        if (!a?.dueDate || a?.dueDate === 'null') return;
                        const d = new Date(a.dueDate);
                        if (isNaN(d.getTime())) return;
                        const days = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        if (days >= 0 && days <= 7) {
                          const name = (a?.name || '').toString();
                          const desc = (a?.description || '').toString();
                          if ((name + ' ' + desc).toLowerCase().includes(topic.toLowerCase())) {
                            urgency += days <= 2 ? 2 : 1;
                          }
                        }
                      });
                    });

                    const score = frequency + recencyBoost + urgency; // higher = higher priority
                    return { topic, score, frequency, recencyBoost, urgency };
                  })
                  .filter(t => t.score > 0)
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 5);

                  if (topicScores.length === 0) {
                    return (
                      <p className="text-sm text-muted-foreground">
                        No priority topics detected yet. Ask questions in chat or add assignments to see suggestions.
                      </p>
                    );
                  }

                  return (
                    <div className="flex flex-wrap gap-2">
                      {topicScores.map(({ topic }) => {
                        const prefill = encodeURIComponent(`Help me review ${topic}`);
                        return (
                          <Link key={topic} href={`/dashboard/chat?prefill=${prefill}`}>
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                              {topic}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  );
                } catch (e) {
                  return (
                    <p className="text-sm text-muted-foreground">Unable to compute topics to review.</p>
                  );
                }
              })()}
            </CardContent>
          </Card>
        </div>
        )}


        {/* Pro Features CTA - Hidden */}
        {/* <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800">
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
                          <Link href="/features" onClick={() => setIsAdvancedDialogOpen(false)}>
                            <Crown className="h-4 w-4 mr-2" />
                            View Features
                          </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                          <Link href="/features" onClick={() => setIsAdvancedDialogOpen(false)}>
                            View Features
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
        </Card> */}

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

        {/* Upload Syllabus Prompt - Show when no syllabi are uploaded */}
        {Object.values(chats).filter((chat: any) => chat.chatType === 'class').length === 0 && (
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 shadow-lg mb-6">
            <CardContent className="p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/50 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Upload Your First Syllabus
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Get started by uploading your course syllabus to see assignments, exams, and track your study progress!
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>Track assignments and due dates</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>Monitor upcoming exams</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>Track study time and streaks</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Link href="/dashboard/chat">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Syllabus
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}


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
              <CardDescription>Assignments from your uploaded syllabi</CardDescription>
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
                          
                          // Create unique key for this assignment
                          const assignmentKey = `${chat.id}-${assignment.name}`;
                          
                          // Check for manual status override first, then Firebase data, then auto-detection
                          const manualStatus = manualStatuses[assignmentKey];
                          let status = manualStatus || assignment.status || 'Not Started';
                          let statusColor = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
                          
                          // Auto-update assignment statuses based on user activity if no status set
                          if (!assignment.status) {
                            const hasStarted = assignment.startedAt || assignment.lastViewed || 
                              (chat.messages && chat.messages.some(msg => 
                                msg.content?.toLowerCase().includes(assignment.name?.toLowerCase() || '') ||
                                msg.content?.toLowerCase().includes('homework') ||
                                msg.content?.toLowerCase().includes('assignment')
                              ));
                            
                            if (hasStarted) {
                              status = 'In Progress';
                              statusColor = 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
                            }
                          }
                          
                          // Set colors based on status
                          if (status === 'In Progress') {
                            statusColor = 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
                          } else if (status === 'Completed') {
                            statusColor = 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';
                          } else if (status === 'Overdue') {
                            statusColor = 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
                          }
                          
                          if (daysUntil !== null) {
                            if (daysUntil < 0 && !manualStatus) {
                              status = 'Overdue';
                              statusColor = 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
                            } else if (daysUntil <= 2 && !manualStatus) {
                              status = hasStarted ? 'Due Soon' : 'Due Soon';
                              statusColor = 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
                            } else if (daysUntil <= 7 && !hasStarted && !manualStatus) {
                              status = 'Upcoming';
                              statusColor = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300';
                            }
                          }
                          
                          return (
                            <tr key={`${chat.id}-${idx}`} className="border-b hover:bg-muted/30 transition-colors">
                              <td className="p-3 text-sm font-medium">{chat.courseData?.courseCode || 'Unknown'}</td>
                              <td className="p-3 text-sm">{assignment.name}</td>
                              <td className="p-3 text-sm text-muted-foreground">
                                {assignment.dueDate && assignment.dueDate !== 'null' && assignment.dueDate !== null ? 
                                  (() => {
                                    try {
                                      const date = new Date(assignment.dueDate);
                                      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                      });
                                    } catch {
                                      return 'N/A';
                                    }
                                  })() : 'N/A'}
                                {daysUntil !== null && daysUntil >= 0 && (
                                  <span className="ml-2 text-xs">
                                    ({daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`})
                                  </span>
                                )}
                              </td>
                              <td className="p-3">
                                <button 
                                  className={`px-2 py-1 text-xs rounded-full ${statusColor} font-medium hover:opacity-80 transition-opacity cursor-pointer`}
                                  onClick={() => {
                                    // Cycle through status options including Overdue
                                    const statusOptions = ['Not Started', 'In Progress', 'Completed', 'Overdue'];
                                    const currentIndex = statusOptions.indexOf(status);
                                    const nextIndex = (currentIndex + 1) % statusOptions.length;
                                    const newStatus = statusOptions[nextIndex];
                                    
                                    // Update local state immediately for instant UI feedback
                                    setManualStatuses(prev => ({
                                      ...prev,
                                      [assignmentKey]: newStatus
                                    }));
                                    
                                    // Update assignment status in Firebase
                                    updateAssignmentStatus(chat.id, assignment.name, newStatus);
                                  }}
                                  title="Click to change status"
                                >
                                  {status}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )
                      .slice(0, showAllAssignments ? undefined : 3)
                      .sort((a, b) => {
                        // Sort by due date (soonest first)
                        const dateA = a.props.children[2].props.children[0];
                        const dateB = b.props.children[2].props.children[0];
                        if (!dateA || dateA === 'N/A') return 1;
                        if (!dateB || dateB === 'N/A') return -1;
                        return new Date(dateA).getTime() - new Date(dateB).getTime();
                      })}
                  </tbody>
                </table>
              </div>
              
              {/* View More Button - Only show if more than 3 assignments */}
              {totalAssignments > 3 && (
              <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAllAssignments(!showAllAssignments)}
                  >
                    {showAllAssignments ? 'Show Less' : `View More (${totalAssignments - 3} more)`}
                </Button>
              </div>
              )}
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
                              <td className="p-3 text-sm text-muted-foreground">
                                {exam.date && exam.date !== 'null' && exam.date !== null ? 
                                  (() => {
                                    try {
                                      const date = new Date(exam.date);
                                      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                      });
                                    } catch {
                                      return 'N/A';
                                    }
                                  })() : 'N/A'}
                              </td>
                              <td className={`p-3 text-sm ${urgencyColor}`}>
                                {daysUntil !== null ? (
                                  daysUntil < 0 ? 'Passed' :
                                  daysUntil === 0 ? '🔴 Today!' :
                                  daysUntil === 1 ? '⚠️ Tomorrow' :
                                  daysUntil <= 3 ? `🔴 ${daysUntil} days` :
                                  daysUntil <= 7 ? `⚠️ ${daysUntil} days` :
                                  `${daysUntil} days`
                                ) : 'N/A'}
                              </td>
                            </tr>
                          );
                        })
                      )
                      .sort((a, b) => {
                        // Sort by exam date (soonest first)
                        const dateA = a.props.children[2].props.children;
                        const dateB = b.props.children[2].props.children;
                        if (!dateA || dateA === 'N/A') return 1;
                        if (!dateB || dateB === 'N/A') return -1;
                        return new Date(dateA).getTime() - new Date(dateB).getTime();
                      })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Study Groups Section - Hidden */}
        {/* <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
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
        </Card> */}

      </div>
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      
    </div>
  );
}

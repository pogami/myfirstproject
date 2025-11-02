"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare, Upload, BookOpen, FileText } from "lucide-react";
import { useChatStore } from "@/hooks/use-chat-store";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { auth } from '@/lib/firebase/client-simple';
import { useState, useEffect } from "react";

// Type assertion for auth
const authInstance = auth as any;
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import GeolocationGreeting from "@/components/geolocation-greeting";

export default function TestDashboardPage() {
  const { chats } = useChatStore();
  const [user, setUser] = useState<any>(null);
  
  const classCount = Object.keys(chats).filter(key => key !== 'general-chat').length;
  
  // Get real-time dashboard stats
  const { stats } = useDashboardStats(user);

  // Handle both guest and authenticated users
  useEffect(() => {
    try {
      if (authInstance && typeof authInstance.onAuthStateChanged === 'function') {
        const unsubscribe = authInstance.onAuthStateChanged(
          (user: any) => {
            if (user) {
              localStorage.removeItem('guestUser');
              setUser(user);
            } else {
              const guestUserData = localStorage.getItem('guestUser');
              if (guestUserData) {
                try {
                  const guestUser = JSON.parse(guestUserData);
                  setUser(guestUser);
                } catch (error) {
                  localStorage.removeItem('guestUser');
                  createGuestUser();
                }
              } else {
                createGuestUser();
              }
            }
          }
        );
        return unsubscribe;
      } else {
        const guestUserData = localStorage.getItem('guestUser');
        if (guestUserData) {
          try {
            const guestUser = JSON.parse(guestUserData);
            setUser(guestUser);
          } catch (error) {
            createGuestUser();
          }
        } else {
          createGuestUser();
        }
      }
    } catch (authError) {
      const guestUserData = localStorage.getItem('guestUser');
      if (guestUserData) {
        try {
          const guestUser = JSON.parse(guestUserData);
          setUser(guestUser);
        } catch (error) {
          createGuestUser();
        }
      } else {
        createGuestUser();
      }
    }

    function createGuestUser() {
      const autoGuestUser = {
        uid: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        displayName: "Guest User",
        email: null,
        photoURL: null,
        isAnonymous: true,
        isGuest: true
      };
      
      localStorage.setItem('guestUser', JSON.stringify(autoGuestUser));
      setUser(autoGuestUser);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Clean Modern Interface */}
      <div className="max-w-4xl mx-auto">
        
        {/* Simple Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">CourseConnect</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">AI Study Assistant</p>
              </div>
            </div>
            
            {/* Clean Stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{stats?.studyStreak || 0}</div>
                <div className="text-xs text-gray-500">Streak</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">{stats?.assignmentsCompleted || 0}</div>
                <div className="text-xs text-gray-500">Done</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">0</div>
                <div className="text-xs text-gray-500">Due</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-12">
          <div className="text-center max-w-2xl mx-auto">
            
            {/* Simple Welcome */}
            <div className="mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                <GeolocationGreeting 
                  userName={user?.displayName || user?.email?.split('@')[0]} 
                  fallbackName="Ready to study" 
                />
              </h2>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                {(() => {
                  const classChats = Object.values(chats).filter((chat: any) => chat.chatType === 'class');
                  
                  if (classChats.length === 0) {
                    return "Upload your syllabus to get personalized study help and track assignments.";
                  }

                  try {
                    const now = new Date();
                    let nextItem: { name: string; date: Date } | null = null;

                    Object.values(chats).forEach((chat: any) => {
                      if (chat.chatType !== 'class' || !chat.courseData) return;

                      (chat.courseData.assignments || []).forEach((a: any) => {
                        if (!a?.dueDate || a?.dueDate === 'null' || a?.status === 'Completed') return;
                        const d = new Date(a.dueDate);
                        if (isNaN(d.getTime()) || d < now) return;
                        if (!nextItem || d < nextItem.date) nextItem = { name: a.name, date: d };
                      });

                      (chat.courseData.exams || []).forEach((e: any) => {
                        if (!e?.date || e?.date === 'null') return;
                        const d = new Date(e.date);
                        if (isNaN(d.getTime()) || d < now) return;
                        if (!nextItem || d < nextItem.date) nextItem = { name: e.name || 'Exam', date: d };
                      });
                    });

                    if (!nextItem) {
                      return "No upcoming assignments or exams. Ask me anything about your courses!";
                    }

                    const formatted = (nextItem as any).date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                    return `Next up: ${(nextItem as any).name} on ${formatted}. How can I help you prepare?`;
                  } catch {
                    return "Ask me anything about your courses and I'll help you study!";
                  }
                })()}
              </p>
            </div>

            {/* Clean Action Buttons */}
            <div className="space-y-4 mb-8">
              <Button asChild className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium">
                <Link href="/test-dashboard/chat">
                  <MessageSquare className="mr-3 h-5 w-5" />
                  Try Improved Chat
                </Link>
              </Button>
              
              {classCount === 0 && (
                <Button asChild className="w-full h-12 bg-green-600 hover:bg-green-700 text-white text-lg font-medium">
                  <Link href="/test-dashboard/chat">
                    <Upload className="mr-3 h-5 w-5" />
                    Upload Syllabus
                  </Link>
                </Button>
              )}
              
              {classCount > 0 && (
                <Button asChild className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white text-lg font-medium">
                  <Link href="/test-dashboard/chat">
                    <BookOpen className="mr-3 h-5 w-5" />
                    Study Topics
                  </Link>
                </Button>
              )}
            </div>

            {/* Quick Actions */}
            {classCount > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" asChild className="h-10">
                    <Link href="/test-dashboard/chat?prefill=What assignments are due this week?">
                      📅 Due This Week
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="h-10">
                    <Link href="/test-dashboard/chat?prefill=Help me study for my upcoming exam">
                      🎯 Exam Prep
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="h-10">
                    <Link href="/test-dashboard/chat?prefill=Create a study schedule for me">
                      📚 Study Plan
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="h-10">
                    <Link href="/test-dashboard/chat?prefill=Explain this topic to me">
                      💡 Explain Topic
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Simple Floating Button */}
        <div className="fixed bottom-6 right-6">
          <Button 
            size="lg" 
            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            asChild
          >
            <Link href="/test-dashboard/chat">
              <MessageSquare className="h-6 w-6" />
            </Link>
          </Button>
        </div>
      </div>
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
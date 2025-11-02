"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, FilePlus, MessageSquare, Bell, GraduationCap, AlertTriangle, Megaphone, X, FileText } from "lucide-react";
import { GlobalCommandMenu } from "@/components/global-command-menu";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { WebsiteTimeTracker } from "@/components/website-time-tracker";
import { HideAISupport } from "@/components/hide-ai-support";
import Image from "next/image";
import { auth } from "@/lib/firebase/client-simple";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from "react";
import { useChatStore } from "@/hooks/use-chat-store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { OnboardingSlideshow } from "@/components/onboarding-slideshow";
import { ClientThemeToggle } from "@/components/client-theme-toggle";
import { NotificationToastListener } from "@/components/notification-toast-listener";
import { toast } from "sonner";


export default function TestDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [showTrialDialog, setShowTrialDialog] = useState(false);
  const { chats, trialActivated, trialDaysLeft, updateTrialDaysLeft, setIsDemoMode } = useChatStore();

  // Check if this is the chat page
  const isChatPage = pathname === '/test-dashboard/chat';

  // Handle both guest and authenticated users
  useEffect(() => {
    // FIRST: Check Firebase auth for authenticated users
    try {
      if (auth && typeof auth.onAuthStateChanged === 'function') {
        console.log('TestDashboard: Setting up auth state listener');
        const unsubscribe = auth.onAuthStateChanged(
          (user: any) => {
            console.log('TestDashboard: Auth state changed - user:', user ? 'authenticated' : 'not authenticated');
            if (user) {
              // User is authenticated, clear any guest data and use real user
              localStorage.removeItem('guestUser');
              localStorage.removeItem('guest-notifications');
              localStorage.removeItem('guest-onboarding-completed');
              setUser(user);
            } else {
              // No authenticated user, check for guest user
              const guestUserData = localStorage.getItem('guestUser');
              if (guestUserData) {
                try {
                  const guestUser = JSON.parse(guestUserData);
                  console.log("TestDashboard: Found guest user in localStorage:", guestUser);
                  setUser(guestUser);
                } catch (error) {
                  console.warn("TestDashboard: Error parsing guest user data:", error);
                  localStorage.removeItem('guestUser');
                  // Create new guest user
                  createGuestUser();
                }
              } else {
                // No guest user exists, create one automatically
                createGuestUser();
              }
            }
          },
          (error: any) => {
            console.warn("TestDashboard: Auth state error:", error);
            // On auth error, fall back to guest user
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
        );
        return unsubscribe;
      } else {
        // Auth not available, check for guest user
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
      console.warn("TestDashboard: Auth initialization error:", authError);
      // Fall back to guest user
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
      console.log("TestDashboard: Creating new guest user");
      const autoGuestUser = {
        uid: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        displayName: "Guest User",
        email: null,
        photoURL: null,
        isAnonymous: true,
        isGuest: true
      };
      
      localStorage.setItem('guestUser', JSON.stringify(autoGuestUser));
      console.log("TestDashboard: Created auto guest user:", autoGuestUser);
      setUser(autoGuestUser);
    }
  }, []);

  // Check for onboarding completion
  useEffect(() => {
    if (user) {
      const onboardingCompleted = localStorage.getItem('guest-onboarding-completed');
      if (!onboardingCompleted && user.isGuest) {
        setIsOnboardingOpen(true);
      }
    }
  }, [user]);

  // Check for trial activation
  useEffect(() => {
    if (trialActivated && trialDaysLeft <= 0) {
      setShowTrialDialog(true);
    }
  }, [trialActivated, trialDaysLeft]);

  const classCount = Object.keys(chats).filter(key => key !== 'general-chat').length;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* Sidebar - Hidden for chat page */}
        {!isChatPage && (
          <Sidebar className="border-r border-border bg-background">
            <SidebarHeader className="border-b border-border p-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="CourseConnect"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-lg font-semibold">CourseConnect</span>
              </div>
            </SidebarHeader>
            
            <SidebarContent className="p-4">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/test-dashboard">
                      <Home className="h-4 w-4" />
                      <span>Home</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/test-dashboard/chat">
                      <MessageSquare className="h-4 w-4" />
                      <span>Chat</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* MY COURSES Section */}
                <div className="mt-6">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    MY COURSES
                  </div>
                  <div className="space-y-1">
                    {Object.values(chats)
                      .filter((chat: any) => chat.chatType === 'class')
                      .slice(0, 3)
                      .map((chat: any) => (
                        <SidebarMenuItem key={chat.id}>
                          <SidebarMenuButton asChild>
                            <Link href={`/dashboard/chat?tab=${encodeURIComponent(chat.id)}`}>
                              <FileText className="h-4 w-4" />
                              <span className="truncate">{chat.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                  </div>
                  
                  {/* Add Course Button */}
                  <SidebarMenuItem className="mt-2">
                    <SidebarMenuButton asChild>
                      <Link href="/test-dashboard/chat">
                        <FilePlus className="h-4 w-4" />
                        <span>+ New Course</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </div>

                {/* Permanent Navigation */}
                <div className="mt-6">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    NAVIGATION
                  </div>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/test-dashboard/notifications">
                        <Bell className="h-4 w-4" />
                        <span>Notifications</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </div>
              </SidebarMenu>
            </SidebarContent>
            
            <SidebarFooter className="border-t border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'G'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {user?.displayName || user?.email?.split('@')[0] || 'Guest'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user?.isGuest ? 'Guest User' : 'Student'}
                    </span>
                  </div>
                </div>
                <ClientThemeToggle />
              </div>
            </SidebarFooter>
          </Sidebar>
        )}

        {/* Main Content */}
        <SidebarInset className={`flex-1 ${isChatPage ? 'w-full' : ''}`}>
          {/* Header - Hidden for chat page */}
          {!isChatPage && (
            <header className="border-b border-border bg-background px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <h1 className="text-2xl font-semibold">Test Dashboard</h1>
                </div>
                <div className="flex items-center gap-4">
                  <NotificationToastListener />
                  <WebsiteTimeTracker />
                  <HideAISupport />
                </div>
              </div>
            </header>
          )}

          {/* Main Content Area */}
          <main className={`flex-1 ${isChatPage ? 'h-full' : 'p-6'}`}>
            {children}
          </main>
        </SidebarInset>
      </div>

      {/* Global Command Menu */}
      <GlobalCommandMenu />

      {/* Onboarding Slideshow */}
      <OnboardingSlideshow 
        isOpen={isOnboardingOpen}
        onClose={() => {
          setIsOnboardingOpen(false);
          localStorage.setItem('guest-onboarding-completed', 'true');
        }}
      />

      {/* Trial Expired Dialog */}
      <AlertDialog open={showTrialDialog} onOpenChange={setShowTrialDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Trial Period Expired</AlertDialogTitle>
            <AlertDialogDescription>
              Your trial period has ended. Please upgrade to continue using CourseConnect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDemoMode(true)}>
              Continue as Demo
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/pricing')}>
              Upgrade Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}

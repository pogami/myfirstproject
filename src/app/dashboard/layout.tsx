
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, FilePlus, MessageSquare, Bell, GraduationCap, AlertTriangle, Megaphone, X, Brain, FileText } from "lucide-react";
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
import { CourseConnectLogo } from "@/components/icons/courseconnect-logo";
import { auth } from "@/lib/firebase/client";
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
import { FirebaseOfflineDisabler } from "@/components/firebase-offline-disabler";
import { FirebaseConnectionMonitor } from "@/components/firebase-connection-monitor";
import { FirebaseConnectionManager } from "@/components/firebase-connection-manager";
import { ClientThemeToggle } from "@/components/client-theme-toggle";

function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Megaphone className="h-5 w-5" />
            <p className="font-medium">
              <span className="hidden md:inline">Welcome to CourseConnect! We're excited to have you.</span>
              <span className="md:hidden">Welcome to CourseConnect!</span>
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-primary/80"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path: string) => pathname === path || (path !== '/dashboard' && pathname.startsWith(path));
  
  // Safely handle auth state
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  useEffect(() => {
    // Reduced timeout to 1 second for faster loading
    const authTimeout = setTimeout(() => {
      console.warn('Dashboard: Auth initialization timeout, proceeding without auth');
      setLoading(false);
      setError(new Error('Auth timeout'));
    }, 1000); // 1 second timeout

    // Check for guest user first (faster than Firebase auth)
    const guestUserData = localStorage.getItem('guestUser');
    if (guestUserData) {
      try {
        const guestUser = JSON.parse(guestUserData);
        console.log("Dashboard: Found guest user in localStorage:", guestUser);
        setUser(guestUser);
        setLoading(false);
        setError(null);
        clearTimeout(authTimeout);
        return; // Exit early for guest users
      } catch (error) {
        console.warn("Dashboard: Error parsing guest user data:", error);
        localStorage.removeItem('guestUser');
      }
    }

    // Safely handle auth state for authenticated users
    try {
      if (auth && typeof auth.onAuthStateChanged === 'function') {
        console.log('Dashboard: Setting up auth state listener');
        const unsubscribe = auth.onAuthStateChanged(
          (user: any) => {
            clearTimeout(authTimeout); // Clear timeout when auth resolves
            console.log('Dashboard: Auth state changed - user:', user ? 'authenticated' : 'not authenticated');
            
            // Check if we're in the middle of a logout process
            const isLoggingOut = localStorage.getItem('isLoggingOut');
            if (isLoggingOut === 'true') {
              console.log('Dashboard: Logout in progress, skipping auth state update');
              return;
            }
            
            setUser(user);
            setLoading(false);
            setError(null);
          },
          (error: any) => {
            clearTimeout(authTimeout); // Clear timeout when auth resolves (even with error)
            console.warn("Dashboard: Auth state error:", error);
            setUser(null);
            setLoading(false);
            setError(error);
          }
        );
        
        // Return cleanup function that clears both timeout and unsubscribe
        return () => {
          clearTimeout(authTimeout);
          if (unsubscribe) unsubscribe();
        };
      } else {
        clearTimeout(authTimeout);
        console.warn('Dashboard: Auth not available');
        setUser(null);
        setLoading(false);
        setError(null);
      }
    } catch (authError) {
      clearTimeout(authTimeout);
      console.warn("Dashboard: Auth initialization error:", authError);
      setUser(null);
      setLoading(false);
      setError(authError);
    }
  }, []);
  
  // Close sidebar on navigation (mobile)
  useEffect(() => {
    // Close sidebar when pathname changes on mobile
    const isMobile = window.innerWidth < 1024; // lg breakpoint
    if (isMobile) {
      // Find and close any open sidebar/sheet
      const sidebarTrigger = document.querySelector('[data-sidebar="trigger"]');
      if (sidebarTrigger) {
        // Trigger click to close sidebar
        (sidebarTrigger as HTMLElement).click();
      }
    }
  }, [pathname]);
  
  const { chats, showUpgrade, setShowUpgrade, isGuest, isDemoMode, setIsDemoMode } = useChatStore();
  const [guestUser, setGuestUser] = useState<any>(null);
  const [isProUser, setIsProUser] = useState(false); // Demo access - set to true for demo
  
  // Check if user has subscription (this would typically come from your payment system)
  const checkUserSubscription = () => {
    // For now, we'll assume no one has a subscription unless they're in demo mode
    // In a real app, this would check your payment system or user database
    return false;
  };

  // Check for guest user in localStorage
  useEffect(() => {
    const storedGuest = localStorage.getItem('guestUser');
    console.log("Checking for guest user in localStorage:", storedGuest);
    if (storedGuest) {
      try {
        const parsedGuest = JSON.parse(storedGuest);
        console.log("Parsed guest user:", parsedGuest);
        setGuestUser(parsedGuest);
      } catch (error) {
        console.error("Error parsing guest user:", error);
        localStorage.removeItem('guestUser');
      }
    }
  }, []);

  useEffect(() => {
    // If user is not logged in and not loading, check if they're a guest
    if (!loading && !user) {
      const storedGuest = localStorage.getItem('guestUser');
      if (!storedGuest) {
        // No user and no guest, redirect to login
        console.log("No user and no guest found, redirecting to login");
        router.push('/login');
      } else {
        console.log("Guest user found in localStorage:", storedGuest);
      }
    }
  }, [user, loading, router, pathname]);

  // Check for onboarding flag
  useEffect(() => {
    if (!loading && user) {
      const shouldShowOnboarding = localStorage.getItem('showOnboarding');
      if (shouldShowOnboarding === 'true') {
        setShowOnboarding(true);
        localStorage.removeItem('showOnboarding');
      }
    }
  }, [user, loading]);

  // Guest users can now upload unlimited syllabi without restrictions


   if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-transparent">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted border-t-primary mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold mb-2">Loading Dashboard</h2>
          <p className="text-sm text-muted-foreground mb-4">Please wait while we prepare your workspace</p>
          <div className="text-xs text-muted-foreground">
            Taking too long? <Link href="/login" className="text-primary hover:underline">Click here to sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-transparent">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-lg font-semibold mb-2 text-red-600">Authentication Error</h2>
          <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
            <Button asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Allow guest users to access the dashboard without restrictions
  // Guest users can explore the platform freely


  return (
      <SidebarProvider className="bg-gradient-to-b from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950 min-h-screen">
        <Sidebar className="sm:translate-x-0 bg-gradient-to-b from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950">
          <SidebarHeader className="group-data-[collapsible=icon]:justify-center p-4 sm:p-6 border-b border-border/50">
             <Link href="/home" className="flex items-center gap-2 sm:gap-3 hover:scale-105 transition-all duration-300">
                <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <CourseConnectLogo className="size-5 sm:size-6 text-primary transition-all group-data-[collapsible=icon]:size-7" />
                </div>
                <span className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent transition-all group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
                  CourseConnect
                </span>
             </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu className="space-y-1 sm:space-y-2 p-1 sm:p-2">
              <SidebarMenuItem>
                <Link 
                  href="/dashboard"
                  className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] group ${
                    pathname === "/dashboard" 
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg" 
                      : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:shadow-md"
                  }`}
                >
                  <div className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 ${
                    pathname === "/dashboard" 
                      ? "bg-primary-foreground/20" 
                      : "bg-muted/50 group-hover:bg-primary/20"
                  }`}>
                    <Home className="size-4 sm:size-5" />
                  </div>
                  <span className="font-medium text-sm sm:text-base">Dashboard</span>
                </Link>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Link 
                  href="/dashboard/upload"
                  className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] group ${
                    isActive("/dashboard/upload") 
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg" 
                      : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:shadow-md"
                  }`}
                >
                  <div className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 ${
                    isActive("/dashboard/upload") 
                      ? "bg-primary-foreground/20" 
                      : "bg-muted/50 group-hover:bg-primary/20"
                  }`}>
                    <FilePlus className="size-4 sm:size-5" />
                  </div>
                  <span className="font-medium text-sm sm:text-base">Upload Syllabus</span>
                </Link>
              
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link 
                  href="/dashboard/upload"
                  className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] group ${
                    isActive("/dashboard/upload") 
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg" 
                      : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:shadow-md"
                  }`}
                >
                  <div className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 ${
                    isActive("/dashboard/upload") 
                      ? "bg-primary-foreground/20" 
                      : "bg-muted/50 group-hover:bg-primary/20"
                  }`}>
                    <Brain className="size-4 sm:size-5" />
                  </div>
                  <span className="font-medium text-sm sm:text-base">Enhanced Upload</span>
                </Link>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Link 
                  href="/dashboard/chat"
                  className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] group ${
                    isActive("/dashboard/chat") 
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg" 
                      : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:shadow-md"
                  }`}
                >
                  <div className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 ${
                    isActive("/dashboard/chat") 
                      ? "bg-primary-foreground/20" 
                      : "bg-muted/50 group-hover:bg-primary/20"
                  }`}>
                    <MessageSquare className="size-4 sm:size-5" />
                  </div>
                  <span className="font-medium text-sm sm:text-base">Class Chats</span>
                </Link>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Link 
                  href="/dashboard/overview"
                  className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] group ${
                    isActive("/dashboard/overview") 
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg" 
                      : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:shadow-md"
                  }`}
                >
                  <div className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 ${
                    isActive("/dashboard/overview") 
                      ? "bg-primary-foreground/20" 
                      : "bg-muted/50 group-hover:bg-primary/20"
                  }`}>
                    <Users className="size-4 sm:size-5" />
                  </div>
                  <span className="font-medium text-sm sm:text-base">Classes Overview</span>
                </Link>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Link 
                  href="/dashboard/flashcards"
                  className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] group ${
                    isActive("/dashboard/flashcards") 
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg" 
                      : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:shadow-md"
                  }`}
                >
                  <div className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 ${
                    isActive("/dashboard/flashcards") 
                      ? "bg-primary-foreground/20" 
                      : "bg-muted/50 group-hover:bg-primary/20"
                  }`}>
                    <GraduationCap className="size-4 sm:size-5" />
                  </div>
                  <span className="font-medium text-sm sm:text-base">Flashcards</span>
                </Link>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Link 
                  href="/dashboard/academic-tools"
                  className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] group ${
                    isActive("/dashboard/academic-tools") 
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg" 
                      : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:shadow-md"
                  }`}
                >
                  <div className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 ${
                    isActive("/dashboard/academic-tools") 
                      ? "bg-primary-foreground/20" 
                      : "bg-muted/50 group-hover:bg-primary/20"
                  }`}>
                    <FileText className="size-4 sm:size-5" />
                  </div>
                  <span className="font-medium text-sm sm:text-base">Citation & Plagiarism</span>
                </Link>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Link 
                  href="/dashboard/notifications"
                  className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] group ${
                    isActive("/dashboard/notifications") 
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg" 
                      : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:shadow-md"
                  }`}
                >
                  <div className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 ${
                    isActive("/dashboard/notifications") 
                      ? "bg-primary-foreground/20" 
                      : "bg-muted/50 group-hover:bg-primary/20"
                  }`}>
                    <Bell className="size-4 sm:size-5" />
                  </div>
                  <span className="font-medium text-sm sm:text-base">Notifications</span>
                </Link>
              </SidebarMenuItem>
              
              {/* Advanced AI Tab - Only show for Pro users or demo mode */}
              {(checkUserSubscription() || isDemoMode) && (
                <SidebarMenuItem>
                  <Link 
                    href="/dashboard/advanced"
                    className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] group ${
                      isActive("/dashboard/advanced") 
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg" 
                        : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-purple-600/5 hover:shadow-md"
                    }`}
                  >
                    <div className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 ${
                      isActive("/dashboard/advanced") 
                        ? "bg-white/20" 
                        : "bg-muted/50 group-hover:bg-purple-500/20"
                    }`}>
                      <Brain className="size-4 sm:size-5" />
                    </div>
                    <span className="font-medium text-sm sm:text-base">Advanced AI</span>
                  </Link>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            {/* User profile moved to header */}
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="bg-gradient-to-b from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950 min-h-screen">
          <AnnouncementBanner />
          
          {/* Header with Hamburger Menu - Always Visible */}
          <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-transparent backdrop-blur supports-[backdrop-filter]:bg-transparent">
            <div className="flex h-16 items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-8 w-8" />
                <Link href="/dashboard" className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-primary tracking-tight">CourseConnect</h1>
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <ClientThemeToggle />
                <DashboardHeader user={user || guestUser} />
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 bg-transparent relative min-h-screen">
            <div className="max-w-full mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
              {children}
            </div>
          </main>
        </SidebarInset>

        {/* Onboarding Slideshow */}
        <OnboardingSlideshow 
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={() => setShowOnboarding(false)}
        />
        
        {/* Firebase Connection Management */}
        <FirebaseOfflineDisabler />
        <FirebaseConnectionMonitor />
        <FirebaseConnectionManager />
      </SidebarProvider>
  );
}

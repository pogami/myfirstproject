
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
import { CourseConnectLogo } from "@/components/icons/courseconnect-logo";
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
    <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2 backdrop-blur-sm">
              <Megaphone className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <p className="font-semibold text-sm">
                <span className="hidden md:inline">Welcome to CourseConnect! 🎓</span>
                <span className="md:hidden">Welcome! 🎓</span>
              </p>
              <p className="text-xs text-white/90 hidden sm:block">
                Your AI-powered learning companion is ready to help you succeed
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-white/20 text-white"
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
    // Increased timeout to 5 seconds to allow Firebase auth to propagate
    const authTimeout = setTimeout(() => {
      console.warn('Dashboard: Auth initialization timeout, proceeding without auth');
      setLoading(false);
      setError(new Error('Auth timeout'));
    }, 5000); // 5 second timeout

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
      // Check if user just logged in (give it 2 more seconds to load)
      const justLoggedIn = sessionStorage.getItem('justLoggedIn');
      if (justLoggedIn === 'true') {
        console.log("User just logged in, waiting for auth to load...");
        return; // Don't redirect yet
      }
      
      const storedGuest = localStorage.getItem('guestUser');
      if (!storedGuest) {
        // No user and no guest, redirect to login
        console.log("No user and no guest found, redirecting to login");
        router.push('/login');
      } else {
        console.log("Guest user found in localStorage:", storedGuest);
      }
    } else if (user) {
      // Clear the flag once user is loaded
      sessionStorage.removeItem('justLoggedIn');
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

  // Show welcome toast for new users
  useEffect(() => {
    if (!loading && user) {
      const justSignedUp = sessionStorage.getItem('justSignedUp');
      if (justSignedUp === 'true') {
        // Clear the flag immediately
        sessionStorage.removeItem('justSignedUp');
        
        // Show welcome toast after a short delay (so page loads first)
        setTimeout(() => {
          toast.success('🎉 Welcome to CourseConnect!', {
            description: 'Your AI-powered learning companion is ready to help you ace your courses! Upload your syllabus to get started.',
            duration: 5000,
          });
        }, 500);
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
      <SidebarProvider className="bg-white dark:bg-gray-950 min-h-screen">
        <Sidebar className="sm:translate-x-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50 shadow-xl">
          <SidebarHeader className="group-data-[collapsible=icon]:justify-center p-6 border-b border-gray-100 dark:border-gray-800">
             <Link href="/home" className="flex items-center gap-3 hover:opacity-80 transition-all duration-200">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                  <CourseConnectLogo className="size-6 text-white transition-all group-data-[collapsible=icon]:size-7" />
                </div>
                <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white transition-all group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
                  CourseConnect
                </span>
             </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu className="space-y-2 p-4">
              <SidebarMenuItem>
                <Link 
                  href="/dashboard"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    pathname === "/dashboard" 
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div className={`p-2 rounded-md transition-all duration-200 ${
                    pathname === "/dashboard" 
                      ? "bg-blue-100 dark:bg-blue-900/50" 
                      : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                  }`}>
                    <Home className="size-4" />
                  </div>
                  <span className="font-medium text-sm">Dashboard</span>
                </Link>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Link 
                  href="/dashboard/upload"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive("/dashboard/upload") 
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div className={`p-2 rounded-md transition-all duration-200 ${
                    isActive("/dashboard/upload") 
                      ? "bg-blue-100 dark:bg-blue-900/50" 
                      : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                  }`}>
                    <FilePlus className="size-4" />
                  </div>
                  <span className="font-medium text-sm">Upload Syllabus</span>
                </Link>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Link 
                  href="/dashboard/chat"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive("/dashboard/chat") 
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div className={`p-2 rounded-md transition-all duration-200 ${
                    isActive("/dashboard/chat") 
                      ? "bg-blue-100 dark:bg-blue-900/50" 
                      : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                  }`}>
                    <MessageSquare className="size-4" />
                  </div>
                  <span className="font-medium text-sm">Class Chats</span>
                </Link>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Link 
                  href="/dashboard/overview"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive("/dashboard/overview") 
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div className={`p-2 rounded-md transition-all duration-200 ${
                    isActive("/dashboard/overview") 
                      ? "bg-blue-100 dark:bg-blue-900/50" 
                      : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                  }`}>
                    <Users className="size-4" />
                  </div>
                  <span className="font-medium text-sm">Classes Overview</span>
                </Link>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Link 
                  href="/dashboard/flashcards"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive("/dashboard/flashcards") 
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div className={`p-2 rounded-md transition-all duration-200 ${
                    isActive("/dashboard/flashcards") 
                      ? "bg-blue-100 dark:bg-blue-900/50" 
                      : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                  }`}>
                    <GraduationCap className="size-4" />
                  </div>
                  <span className="font-medium text-sm">Flashcards</span>
                </Link>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Link 
                  href="/dashboard/academic-tools"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive("/dashboard/academic-tools") 
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div className={`p-2 rounded-md transition-all duration-200 ${
                    isActive("/dashboard/academic-tools") 
                      ? "bg-blue-100 dark:bg-blue-900/50" 
                      : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                  }`}>
                    <FileText className="size-4" />
                  </div>
                  <span className="font-medium text-sm">Citation & Plagiarism</span>
                </Link>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Link 
                  href="/dashboard/notifications"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive("/dashboard/notifications") 
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div className={`p-2 rounded-md transition-all duration-200 ${
                    isActive("/dashboard/notifications") 
                      ? "bg-blue-100 dark:bg-blue-900/50" 
                      : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                  }`}>
                    <Bell className="size-4" />
                  </div>
                  <span className="font-medium text-sm">Notifications</span>
                </Link>
              </SidebarMenuItem>
              
              {/* Advanced AI Tab - Only show for Pro users or demo mode */}
              {(checkUserSubscription() || isDemoMode) && (
                <SidebarMenuItem>
                  <Link 
                    href="/dashboard/advanced"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      isActive("/dashboard/advanced") 
                        ? "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800" 
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <div className={`p-2 rounded-md transition-all duration-200 ${
                      isActive("/dashboard/advanced") 
                        ? "bg-purple-100 dark:bg-purple-900/50" 
                        : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                    }`}>
                    </div>
                    <span className="font-medium text-sm">Advanced AI</span>
                  </Link>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            {/* User profile moved to header */}
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="bg-gray-50/50 dark:bg-gray-950 min-h-screen">
          <AnnouncementBanner />
          
          {/* Header with Hamburger Menu - Always Visible */}
          <header className="sticky top-0 z-40 w-full border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" />
                <Link href="/dashboard" className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <ClientThemeToggle />
                <DashboardHeader user={user || guestUser} />
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-6 bg-transparent relative min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
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
        
        {/* Global Command Menu (⌘K) */}
        <GlobalCommandMenu />
        
        {/* Notification Toast Listener */}
        <NotificationToastListener />
        
      </SidebarProvider>
  );
}

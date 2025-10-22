
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
  
  const { chats, showUpgrade, setShowUpgrade, isGuest, isDemoMode, setIsDemoMode, addChat, setCurrentTab } = useChatStore();
  
  // Auto-create course chat from saved syllabus data after signup (HOMEPAGE ONLY)
  useEffect(() => {
    if (!user || isGuest) return; // Only for authenticated users
    
    const createCourseFromSavedData = async () => {
      try {
        // Check for saved course data from homepage syllabus upload
        const savedCourseData = sessionStorage.getItem('cc-course-context-card');
        if (!savedCourseData) return;
        
        // Additional check: Only create if this is a fresh signup (not an existing user)
        // This prevents creating chats for existing users who might have stale sessionStorage
        const isNewSignup = localStorage.getItem('cc-new-signup') === 'true';
        if (!isNewSignup) {
          console.log('🚫 Not a new signup, skipping auto-creation');
          sessionStorage.removeItem('cc-course-context-card'); // Clean up stale data
          return;
        }
        
        console.log('🎓 Found saved course data after homepage signup!');
        const courseData = JSON.parse(savedCourseData);
        
        // Create course chat
        const chatTitle = `${courseData.courseCode} - ${courseData.courseName}`;
        const welcomeMessage = {
          id: `welcome-${Date.now()}`,
          sender: 'bot' as const,
          name: 'CourseConnect AI',
          text: `Welcome to your ${courseData.courseName} course chat! I'm your AI tutor with full context about your syllabus. I can help you with:\n\n• Course topics and concepts\n• Assignment deadlines and requirements\n• Exam preparation\n• Study strategies\n• Any questions about the course material\n\nWhat would you like to know about ${courseData.courseName}?`,
          timestamp: Date.now()
        };
        
        const uniqueChatId = `${courseData.courseCode}-${courseData.courseName}-${Date.now()}`;
        
        console.log('✅ Creating course chat:', chatTitle);
        
        // Create the chat
        await addChat(chatTitle, welcomeMessage, uniqueChatId, 'class', {
          courseName: courseData.courseName,
          courseCode: courseData.courseCode,
          professor: courseData.professor || 'Unknown Professor',
          topics: courseData.topics || [],
        });
        
        // Clear the saved data
        sessionStorage.removeItem('cc-course-context-card');
        localStorage.removeItem('cc-new-signup'); // Clear the new signup flag
        
        // Show success message
        toast.success('Course Chat Created!', {
          description: `Your ${courseData.courseName} chat is ready. Let's start learning!`,
          duration: 5000,
        });
        
        // Redirect to the new chat
        setTimeout(() => {
          setCurrentTab(uniqueChatId);
          router.push(`/dashboard/chat?tab=${uniqueChatId}`);
        }, 1000);
        
      } catch (error) {
        console.error('Failed to create course chat from saved data:', error);
        // Clear the data anyway to prevent retry loops
        sessionStorage.removeItem('cc-course-context-card');
        localStorage.removeItem('cc-new-signup');
      }
    };
    
    createCourseFromSavedData();
  }, [user, isGuest, addChat, setCurrentTab, router]);
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
      
      // Give auth listener time to work before redirecting
      const timeoutId = setTimeout(() => {
        const storedGuest = localStorage.getItem('guestUser');
        if (!storedGuest) {
          // No user and no guest, redirect to login
          console.log("No user and no guest found after timeout, redirecting to login");
          router.push('/login');
        } else {
          console.log("Guest user found in localStorage:", storedGuest);
        }
      }, 1000); // Wait 1 second for auth to initialize
      
      return () => clearTimeout(timeoutId);
    } else if (user) {
      // Clear the flag once user is loaded
      sessionStorage.removeItem('justLoggedIn');
    }
  }, [user, loading, router, pathname]);

  // Check for onboarding flag
  useEffect(() => {
    if (!loading && user) {
      // Check if user has completed onboarding
      const onboardingCompleted = localStorage.getItem('onboarding-completed');
      const shouldShowOnboarding = localStorage.getItem('showOnboarding');
      
      // Show onboarding if:
      // 1. User hasn't completed onboarding yet, OR
      // 2. Manual trigger flag is set
      if (!onboardingCompleted || shouldShowOnboarding === 'true') {
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
                <Image 
                  src="/pageicon.png?v=4"
                  alt="CourseConnect Logo"
                  width={40}
                  height={40}
                  className="object-contain transition-all group-data-[collapsible=icon]:size-7" 
                />
                <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white transition-all group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
                  CourseConnect <span className="text-blue-500">AI</span>
                </span>
             </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu className="space-y-2 p-4">
              {/* Home */}
              <SidebarMenuItem>
                <Link 
                  href="/dashboard"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    pathname === "/dashboard" 
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 text-blue-700 dark:text-blue-300 shadow-sm" 
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <Home className="size-5" />
                  <span className="font-semibold text-sm">Home</span>
                </Link>
              </SidebarMenuItem>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

              {/* My Courses Section */}
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  My Courses
                </p>
              </div>

              {/* List courses from chats */}
              {Object.values(chats).filter((chat: any) => chat.chatType === 'class').slice(0, 5).map((chat: any) => (
                <SidebarMenuItem key={chat.id}>
                  <Link 
                    href={`/dashboard/course/${encodeURIComponent(chat.id)}`}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      pathname.includes(chat.id)
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 text-blue-700 dark:text-blue-300 shadow-sm" 
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                          {chat.courseData?.courseCode?.charAt(0) || 'C'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {chat.courseData?.courseCode || chat.title}
                      </p>
                      {chat.courseData?.assignments && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {chat.courseData.assignments.filter((a: any) => a.status === 'Completed').length}/{chat.courseData.assignments.length} done
                        </p>
                      )}
                    </div>
                  </Link>
                </SidebarMenuItem>
              ))}
              
              {/* Add Course */}
              <SidebarMenuItem>
                <Link 
                  href="/dashboard/upload"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group border-2 border-dashed ${
                    isActive("/dashboard/upload") 
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 text-blue-700 dark:text-blue-300 border-blue-300" 
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <FilePlus className="size-5" />
                  <span className="font-medium text-sm">Add Course</span>
                </Link>
              </SidebarMenuItem>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-4" />
              
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
              
              
              {/* Academic Tools - HIDDEN */}
              {/* <SidebarMenuItem>
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
              </SidebarMenuItem> */}
              
              
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
              
              {/* Advanced AI Tab - HIDDEN */}
              {/* {(checkUserSubscription() || isDemoMode) && (
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
              )} */}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            {/* User profile moved to header */}
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="bg-gray-50/50 dark:bg-gray-950 min-h-screen">
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
          
          <main className="flex-1 bg-transparent relative min-h-screen">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
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
        
        {/* Website Time Tracker */}
        <WebsiteTimeTracker />
        
        {/* Hide AI Support */}
        <HideAISupport />
        
      </SidebarProvider>
  );
}

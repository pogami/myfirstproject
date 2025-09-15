
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, FilePlus, MessageSquare, Bell, GraduationCap, AlertTriangle, Megaphone, X } from "lucide-react";
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

function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(true);

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
  const [user, loading, error] = useAuthState(auth);
  const { chats, showUpgrade, setShowUpgrade, isGuest } = useChatStore();
  const [guestUser, setGuestUser] = useState<any>(null);

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

  useEffect(() => {
    // Show upgrade modal for guests with 2 or more classes
    if (isGuest && Object.keys(chats).length >= 2 && !pathname.startsWith('/dashboard/upload')) {
      // Small delay to prevent flash of content
      setTimeout(() => setShowUpgrade(true), 100);
    }
  }, [isGuest, chats, pathname, setShowUpgrade]);


   if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="flex h-screen items-center justify-center">Error: {error.message}</div>;
  }
  
  // This logic is for guest users.
  if (!user && (isGuest || guestUser)) {
      if (Object.keys(chats).length >= 2 && pathname !== '/dashboard/upload' && pathname !== '/dashboard/chat') {
          router.push('/login?state=signup');
          return <div className="flex h-screen items-center justify-center">Redirecting to sign up...</div>;
      }
  }


  return (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="group-data-[collapsible=icon]:justify-center p-6 border-b border-border/50">
             <Link href="/home" className="flex items-center gap-3 hover:scale-105 transition-all duration-300">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <CourseConnectLogo className="size-6 text-primary transition-all group-data-[collapsible=icon]:size-7" />
                </div>
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent transition-all group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
                  CourseConnect
                </span>
             </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu className="space-y-2 p-2">
              <SidebarMenuItem>
                <Link 
                  href="/dashboard"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] group ${
                    pathname === "/dashboard" 
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg" 
                      : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:shadow-md"
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    pathname === "/dashboard" 
                      ? "bg-primary-foreground/20" 
                      : "bg-muted/50 group-hover:bg-primary/20"
                  }`}>
                    <Home className="size-5" />
                  </div>
                  <span className="font-medium">Dashboard</span>
                </Link>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Link 
                  href="/dashboard/upload"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] group ${
                    isActive("/dashboard/upload") 
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg" 
                      : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:shadow-md"
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    isActive("/dashboard/upload") 
                      ? "bg-primary-foreground/20" 
                      : "bg-muted/50 group-hover:bg-primary/20"
                  }`}>
                    <FilePlus className="size-5" />
                  </div>
                  <span className="font-medium">Upload Syllabus</span>
                </Link>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Link 
                  href="/dashboard/chat"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] group ${
                    isActive("/dashboard/chat") 
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg" 
                      : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:shadow-md"
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    isActive("/dashboard/chat") 
                      ? "bg-primary-foreground/20" 
                      : "bg-muted/50 group-hover:bg-primary/20"
                  }`}>
                    <MessageSquare className="size-5" />
                  </div>
                  <span className="font-medium">Class Chats</span>
                </Link>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Link 
                  href="/dashboard/overview"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] group ${
                    isActive("/dashboard/overview") 
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg" 
                      : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:shadow-md"
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    isActive("/dashboard/overview") 
                      ? "bg-primary-foreground/20" 
                      : "bg-muted/50 group-hover:bg-primary/20"
                  }`}>
                    <Users className="size-5" />
                  </div>
                  <span className="font-medium">Classes Overview</span>
                </Link>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Link 
                  href="/dashboard/flashcards"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] group ${
                    isActive("/dashboard/flashcards") 
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg" 
                      : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:shadow-md"
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    isActive("/dashboard/flashcards") 
                      ? "bg-primary-foreground/20" 
                      : "bg-muted/50 group-hover:bg-primary/20"
                  }`}>
                    <GraduationCap className="size-5" />
                  </div>
                  <span className="font-medium">Flashcards</span>
                </Link>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Link 
                  href="/dashboard/notifications"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] group ${
                    isActive("/dashboard/notifications") 
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg" 
                      : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:shadow-md"
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    isActive("/dashboard/notifications") 
                      ? "bg-primary-foreground/20" 
                      : "bg-muted/50 group-hover:bg-primary/20"
                  }`}>
                    <Bell className="size-5" />
                  </div>
                  <span className="font-medium">Notifications</span>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            {/* User profile moved to header */}
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <AnnouncementBanner />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background/40 relative">{children}</main>
          
          {/* Floating Profile in Top-Right Corner */}
          <div className="fixed top-4 right-4 z-50">
            <DashboardHeader user={user || guestUser} />
          </div>
        </SidebarInset>

        <AlertDialog open={showUpgrade} onOpenChange={setShowUpgrade}>
          <AlertDialogContent>
            <AlertDialogHeader>
               <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-3 border-2 border-primary/20">
                  <AlertTriangle className="h-8 w-8 text-primary" />
                </div>
              </div>
              <AlertDialogTitle className="text-center text-2xl">Create an Account to Continue</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                You've used your 2 free syllabus uploads. Please create a free account to save your classes and unlock unlimited access.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col gap-2">
              <AlertDialogAction asChild className="w-full">
                <Link href="/login?state=signup">Create Account</Link>
              </AlertDialogAction>
              <AlertDialogCancel asChild className="w-full mt-0">
                 <Link href="/home">Maybe Later</Link>
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarProvider>
  );
}

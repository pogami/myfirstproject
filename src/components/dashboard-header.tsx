
"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { auth, db } from "@/lib/firebase/client-simple";
// Realtime Database removed - using Firestore instead
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Skeleton } from "./ui/skeleton";
import { User as UserIcon, Settings as SettingsIcon, LogOut, Bell, Shield, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { useChatStore } from "@/hooks/use-chat-store";
import { OnboardingSlideshow } from "@/components/onboarding-slideshow";
import { NotificationBell } from "@/components/notification-bell";

interface DashboardHeaderProps {
    user: User | null;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userProfilePicture, setUserProfilePicture] = useState<string | null>(null);
  const router = useRouter();
  const { clearGuestData } = useChatStore();

  // Listen for profile picture updates
  useEffect(() => {
    if (user) {
      // Set initial profile picture
      setUserProfilePicture(user.photoURL);
      
      // Listen for auth state changes (profile updates)
      const unsubscribe = auth.onAuthStateChanged((updatedUser) => {
        if (updatedUser && updatedUser.uid === user.uid) {
          setUserProfilePicture(updatedUser.photoURL);
        }
      });
      
      return () => unsubscribe();
    }
  }, [user]);

  // Listen for guest profile picture updates in localStorage
  useEffect(() => {
    if (isGuest) {
      const checkGuestProfilePicture = () => {
        try {
          const guestData = localStorage.getItem('guestUser');
          if (guestData) {
            const parsed = JSON.parse(guestData);
            if (parsed.profilePicture) {
              setUserProfilePicture(parsed.profilePicture);
            }
          }
        } catch (error) {
          console.error('Error reading guest profile picture:', error);
        }
      };

      // Check initially
      checkGuestProfilePicture();

      // Listen for storage changes
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'guestUser') {
          checkGuestProfilePicture();
        }
      };

      window.addEventListener('storage', handleStorageChange);
      
      // Also listen for custom events (for same-tab updates)
      const handleCustomStorageChange = () => {
        checkGuestProfilePicture();
      };
      
      window.addEventListener('guestProfileUpdated', handleCustomStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('guestProfileUpdated', handleCustomStorageChange);
      };
    }
  }, [isGuest]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show onboarding for new users
  useEffect(() => {
    if (user && isClient) {
      const hasSeenOnboarding = localStorage.getItem('onboarding-completed');
      const justSignedUp = sessionStorage.getItem('justSignedUp');
      
      // For guest users, also check if they've seen onboarding as a guest
      const guestHasSeenOnboarding = user.isGuest || user.isAnonymous ? 
        localStorage.getItem('guest-onboarding-completed') : true;
      
      if ((!hasSeenOnboarding || justSignedUp) && guestHasSeenOnboarding) {
        // Delay to let the dashboard load
        setTimeout(() => {
          setShowOnboarding(true);
          sessionStorage.removeItem('justSignedUp');
        }, 1000);
      }
    }
  }, [user, isClient]);

  useEffect(() => {
    const checkGuestStatus = async () => {
      if (user) {
        // Check if it's a guest user from localStorage first
        const guestData = localStorage.getItem('guestUser');
        if (guestData && (user.isGuest || user.isAnonymous)) {
          setIsGuest(true);
          
          // Load profile picture from localStorage for guest users
          try {
            const parsed = JSON.parse(guestData);
            if (parsed.profilePicture) {
              setUserProfilePicture(parsed.profilePicture);
            }
          } catch (error) {
            console.error("Error loading guest profile picture:", error);
          }
          return;
        }
        
        // For authenticated users, check Firebase document
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            // If user has a Firebase document, they're not a guest
            setIsGuest(false);
            // Set profile picture from Firestore if available
            if (userData.profilePicture) {
              setUserProfilePicture(userData.profilePicture);
            }
          }
        } catch (error) {
          console.error("Error checking guest status:", error);
        }
      }
    };

    checkGuestStatus();
  }, [user]);

  // Listen for profile picture changes
  useEffect(() => {
    const handleProfilePictureChange = (event: CustomEvent) => {
      const { profilePicture } = event.detail;
      if (profilePicture) {
        setUserProfilePicture(profilePicture);
      }
    };

    window.addEventListener('profilePictureChanged', handleProfilePictureChange as EventListener);
    
    return () => {
      window.removeEventListener('profilePictureChanged', handleProfilePictureChange as EventListener);
    };
  }, []);

  // Removed realtime database presence tracking
  useEffect(() => {
    if (!user || !isClient) return;

    // Set mock active users count
    setActiveUsers(42);

    // Cleanup function (realtime DB cleanup removed)
    return () => {
        // No cleanup needed
    };
  }, [user, isClient]);

  const handleLogout = async () => {
    console.log('=== LOGOUT INITIATED ===');
    console.log('User:', user);
    
    // Set a flag to prevent auth state listeners from interfering
    localStorage.setItem('isLoggingOut', 'true');
    
    if (!user) {
      console.log('No user found, redirecting to home');
      localStorage.removeItem('isLoggingOut');
      window.location.href = '/home';
      return;
    }

    // Handle guest logout
    if (user.isGuest || user.isAnonymous) {
      console.log('Guest user logout');
      localStorage.removeItem('guestUser');
      clearGuestData();
      toast.success("Logged out successfully", {
        description: "You have been signed out of your guest account.",
      });
      localStorage.removeItem('isLoggingOut');
      // Force redirect after a short delay
      setTimeout(() => {
        window.location.href = '/home';
      }, 1000);
      return;
    }

    try {
      console.log('Starting Firebase logout process');
      toast.loading("Logging out...", {
        description: "You are being signed out of your account.",
      });

      // Realtime Database status tracking removed
      console.log('Preparing to sign out');

      // Sign out from Firebase Auth
      console.log('Signing out from Firebase Auth');
      await signOut(auth);
      console.log('Firebase signOut completed');
      
      // Clear any local state
      console.log('Clearing local state');
      clearGuestData();
      
      // Clear localStorage
      localStorage.removeItem('guestUser');
      localStorage.removeItem('showOnboarding');
      localStorage.removeItem('isLoggingOut');
      
      toast.dismiss();
      toast.success("Logged out successfully 👋", {
        description: "You have been signed out of your account.",
      });
      
      // Force redirect with multiple methods
      console.log('Redirecting to home page');
      setTimeout(() => {
        console.log('Executing redirect...');
        window.location.href = '/home';
        // Backup redirect method
        setTimeout(() => {
          if (window.location.pathname !== '/home') {
            console.log('Backup redirect triggered');
            window.location.replace('/home');
          }
        }, 500);
      }, 1000);
      
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('isLoggingOut');
      toast.dismiss();
      toast.error("Logout failed", {
        description: "There was an error signing you out. Please try again.",
      });
      
      // Force redirect even on error
      setTimeout(() => {
        window.location.href = '/home';
      }, 2000);
    }
  };

  const getInitials = (name: string | null | undefined) => {
      if (!name) return "U";
      const parts = name.split(' ');
      if (parts.length > 1) {
          return parts[0][0] + parts[parts.length - 1][0];
      }
      return name[0];
  }

  return (
    <div className="flex items-center gap-2">
      <NotificationBell />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg border-2 border-background/20 hover:shadow-xl transition-all duration-200 min-h-[40px] min-w-[40px] sm:min-h-[48px] sm:min-w-[48px] hover:bg-transparent">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                    {user ? (
                        <>
                            <AvatarImage src={userProfilePicture || user.photoURL || ''} data-ai-hint="student avatar" alt={user.displayName || 'Student'} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-sm sm:text-base">
                                {getInitials(user.displayName || user.email)}
                            </AvatarFallback>
                        </>
                    ) : (
                       <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
                    )}
                </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 sm:w-64 bg-card/95 backdrop-blur-sm border-0 shadow-xl" align="end">
          {user ? (
            <>
              <DropdownMenuLabel className="px-3 sm:px-4 py-2 sm:py-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                    <AvatarImage src={userProfilePicture || user.photoURL || ''} alt={user.displayName || 'Student'} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-xs sm:text-sm">
                      {getInitials(user.displayName || user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <p className="font-semibold truncate text-foreground text-sm sm:text-base">{user.displayName || 'Student User'}</p>
                      {isGuest && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 border-orange-200 flex-shrink-0">
                          Guest
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-normal truncate">
                      {isGuest ? 'Guest User' : (user.email || 'No email')}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              {isGuest && (
                <>
              <DropdownMenuItem asChild className="group px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-primary/15 hover:text-primary hover:shadow-md hover:scale-[1.01] hover:ring-2 hover:ring-primary/20 transition-all duration-150">
                <Link href="/login?state=signup" className="flex items-center gap-2 sm:gap-3">
                  <Shield className="size-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base">Create Account</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
                </>
              )}
              <DropdownMenuItem asChild className="group px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-primary/15 hover:text-primary hover:shadow-md hover:scale-[1.01] hover:ring-2 hover:ring-primary/20 transition-all duration-150">
                <Link href="/dashboard/profile" className="flex items-center gap-2 sm:gap-3">
                  <UserIcon className="size-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base">Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="group px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-primary/15 hover:text-primary hover:shadow-md hover:scale-[1.01] hover:ring-2 hover:ring-primary/20 transition-all duration-150">
                <Link href="/dashboard/settings" className="flex items-center gap-2 sm:gap-3">
                  <SettingsIcon className="size-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base">Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="group px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-primary/15 hover:text-primary hover:shadow-md hover:scale-[1.01] hover:ring-2 hover:ring-primary/20 transition-all duration-150">
                <Link href="/dashboard/notifications" className="flex items-center gap-2 sm:gap-3">
                  <Bell className="size-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base">Notifications</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowOnboarding(true)}
                className="group px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-primary/15 hover:text-primary hover:shadow-md hover:scale-[1.01] hover:ring-2 hover:ring-primary/20 transition-all duration-150"
              >
                <BookOpen className="size-4 mr-2 sm:mr-3 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                <span className="text-sm sm:text-base">Tutorial</span>
                <Badge className="ml-auto bg-blue-500 text-white text-xs">Tips</Badge>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="group px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-destructive/15 hover:shadow-md hover:scale-[1.01] hover:ring-2 hover:ring-destructive/20 transition-all text-destructive focus:text-destructive"
              >
                <LogOut className="size-4 mr-2 sm:mr-3 flex-shrink-0" />
                <span className="text-sm sm:text-base">Logout</span>
              </DropdownMenuItem>
            </>
          ) : (
             <DropdownMenuItem asChild className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-primary/10 transition-colors">
                  <Link href="/login" className="flex items-center gap-2 sm:gap-3">
                    <UserIcon className="size-4 text-primary flex-shrink-0" />
                    <span className="text-sm sm:text-base">Login</span>
                  </Link>
              </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
        <OnboardingSlideshow 
          isOpen={showOnboarding} 
          onClose={() => setShowOnboarding(false)}
          onComplete={() => setShowOnboarding(false)}
        />
    </div>
  );
}

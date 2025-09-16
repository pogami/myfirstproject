
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
import { auth, rtdb, db } from "@/lib/firebase/client";
import { ref, onValue, onDisconnect, set, serverTimestamp } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Skeleton } from "./ui/skeleton";
import { User as UserIcon, Settings as SettingsIcon, LogOut, Bell, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardHeaderProps {
    user: User | null;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const checkGuestStatus = async () => {
      if (user) {
        // Check if it's a guest user from localStorage
        if (user.isGuest || user.isAnonymous) {
          setIsGuest(true);
          return;
        }
        
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setIsGuest(userData.isGuest || false);
          }
        } catch (error) {
          console.error("Error checking guest status:", error);
        }
      }
    };

    checkGuestStatus();
  }, [user]);

  useEffect(() => {
    if (!user || !isClient) return;

    const db = rtdb;
    const userStatusDatabaseRef = ref(db, `/status/${user.uid}`);
    const onlineUsersRef = ref(db, 'status');

    const isOfflineForDatabase = {
        state: 'offline',
        last_changed: serverTimestamp(),
    };

    const isOnlineForDatabase = {
        state: 'online',
        last_changed: serverTimestamp(),
    };

    const connectedRef = ref(db, '.info/connected');
    
    const listener = onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
            onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).then(() => {
                set(userStatusDatabaseRef, isOnlineForDatabase);
            });
        }
    });

    const onlineUsersListener = onValue(onlineUsersRef, (snap) => {
        const users = snap.val();
        if (users) {
            const onlineCount = Object.values(users).filter((u: any) => u.state === 'online').length;
            setActiveUsers(onlineCount);
        } else {
            setActiveUsers(0);
        }
    });

    // Cleanup function
    return () => {
        listener();
        onlineUsersListener();
        if(user) {
            const userStatusRef = ref(db, `/status/${user.uid}`);
            set(userStatusRef, isOfflineForDatabase);
        }
    };
  }, [user, isClient]);

  const handleLogout = async () => {
    if (!user) {
      router.push('/home');
      return;
    }

    // Handle guest logout
    if (user.isGuest || user.isAnonymous) {
      localStorage.removeItem('guestUser');
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your guest account.",
      });
      router.push('/home');
      return;
    }

    try {
      toast({
        title: "Logging out...",
        description: "You are being signed out of your account.",
      });

      // Set user status to offline in Realtime Database
      const userStatusRef = ref(rtdb, `/status/${user.uid}`);
      await set(userStatusRef, {
        state: 'offline',
        last_changed: serverTimestamp(),
      });

      // Sign out from Firebase Auth
      await signOut(auth);
      
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account.",
      });
      
      // Redirect to home page
      router.push('/home');
      
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was an error signing you out. Please try again.",
      });
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
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg border-2 border-background/20 hover:shadow-xl transition-all duration-200 min-h-[40px] min-w-[40px] sm:min-h-[48px] sm:min-w-[48px]">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                    {user ? (
                        <>
                            <AvatarImage src={user.photoURL || ''} data-ai-hint="student avatar" alt={user.displayName || 'Student'} />
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
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'Student'} />
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
                    <p className="text-xs text-muted-foreground font-normal truncate">{user.email || 'Guest User'}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              {isGuest && (
                <>
              <DropdownMenuItem asChild className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-primary/10 transition-colors">
                <Link href="/login?state=signup" className="flex items-center gap-2 sm:gap-3">
                  <Shield className="size-4 text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base">Create Account</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
                </>
              )}
              <DropdownMenuItem asChild className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-primary/10 transition-colors">
                <Link href="/dashboard/profile" className="flex items-center gap-2 sm:gap-3">
                  <UserIcon className="size-4 text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base">Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-primary/10 transition-colors">
                <Link href="/dashboard/settings" className="flex items-center gap-2 sm:gap-3">
                  <SettingsIcon className="size-4 text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base">Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-primary/10 transition-colors">
                <Link href="/dashboard/notifications" className="flex items-center gap-2 sm:gap-3">
                  <Bell className="size-4 text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base">Notifications</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-destructive/10 transition-colors text-destructive focus:text-destructive"
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
    </div>
  );
}

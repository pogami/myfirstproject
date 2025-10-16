'use client';

import { useEffect, useRef, useState } from 'react';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';

export function WebsiteTimeTracker() {
  const [user, setUser] = useState<any>(null);
  const { updateWebsiteTime, trackWebsiteVisit } = useDashboardStats(user);
  const startTimeRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasTrackedVisitRef = useRef<boolean>(false);

  // Handle both guest and authenticated users (same logic as dashboard page)
  useEffect(() => {
    // Check for guest user first (faster than Firebase auth)
    const guestUserData = localStorage.getItem('guestUser');
    if (guestUserData) {
      try {
        const guestUser = JSON.parse(guestUserData);
        console.log("WebsiteTimeTracker: Found guest user in localStorage:", guestUser);
        setUser(guestUser);
        return; // Exit early for guest users
      } catch (error) {
        console.warn("WebsiteTimeTracker: Error parsing guest user data:", error);
        localStorage.removeItem('guestUser');
      }
    }

    // Handle authenticated users
    try {
      const { auth } = require('@/lib/firebase/client-simple');
      if (auth && typeof auth.onAuthStateChanged === 'function') {
        console.log('WebsiteTimeTracker: Setting up auth state listener');
        const unsubscribe = auth.onAuthStateChanged(
          (user: any) => {
            console.log('WebsiteTimeTracker: Auth state changed:', user?.uid);
            setUser(user);
          },
          (error: any) => {
            console.warn("WebsiteTimeTracker: Auth state error:", error);
            setUser(null);
          }
        );
        return unsubscribe;
      } else {
        console.warn('WebsiteTimeTracker: Auth not available');
        setUser(null);
      }
    } catch (authError) {
      console.warn("WebsiteTimeTracker: Auth initialization error:", authError);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    console.log('⏰ WebsiteTimeTracker useEffect triggered');
    console.log('⏰ User:', user);
    console.log('⏰ User isGuest:', user?.isGuest);
    
    if (!user) {
      console.log('⏰ No user, clearing interval');
      // Clear interval if user logs out
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    console.log('⏰ User detected, setting up time tracking');

    // Track website visit on mount
    if (!hasTrackedVisitRef.current) {
      console.log('⏰ Tracking website visit');
      trackWebsiteVisit();
      hasTrackedVisitRef.current = true;
    }

    // Start tracking time
    startTimeRef.current = Date.now();
    console.log('⏰ Started time tracking at:', new Date().toLocaleTimeString());

    // Update time every minute (original design)
    intervalRef.current = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 60000); // 1 minute
      if (timeSpent > 0) {
        console.log('⏰ Updating website time:', timeSpent, 'minutes');
        updateWebsiteTime(timeSpent); // Add minutes directly
        startTimeRef.current = Date.now(); // Reset for next interval
      }
    }, 60000); // Every minute

    // Track time on page unload
    const handleBeforeUnload = () => {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 60000);
      if (timeSpent > 0) {
        updateWebsiteTime(timeSpent);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Final time update
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 60000);
      if (timeSpent > 0) {
        updateWebsiteTime(timeSpent);
      }
    };
  }, [user, updateWebsiteTime, trackWebsiteVisit]);

  return null; // This component doesn't render anything
}

"use client";

import { useEffect, useState } from "react";
import { ensureFirebaseOnline, checkFirebaseConnection } from "@/lib/firebase/client";

// Comprehensive Firebase connection manager
export function FirebaseConnectionManager() {
  const [isOnline, setIsOnline] = useState(true);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    let isMonitoring = true;
    let intervalId: NodeJS.Timeout;
    const maxReconnectAttempts = 10;

    // Check if we're on a page that needs Firebase
    const needsFirebase = () => {
      const path = window.location.pathname;
      return path.startsWith('/dashboard') || 
             path.startsWith('/login') || 
             path.startsWith('/api/') ||
             path.includes('firebase') ||
             document.querySelector('[data-firebase-required]') !== null;
    };

    const monitorConnection = async () => {
      if (!isMonitoring) return;

      // Only monitor Firebase if we're on a page that needs it
      if (!needsFirebase()) {
        return;
      }

      try {
        const isConnected = await checkFirebaseConnection();
        setIsOnline(isConnected);
        
        if (!isConnected) {
          console.log(`🔴 Firebase disconnected, attempting to reconnect (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
          setReconnectAttempts(prev => prev + 1);
          
          if (reconnectAttempts < maxReconnectAttempts) {
            const reconnected = await ensureFirebaseOnline();
            if (reconnected) {
              console.log("✅ Firebase reconnected successfully");
              setReconnectAttempts(0);
              setLastError(null);
              setIsOnline(true);
            } else {
              setLastError("Failed to reconnect to Firebase");
            }
          } else {
            setLastError("Max reconnection attempts reached");
            console.log("❌ Max Firebase reconnection attempts reached");
          }
        } else {
          setReconnectAttempts(0);
          setLastError(null);
        }
      } catch (error: any) {
        console.log("Firebase connection monitor error:", error);
        setLastError(error.message);
      }
    };

    // Start monitoring immediately if needed
    if (needsFirebase()) {
      monitorConnection();
    }

    // Set up periodic monitoring every 15 seconds
    intervalId = setInterval(monitorConnection, 15000);

    // Listen for browser online/offline events
    const handleOnline = () => {
      console.log("🌐 Browser came online, forcing Firebase online");
      setIsOnline(true);
      setReconnectAttempts(0);
      if (needsFirebase()) {
        ensureFirebaseOnline();
      }
    };

    const handleOffline = () => {
      console.log("🔴 Browser went offline");
      setIsOnline(false);
    };

    // Listen for visibility changes (tab focus/blur)
    const handleVisibilityChange = () => {
      if (!document.hidden && needsFirebase()) {
        console.log("👁️ Tab became visible, checking Firebase connection");
        monitorConnection();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Force Firebase online on page load only if needed
    const forceOnlineOnLoad = async () => {
      if (needsFirebase()) {
        console.log("🚀 Page loaded, ensuring Firebase is online");
        await ensureFirebaseOnline();
      }
    };
    
    forceOnlineOnLoad();

    return () => {
      isMonitoring = false;
      clearInterval(intervalId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [reconnectAttempts]);

  // Log connection status changes
  useEffect(() => {
    if (isOnline) {
      console.log("✅ Firebase connection: ONLINE");
    } else {
      console.log("🔴 Firebase connection: OFFLINE");
    }
  }, [isOnline]);

  // This component doesn't render anything visible
  return null;
}

// Hook to get Firebase connection status
export function useFirebaseConnection() {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const isConnected = await checkFirebaseConnection();
      setIsOnline(isConnected);
      return isConnected;
    } catch (error) {
      setIsOnline(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  const forceOnline = async () => {
    setIsChecking(true);
    try {
      const success = await ensureFirebaseOnline();
      setIsOnline(success);
      return success;
    } catch (error) {
      setIsOnline(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  return {
    isOnline,
    isChecking,
    checkConnection,
    forceOnline
  };
}

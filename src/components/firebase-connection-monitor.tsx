"use client";

import { useEffect } from "react";
import { ensureFirebaseOnline, checkFirebaseConnection } from "@/lib/firebase/client";

// Global Firebase connection monitor
export function FirebaseConnectionMonitor() {
  useEffect(() => {
    let isMonitoring = true;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const monitorConnection = async () => {
      if (!isMonitoring) return;

      try {
        const isConnected = await checkFirebaseConnection();
        
        if (!isConnected && reconnectAttempts < maxReconnectAttempts) {
          console.log(`Firebase disconnected, attempting to reconnect (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
          reconnectAttempts++;
          
          const reconnected = await ensureFirebaseOnline();
          if (reconnected) {
            console.log("Firebase reconnected successfully");
            reconnectAttempts = 0; // Reset counter on successful reconnection
          }
        } else if (isConnected) {
          reconnectAttempts = 0; // Reset counter when connected
        }
      } catch (error) {
        console.log("Firebase connection monitor error:", error);
      }

      // Check every 30 seconds
      setTimeout(monitorConnection, 30000);
    };

    // Start monitoring after a short delay
    const initialDelay = setTimeout(monitorConnection, 5000);

    // Listen for online/offline events
    const handleOnline = () => {
      console.log("Browser came online, checking Firebase connection");
      ensureFirebaseOnline();
    };

    const handleOffline = () => {
      console.log("Browser went offline");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      isMonitoring = false;
      clearTimeout(initialDelay);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return null; // This component doesn't render anything
}

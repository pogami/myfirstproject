"use client";

import { useEffect } from "react";
import { db } from "@/lib/firebase/client";

// Global Firebase offline persistence disabler
export function FirebaseOfflineDisabler() {
  useEffect(() => {
    const disableOfflinePersistence = async () => {
      if (!db) return;
      
      try {
        console.log("🔧 Disabling Firebase offline persistence globally...");
        
        // Import Firestore functions
        const { disableNetwork, enableNetwork } = await import('firebase/firestore');
        
        // Disable offline persistence
        await disableNetwork(db);
        console.log("✅ Offline persistence disabled");
        
        // Immediately re-enable network
        await enableNetwork(db);
        console.log("✅ Network enabled - Firebase forced to online mode");
        
        // Set up AGGRESSIVE periodic checks to ensure it stays online
        const interval = setInterval(async () => {
          try {
            await disableNetwork(db);
            await new Promise(resolve => setTimeout(resolve, 50));
            await enableNetwork(db);
            console.log("🔄 Aggressive online enforcement completed");
          } catch (error) {
            console.log("⚠️ Aggressive online enforcement failed:", error);
          }
        }, 5000); // Check every 5 seconds - VERY AGGRESSIVE
        
        return () => clearInterval(interval);
      } catch (error) {
        console.error("❌ Failed to disable offline persistence:", error);
      }
    };
    
    // Run immediately
    disableOfflinePersistence();
    
    // Also run when window comes online, focus, or visibility changes
    const handleOnline = () => {
      console.log("🌐 Browser came online, aggressively ensuring Firebase is online");
      disableOfflinePersistence();
    };
    
    const handleFocus = () => {
      console.log("🎯 Window focused, ensuring Firebase is online");
      disableOfflinePersistence();
    };
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("👁️ Page visible, ensuring Firebase is online");
        disableOfflinePersistence();
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null; // This component doesn't render anything
}

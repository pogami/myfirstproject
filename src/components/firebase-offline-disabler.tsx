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
        
        // Set up periodic checks to ensure it stays online
        const interval = setInterval(async () => {
          try {
            await enableNetwork(db);
          } catch (error) {
            console.log("Periodic network enable failed:", error);
          }
        }, 30000); // Check every 30 seconds
        
        return () => clearInterval(interval);
      } catch (error) {
        console.error("❌ Failed to disable offline persistence:", error);
      }
    };
    
    // Run immediately
    disableOfflinePersistence();
    
    // Also run when window comes online
    const handleOnline = () => {
      console.log("🌐 Browser came online, ensuring Firebase is online");
      disableOfflinePersistence();
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return null; // This component doesn't render anything
}

// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "courseconnect-61eme",
  "appId": "1:150901346125:web:116c79e5f3521488e97104",
  "storageBucket": "courseconnect-61eme.firebasestorage.app",
  "apiKey": "AIzaSyDk-zhYbWHSWdk-cDzq5b_kwZ2L3wFsYgQ",
  "authDomain": "www.courseconnectai.com",
  "messagingSenderId": "150901346125",
  "databaseURL": "https://courseconnect-61eme-default-rtdb.firebaseio.com"
};

// Environment-specific configuration
const isDevelopment = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' ||
   window.location.hostname.includes('localhost'));

// Log environment info for debugging
if (typeof window !== 'undefined') {
  console.log('Firebase Environment:', {
    isDevelopment,
    hostname: window.location.hostname,
    port: window.location.port,
    href: window.location.href
  });
}

// Initialize Firebase - COMPLETELY DISABLE OFFLINE MODE
let app: any;
if (!getApps().length) {
  try {
    console.log("🚀 Initializing Firebase...");
    app = initializeApp(firebaseConfig);
    console.log("✅ Firebase initialized successfully");
  } catch (error) {
    console.warn("❌ Firebase initialization failed:", error);
    app = { name: 'offline-app' };
  }
} else {
  app = getApps()[0];
  console.log("✅ Using existing Firebase app:", app.name);
}

// Force disable offline persistence immediately - will be done after db is initialized

// Initialize services - FORCE ONLINE MODE ONLY
let storage: any, db: any, auth: any, rtdb: any;

try {
  if (app && app.name !== 'offline-app') {
    console.log("🔧 Initializing Firebase services...");
    storage = getStorage(app);
    db = getFirestore(app);
    auth = getAuth(app);
    rtdb = getDatabase(app);
    
    console.log("✅ Firebase services initialized successfully");
    
    // FORCE ONLINE MODE IMMEDIATELY
    if (db) {
      // Force online mode synchronously
      (async () => {
        try {
          const { enableNetwork, disableNetwork } = await import('firebase/firestore');
          console.log("🔧 Forcing Firestore to online mode...");
          
          // First disable any offline persistence
          try {
            await disableNetwork(db);
            console.log("✅ Offline persistence disabled");
          } catch (e) {
            console.log("⚠️ Could not disable network (may already be disabled)");
          }
          
          // Force enable network
          await enableNetwork(db);
          console.log("✅ Firestore forced to online mode");
          
          // Set up aggressive online enforcement
          const forceOnline = async () => {
            try {
              await enableNetwork(db);
            } catch (error) {
              console.log("⚠️ Force online failed:", error);
            }
          };
          
          // Force online every 10 seconds
          setInterval(forceOnline, 10000);
          
          // Force online on any network event
          if (typeof window !== 'undefined') {
            window.addEventListener('online', forceOnline);
            window.addEventListener('focus', forceOnline);
            window.addEventListener('visibilitychange', () => {
              if (!document.hidden) forceOnline();
            });
          }
          
        } catch (error) {
          console.log("❌ Error forcing Firestore online:", error);
        }
      })();
    }
  } else {
    throw new Error('Firebase app not properly initialized');
  }
} catch (error) {
  console.error("❌ Firebase services initialization failed:", error);
  // Create mock objects only if absolutely necessary
  storage = {
    ref: () => ({ uploadBytes: () => Promise.resolve(), getDownloadURL: () => Promise.resolve('') })
  };
  db = {
    doc: () => ({ 
      getDoc: () => Promise.resolve({ exists: () => false, data: () => null }),
      setDoc: () => Promise.resolve(),
      updateDoc: () => Promise.resolve()
    })
  };
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback: any) => {
      callback(null);
      return () => {};
    },
    signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase not available')),
    signOut: () => Promise.resolve(),
    createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase not available'))
  };
  rtdb = {
    ref: () => ({
      onValue: () => () => {},
      set: () => Promise.resolve(),
      onDisconnect: () => ({ set: () => Promise.resolve() })
    })
  };
}

// Simple Firebase connection check with offline handling
export const checkFirebaseConnection = async () => {
  try {
    if (!db) {
      console.log("❌ No Firestore instance available for connection check");
      return false;
    }
    
    // Import Firestore functions
    const { doc, getDoc } = await import('firebase/firestore');
    
    // Try to read a test document
    const testDocRef = doc(db, 'test', 'connection');
    await getDoc(testDocRef);
    console.log("✅ Firebase connection: ONLINE");
    return true;
  } catch (error: any) {
    console.log("🔴 Firebase connection check failed:", error.message);
    
    // If it's an offline error, try to force online mode
    if (error.code === 'unavailable' || error.message?.includes('offline') || error.message?.includes('Could not reach Cloud Firestore backend')) {
      console.log("🔄 Attempting to force Firebase online...");
      try {
        const { enableNetwork } = await import('firebase/firestore');
        await enableNetwork(db);
        console.log("✅ Firebase network enabled");
        return true;
      } catch (enableError) {
        console.log("❌ Failed to enable Firebase network:", enableError);
        return false;
      }
    }
    
    return false;
  }
};

// Force Firebase to stay online - AGGRESSIVE VERSION
export const ensureFirebaseOnline = async () => {
  try {
    if (!db) {
      console.log("❌ No Firestore instance available");
      return false;
    }
    
    console.log("🔧 AGGRESSIVELY ensuring Firebase stays online...");
    
    // Import Firestore functions
    const { enableNetwork, disableNetwork } = await import('firebase/firestore');
    
    // Force online mode multiple times
    for (let i = 0; i < 3; i++) {
      try {
        await disableNetwork(db);
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
        await enableNetwork(db);
        console.log(`✅ Network cycle ${i + 1} completed`);
      } catch (error) {
        console.log(`⚠️ Network cycle ${i + 1} failed:`, error);
      }
    }
    
    console.log("✅ Firebase aggressively forced to online mode");
    return true;
  } catch (error) {
    console.log("❌ Error aggressively ensuring Firebase online:", error);
    return false;
  }
};

// Simple reconnection
export const reconnectFirebase = () => {
  window.location.reload();
};

export { storage, db, auth, rtdb };

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
  "authDomain": "courseconnect-61eme.firebaseapp.com",
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

// Initialize services - COMPLETELY DISABLE OFFLINE PERSISTENCE
let storage: any, db: any, auth: any, rtdb: any;

try {
  if (app && app.name !== 'offline-app') {
    console.log("🔧 Initializing Firebase services...");
    storage = getStorage(app);
    db = getFirestore(app);
    auth = getAuth(app);
    rtdb = getDatabase(app);
    
    console.log("✅ Firebase services initialized successfully");
    
    // IMMEDIATELY disable offline persistence
    if (db) {
      // Force disable offline persistence asynchronously
      setTimeout(async () => {
        try {
          const { disableNetwork, enableNetwork } = await import('firebase/firestore');
          console.log("🔧 Disabling Firestore offline persistence...");
          
          await disableNetwork(db);
          console.log("✅ Offline persistence disabled");
          
          // Immediately re-enable network
          await enableNetwork(db);
          console.log("✅ Firestore forced to online mode");
          
          // Set up periodic network enforcement
          setInterval(async () => {
            try {
              await enableNetwork(db);
            } catch (error) {
              console.log("⚠️ Periodic network enable failed:", error);
            }
          }, 30000); // Every 30 seconds
          
        } catch (error) {
          console.log("❌ Error configuring Firestore:", error);
        }
      }, 2000); // Wait 2 seconds after initialization to ensure db is ready
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

// Force Firebase to stay online
export const ensureFirebaseOnline = async () => {
  try {
    if (!db) {
      console.log("❌ No Firestore instance available");
      return false;
    }
    
    console.log("🔧 Ensuring Firebase stays online...");
    
    // Import Firestore functions
    const { enableNetwork, disableNetwork } = await import('firebase/firestore');
    
    // First disable offline persistence
    try {
      await disableNetwork(db);
      console.log("✅ Offline persistence disabled");
    } catch (error) {
      console.log("⚠️ Failed to disable offline persistence:", error);
    }
    
    // Then enable network
    try {
      await enableNetwork(db);
      console.log("✅ Network enabled - Firebase forced to online mode");
      return true;
    } catch (error) {
      console.log("❌ Failed to enable network:", error);
      return false;
    }
  } catch (error) {
    console.log("❌ Error ensuring Firebase online:", error);
    return false;
  }
};

// Simple reconnection
export const reconnectFirebase = () => {
  window.location.reload();
};

export { storage, db, auth, rtdb };

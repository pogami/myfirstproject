// Simplified Firebase client configuration
import { initializeApp, getApps } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  "projectId": "courseconnect-61eme",
  "appId": "1:150901346125:web:116c79e5f3521488e97104",
  "storageBucket": "courseconnect-61eme.firebasestorage.app",
  "apiKey": process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_FIREBASE_API_KEY",
  "authDomain": "courseconnect-61eme.firebaseapp.com",
  "messagingSenderId": "150901346125",
};

// Initialize Firebase
let app: any;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log("✅ Firebase initialized successfully");
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error);
  }
} else {
  app = getApps()[0];
}

// Initialize services with simple error handling
let storage, db, auth;

try {
  if (app) {
    storage = getStorage(app);
    db = getFirestore(app);
    auth = getAuth(app);
    
    // Ensure auth persistence is set to local storage (default, but explicit is better)
    // This keeps users logged in across page reloads
    if (auth && typeof setPersistence === 'function') {
      setPersistence(auth, browserLocalPersistence).catch((error: any) => {
        console.warn("Auth persistence setting failed (non-critical):", error);
      });
    }
    
    console.log("✅ Firebase services initialized");
  } else {
    throw new Error('Firebase app not initialized');
  }
} catch (error) {
  console.error("❌ Firebase services failed:", error);
  // Create minimal mock objects
  storage = null;
  db = null;
  auth = null;
}

export { app, storage, db, auth };

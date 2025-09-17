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

// Initialize Firebase
let app: any;
if (!getApps().length) {
  try {
    // Check if we're online before initializing Firebase
    if (typeof window !== 'undefined' && !navigator.onLine) {
      console.log("Offline mode - skipping Firebase initialization");
      app = { name: 'offline-app' };
    } else {
      app = initializeApp(firebaseConfig);
    }
  } catch (error) {
    console.warn("Firebase initialization failed (offline mode):", error);
    // Create a minimal app object to prevent crashes
    app = { name: 'offline-app' };
  }
} else {
  app = getApps()[0];
}

// Initialize services with error handling
let storage: any, db: any, auth: any, rtdb: any;

try {
  if (app && app.name !== 'offline-app') {
    storage = getStorage(app);
    db = getFirestore(app);
    auth = getAuth(app);
    rtdb = getDatabase(app);
  } else {
    throw new Error('Firebase app not properly initialized');
  }
} catch (error) {
  console.warn("Firebase services initialization failed (offline mode):", error);
  // Create mock objects to prevent crashes
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
    }
  };
  rtdb = {
    ref: () => ({
      onValue: () => () => {},
      set: () => Promise.resolve(),
      onDisconnect: () => ({ set: () => Promise.resolve() })
    })
  };
}

export { storage, db, auth, rtdb };

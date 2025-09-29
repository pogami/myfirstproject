// Simplified Firebase client configuration
import { initializeApp, getApps } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  "projectId": "courseconnect-61eme",
  "appId": "1:150901346125:web:116c79e5f3521488e97104",
  "storageBucket": "courseconnect-61eme.firebasestorage.app",
  "apiKey": "AIzaSyDk-zhYbWHSWdk-cDzq5b_kwZ2L3wFsYgQ",
  "authDomain": "courseconnect-61eme.firebaseapp.com",
  "messagingSenderId": "150901346125",
  "databaseURL": "https://courseconnect-61eme-default-rtdb.firebaseio.com"
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
let storage, db, auth, rtdb;

try {
  if (app) {
    storage = getStorage(app);
    db = getFirestore(app);
    auth = getAuth(app);
    rtdb = getDatabase(app);
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
  rtdb = null;
}

export { app, storage, db, auth, rtdb };

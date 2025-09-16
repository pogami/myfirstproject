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

// Initialize Firebase
let app;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
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
  storage = getStorage(app);
  db = getFirestore(app);
  auth = getAuth(app);
  rtdb = getDatabase(app);
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

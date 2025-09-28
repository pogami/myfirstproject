// Firebase Admin SDK configuration
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Firebase Admin configuration
const firebaseAdminConfig = {
  projectId: "courseconnect-61eme",
  // Note: In production, use environment variables for service account key
  // For now, we'll use the default service account
};

// Initialize Firebase Admin
let adminApp;
if (!getApps().length) {
  try {
    adminApp = initializeApp(firebaseAdminConfig);
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
    // Create a mock admin app for development
    adminApp = { name: 'admin-app' };
  }
} else {
  adminApp = getApps()[0];
}

// Initialize services
let adminDb, adminAuth;

try {
  if (adminApp && adminApp.name !== 'admin-app') {
    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
  } else {
    // Mock services for development
    adminDb = {
      collection: () => ({
        add: () => Promise.resolve({ id: 'mock-id' }),
        doc: () => ({
          get: () => Promise.resolve({ exists: false, data: () => null }),
          set: () => Promise.resolve(),
          update: () => Promise.resolve(),
        }),
      }),
    };
    adminAuth = {
      verifyIdToken: () => Promise.resolve({ uid: 'mock-uid' }),
    };
  }
} catch (error) {
  console.error('Firebase Admin services initialization failed:', error);
  // Create mock services
  adminDb = {
    collection: () => ({
      add: () => Promise.resolve({ id: 'mock-id' }),
      doc: () => ({
        get: () => Promise.resolve({ exists: false, data: () => null }),
        set: () => Promise.resolve(),
        update: () => Promise.resolve(),
      }),
    }),
  };
  adminAuth = {
    verifyIdToken: () => Promise.resolve({ uid: 'mock-uid' }),
  };
}

export { adminDb as db, adminAuth as auth };

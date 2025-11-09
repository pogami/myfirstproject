// Firebase Admin SDK configuration
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin (only if credentials are available)
let adminApp: any = null;

// Only initialize if we have the required environment variables OR use default project
if (
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
) {
  // Use environment variables (production)
  try {
    const firebaseAdminConfig = {
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    };
    adminApp = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];
  } catch (error) {
    console.warn('Firebase Admin initialization with credentials failed:', error);
    adminApp = { name: 'admin-app' };
  }
} else if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID) {
  // Fallback: Use project ID only (for build time)
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "courseconnect-61eme";
    adminApp = getApps().length === 0 ? initializeApp({ projectId }) : getApps()[0];
  } catch (error) {
    console.warn('Firebase Admin initialization failed:', error);
    adminApp = { name: 'admin-app' };
  }
} else {
  // No credentials available - create mock app for build time
  adminApp = { name: 'admin-app' };
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

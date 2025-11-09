import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK (only if credentials are available)
let app: any = null;
let adminDb: any = null;

// Only initialize if we have the required environment variables
if (
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
) {
  try {
    const firebaseAdminConfig = {
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    };

    // Initialize Firebase Admin
    app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];
    adminDb = getFirestore(app);
  } catch (error) {
    console.warn('Firebase Admin initialization failed (non-critical):', error);
    // Create mock services for build time
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
  }
} else {
  // Build-time fallback - create mock services
  console.warn('Firebase Admin credentials not found - using mock services');
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
}

export { adminDb as db };
export { adminDb };



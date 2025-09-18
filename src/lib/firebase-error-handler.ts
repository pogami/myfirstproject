"use client";

// Global Firebase error handler
export const handleFirebaseError = (error: any, operation: string = "Firebase operation") => {
  console.log(`Firebase ${operation} failed:`, error.message);
  
  // If it's an offline error, try to force online mode
  if (error.code === 'unavailable' || error.message?.includes('offline') || error.message?.includes('Could not reach Cloud Firestore backend')) {
    console.log("🔄 Firebase offline detected, attempting to force online mode...");
    
    // Try to force online mode
    if (typeof window !== 'undefined') {
      import('firebase/firestore').then(({ enableNetwork }) => {
        import('@/lib/firebase/client').then(({ db }) => {
          if (db) {
            enableNetwork(db).then(() => {
              console.log("✅ Firebase network enabled");
            }).catch(() => {
              console.log("⚠️ Failed to enable Firebase network");
            });
          }
        });
      });
    }
  }
  
  return null;
};

// Safe Firebase operation wrapper with better error handling
export const safeFirebaseOperation = async <T>(
  operation: () => Promise<T>, 
  operationName: string = "Firebase operation",
  fallback?: () => void
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error: any) {
    handleFirebaseError(error, operationName);
    if (fallback) fallback();
    return null;
  }
};

// Check if a Firebase result is valid
export const isValidFirebaseResult = (result: any): boolean => {
  return result !== null && result !== undefined && typeof result === 'object';
};

// Safe document snapshot checker
export const safeDocumentExists = (docSnap: any): boolean => {
  return isValidFirebaseResult(docSnap) && typeof docSnap.exists === 'function' && docSnap.exists();
};

// Safe document data getter
export const safeDocumentData = (docSnap: any): any => {
  if (safeDocumentExists(docSnap)) {
    return docSnap.data();
  }
  return null;
};

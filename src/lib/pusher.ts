import Pusher from 'pusher-js';

// Initialize Pusher client with error handling
let pusher: Pusher | null = null;

// Function to initialize Pusher
function initializePusher(userId?: string, userName?: string, userPhotoURL?: string): Pusher | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (pusher) {
    return pusher; // Return existing instance if already initialized
  }

  // Use environment variables for Pusher credentials (with fallback)
  const appKey = process.env.NEXT_PUBLIC_PUSHER_KEY || '1e4d1e2b0527bdbbbea7';
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2';
  
  console.log('Pusher initialization with credentials:', {
    appKey,
    cluster,
    usingEnvVars: !!process.env.NEXT_PUBLIC_PUSHER_KEY,
    allEnvVars: {
      NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY,
      NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      PUSHER_APP_ID: process.env.PUSHER_APP_ID,
      PUSHER_KEY: process.env.PUSHER_KEY,
      PUSHER_SECRET: process.env.PUSHER_SECRET,
      PUSHER_CLUSTER: process.env.PUSHER_CLUSTER
    }
  });
  
  if (appKey && cluster) {
    try {
      pusher = new Pusher(appKey, {
        cluster: cluster,
        forceTLS: true,
        authEndpoint: '/api/pusher/auth',
        auth: {
          headers: {
            'Content-Type': 'application/json',
            ...(userId && { 'x-user-id': userId }),
            ...(userName && { 'x-user-name': userName }),
            ...(userPhotoURL && { 'x-user-photo': userPhotoURL }),
          }
        }
      });
      
      console.log('Pusher initialized successfully');
      return pusher;
    } catch (error) {
      console.error('Failed to initialize Pusher:', error);
      return null;
    }
  } else {
    console.error('Missing Pusher environment variables:', { 
      appKey, 
      cluster,
      NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY,
      NEXT_PUBLIC_PUSHER_APP_KEY: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
      NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    });
    return null;
  }
}

// Initialize Pusher on demand (not immediately)
// pusher = initializePusher();

export { pusher, initializePusher };
export default pusher;
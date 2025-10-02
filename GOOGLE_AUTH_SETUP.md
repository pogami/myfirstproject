# Google Authentication Setup Guide

## Issue: "The requested action is invalid" on localhost

This error occurs when Firebase/Google OAuth is not properly configured for localhost development.

## Solution Steps

### 1. Firebase Console Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `courseconnect-61eme`
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Add these domains:
   - `localhost` (for localhost:9002)
   - `127.0.0.1` (alternative localhost)
   - `localhost:9002` (specific port)

### 2. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `courseconnect-61eme`
3. Navigate to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID
5. Add these **Authorized JavaScript origins**:
   - `http://localhost:9002`
   - `http://127.0.0.1:9002`
   - `https://courseconnect-fsh64ahg1-pogamis-projects.vercel.app` (Vercel)

6. Add these **Authorized redirect URIs**:
   - `http://localhost:9002/__/auth/handler`
   - `http://127.0.0.1:9002/__/auth/handler`
   - `https://courseconnect-fsh64ahg1-pogamis-projects.vercel.app/__/auth/handler`

### 3. Verify Firebase Configuration

Your current Firebase config in `src/lib/firebase/client.ts`:
```typescript
const firebaseConfig = {
  "projectId": "courseconnect-61eme",
  "appId": "1:150901346125:web:116c79e5f3521488e97104",
  "storageBucket": "courseconnect-61eme.firebasestorage.app",
  "apiKey": "YOUR_FIREBASE_API_KEY",
  "authDomain": "courseconnect-61eme.firebaseapp.com",
  "messagingSenderId": "150901346125",
  "databaseURL": "https://courseconnect-61eme-default-rtdb.firebaseio.com"
};
```

### 4. Test the Fix

1. Restart your development server: `npm run dev`
2. Navigate to `http://localhost:9002/login`
3. Try Google sign-in
4. Check browser console for any remaining errors

### 5. Common Issues & Solutions

**Issue**: "unauthorized-domain"
- **Solution**: Add `localhost` to Firebase authorized domains

**Issue**: "invalid_request" 
- **Solution**: Add `http://localhost:9002` to Google Cloud Console authorized origins

**Issue**: "popup_closed_by_user"
- **Solution**: This is normal if user cancels - not an error

**Issue**: "operation-not-allowed"
- **Solution**: Enable Google sign-in in Firebase Authentication → Sign-in method

### 6. Alternative: Use Firebase Auth Emulator (Development)

For local development, you can use Firebase Auth Emulator:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Run: `firebase emulators:start --only auth`
3. Update your Firebase config to use emulator:
   ```typescript
   if (process.env.NODE_ENV === 'development') {
     connectAuthEmulator(auth, "http://localhost:9099");
   }
   ```

## Quick Fix Commands

```bash
# Restart development server
npm run dev

# Check if localhost:9002 is running
netstat -ano | findstr :9002

# If port is busy, kill the process
taskkill /PID <PID> /F
```

## Verification Checklist

- [ ] Firebase Console: `localhost` added to authorized domains
- [ ] Google Cloud Console: `http://localhost:9002` added to authorized origins
- [ ] Development server running on port 9002
- [ ] No browser console errors
- [ ] Google sign-in popup opens successfully
- [ ] User can complete authentication flow

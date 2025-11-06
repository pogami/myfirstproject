# Simple Google Auth Fix - No New Projects Needed

## Current Issue
Google sign-in is failing on `www.courseconnectai.com`. Let's fix the existing setup without creating new projects.

## Step 1: Check Current Error

1. Go to `https://www.courseconnectai.com/login`
2. Click "Sign in with Google"
3. Check browser console (F12) for the exact error message
4. Share the error code and message

## Step 2: Firebase Console Fix

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `courseconnect-61eme`
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Make sure these domains are added:
   - `www.courseconnectai.com`
   - `courseconnect-3ch3u7yta-pogamis-projects.vercel.app`

## Step 3: Google Cloud Console Fix

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `courseconnect-61eme`
3. Go to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID (Web application)
5. Click **Edit**

### Authorized JavaScript origins:
Add these URLs:
- `https://www.courseconnectai.com`
- `https://courseconnect-3ch3u7yta-pogamis-projects.vercel.app`

### Authorized redirect URIs:
Add these URLs:
- `https://www.courseconnectai.com/__/auth/handler`
- `https://courseconnect-3ch3u7yta-pogamis-projects.vercel.app/__/auth/handler`

## Step 4: OAuth Consent Screen Fix

1. In Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
2. Make sure:
   - **App name**: CourseConnect AI
   - **User support email**: `courseconnect.noreply@gmail.com`
   - **Developer contact information**: `courseconnect.noreply@gmail.com`
3. Add test users:
   - `courseconnect.noreply@gmail.com`
   - Any other emails you want to test with

## Step 5: Firebase Authentication Fix

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Google** provider
3. Make sure it's **Enabled**
4. The Web SDK configuration should show the correct OAuth client ID

## Step 6: Test the Fix

1. Go to `https://www.courseconnectai.com/login`
2. Click "Sign in with Google"
3. Use `courseconnect.noreply@gmail.com`
4. Check browser console for any errors

## Common Error Codes and Fixes

### `auth/unauthorized-domain`
**Fix**: Add `www.courseconnectai.com` to Firebase authorized domains

### `auth/operation-not-allowed`
**Fix**: Enable Google provider in Firebase Authentication

### `auth/invalid-action` or `redirect_uri_mismatch`
**Fix**: Add correct redirect URIs in Google Cloud Console

### `auth/access-blocked`
**Fix**: Add your email to OAuth consent screen test users

### `auth/configuration-not-found`
**Fix**: Check OAuth client ID in Firebase Google provider settings

## Current Firebase Configuration (Keep This)

Your current config in `src/lib/firebase/client-simple.ts` is correct:
```javascript
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

## Quick Checklist

- [ ] `www.courseconnectai.com` in Firebase authorized domains
- [ ] `https://www.courseconnectai.com` in Google Cloud OAuth origins
- [ ] `https://www.courseconnectai.com/__/auth/handler` in Google Cloud redirect URIs
- [ ] Google provider enabled in Firebase
- [ ] OAuth consent screen configured with correct email
- [ ] Test user added to OAuth consent screen

## Next Steps

1. **First**: Check the exact error message on production
2. **Then**: Apply the specific fix for that error
3. **Finally**: Test Google sign-in again

## Support

Please share:
1. The exact error message from browser console on `www.courseconnectai.com`
2. Which step you're stuck on
3. Screenshots of any error messages

This approach keeps your existing project and just fixes the OAuth configuration!

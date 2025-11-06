# Google Authentication 404 Error Fix

## Issue
Google authentication is returning a 404 error, which typically indicates OAuth configuration issues.

## Root Cause
The 404 error is usually caused by:
1. Incorrect Firebase authDomain configuration
2. Missing OAuth redirect URIs in Google Cloud Console
3. Unauthorized domains in Firebase Console

## Fixes Applied

### 1. Updated Firebase Configuration
Changed `authDomain` from `www.courseconnectai.com` to `courseconnect-61eme.firebaseapp.com` in `src/lib/firebase/client.ts`.

### 2. Enhanced Error Handling
Added specific 404 error detection and detailed configuration guidance in the auth form.

### 3. Improved Logging
Added comprehensive logging to help debug authentication issues.

## Required Configuration Steps

### Firebase Console Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `courseconnect-61eme`
3. Navigate to Authentication → Settings
4. Under "Authorized domains", add:
   - `localhost`
   - `127.0.0.1`
   - `www.courseconnectai.com` (if using production domain)

### Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `courseconnect-61eme`
3. Navigate to APIs & Services → Credentials
4. Find your OAuth 2.0 Client ID
5. Under "Authorized JavaScript origins", add:
   - `http://localhost:3000`
   - `http://localhost:3001`
   - `https://www.courseconnectai.com` (if using production domain)
6. Under "Authorized redirect URIs", add:
   - `http://localhost:3000/__/auth/handler`
   - `http://localhost:3001/__/auth/handler`
   - `https://www.courseconnectai.com/__/auth/handler` (if using production domain)

### Enable Google Sign-In
1. In Firebase Console → Authentication → Sign-in method
2. Enable "Google" provider
3. Add your OAuth client ID and secret (if not already configured)

## Testing
1. Clear browser cache and cookies
2. Try Google sign-in again
3. Check browser console for detailed error messages
4. Verify the configuration steps above

## Common Issues
- **404 Error**: Usually means OAuth redirect URI is not configured
- **Unauthorized Domain**: Add localhost to Firebase authorized domains
- **Popup Blocked**: Ensure popups are allowed for the site
- **Network Error**: Check internet connection and firewall settings

## Debug Information
The auth form now logs detailed information including:
- Current domain and port
- Full error details
- Stack trace
- Configuration guidance

Check the browser console for these logs when testing.

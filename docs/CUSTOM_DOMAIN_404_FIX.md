# Custom Domain 404 Error Fix

## Issue
Getting 404 error when using custom domain `www.courseconnectai.com` for Google authentication.

## Root Cause
The 404 error occurs because the custom domain is not properly configured in Firebase Hosting and OAuth settings.

## Fixes Applied

### 1. Updated Firebase Configuration
Changed `authDomain` to `www.courseconnectai.com` in `src/lib/firebase/client.ts`.

### 2. Enhanced Error Messages
Added specific guidance for custom domain configuration in error handling.

## Required Configuration Steps

### Firebase Console Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `courseconnect-61eme`
3. Navigate to Authentication → Settings
4. Under "Authorized domains", add:
   - `localhost`
   - `www.courseconnectai.com`
   - `courseconnectai.com` (if using both)

### Firebase Hosting Setup
1. In Firebase Console → Hosting
2. Click "Add custom domain"
3. Add `www.courseconnectai.com`
4. Follow the DNS configuration steps
5. Wait for SSL certificate to be provisioned

### Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `courseconnect-61eme`
3. Navigate to APIs & Services → Credentials
4. Find your OAuth 2.0 Client ID
5. Under "Authorized JavaScript origins", add:
   - `http://localhost:3000`
   - `https://www.courseconnectai.com`
6. Under "Authorized redirect URIs", add:
   - `http://localhost:3000/__/auth/handler`
   - `https://www.courseconnectai.com/__/auth/handler`

### DNS Configuration
1. In your domain registrar (where you bought courseconnectai.com)
2. Add a CNAME record:
   - Name: `www`
   - Value: `courseconnect-61eme.web.app`
3. Or add an A record pointing to Firebase Hosting IP

## Testing Steps
1. Verify domain is accessible: `https://www.courseconnectai.com`
2. Check SSL certificate is active
3. Test Google sign-in
4. Check browser console for errors

## Common Issues
- **404 Error**: Domain not configured in Firebase Hosting
- **SSL Error**: Certificate not yet provisioned
- **DNS Error**: Domain not pointing to Firebase
- **OAuth Error**: Redirect URIs not configured

## Alternative Solution
If custom domain setup is complex, you can temporarily use:
- `authDomain: "courseconnect-61eme.firebaseapp.com"`
- This will show "Continue to courseconnect-61eme.firebaseapp.com" in OAuth

## Debug Information
The auth form now provides detailed configuration guidance for custom domain setup.

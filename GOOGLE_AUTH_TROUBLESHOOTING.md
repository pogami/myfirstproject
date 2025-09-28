# Google Authentication Troubleshooting Guide

## Current Status
Reverted to default Firebase domain: `courseconnect-61eme.firebaseapp.com`

## Step-by-Step Fix

### 1. Firebase Console Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `courseconnect-61eme`
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Google** provider if not already enabled
5. Go to **Authentication** → **Settings** → **Authorized domains**
6. Add `localhost` if not present

### 2. Google Cloud Console Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `courseconnect-61eme`
3. Navigate to **APIs & Services** → **Credentials**
4. Find your **OAuth 2.0 Client ID** (Web application)
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000`
   - `http://localhost:3001`
   - `https://courseconnect-61eme.firebaseapp.com`
6. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/__/auth/handler`
   - `http://localhost:3001/__/auth/handler`
   - `https://courseconnect-61eme.firebaseapp.com/__/auth/handler`

### 3. Test the Configuration
1. Clear browser cache and cookies
2. Restart your development server
3. Try Google sign-in again
4. Check browser console for any errors

### 4. Common Issues and Solutions

#### Issue: "This app is not verified"
- **Solution**: This is normal for development. Click "Advanced" → "Go to courseconnect-61eme.firebaseapp.com (unsafe)"

#### Issue: "Popup blocked"
- **Solution**: Allow popups for localhost in your browser settings

#### Issue: "Network error"
- **Solution**: Check internet connection and firewall settings

#### Issue: "Invalid client"
- **Solution**: Verify OAuth client ID in Firebase Console → Authentication → Sign-in method → Google

### 5. Debug Information
The auth form now logs detailed information. Check browser console for:
- Current domain and port
- Error codes and messages
- Configuration guidance

### 6. Alternative Testing
If Google sign-in still doesn't work:
1. Try email/password authentication first
2. Use guest login option
3. Check if other OAuth providers (Microsoft) work

## Next Steps
Once Google authentication is working with the default domain, we can configure the custom domain `www.courseconnectai.com` properly.

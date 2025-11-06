# Google Authentication Fix Guide

## Current Issue
Google sign-in is failing with "Authentication Failed" error. This is typically due to OAuth configuration issues.

## Step-by-Step Fix

### 1. Firebase Console Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `courseconnect-61eme`
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add these domains:
   - `localhost` (for local development)
   - `www.courseconnectai.com` (for production)
   - `courseconnect-3ch3u7yta-pogamis-projects.vercel.app` (for Vercel deployment)

### 2. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `courseconnect-61eme`
3. Go to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID (Web application)
5. Click **Edit**

#### Authorized JavaScript origins:
Add these URLs:
- `http://localhost:9002`
- `https://www.courseconnectai.com`
- `https://courseconnect-3ch3u7yta-pogamis-projects.vercel.app`

#### Authorized redirect URIs:
Add these URLs:
- `http://localhost:9002/__/auth/handler`
- `https://www.courseconnectai.com/__/auth/handler`
- `https://courseconnect-3ch3u7yta-pogamis-projects.vercel.app/__/auth/handler`

### 3. Firebase Authentication Settings

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Google** provider
3. Make sure the **Web SDK configuration** is correct
4. Copy the **Web client ID** and **Web client secret**

### 4. Test the Configuration

1. Restart your development server: `npm run dev`
2. Go to `http://localhost:9002/login`
3. Click "Sign in with Google"
4. Check the browser console for detailed error messages

### 5. Common Error Codes and Solutions

- **auth/unauthorized-domain**: Add `localhost` to Firebase authorized domains
- **auth/operation-not-allowed**: Enable Google provider in Firebase
- **redirect_uri_mismatch**: Add correct redirect URIs in Google Cloud Console
- **auth/invalid-action**: Check OAuth configuration in Google Cloud Console
- **auth/network-request-failed**: Check internet connection and firewall settings

### 6. Production Deployment

For production deployment, make sure to:
1. Add your production domain to Firebase authorized domains
2. Add your production URLs to Google Cloud Console OAuth settings
3. Update any hardcoded localhost URLs in your code

## Current Firebase Configuration

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

## Next Steps

1. Follow the configuration steps above
2. Test Google sign-in on localhost:9002
3. Check browser console for specific error messages
4. If issues persist, share the exact error code and message from the console

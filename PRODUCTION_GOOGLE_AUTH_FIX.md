# Fix Google Auth for www.courseconnectai.com

## Current Issue
Google sign-in needs to work on the production domain `www.courseconnectai.com` with `courseconnect.noreply@gmail.com`.

## Step 1: Firebase Console Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `courseconnect-61eme`
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Make sure these domains are added:
   - `www.courseconnectai.com`
   - `courseconnect-3ch3u7yta-pogamis-projects.vercel.app` (Vercel deployment)

## Step 2: Google Cloud Console Configuration

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

## Step 3: OAuth Consent Screen Configuration

1. In Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
2. Configure the app with:
   - **App name**: CourseConnect AI
   - **User support email**: `courseconnect.noreply@gmail.com`
   - **Developer contact information**: `courseconnect.noreply@gmail.com`
3. Add scopes:
   - `email`
   - `profile`
   - `openid`
4. Add test users:
   - `courseconnect.noreply@gmail.com`
   - Any other emails you want to test with

## Step 4: Firebase Authentication Settings

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Google** provider
3. Make sure it's **Enabled**
4. The Web SDK configuration should show:
   - **Web client ID**: (from Google Cloud Console)
   - **Web client secret**: (from Google Cloud Console)

## Step 5: Test on Production

1. Go to `https://www.courseconnectai.com/login`
2. Click "Sign in with Google"
3. Use `courseconnect.noreply@gmail.com`
4. Check browser console for any errors

## Step 6: Common Production Issues and Fixes

### Issue: "Unauthorized domain"
**Fix**: Add `www.courseconnectai.com` to Firebase authorized domains

### Issue: "Invalid client"
**Fix**: Check OAuth client ID in Firebase Google provider settings

### Issue: "Redirect URI mismatch"
**Fix**: Add `https://www.courseconnectai.com/__/auth/handler` to Google Cloud Console

### Issue: "Access blocked"
**Fix**: Add `courseconnect.noreply@gmail.com` to OAuth consent screen test users

### Issue: "App not authorized"
**Fix**: Make sure Google provider is enabled in Firebase

## Step 7: Verify Production Configuration

After making changes, verify:

1. **Firebase Console**:
   - Google provider is enabled
   - `www.courseconnectai.com` is in authorized domains
   - Web SDK configuration is correct

2. **Google Cloud Console**:
   - OAuth 2.0 Client ID has `https://www.courseconnectai.com` in origins
   - OAuth 2.0 Client ID has `https://www.courseconnectai.com/__/auth/handler` in redirect URIs
   - OAuth consent screen has correct email and test users
   - Required APIs are enabled

3. **Production Site**:
   - No JavaScript errors in browser console
   - Firebase initializes correctly
   - Google sign-in popup appears

## Current Firebase Configuration

Your current config in `src/lib/firebase/client-simple.ts`:
```javascript
const firebaseConfig = {
  "projectId": "courseconnect-61eme",
  "appId": "1:150901346125:web:116c79e5f3521488e97104",
  "storageBucket": "courseconnect-61eme.firebasestorage.app",
  "apiKey": "AIzaSyDk-zhYbWHSWdk-cDzq5b_kwZ2L3wFsYgQ",
  "authDomain": "courseconnect-61eme.firebaseapp.com",
  "messagingSenderId": "150901346125",
  "databaseURL": "https://courseconnect-61eme-default-rtdb.firebaseio.com"
};
```

## Production URLs to Configure

### Firebase Authorized Domains:
- `www.courseconnectai.com`
- `courseconnect-3ch3u7yta-pogamis-projects.vercel.app`

### Google Cloud OAuth Origins:
- `https://www.courseconnectai.com`
- `https://courseconnect-3ch3u7yta-pogamis-projects.vercel.app`

### Google Cloud OAuth Redirect URIs:
- `https://www.courseconnectai.com/__/auth/handler`
- `https://courseconnect-3ch3u7yta-pogamis-projects.vercel.app/__/auth/handler`

## Next Steps

1. Follow the configuration steps above
2. Test Google sign-in on `https://www.courseconnectai.com/login`
3. Check browser console for specific error messages
4. If issues persist, share the exact error code and message

## Quick Test

```bash
# Test on production
# Go to https://www.courseconnectai.com/login
# Click "Sign in with Google"
# Use courseconnect.noreply@gmail.com
```

## Support

If you need help with any step, share:
1. The exact error message from browser console on production
2. Which step you're stuck on
3. Screenshots of Firebase/Google Cloud Console settings

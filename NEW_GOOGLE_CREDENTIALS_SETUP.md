# Setting Up New Google OAuth Credentials

## Step 1: Create New Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "CourseConnect AI - New")
4. Click "Create"

## Step 2: Enable Required APIs

1. In your new project, go to **APIs & Services** → **Library**
2. Search and enable:
   - **Google+ API** (for user profile info)
   - **People API** (for user profile info)

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
3. If prompted, configure OAuth consent screen:
   - Choose **External** user type
   - Fill in app name: "CourseConnect AI"
   - Add your new email as developer contact
   - Add scopes: `email`, `profile`, `openid`
   - Add test users (your new email)

## Step 4: Configure OAuth Client

1. Application type: **Web application**
2. Name: "CourseConnect AI Web Client"
3. **Authorized JavaScript origins:**
   - `http://localhost:9002`
   - `https://www.courseconnectai.com`
   - `https://courseconnect-3ch3u7yta-pogamis-projects.vercel.app`
4. **Authorized redirect URIs:**
   - `http://localhost:9002/__/auth/handler`
   - `https://www.courseconnectai.com/__/auth/handler`
   - `https://courseconnect-3ch3u7yta-pogamis-projects.vercel.app/__/auth/handler`

## Step 5: Create New Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "courseconnect-new")
4. Choose your new Google Cloud project
5. Enable Google Analytics (optional)
6. Click "Create project"

## Step 6: Configure Firebase Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Google** provider
3. Add your new OAuth client ID and secret
4. Go to **Settings** → **Authorized domains**
5. Add:
   - `localhost`
   - `www.courseconnectai.com`
   - `courseconnect-3ch3u7yta-pogamis-projects.vercel.app`

## Step 7: Update Firebase Configuration

Replace the Firebase config in `src/lib/firebase/client-simple.ts` with your new project's config:

```javascript
const firebaseConfig = {
  "projectId": "your-new-project-id",
  "appId": "your-new-app-id",
  "storageBucket": "your-new-project.firebasestorage.app",
  "apiKey": "your-new-api-key",
  "authDomain": "your-new-project.firebaseapp.com",
  "messagingSenderId": "your-new-sender-id",
  "databaseURL": "https://your-new-project-default-rtdb.firebaseio.com"
};
```

## Step 8: Test the Setup

1. Restart your dev server: `npm run dev`
2. Go to `http://localhost:9002/login`
3. Try Google sign-in with your new email
4. Check console for any errors

## Alternative: Use Existing Project with New Email

If you want to keep using the existing Firebase project but with a new email:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select existing project: `courseconnect-61eme`
3. Go to **Authentication** → **Users**
4. Add your new email as a test user
5. Or just sign up with Google using your new email

## Troubleshooting

- **"Unauthorized domain"**: Add `localhost` to Firebase authorized domains
- **"Invalid client"**: Check OAuth client ID in Firebase Google provider settings
- **"Redirect URI mismatch"**: Add correct redirect URIs in Google Cloud Console
- **"Access blocked"**: Add your email to OAuth consent screen test users

## Quick Test

After setup, test with:
1. `http://localhost:9002/login`
2. Click "Sign in with Google"
3. Use your new email
4. Check browser console for errors

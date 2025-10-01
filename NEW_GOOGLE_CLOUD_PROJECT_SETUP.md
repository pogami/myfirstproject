# Set Up New Google Cloud Project with courseconnect.noreply@gmail.com

## Step 1: Create New Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with `courseconnect.noreply@gmail.com`
3. Click "Select a project" → "New Project"
4. Enter project name: `CourseConnect AI`
5. Click "Create"

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
   - Add `courseconnect.noreply@gmail.com` as developer contact
   - Add scopes: `email`, `profile`, `openid`
   - Add test users: `courseconnect.noreply@gmail.com`

## Step 4: Configure OAuth Client

1. Application type: **Web application**
2. Name: "CourseConnect AI Web Client"
3. **Authorized JavaScript origins:**
   - `https://www.courseconnectai.com`
   - `https://courseconnect-3ch3u7yta-pogamis-projects.vercel.app`
4. **Authorized redirect URIs:**
   - `https://www.courseconnectai.com/__/auth/handler`
   - `https://courseconnect-3ch3u7yta-pogamis-projects.vercel.app/__/auth/handler`

## Step 5: Create New Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Sign in with `courseconnect.noreply@gmail.com`
3. Click "Add project"
4. Enter project name: `courseconnect-new`
5. Choose your new Google Cloud project
6. Enable Google Analytics (optional)
7. Click "Create project"

## Step 6: Configure Firebase Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Google** provider
3. Add your new OAuth client ID and secret from Step 3
4. Go to **Settings** → **Authorized domains**
5. Add:
   - `www.courseconnectai.com`
   - `courseconnect-3ch3u7yta-pogamis-projects.vercel.app`

## Step 7: Get New Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → Web app (</> icon)
4. Register app name: "CourseConnect AI Web"
5. Copy the Firebase configuration

## Step 8: Update Firebase Configuration in Code

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

## Step 9: Test the New Configuration

1. Update the Firebase config in your code
2. Deploy to production: `git push origin master`
3. Go to `https://www.courseconnectai.com/login`
4. Try Google sign-in with `courseconnect.noreply@gmail.com`
5. Check console for any errors

## Step 10: Update Database and Storage

If you have existing data, you'll need to:

1. **Export data** from old Firebase project
2. **Import data** to new Firebase project
3. **Update storage** references if using Firebase Storage
4. **Update database** references if using Firestore

## Alternative: Transfer Existing Project

If you want to keep the existing project but change ownership:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project `courseconnect-61eme`
3. Go to **Project Settings** → **Users and permissions**
4. Add `courseconnect.noreply@gmail.com` as owner
5. Remove old email if needed

## Current vs New Configuration

### Current (courseconnect-61eme):
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

### New (to be created):
```javascript
const firebaseConfig = {
  "projectId": "courseconnect-new", // or whatever you name it
  "appId": "your-new-app-id",
  "storageBucket": "courseconnect-new.firebasestorage.app",
  "apiKey": "your-new-api-key",
  "authDomain": "courseconnect-new.firebaseapp.com",
  "messagingSenderId": "your-new-sender-id",
  "databaseURL": "https://courseconnect-new-default-rtdb.firebaseio.com"
};
```

## Next Steps

1. Create new Google Cloud project with `courseconnect.noreply@gmail.com`
2. Create new Firebase project
3. Get new Firebase configuration
4. Update code with new config
5. Test on production
6. Migrate data if needed

## Support

If you need help with any step, share:
1. Which step you're stuck on
2. Any error messages
3. Screenshots of the setup process

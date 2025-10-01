# Link Existing Firebase Project to New Google Cloud Project

## Current Situation
- You have an existing Firebase project: `courseconnect-61eme`
- You created a new Google Cloud project with `courseconnect.noreply@gmail.com`
- You want to link the existing Firebase project to the new Google Cloud project

## Step 1: Access Firebase Console with New Email

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Sign in with `courseconnect.noreply@gmail.com`
3. You should see the existing project `courseconnect-61eme` (if you have access)

## Step 2: Check Project Ownership

1. In Firebase Console, select project `courseconnect-61eme`
2. Go to **Project Settings** (gear icon) → **Users and permissions**
3. Check if `courseconnect.noreply@gmail.com` is listed as an owner

## Step 3: Add New Email as Owner (if not already)

1. In **Users and permissions**, click **Add member**
2. Add `courseconnect.noreply@gmail.com`
3. Set role to **Owner**
4. Click **Add member**

## Step 4: Link to New Google Cloud Project

1. In Firebase Console, go to **Project Settings** → **General**
2. Scroll down to **Project resources**
3. Click **Change** next to "Google Cloud Platform (GCP) resource location"
4. Select your new Google Cloud project
5. Click **Save**

## Step 5: Update OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with `courseconnect.noreply@gmail.com`
3. Select your new Google Cloud project
4. Go to **APIs & Services** → **Credentials**
5. Create new OAuth 2.0 Client ID or update existing one

## Step 6: Configure OAuth for Production

1. **Authorized JavaScript origins:**
   - `https://www.courseconnectai.com`
   - `https://courseconnect-3ch3u7yta-pogamis-projects.vercel.app`

2. **Authorized redirect URIs:**
   - `https://www.courseconnectai.com/__/auth/handler`
   - `https://courseconnect-3ch3u7yta-pogamis-projects.vercel.app/__/auth/handler`

## Step 7: Update Firebase Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Google** provider
3. Update the Web SDK configuration with new OAuth client ID and secret
4. Go to **Settings** → **Authorized domains**
5. Make sure `www.courseconnectai.com` is listed

## Step 8: Test the Configuration

1. Go to `https://www.courseconnectai.com/login`
2. Click "Sign in with Google"
3. Use `courseconnect.noreply@gmail.com`
4. Check browser console for any errors

## Alternative: Transfer Project Ownership

If you can't access the existing project:

1. Ask the current owner to add `courseconnect.noreply@gmail.com` as owner
2. Or create a new Firebase project and migrate data

## Current Firebase Configuration (Keep This)

Your current config in `src/lib/firebase/client-simple.ts` should remain the same:

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

## What This Achieves

- Keeps your existing Firebase project and data
- Links it to your new Google Cloud project
- Allows you to manage OAuth with `courseconnect.noreply@gmail.com`
- Maintains all existing functionality

## Troubleshooting

### Issue: Can't see existing project
**Solution**: You need to be added as an owner by the current project owner

### Issue: Can't change GCP resource location
**Solution**: Make sure you have owner permissions on both Firebase and Google Cloud projects

### Issue: OAuth not working
**Solution**: Update the OAuth client ID in Firebase Authentication settings

## Next Steps

1. Try to access the existing Firebase project with your new email
2. If you can access it, follow the linking steps above
3. If you can't access it, you'll need to create a new project or get added as owner
4. Test Google sign-in on production

## Support

If you need help with any step, share:
1. Whether you can see the existing Firebase project with your new email
2. Any error messages you encounter
3. Screenshots of the Firebase Console interface

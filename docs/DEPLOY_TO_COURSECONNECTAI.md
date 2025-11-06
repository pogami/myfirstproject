# Deploy CourseConnect AI to www.courseconnectai.com

## GitHub Repository ✅
**Repository**: https://github.com/pogami/myfirstproject.git
**Status**: Up to date with latest changes

## Vercel Deployment Steps

### 1. Connect GitHub to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Click **"Import Git Repository"**
4. Select **"pogami/myfirstproject"** from GitHub
5. Click **"Import"**

### 2. Configure Project Settings
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3. Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

```
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=courseconnect-61eme.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=courseconnect-61eme
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=courseconnect-61eme.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=150901346125
NEXT_PUBLIC_FIREBASE_APP_ID=1:150901346125:web:116c79e5f3521488e97104
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://courseconnect-61eme-default-rtdb.firebaseio.com
```

### 4. Deploy to Vercel
1. Click **"Deploy"**
2. Wait for build to complete
3. Note the temporary Vercel URL (e.g., `myfirstproject-xxx.vercel.app`)

### 5. Configure Custom Domain
1. In Vercel Dashboard → Settings → Domains
2. Click **"Add Domain"**
3. Enter: `www.courseconnectai.com`
4. Click **"Add"**

### 6. DNS Configuration
Configure DNS records in your domain registrar:

**Option A: CNAME Record (Recommended)**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Option B: A Record**
```
Type: A
Name: www
Value: 76.76.19.61
```

### 7. Update Firebase OAuth Settings

#### Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `courseconnect-61eme`
3. Authentication → Settings → Authorized domains
4. Add: `www.courseconnectai.com`
5. Add: `your-vercel-app.vercel.app` (temporary)

#### Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `courseconnect-61eme`
3. APIs & Services → Credentials → OAuth 2.0 Client ID
4. Add to **Authorized JavaScript origins**:
   - `https://www.courseconnectai.com`
   - `https://your-vercel-app.vercel.app`
5. Add to **Authorized redirect URIs**:
   - `https://www.courseconnectai.com/__/auth/handler`
   - `https://your-vercel-app.vercel.app/__/auth/handler`

### 8. Update Firebase Configuration for Production
Update `src/lib/firebase/client.ts`:

```javascript
const firebaseConfig = {
  "projectId": "courseconnect-61eme",
  "appId": "1:150901346125:web:116c79e5f3521488e97104",
  "storageBucket": "courseconnect-61eme.firebasestorage.app",
  "apiKey": "YOUR_FIREBASE_API_KEY",
  "authDomain": "www.courseconnectai.com", // Updated for production
  "messagingSenderId": "150901346125",
  "databaseURL": "https://courseconnect-61eme-default-rtdb.firebaseio.com"
};
```

### 9. Test Deployment
- [ ] Visit `https://www.courseconnectai.com`
- [ ] Test Google authentication
- [ ] Test email/password authentication
- [ ] Test guest login
- [ ] Verify all features work

### 10. SSL Certificate
- Vercel automatically provisions SSL certificates
- Wait 24-48 hours for full propagation
- Check SSL status in Vercel Dashboard → Domains

## Troubleshooting

### Domain Not Working
- Check DNS propagation: https://dnschecker.org/
- Verify DNS records are correct
- Wait up to 24 hours for full propagation

### Authentication Issues
- Verify Firebase authorized domains
- Check Google OAuth redirect URIs
- Clear browser cache and cookies

### Build Errors
- Check Vercel build logs
- Verify all environment variables are set
- Ensure Node.js version compatibility

## Monitoring
- Vercel Dashboard → Analytics
- Vercel Dashboard → Functions
- Firebase Console → Analytics

## Final Result
Your CourseConnect AI will be live at: **https://www.courseconnectai.com**

The OAuth screen will show: "Continue to www.courseconnectai.com"

# Vercel Deployment Guide for CourseConnect AI

## GitHub Repository
✅ **Successfully pushed to GitHub**: https://github.com/pogami/myfirstproject.git

## Vercel Deployment Steps

### 1. Connect to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import from GitHub: `pogami/myfirstproject`
4. Click "Import"

### 2. Configure Project Settings
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### 3. Environment Variables
Add these environment variables in Vercel Dashboard → Settings → Environment Variables:

#### Firebase Configuration
```
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=courseconnect-61eme.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=courseconnect-61eme
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=courseconnect-61eme.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=150901346125
NEXT_PUBLIC_FIREBASE_APP_ID=1:150901346125:web:116c79e5f3521488e97104
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://courseconnect-61eme-default-rtdb.firebaseio.com
```

#### AI Services (Optional)
```
OPENAI_API_KEY=your_openai_key
GOOGLE_AI_API_KEY=your_google_ai_key
```

#### Email Services (Optional)
```
SENDGRID_API_KEY=your_sendgrid_key
RESEND_API_KEY=your_resend_key
```

#### Stripe (Optional)
```
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 4. Domain Configuration
1. In Vercel Dashboard → Settings → Domains
2. Add custom domain: `www.courseconnectai.com`
3. Follow DNS configuration instructions
4. Wait for SSL certificate provisioning

### 5. Firebase Configuration Updates
After deployment, update Firebase settings:

#### Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `courseconnect-61eme`
3. Authentication → Settings → Authorized domains
4. Add: `your-vercel-app.vercel.app` (temporary)
5. Add: `www.courseconnectai.com` (when custom domain is ready)

#### Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `courseconnect-61eme`
3. APIs & Services → Credentials → OAuth 2.0 Client ID
4. Add to Authorized JavaScript origins:
   - `https://your-vercel-app.vercel.app`
   - `https://www.courseconnectai.com`
5. Add to Authorized redirect URIs:
   - `https://your-vercel-app.vercel.app/__/auth/handler`
   - `https://www.courseconnectai.com/__/auth/handler`

### 6. Deploy
1. Click "Deploy" in Vercel
2. Wait for build to complete
3. Test the deployed application

### 7. Post-Deployment Testing
- [ ] Test Google authentication
- [ ] Test email/password authentication
- [ ] Test guest login
- [ ] Test all major features
- [ ] Verify custom domain (if configured)

## Troubleshooting

### Build Errors
- Check Node.js version (should be 18+)
- Verify all dependencies are in package.json
- Check for TypeScript errors

### Authentication Issues
- Verify Firebase configuration
- Check OAuth redirect URIs
- Ensure authorized domains are set

### Custom Domain Issues
- Verify DNS configuration
- Wait for SSL certificate
- Check domain propagation

## Monitoring
- Vercel Dashboard → Analytics
- Vercel Dashboard → Functions (for API monitoring)
- Firebase Console → Analytics (if enabled)

## Next Steps
1. Deploy to Vercel
2. Configure environment variables
3. Set up custom domain
4. Update Firebase OAuth settings
5. Test all functionality
6. Monitor performance and errors

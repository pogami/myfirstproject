# CourseConnect Deployment Guide

## 🚀 Ensuring Localhost and Vercel are Synchronized

### Current Status
- ✅ Localhost: Running on port 9002 with latest authentication fixes
- ✅ Vercel: Configured with Next.js framework
- ⚠️ Environment variables need to be set in Vercel dashboard

## 🔧 Required Setup Steps

### 1. Firebase Console Configuration
**Add these authorized domains in Firebase Console → Authentication → Settings:**

**For Localhost:**
- `localhost`
- `127.0.0.1`
- `localhost:9002` (your current dev port)

**For Production (Vercel):**
- `your-app-name.vercel.app` (replace with your actual Vercel domain)
- `your-custom-domain.com` (if you have one)

### 2. Google Cloud Console OAuth Setup
**Add these redirect URIs in Google Cloud Console → Credentials → OAuth 2.0 Client ID:**

**For Localhost:**
- `http://localhost:9002/__/auth/handler`
- `http://localhost:9002`
- `http://127.0.0.1:9002/__/auth/handler`
- `http://127.0.0.1:9002`

**For Production:**
- `https://your-app-name.vercel.app/__/auth/handler`
- `https://your-app-name.vercel.app`
- `https://your-custom-domain.com/__/auth/handler` (if applicable)

### 3. Vercel Environment Variables
**Set these in Vercel Dashboard → Project Settings → Environment Variables:**

```bash
# AI Configuration
OPENAI_API_KEY=your_actual_openai_key
GOOGLE_AI_API_KEY=your_actual_google_ai_key
AI_PROVIDER_PREFERENCE=google

# Firebase Configuration (optional - already hardcoded)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDk-zhYbWHSWdk-cDzq5b_kwZ2L3wFsYgQ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=courseconnect-61eme.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=courseconnect-61eme
```

### 4. Deploy to Vercel
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy
vercel --prod

# Or push to GitHub if connected to Vercel
git add .
git commit -m "Update authentication and sync localhost/production"
git push
```

## 🔍 Testing Both Environments

### Localhost Testing
1. Run `npm run dev`
2. Go to `http://localhost:9002`
3. Try Google sign-in
4. Check browser console for any errors

### Production Testing
1. Deploy to Vercel
2. Go to your Vercel URL
3. Try Google sign-in
4. Check browser console for any errors

## 🐛 Troubleshooting

### Common Issues:
1. **"Invalid action" error**: Check Firebase authorized domains
2. **Redirect URI mismatch**: Check Google Cloud Console OAuth settings
3. **Environment variables not working**: Check Vercel dashboard settings

### Debug Information:
The app now logs environment information to console:
- Development vs Production detection
- Current hostname and port
- Firebase configuration status

## 📝 Next Steps
1. Add localhost to Firebase authorized domains
2. Add production domain to Firebase authorized domains
3. Update Google Cloud Console OAuth settings
4. Set environment variables in Vercel dashboard
5. Deploy and test both environments

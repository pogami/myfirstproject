#!/bin/bash

# CourseConnect Deployment Script
echo "🚀 CourseConnect Deployment Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo ""
echo "📋 Current Configuration:"
echo "- Development port: 9002"
echo "- Firebase project: courseconnect-61eme"
echo "- Framework: Next.js"

echo ""
echo "🔧 Pre-deployment Checklist:"
echo "1. ✅ Firebase authorized domains include localhost and production domain"
echo "2. ✅ Google Cloud Console OAuth redirect URIs configured"
echo "3. ✅ Environment variables set in Vercel dashboard"
echo "4. ✅ Latest code changes committed"

echo ""
read -p "Have you completed the checklist above? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please complete the checklist first. See DEPLOYMENT_GUIDE.md for details."
    exit 1
fi

echo ""
echo "🔄 Building and deploying..."

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
fi

echo ""
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Test Google sign-in on your Vercel URL"
    echo "2. Test Google sign-in on localhost:9002"
    echo "3. Check browser console for any errors"
    echo ""
    echo "🔍 If you encounter issues:"
    echo "- Check Firebase Console → Authentication → Settings → Authorized domains"
    echo "- Check Google Cloud Console → Credentials → OAuth 2.0 Client ID"
    echo "- Check Vercel Dashboard → Project Settings → Environment Variables"
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi

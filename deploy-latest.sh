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
echo "- Latest version: v2.2.0"

echo ""
echo "🔧 Pre-deployment Checklist:"
echo "1. ✅ Firebase authorized domains include localhost and production domain"
echo "2. ✅ Google Cloud Console OAuth redirect URIs configured"
echo "3. ✅ Environment variables set in Vercel dashboard"
echo "4. ✅ Latest code changes committed"
echo "5. ✅ Site logs updated with latest changes"

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

# Get current version and changes for logging
VERSION=$(node -p "require('./package.json').version")
CHANGES=$(git log -1 --pretty=format:"%s")

# Deploy to Vercel
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    
    # Log the deployment
    echo "📝 Logging deployment..."
    echo "import { logVercelDeployment } from './src/lib/site-logs.ts';" > temp_deployment_log.js
    echo "logVercelDeployment('$VERSION', ['$CHANGES'], 'Development Team');" >> temp_deployment_log.js
    echo "console.log('✅ Vercel deployment logged successfully');" >> temp_deployment_log.js
    
    echo ""
echo "🔄 Auto-syncing to GitHub..."
if [ -f "./auto-sync.sh" ]; then
    bash ./auto-sync.sh
else
    echo "📤 Pushing to GitHub..."
    git push origin main
    git push origin main:master
fi

echo ""
echo "📝 Next steps:"
echo "1. Test the changelog page at your Vercel URL/changelog"
echo "2. Test the updated authentication flow on localhost:9002"
echo "3. Check browser console for any errors"
echo "4. Verify all links in the footer work correctly"
echo "5. Visit http://localhost:9002/changelog to test the new changelog system"
    echo ""
    echo "🔍 If you encounter issues:"
    echo "- Check Firebase Console → Authentication → Settings → Authorized domains"
    echo "- Check Google Cloud Console → Credentials → OAuth 2.0 Client ID"
    echo "- Check Vercel Dashboard → Project Settings → Environment Variables"
    echo ""
    echo "📊 Site Logs:"
    echo "- All changes are now tracked in the dedicated changelog page"
    echo "- Version $VERSION includes comprehensive changelog system"
    echo "- Future changes will be automatically logged using the deployment scripts"
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi

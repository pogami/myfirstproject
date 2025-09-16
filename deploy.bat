@echo off
REM CourseConnect Deployment Script for Windows
echo 🚀 CourseConnect Deployment Script
echo ==================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

echo.
echo 📋 Current Configuration:
echo - Development port: 9002
echo - Firebase project: courseconnect-61eme
echo - Framework: Next.js

echo.
echo 🔧 Pre-deployment Checklist:
echo 1. ✅ Firebase authorized domains include localhost and production domain
echo 2. ✅ Google Cloud Console OAuth redirect URIs configured
echo 3. ✅ Environment variables set in Vercel dashboard
echo 4. ✅ Latest code changes committed

echo.
set /p confirm="Have you completed the checklist above? (y/n): "
if /i not "%confirm%"=="y" (
    echo Please complete the checklist first. See DEPLOYMENT_GUIDE.md for details.
    pause
    exit /b 1
)

echo.
echo 🔄 Building and deploying...

REM Build the project
echo 📦 Building project...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed. Please fix errors and try again.
    pause
    exit /b 1
)

echo ✅ Build successful!

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo 📥 Installing Vercel CLI...
    call npm install -g vercel
)

echo.
echo 🚀 Deploying to Vercel...
call vercel --prod

if %errorlevel% equ 0 (
    echo.
    echo 🎉 Deployment successful!
    echo.
    echo 📝 Next steps:
    echo 1. Test Google sign-in on your Vercel URL
    echo 2. Test Google sign-in on localhost:9002
    echo 3. Check browser console for any errors
    echo.
    echo 🔍 If you encounter issues:
    echo - Check Firebase Console → Authentication → Settings → Authorized domains
    echo - Check Google Cloud Console → Credentials → OAuth 2.0 Client ID
    echo - Check Vercel Dashboard → Project Settings → Environment Variables
) else (
    echo ❌ Deployment failed. Please check the error messages above.
    pause
    exit /b 1
)

pause

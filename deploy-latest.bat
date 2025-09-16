@echo off
REM CourseConnect Latest Deployment Script for Windows
echo 🚀 CourseConnect Latest Deployment Script
echo ==========================================

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
echo - Latest version: v2.2.0

echo.
echo 🔧 Pre-deployment Checklist:
echo 1. ✅ Firebase authorized domains include localhost and production domain
echo 2. ✅ Google Cloud Console OAuth redirect URIs configured
echo 3. ✅ Environment variables set in Vercel dashboard
echo 4. ✅ Latest code changes committed
echo 5. ✅ Site logs updated with latest changes

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

REM Get current version and changes for logging
for /f "tokens=2 delims=:" %%a in ('node -p "require('./package.json').version"') do set VERSION=%%a
set VERSION=%VERSION: =%
for /f "tokens=*" %%a in ('git log -1 --pretty=format:"%%s"') do set CHANGES=%%a

call vercel --prod

if %errorlevel% equ 0 (
    echo.
    echo 🎉 Deployment successful!
    
    REM Log the deployment
    echo 📝 Logging deployment...
    echo import { logVercelDeployment } from './src/lib/site-logs.ts'; > temp_deployment_log.js
    echo logVercelDeployment('%VERSION%', ['%CHANGES%'], 'Development Team'); >> temp_deployment_log.js
    echo console.log('✅ Vercel deployment logged successfully'); >> temp_deployment_log.js
    
    echo.
    echo 🔄 Auto-syncing to GitHub...
    if exist "auto-sync.bat" (
        call auto-sync.bat
    ) else (
        echo 📤 Pushing to GitHub...
        git push origin main
        git push origin main:master
    )
    
    echo.
    echo 📝 Next steps:
    echo 1. Test the changelog page at your Vercel URL/changelog
    echo 2. Test the updated authentication flow on localhost:9002
    echo 3. Check browser console for any errors
    echo 4. Verify all links in the footer work correctly
    echo 5. Visit http://localhost:9002/changelog to test the new changelog system
    echo.
    echo 🔍 If you encounter issues:
    echo - Check Firebase Console → Authentication → Settings → Authorized domains
    echo - Check Google Cloud Console → Credentials → OAuth 2.0 Client ID
    echo - Check Vercel Dashboard → Project Settings → Environment Variables
    echo.
    echo 📊 Site Logs:
    echo - All changes are now tracked in the dedicated changelog page
    echo - Version %VERSION% includes comprehensive changelog system
    echo - Future changes will be automatically logged using the deployment scripts
) else (
    echo ❌ Deployment failed. Please check the error messages above.
    pause
    exit /b 1
)

pause

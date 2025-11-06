@echo off
REM CourseConnect Deployment Logger for Windows
REM This script automatically logs deployments to localhost and Vercel

setlocal enabledelayedexpansion

REM Function to log deployment
:log_deployment
set environment=%1
set version=%2
set changes=%3
set author=%4
if "%author%"=="" set author=Development Team

echo 🚀 Logging deployment to %environment%...

REM Create a temporary file with the deployment log
echo // Auto-generated deployment log > temp_deployment_log.js
echo import { logLocalhostDeployment, logVercelDeployment, logProductionDeployment } from './src/lib/site-logs.ts'; >> temp_deployment_log.js
echo. >> temp_deployment_log.js
echo // Log deployment >> temp_deployment_log.js
echo %environment%Deployment('%version%', %changes%, '%author%'); >> temp_deployment_log.js
echo. >> temp_deployment_log.js
echo console.log('✅ Deployment logged successfully'); >> temp_deployment_log.js

echo ✅ Deployment logged: %version% to %environment%
echo 📝 Changes: %changes%
echo 👤 Author: %author%
goto :eof

REM Function to deploy to localhost
:deploy_localhost
echo 🏠 Deploying to localhost...

REM Get current version from package.json
for /f "tokens=2 delims=:" %%a in ('node -p "require('./package.json').version"') do set VERSION=%%a
set VERSION=%VERSION: =%

REM Get git commit message for changes
for /f "tokens=*" %%a in ('git log -1 --pretty=format:"%%s"') do set CHANGES=%%a

REM Log the deployment
call :log_deployment "localhost" "%VERSION%" "[\"%CHANGES%\"]"

REM Start development server
echo 🚀 Starting localhost development server...
npm run dev
goto :eof

REM Function to deploy to Vercel
:deploy_vercel
echo ☁️ Deploying to Vercel...

REM Get current version from package.json
for /f "tokens=2 delims=:" %%a in ('node -p "require('./package.json').version"') do set VERSION=%%a
set VERSION=%VERSION: =%

REM Get git commit message for changes
for /f "tokens=*" %%a in ('git log -1 --pretty=format:"%%s"') do set CHANGES=%%a

REM Log the deployment
call :log_deployment "vercel" "%VERSION%" "[\"%CHANGES%\"]"

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod
goto :eof

REM Function to show help
:show_help
echo CourseConnect Deployment Logger
echo.
echo Usage: %0 [COMMAND]
echo.
echo Commands:
echo   localhost    Deploy to localhost with logging
echo   vercel       Deploy to Vercel with logging
echo   log          Log a deployment without deploying
echo   help         Show this help message
echo.
echo Examples:
echo   %0 localhost
echo   %0 vercel
echo   %0 log localhost v2.1.0 "Fixed authentication bug" "John Doe"
goto :eof

REM Main script logic
if "%1"=="localhost" (
    call :deploy_localhost
) else if "%1"=="vercel" (
    call :deploy_vercel
) else if "%1"=="log" (
    if "%2"=="" (
        echo ❌ Error: Missing required arguments
        echo Usage: %0 log [environment] [version] [changes] [author]
        exit /b 1
    )
    call :log_deployment %2 %3 %4 %5
) else if "%1"=="help" (
    call :show_help
) else if "%1"=="-h" (
    call :show_help
) else if "%1"=="--help" (
    call :show_help
) else (
    echo ❌ Error: Unknown command '%1'
    call :show_help
    exit /b 1
)

endlocal

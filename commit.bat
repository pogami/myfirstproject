@echo off
REM Smart Commit Script for CourseConnect
REM This script commits changes and automatically syncs to GitHub

if "%1"=="" (
    echo ❌ Please provide a commit message
    echo Usage: %0 "Your commit message"
    exit /b 1
)

set "COMMIT_MSG=%*"

echo 🔄 Committing changes...
git add .
git commit -m "%COMMIT_MSG%"

if %errorlevel% equ 0 (
    echo ✅ Commit successful!
    echo 🔄 Auto-syncing to GitHub...
    
    REM Run auto-sync
    call auto-sync.bat
    
    if %errorlevel% equ 0 (
        echo 🎉 All done! Your MacBook will have the latest changes.
    ) else (
        echo ⚠️ Commit successful but sync failed. Run 'git push origin main' manually.
    )
) else (
    echo ❌ Commit failed. Please check your changes and try again.
    exit /b 1
)

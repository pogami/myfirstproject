@echo off
REM Auto-Sync Script for CourseConnect (Windows)
REM This script automatically pushes changes to GitHub after every commit

echo 🔄 Auto-syncing to GitHub...

REM Get current branch
for /f "tokens=*" %%a in ('git branch --show-current') do set CURRENT_BRANCH=%%a

REM Push to current branch
echo 📤 Pushing to origin/%CURRENT_BRANCH%...
git push origin %CURRENT_BRANCH%

if %errorlevel% equ 0 (
    echo ✅ Successfully pushed to origin/%CURRENT_BRANCH%
    
    REM Also push to master to keep both branches in sync
    if not "%CURRENT_BRANCH%"=="master" (
        echo 📤 Syncing to master branch...
        git push origin %CURRENT_BRANCH%:master
        if %errorlevel% equ 0 (
            echo ✅ Successfully synced to master branch
        ) else (
            echo ⚠️ Warning: Failed to sync to master branch
        )
    )
    
    echo 🎉 Auto-sync complete! Your MacBook will have the latest changes.
) else (
    echo ❌ Failed to push to GitHub. Please check your connection and try again.
    exit /b 1
)

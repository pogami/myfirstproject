#!/bin/bash

# Smart Commit Script for CourseConnect
# This script commits changes and automatically syncs to GitHub

if [ -z "$1" ]; then
    echo "❌ Please provide a commit message"
    echo "Usage: $0 \"Your commit message\""
    exit 1
fi

COMMIT_MSG="$1"

echo "🔄 Committing changes..."
git add .
git commit -m "$COMMIT_MSG"

if [ $? -eq 0 ]; then
    echo "✅ Commit successful!"
    echo "🔄 Auto-syncing to GitHub..."
    
    # Run auto-sync
    if [ -f "./auto-sync.sh" ]; then
        bash ./auto-sync.sh
    else
        echo "⚠️ Auto-sync script not found. Pushing manually..."
        git push origin main
        git push origin main:master
    fi
    
    if [ $? -eq 0 ]; then
        echo "🎉 All done! Your MacBook will have the latest changes."
    else
        echo "⚠️ Commit successful but sync failed. Run 'git push origin main' manually."
    fi
else
    echo "❌ Commit failed. Please check your changes and try again."
    exit 1
fi

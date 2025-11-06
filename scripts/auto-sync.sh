#!/bin/bash

# Auto-Sync Script for CourseConnect
# This script automatically pushes changes to GitHub after every commit

echo "🔄 Auto-syncing to GitHub..."

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Push to both main and master branches to ensure sync
echo "📤 Pushing to origin/$CURRENT_BRANCH..."
git push origin $CURRENT_BRANCH

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to origin/$CURRENT_BRANCH"
    
    # Also push to master to keep both branches in sync
    if [ "$CURRENT_BRANCH" != "master" ]; then
        echo "📤 Syncing to master branch..."
        git push origin $CURRENT_BRANCH:master
        if [ $? -eq 0 ]; then
            echo "✅ Successfully synced to master branch"
        else
            echo "⚠️ Warning: Failed to sync to master branch"
        fi
    fi
    
    echo "🎉 Auto-sync complete! Your MacBook will have the latest changes."
else
    echo "❌ Failed to push to GitHub. Please check your connection and try again."
    exit 1
fi

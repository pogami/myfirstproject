#!/bin/bash

# CourseConnect Environment Setup Script
echo "🚀 Setting up CourseConnect environment variables..."

# Create .env.local file
cat > .env.local << 'EOF'
# CourseConnect Environment Variables
# Replace these with your actual API keys

# OpenAI API Key (get from https://platform.openai.com/account/api-keys)
OPENAI_API_KEY=demo-key

# Google AI API Key (get from https://aistudio.google.com/app/apikey)
GOOGLE_AI_API_KEY=demo-key

# AI Provider Preference (google, openai, or fallback)
AI_PROVIDER_PREFERENCE=fallback

# Firebase Configuration (if needed)
NEXT_PUBLIC_FIREBASE_API_KEY=demo-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=demo-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=demo-app-id
EOF

echo "✅ Created .env.local file"
echo ""
echo "📝 To use real AI features:"
echo "1. Get an OpenAI API key from: https://platform.openai.com/account/api-keys"
echo "2. Get a Google AI API key from: https://aistudio.google.com/app/apikey"
echo "3. Replace 'demo-key' in .env.local with your actual keys"
echo "4. Change AI_PROVIDER_PREFERENCE to 'google' or 'openai'"
echo ""
echo "🎯 For now, the app will use enhanced fallback responses that provide"
echo "   helpful educational content without requiring API keys!"
echo ""
echo "🔄 Restart your development server to apply changes:"
echo "   npm run dev"
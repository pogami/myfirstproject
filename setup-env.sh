#!/bin/bash

# CourseConnect Environment Setup Script
echo "🚀 Setting up CourseConnect environment..."

# Create .env.local file
cat > .env.local << 'EOF'
# AI Provider Configuration
# Get your Google AI API key from: https://aistudio.google.com/app/apikey
GOOGLE_AI_API_KEY=your_actual_google_api_key_here

# Get your OpenAI API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_actual_openai_api_key_here

# AI Provider Preference (google or openai)
AI_PROVIDER_PREFERENCE=google

# Firebase Configuration (already configured - these are public)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDk-zhYbWHSWdk-cDzq5b_kwZ2L3wFsYgQ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=courseconnect-61eme.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=courseconnect-61eme
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=courseconnect-61eme.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=150901346125
NEXT_PUBLIC_FIREBASE_APP_ID=1:150901346125:web:116c79e5f3521488e97104
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://courseconnect-61eme-default-rtdb.firebaseio.com
EOF

echo "✅ Created .env.local file"
echo ""
echo "📝 Next steps:"
echo "1. Get your Google AI API key from: https://aistudio.google.com/app/apikey"
echo "2. Edit .env.local and replace 'your_actual_google_api_key_here' with your actual API key"
echo "3. Restart your development server: npm run dev"
echo ""
echo "🎉 Chat functionality will work with enhanced fallback responses even without API keys!"

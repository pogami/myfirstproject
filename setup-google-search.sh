#!/bin/bash

# Google Search API Setup Script
echo "🔧 Setting up Google Search API..."

# Create .env.local file
cat > .env.local << 'EOF'
# Google Search API Configuration
# Get these from: https://console.cloud.google.com/ and https://cse.google.com/cse/

# Google Custom Search API Key
GOOGLE_SEARCH_API_KEY=your_google_api_key_here

# Google Custom Search Engine ID
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
EOF

echo "✅ Created .env.local file"
echo ""
echo "📋 Next Steps:"
echo "1. Go to https://console.cloud.google.com/"
echo "2. Create a new project or select existing"
echo "3. Enable 'Custom Search API'"
echo "4. Go to 'Credentials' → 'Create Credentials' → 'API Key'"
echo "5. Copy the API key and replace 'your_google_api_key_here' in .env.local"
echo "6. Go to https://cse.google.com/cse/"
echo "7. Create a new search engine"
echo "8. Copy the Search Engine ID and replace 'your_search_engine_id_here' in .env.local"
echo ""
echo "🚀 After setup, restart your development server: npm run dev"

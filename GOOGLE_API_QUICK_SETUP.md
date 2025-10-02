# 🚀 Google Search API Quick Setup Guide

## Step 1: Get Google API Key

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create/Select Project**: Create a new project or select existing one
3. **Enable Custom Search API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Custom Search API"
   - Click "Enable"
4. **Create API Key**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key

## Step 2: Create Custom Search Engine

1. **Go to Google Custom Search**: https://cse.google.com/cse/
2. **Create New Search Engine**:
   - Click "Add" button
   - Enter any website (e.g., "google.com") in "Sites to search"
   - Click "Create"
3. **Get Search Engine ID**:
   - Go to "Setup" → "Basics"
   - Copy the "Search engine ID"

## Step 3: Configure Environment Variables

Edit the `.env.local` file in your project root:

```env
# Replace with your actual values
GOOGLE_SEARCH_API_KEY=YOUR_GOOGLE_SEARCH_API_KEY
GOOGLE_SEARCH_ENGINE_ID=012345678901234567890:abcdefghijk
```

## Step 4: Restart Development Server

```bash
npm run dev
```

## ✅ Benefits of Google Search API

- **Real-time Results**: Google indexes content faster than DuckDuckGo
- **Better Accuracy**: Google's algorithm provides more relevant results
- **Current Information**: Google prioritizes recent content
- **Comprehensive Coverage**: Access to Google's vast index
- **No Fallback Needed**: Direct access to Google's search results

## 🔧 Troubleshooting

- **API Key Invalid**: Make sure you copied the full API key
- **Search Engine ID Wrong**: Double-check the ID from Custom Search setup
- **Quota Exceeded**: Google provides 100 free searches per day
- **CORS Issues**: The API runs server-side, so no CORS problems

## 📊 Usage Limits

- **Free Tier**: 100 searches per day
- **Paid Tier**: $5 per 1,000 queries after free limit
- **Rate Limit**: 10 queries per second

Your AI will now use Google's powerful search capabilities for real-time, accurate information! 🎯

# Google Search API Setup Guide

To enable Google's real-time search functionality, you need to set up Google Custom Search API:

## 1. Get Google Search API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Custom Search API"
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key

## 2. Create Custom Search Engine

1. Go to [Google Custom Search](https://cse.google.com/cse/)
2. Click "Add" to create a new search engine
3. Enter any website (e.g., "google.com") in "Sites to search"
4. Click "Create"
5. Go to "Setup" → "Basics" → Copy your "Search engine ID"

## 3. Add to Environment Variables

Add these to your `.env.local` file:

```env
GOOGLE_SEARCH_API_KEY=your_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

## 4. Benefits of Google Search

- **Real-time results**: Google indexes content faster than DuckDuckGo
- **Better accuracy**: Google's algorithm provides more relevant results
- **Current information**: Google prioritizes recent content
- **Comprehensive coverage**: Access to Google's vast index

## 5. Fallback System

If Google API is not configured, the system automatically falls back to:
1. DuckDuckGo HTML search
2. Enhanced knowledge base responses

This ensures the search always works, even without Google API setup.

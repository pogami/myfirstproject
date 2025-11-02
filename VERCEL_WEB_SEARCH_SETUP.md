# Real-Time Web Search Setup for Vercel

## 🔍 Environment Variables Needed

To enable real-time web search on Vercel, you need to add these environment variables:

### Required Variables:

1. **`GOOGLE_SEARCH_API_KEY`**
   - Your Google Custom Search API key
   - **Keep this private** (server-side only)

2. **`GOOGLE_SEARCH_ENGINE_ID`** 
   - Your Google Custom Search Engine ID (also called "cx")
   - **Keep this private** (server-side only)

### Optional Variables:

3. **`SEARCH_RESULTS_LIMIT`** (optional)
   - Number of search results to return (default: 12, max: 20)
   - Example: `12`

## 🚀 Step-by-Step Setup

### Step 1: Get Google Search API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **"Custom Search API"**:
   - Go to "APIs & Services" → "Library"
   - Search for "Custom Search API"
   - Click "Enable"
4. Create API Key:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy your API key
   - (Optional) Click "Restrict Key" → Select "Custom Search API" only for security

### Step 2: Create Custom Search Engine

1. Go to [Google Custom Search](https://cse.google.com/cse/)
2. Click "Add" to create a new search engine
3. In "Sites to search":
   - Enter `*` (asterisk) to search the entire web
   - OR enter specific sites like `*.edu`, `*.org`, etc.
4. Click "Create"
5. Go to "Setup" → "Basics"
6. Copy your **"Search engine ID"** (also shown as "cx" parameter)

### Step 3: Add to Vercel Environment Variables

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

   **Variable 1:**
   - **Name:** `GOOGLE_SEARCH_API_KEY`
   - **Value:** (paste your Google API key)
   - **Environment:** Select all (Production, Preview, Development)
   - Click **Save**

   **Variable 2:**
   - **Name:** `GOOGLE_SEARCH_ENGINE_ID`
   - **Value:** (paste your Search Engine ID)
   - **Environment:** Select all (Production, Preview, Development)
   - Click **Save**

   **Variable 3 (Optional):**
   - **Name:** `SEARCH_RESULTS_LIMIT`
   - **Value:** `12`
   - **Environment:** Select all (Production, Preview, Development)
   - Click **Save**

5. **Redeploy** your application for changes to take effect

## 📝 Quick Copy-Paste for Vercel

When adding to Vercel, use these exact variable names:

```
GOOGLE_SEARCH_API_KEY=your_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
SEARCH_RESULTS_LIMIT=12
```

## ✅ Verify It's Working

After redeploying, test the web search:

1. Go to your deployed app
2. Use the chat feature
3. Ask a question that requires current information, like:
   - "What's the latest news about [topic]?"
   - "Search for [query]"
4. You should see search results with sources

## 🔒 Security Notes

- ✅ **Keep these private** - Don't expose them in client-side code
- ✅ The code already uses `process.env.*` which is server-side only
- ✅ You can restrict your API key in Google Cloud Console to only allow "Custom Search API"
- ✅ Consider setting up API key restrictions by domain (your Vercel domain)

## 💰 Cost Information

- **Google Custom Search API** offers 100 free searches per day
- After that, it's $5 per 1,000 searches
- Monitor usage in [Google Cloud Console](https://console.cloud.google.com/) → "APIs & Services" → "Dashboard"

## 🛠️ Troubleshooting

### Search not working?
1. ✅ Verify both environment variables are set in Vercel
2. ✅ Check that you've redeployed after adding variables
3. ✅ Verify API key has "Custom Search API" enabled
4. ✅ Check Vercel logs for errors
5. ✅ Verify Search Engine ID is correct (no extra spaces)

### Rate limit errors?
- You may have exceeded the 100 free searches/day limit
- Upgrade your Google Cloud quota if needed

## 📚 Additional Resources

- [Google Custom Search API Docs](https://developers.google.com/custom-search/v1/overview)
- [Google Custom Search Engine Setup](https://cse.google.com/cse/)
- [Vercel Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)


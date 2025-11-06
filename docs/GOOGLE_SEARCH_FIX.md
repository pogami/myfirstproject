# Fix Google Search API 400 Bad Request Error

## The Problem
You're getting `INVALID_ARGUMENT` (400) error even though your API key and engine ID are loaded correctly.

## Most Common Fix: Enable Custom Search API

1. **Go to Google Cloud Console:**
   https://console.cloud.google.com/apis/library/customsearch.googleapis.com

2. **Enable the API:**
   - Click **"Enable"** if it's not already enabled
   - Wait a few seconds for it to activate

3. **Verify API Key Access:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click on your API key (`AIzaSyDjMZ...`)
   - Under **"API restrictions"**, make sure:
     - Either **"Don't restrict key"** is selected, OR
     - **"Restrict key"** includes **"Custom Search API"** in the list

4. **Check Application Restrictions:**
   - In the same API key page, check **"Application restrictions"**
   - If set to **"IP addresses"** or **"HTTP referrers"**, make sure your server IP/localhost is allowed
   - For local development, you can temporarily set it to **"None"**

5. **Verify Search Engine ID:**
   - Go to: https://cse.google.com/cse/all
   - Find your search engine
   - Copy the **"Search engine ID"** - it should match `a44c92909b0a643aa`

## After Making Changes

1. **Restart your server** (the changes take effect immediately, but restart to be safe)
2. **Try the search again** - click globe icon and ask "who's the richest person in the world"

## If Still Not Working

Check the terminal for the new detailed error logs - they will show exactly which parameter is invalid.


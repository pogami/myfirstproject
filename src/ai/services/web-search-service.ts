/**
 * Web Search Service for Real-Time Information
 * 
 * This service provides current information using ONLY Google Custom Search API
 */

export interface WebSearchResult {
  title: string;
  snippet: string;
  url: string;
  date?: string;
}

export interface WebSearchResponse {
  results: WebSearchResult[];
  query: string;
  timestamp: string;
}

/**
 * Search for current information using ONLY Google Custom Search API
 */
let lastSearchTime = 0;
const MIN_SEARCH_INTERVAL = 1000; // 1 second between searches

export async function searchCurrentInformation(query: string): Promise<WebSearchResponse> {
  try {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      console.log('⚠️ Invalid query provided to searchCurrentInformation');
      return {
        results: [],
        query: '',
        timestamp: new Date().toISOString()
      };
    }
    // Query logging removed for production
    
    // Check rate limits
    const now = Date.now();
    if (now - lastSearchTime < MIN_SEARCH_INTERVAL) {
      console.log('⚠️ Rate limiting: waiting before next search');
      await new Promise(resolve => setTimeout(resolve, MIN_SEARCH_INTERVAL - (now - lastSearchTime)));
    }
    
    const results: WebSearchResult[] = [];
    
    // Get Google API credentials
    const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const googleSearchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    
    // Note: Logging removed for production security - API keys and engine IDs should not be logged
    
    // Validate that we have actual string values (not just truthy)
    if (!googleApiKey || typeof googleApiKey !== 'string' || googleApiKey.trim().length === 0 ||
        googleApiKey === 'demo-key' || googleApiKey === 'your_google_search_key_here') {
      console.error('❌ GOOGLE_SEARCH_API_KEY is missing or invalid');
      console.error('   Value:', googleApiKey);
      console.error('   Type:', typeof googleApiKey);
      return {
        results: [],
        query,
        timestamp: new Date().toISOString()
      };
    }
    
    if (!googleSearchEngineId || typeof googleSearchEngineId !== 'string' || googleSearchEngineId.trim().length === 0 ||
        googleSearchEngineId === 'demo-engine-id' || googleSearchEngineId === 'your_search_engine_id_here') {
      console.error('❌ GOOGLE_SEARCH_ENGINE_ID is missing or invalid');
      console.error('   Value:', googleSearchEngineId);
      console.error('   Type:', typeof googleSearchEngineId);
      return {
        results: [],
        query,
        timestamp: new Date().toISOString()
      };
    }
    
    try {
      console.log('🔍 Using Google Custom Search API...');
      
      const limitFromEnv = parseInt(process.env.SEARCH_RESULTS_LIMIT || "12", 10);
      const limit = Number.isFinite(limitFromEnv) && limitFromEnv > 0 && limitFromEnv <= 20 ? limitFromEnv : 12;
      
      // Ensure query is properly encoded (API key and engine ID should NOT be encoded)
      const encodedQuery = encodeURIComponent(query.trim());
      
      // Build URL - only encode the query, not the API key or engine ID
      const googleSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${googleSearchEngineId}&q=${encodedQuery}&num=${limit}`;
      
      // Logging removed for production security
      
      const googleResponse = await fetch(googleSearchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CourseConnect-AI/1.0; +https://courseconnectai.com)',
        },
        signal: AbortSignal.timeout(10000)
      });
      
      if (googleResponse.ok) {
        const googleData = await googleResponse.json();
        
        if (googleData.items && googleData.items.length > 0) {
          googleData.items.forEach((item: any) => {
            results.push({
              title: item.title || 'Untitled',
              snippet: item.snippet || 'No description available',
              url: item.link || '',
              date: new Date().toISOString()
            });
          });
          console.log('✅ Google search completed with', results.length, 'results');
          lastSearchTime = Date.now();
        } else {
          console.log('⚠️ No results found from Google Search');
        }
      } else {
        console.error('❌ Google Search API error:', googleResponse.status, googleResponse.statusText);
        const errorText = await googleResponse.text();
        console.error('Raw error text:', errorText);
        
        // Try to parse error JSON for more details
        try {
          const errorJson = JSON.parse(errorText);
          console.error('📋 Parsed error JSON:', JSON.stringify(errorJson, null, 2));
          
          // Extract detailed error information
          if (errorJson.error) {
            const error = errorJson.error;
            console.error('🔍 Error Code:', error.code);
            console.error('🔍 Error Message:', error.message);
            
            if (error.errors && Array.isArray(error.errors)) {
              error.errors.forEach((err: any, index: number) => {
                console.error(`🔍 Error ${index + 1}:`, {
                  domain: err.domain,
                  reason: err.reason,
                  message: err.message,
                  location: err.location,
                  locationType: err.locationType
                });
              });
            }
          }
          
          // Check specific error types
          if (errorJson.error?.status === 'INVALID_ARGUMENT' || errorJson.error?.code === 400) {
            console.error('⚠️ INVALID_ARGUMENT Error - Possible causes:');
            console.error('  1. ❌ API key does NOT have "Custom Search API" enabled');
            console.error('     → Go to: https://console.cloud.google.com/apis/library/customsearch.googleapis.com');
            console.error('     → Click "Enable" if not already enabled');
            console.error('  2. ❌ Search Engine ID (cx) is incorrect or not accessible by this API key');
            console.error('     → Check your engine ID at: https://cse.google.com/cse/all');
            console.error('  3. ❌ API key has restrictions (IP, HTTP referrer) that block this request');
            console.error('     → Go to: https://console.cloud.google.com/apis/credentials');
            console.error('     → Edit your API key and check "Application restrictions"');
            console.error('  4. ❌ API key quota exceeded or billing not enabled');
            console.error('     → Check quota at: https://console.cloud.google.com/apis/api/customsearch.googleapis.com/quotas');
          }
        } catch (e) {
          console.error('❌ Could not parse error as JSON:', e);
          console.error('Raw error text was:', errorText);
        }
      }
    } catch (error) {
      console.error('❌ Google Custom Search failed:', error);
    }
    
    // If no results from Google, return empty results
    if (results.length === 0) {
      console.log('⚠️ No results found from Google Search');
      return {
        results: [],
        query,
        timestamp: new Date().toISOString()
      };
    }
    
    console.log('🎯 Google search completed with', results.length, 'results');
    
    return {
      results: results.slice(0, Number(process.env.SEARCH_RESULTS_LIMIT || 12)),
      query,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Google search failed:', error);
    
    return {
      results: [{
        title: 'Google Search Error',
        snippet: `Search failed due to an error. Please check your Google Search API configuration.`,
        url: 'https://console.cloud.google.com/',
        date: new Date().toISOString()
      }],
      query,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Check if a query needs current information
 * Only return true for specific current events, news, weather, etc.
 */
export function needsCurrentInformation(question: string): boolean {
  const lowerQuestion = question.toLowerCase();
  
  // Only search for specific current information topics
  const currentInfoKeywords = [
    'weather', 'temperature', 'forecast',
    'news', 'latest', 'recent', 'today', 'now',
    'stock', 'market', 'price', 'crypto', 'bitcoin',
    'election', 'politics', 'breaking',
    'sports', 'game', 'score', 'nba', 'nfl', 'mlb',
    'covid', 'pandemic', 'virus',
    'earthquake', 'hurricane', 'disaster'
  ];
  
  return currentInfoKeywords.some(keyword => lowerQuestion.includes(keyword));
}

/**
 * Format search results for AI consumption
 */
export function formatSearchResultsForAI(searchResponse: WebSearchResponse): string {
  if (searchResponse.results.length === 0) {
    return '';
  }
  
  const formattedResults = searchResponse.results.map((result, index) => {
    return `${index + 1}. ${result.title}\n   ${result.snippet}\n   Source: ${result.url}\n`;
  }).join('\n');
  
  return `\n\n🔍 REAL-TIME SEARCH RESULTS (${new Date().toLocaleDateString()}):\nIMPORTANT: Use ONLY this current information to answer questions. Do NOT use outdated training data when current information is available.\n\n${formattedResults}\n\nCRITICAL: Base your response ONLY on the current information above. Ignore any outdated information from your training data.`;
}

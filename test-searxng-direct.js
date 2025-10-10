// Quick test for SearXNG service
// Save this as test-searxng-direct.js and run with: node test-searxng-direct.js

async function testSearXNGDirect() {
  console.log('🧪 Testing SearXNG Service Directly...\n');
  
  // Test a simple search
  const query = 'latest news about artificial intelligence';
  console.log(`🔍 Testing query: "${query}"`);
  
  try {
    // Make a direct request to a SearXNG instance
    const searchUrl = `https://searx.tiekoetter.com/search?q=${encodeURIComponent(query)}&format=json&categories=general`;
    
    console.log(`📡 Requesting: ${searchUrl}`);
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`✅ SearXNG Response received`);
    console.log(`📊 Found ${data.results?.length || 0} results`);
    console.log(`🔍 Number of engines: ${Object.keys(data.number_of_results_per_engine || {}).length}`);
    
    if (data.results && data.results.length > 0) {
      console.log('\n🔗 Top 3 results:');
      data.results.slice(0, 3).forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.title}`);
        console.log(`     URL: ${result.url}`);
        console.log(`     Engine: ${result.engine}`);
        console.log(`     Content: ${result.content?.substring(0, 100) || 'No content'}...`);
      });
    }
    
    if (data.answers && data.answers.length > 0) {
      console.log(`\n💡 Instant Answer: ${data.answers[0]}`);
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
  
  console.log('\n🎯 Direct SearXNG Test Complete!');
}

testSearXNGDirect().catch(console.error);

// Simple test to check if real-time search is working
const { SimpleSearchService } = require('./src/lib/simple-search-service.ts');

async function testRealTimeSearch() {
  console.log('🧪 Testing Real-Time Search Functionality...\n');
  
  const testQueries = [
    'NBA coach FBI detaining',
    'latest AI news',
    'Tesla CEO Elon Musk',
    'space exploration news'
  ];
  
  for (const query of testQueries) {
    console.log(`🔍 Testing: "${query}"`);
    
    try {
      const result = await SimpleSearchService.search(query);
      
      console.log(`✅ SUCCESS:`);
      console.log(`   📊 Sources: ${result.sources.length}`);
      console.log(`   ⏱️ Time: ${result.searchTime}ms`);
      console.log(`   📄 Content: ${result.content.substring(0, 100)}...`);
      
      if (result.sources.length > 0) {
        console.log(`   🔗 Top Source: ${result.sources[0].title}`);
        console.log(`   🌐 URL: ${result.sources[0].url}`);
      }
      
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('🎯 Real-Time Search Test Complete!');
}

testRealTimeSearch().catch(console.error);

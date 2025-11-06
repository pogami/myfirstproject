// Simple test script for SearXNG integration
// Run with: node test-searxng-integration.js

/**
 * Test SearXNG integration by making HTTP requests to the chat API
 */
async function testSearXNGIntegration() {
  console.log('🧪 Testing SearXNG Integration via Chat API...\n');
  
  const testQueries = [
    'What is the latest news about artificial intelligence?',
    'Who is the current CEO of Tesla?',
    'What are the recent developments in space exploration?',
    'What is happening with cryptocurrency today?'
  ];
  
  const baseUrl = 'http://localhost:9002';
  
  for (const query of testQueries) {
    console.log(`🔍 Testing query: "${query}"`);
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: query,
          shouldCallAI: true,
          isPublicChat: false,
          hasAIMention: false,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      const endTime = Date.now();
      
      console.log(`✅ Response received in ${endTime - startTime}ms`);
      console.log(`🤖 AI Provider: ${result.provider}`);
      console.log(`📊 Found ${result.sources?.length || 0} sources`);
      console.log(`⏱️ Search time: ${result.searchTime || 'N/A'}ms`);
      console.log(`📄 Answer length: ${result.answer?.length || 0} characters`);
      
      if (result.sources && result.sources.length > 0) {
        console.log('🔗 Top sources:');
        result.sources.slice(0, 3).forEach((source, index) => {
          console.log(`  ${index + 1}. ${source.title}`);
          console.log(`     URL: ${source.url}`);
          console.log(`     Engine: ${source.engine || 'Unknown'}`);
          console.log(`     Snippet: ${source.snippet?.substring(0, 100) || 'No snippet'}...`);
        });
      }
      
      console.log(`📝 Answer preview: ${result.answer?.substring(0, 200) || 'No answer'}...\n`);
      
    } catch (error) {
      console.error(`❌ Error testing query "${query}":`, error.message);
    }
  }
  
  console.log('🎯 SearXNG Integration Test Complete!');
}

// Run the test
testSearXNGIntegration().catch(console.error);

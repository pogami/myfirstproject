#!/usr/bin/env node

/**
 * Test Streaming Chat API
 * Tests the new streaming functionality with Lucy model thinking process
 */

const baseUrl = 'http://localhost:9002';

async function testStreamingChat() {
  console.log('🧪 Testing Streaming Chat API...\n');

  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: 'What is Elon Musk\'s current net worth?',
        shouldCallAI: true,
        isPublicChat: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    console.log('🔄 Starting streaming response...\n');

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader available');
    }

    const decoder = new TextDecoder();
    let fullContent = '';
    let statusMessage = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          
          if (data.type === 'status') {
            if (data.message !== statusMessage) {
              statusMessage = data.message;
              console.log(`📊 Status: ${data.message}`);
            }
          } else if (data.type === 'content') {
            process.stdout.write(data.content);
            fullContent += data.content;
          } else if (data.type === 'done') {
            console.log('\n\n✅ Streaming complete!');
            console.log(`📄 Total response length: ${fullContent.length} characters`);
            break;
          }
        } catch (parseError) {
          console.warn('⚠️ Failed to parse chunk:', parseError.message);
        }
      }
    }

  } catch (error) {
    console.error('❌ Streaming test failed:', error.message);
  }
}

// Run the test
testStreamingChat();

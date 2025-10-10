// Test script for mathematical analysis API
const testMathAnalysis = async () => {
  try {
    console.log('Testing mathematical analysis API...');
    
    const response = await fetch('http://localhost:9002/api/math-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        question: 'solve x^2 + 5x + 6 = 0',
        context: 'Quadratic equation solving'
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Math analysis API working!');
    console.log('Model used:', data.model);
    console.log('Analysis preview:', data.analysis.substring(0, 200) + '...');
    
  } catch (error) {
    console.error('❌ Math analysis API test failed:', error);
  }
};

// Run test if this is executed directly
if (typeof window === 'undefined') {
  testMathAnalysis();
}

module.exports = { testMathAnalysis };

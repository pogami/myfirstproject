import { NextRequest, NextResponse } from 'next/server';
import { provideStudyAssistanceWithFallback } from '@/ai/services/dual-ai-service';

export async function POST(request: NextRequest) {
  try {
    const { question, deviceInfo } = await request.json();
    
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    console.log('Device AI Test:', { 
      question, 
      deviceInfo,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent')
    });
    
    // Test different types of questions to ensure comprehensive AI functionality
    const testQuestions = [
      question,
      "Hello, who are you?",
      "Can you help me with math?",
      "What's the current weather like?",
      "Explain photosynthesis",
      "How do I study effectively?"
    ];
    
    const results = [];
    
    for (const testQuestion of testQuestions) {
      try {
        const result = await provideStudyAssistanceWithFallback({
          question: testQuestion,
          context: 'Device Compatibility Test',
          conversationHistory: []
        });
        
        results.push({
          question: testQuestion,
          answer: result.answer,
          provider: result.provider,
          success: true,
          answerLength: result.answer?.length || 0
        });
      } catch (error) {
        results.push({
          question: testQuestion,
          answer: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          provider: 'error',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Check if all tests passed
    const allPassed = results.every(r => r.success);
    const providersUsed = [...new Set(results.map(r => r.provider))];
    
    return NextResponse.json({
      success: allPassed,
      deviceInfo,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
      testResults: results,
      summary: {
        totalTests: results.length,
        passedTests: results.filter(r => r.success).length,
        failedTests: results.filter(r => !r.success).length,
        providersUsed,
        averageAnswerLength: Math.round(results.reduce((sum, r) => sum + r.answerLength, 0) / results.length)
      }
    });
    
  } catch (error) {
    console.error('Device AI Test error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'AI service test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Device AI Test Endpoint',
    description: 'POST a question and device info to test AI functionality across devices',
    example: {
      question: "Hello, who are you?",
      deviceInfo: {
        device: "iPad",
        browser: "Safari",
        os: "iOS"
      }
    }
  });
}

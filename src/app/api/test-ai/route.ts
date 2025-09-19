import { NextRequest, NextResponse } from 'next/server';
import { provideStudyAssistanceWithFallback } from '@/ai/services/dual-ai-service';

export async function POST(request: NextRequest) {
  try {
    const { question, context } = await request.json();
    
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    console.log('Testing AI service with:', { question, context });
    
    const result = await provideStudyAssistanceWithFallback({
      question,
      context: context || 'General Chat'
    });

    console.log('AI service result:', result);

    return NextResponse.json({
      success: true,
      answer: result.answer,
      provider: result.provider
    });
  } catch (error) {
    console.error('AI service test error:', error);
    return NextResponse.json({ 
      error: 'AI service failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

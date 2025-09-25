import { NextRequest, NextResponse } from 'next/server';
import { provideStudyAssistanceWithFallback } from '@/ai/services/dual-ai-service';

export async function POST(request: NextRequest) {
  try {
    const { question, context, conversationHistory, shouldCallAI = true, isPublicChat = false } = await request.json();
    
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // If it's a public chat and AI shouldn't be called, return no response
    if (isPublicChat && !shouldCallAI) {
      return NextResponse.json({
        success: true,
        answer: null, // No AI response
        shouldRespond: false
      });
    }

    // Clean @ mentions from the question if present
    const cleanedQuestion = question.replace(/@ai\s*/gi, '').trim();
    
    console.log('Chat API called with:', { question: cleanedQuestion, context, conversationHistory, shouldCallAI, isPublicChat });
    
    const result = await provideStudyAssistanceWithFallback({
      question: cleanedQuestion,
      context: context || 'General Chat',
      conversationHistory: conversationHistory || []
    });

    console.log('Chat API result:', result);

    return NextResponse.json({
      success: true,
      answer: result.answer,
      provider: result.provider,
      shouldRespond: true
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ 
      error: 'AI service failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

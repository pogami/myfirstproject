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
    
    console.log('Chat API called with:', { 
      question: cleanedQuestion, 
      context, 
      conversationHistory: conversationHistory?.length || 0, 
      shouldCallAI, 
      isPublicChat,
      timestamp: new Date().toISOString()
    });
    
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 30000); // 30 second timeout
    });
    
    const aiPromise = provideStudyAssistanceWithFallback({
      question: cleanedQuestion,
      context: context || 'General Chat',
      conversationHistory: conversationHistory || []
    });
    
    const result = await Promise.race([aiPromise, timeoutPromise]) as any;

    console.log('Chat API result:', { 
      provider: result.provider, 
      answerLength: result.answer?.length || 0,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      answer: result.answer,
      provider: result.provider,
      shouldRespond: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Provide a helpful fallback response instead of just an error
    const fallbackResponse = {
      success: true,
      answer: `Hey! I'm CourseConnect AI, your friendly study buddy! I'm having a small technical hiccup right now, but I'm still here to help! I can assist with:\n\n📚 Academic subjects and homework\n💡 Study strategies and tips\n📝 Writing and research\n🧠 Problem-solving\n💬 General questions and conversation\n\nWhat's on your mind? What would you like to talk about or get help with?`,
      provider: 'fallback',
      shouldRespond: true,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(fallbackResponse, { status: 200 });
  }
}

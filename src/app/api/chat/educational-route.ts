// Gemini-Only Educational Chat API
// Simplified to use only Google AI (Gemini) for all educational tasks

import { NextRequest, NextResponse } from 'next/server';
import { EducationalModelManager } from '@/lib/educational-model-manager';
import { provideStudyAssistance } from '@/ai/services/dual-ai-service';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, context, conversationHistory, shouldCallAI, isPublicChat, hasAIMention, timestamp } = body;
    
    console.log('🎓 Educational Chat API called with:', { 
      question: question?.substring(0, 100) + '...',
      shouldCallAI, 
      isPublicChat,
      hasAIMention
    });

    if (!shouldCallAI) {
      return NextResponse.json({
        success: true,
        answer: '',
        provider: 'none',
        shouldRespond: false,
        timestamp: new Date().toISOString(),
        sources: []
      });
    }

    const cleanedQuestion = question.trim();
    if (!cleanedQuestion) {
      return NextResponse.json({
        success: true,
        answer: '',
        provider: 'none',
        shouldRespond: false,
        timestamp: new Date().toISOString(),
        sources: []
      });
    }

    // Get educational model info
    const modelInfo = EducationalModelManager.getModelInfo(cleanedQuestion);
    console.log(`🎯 Using Gemini for ${modelInfo.subject} (${modelInfo.complexity})`);

    // Use Gemini AI service
    const aiResponse = await provideStudyAssistance({
      question: cleanedQuestion,
      context: context || '',
      conversationHistory: conversationHistory || [],
      fileContext: undefined
    });

    console.log(`✅ Gemini response received for ${modelInfo.subject}`);

    return NextResponse.json({
      success: true,
      answer: aiResponse.answer,
      provider: aiResponse.provider,
      shouldRespond: true,
      timestamp: new Date().toISOString(),
      sources: aiResponse.sources || [],
      modelInfo: {
        subject: modelInfo.subject,
        complexity: modelInfo.complexity,
        provider: 'google'
      }
    });

  } catch (error) {
    console.error('❌ Educational Chat API Error:', error);
    
    return NextResponse.json({
      success: false,
      answer: 'I apologize, but I\'m experiencing some technical difficulties. Please try again in a moment.',
      provider: 'fallback',
      shouldRespond: true,
      timestamp: new Date().toISOString(),
      sources: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
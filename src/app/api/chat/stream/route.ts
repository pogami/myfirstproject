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
        answer: null,
        shouldRespond: false
      });
    }

    // Clean @ mentions from the question if present
    const cleanedQuestion = question.replace(/@ai\s*/gi, '').trim();
    
    console.log('Streaming Chat API called with:', { 
      question: cleanedQuestion, 
      context, 
      conversationHistory: conversationHistory?.length || 0, 
      shouldCallAI, 
      isPublicChat,
      timestamp: new Date().toISOString()
    });

    // Create a readable stream for real-time response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Add timeout to prevent hanging requests
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), 30000);
          });
          
          const aiPromise = provideStudyAssistanceWithFallback({
            question: cleanedQuestion,
            context: context || 'General Chat',
            conversationHistory: conversationHistory || []
          });
          
          const result = await Promise.race([aiPromise, timeoutPromise]) as any;

          // Send the complete response
          const responseData = {
            success: true,
            answer: result.answer,
            provider: result.provider,
            shouldRespond: true,
            timestamp: new Date().toISOString()
          };

          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(responseData)}\n\n`));
          controller.close();

        } catch (error) {
          console.error('Streaming Chat API error:', error);
          
          const errorResponse = {
            success: false,
            error: 'Failed to generate response',
            answer: 'I apologize, but I encountered an error while processing your request. Please try again.',
            provider: 'fallback',
            shouldRespond: true,
            timestamp: new Date().toISOString()
          };

          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(errorResponse)}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Streaming Chat API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      answer: 'I apologize, but I encountered an error while processing your request. Please try again.',
      provider: 'fallback',
      shouldRespond: true,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

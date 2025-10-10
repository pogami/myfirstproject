import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();
    console.log('🤖 Gemini-Only Demo API called with:', { question });

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid question' }, { status: 400 });
    }

    const cleanedQuestion = question.trim();

    // Use ONLY Google Gemini - no web search, no other services
    console.log('🤖 Using ONLY Google Gemini 1.5 Flash...');
    
    const apiKey = 'AIzaSyDjMZmrQsdSf8B8csnWvZSvT-_zGgiTg14';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash'
    });

    const geminiPrompt = `You are a helpful AI assistant. Answer the user's question naturally and conversationally.

INSTRUCTIONS:
- Provide accurate, helpful information
- Be conversational and friendly
- Keep responses clear and concise (2-4 paragraphs)
- Use proper paragraphs with line breaks
- For greetings, respond naturally

User Question: ${cleanedQuestion}

Answer:`;

    try {
      const result = await model.generateContent(geminiPrompt);
      const response = await result.response;
      let aiResponse = response.text();

      // Clean up the response
      aiResponse = aiResponse.trim();

      console.log('✅ Google Gemini responded successfully');
      console.log('Gemini Demo API result:', {
        model: 'gemini-1.5-flash',
        answerLength: aiResponse.length,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        answer: aiResponse,
        sources: [], // No web search sources
        provider: 'gemini-1.5-flash',
        timestamp: new Date().toISOString()
      });

    } catch (geminiError: any) {
      console.error('❌ Gemini API error:', geminiError);
      console.error('❌ Gemini error details:', {
        message: geminiError.message,
        status: geminiError.status,
        code: geminiError.code
      });
      return NextResponse.json({
        error: 'Failed to generate response',
        details: geminiError.message,
        status: geminiError.status || 500
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Gemini Demo API error:', error);
    
    return NextResponse.json({
      error: 'Failed to process request',
      details: error.message
    }, { status: 500 });
  }
}

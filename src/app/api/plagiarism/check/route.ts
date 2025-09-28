import { NextRequest, NextResponse } from 'next/server';
import { checkPlagiarism } from '@/ai/services/citation-service';

export async function POST(request: NextRequest) {
  try {
    const { text, minLength = 50 } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required for plagiarism check' },
        { status: 400 }
      );
    }

    if (text.length < 20) {
      return NextResponse.json(
        { error: 'Text must be at least 20 characters long' },
        { status: 400 }
      );
    }

    const result = await checkPlagiarism(text, minLength);

    return NextResponse.json({ 
      success: true, 
      result 
    });

  } catch (error) {
    console.error('Plagiarism check error:', error);
    return NextResponse.json(
      { error: 'Failed to check plagiarism' },
      { status: 500 }
    );
  }
}

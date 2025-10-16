import { NextRequest, NextResponse } from 'next/server';
import { generateMLACitation, generateMultipleCitations } from '@/ai/services/citation-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle multiple citations
    if (body.citations && Array.isArray(body.citations)) {
      const citations = await generateMultipleCitations(body.citations);
      return NextResponse.json({ 
        success: true, 
        citations,
        count: citations.length 
      });
    }
    
    // Handle single citation
    const { text, url, sourceType, manualData } = body;
    
    // More lenient validation - allow any input
    if (!text && !url && !manualData) {
      return NextResponse.json(
        { error: 'Either text, URL, or manual data is required' },
        { status: 400 }
      );
    }

    const citation = await generateMLACitation({
      text: text || '',
      url,
      sourceType,
      manualData
    });

    return NextResponse.json({ 
      success: true, 
      citation 
    });

  } catch (error) {
    console.error('Citation generation error:', error);
    
    // Return a fallback citation instead of error
    const fallbackCitation = {
      inText: '("Source")',
      worksCited: '"Source." Unknown Publisher, n.d.',
      sourceType: 'website',
      confidence: 20
    };
    
    return NextResponse.json({ 
      success: true, 
      citation: fallbackCitation,
      warning: 'Generated fallback citation due to processing error'
    });
  }
}

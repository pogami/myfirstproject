import { NextRequest, NextResponse } from 'next/server';
import { dualAIService } from '@/ai/services/dual-ai-service';

export async function POST(request: NextRequest) {
  try {
    const { extractedText, fileName, fileType, userPrompt } = await request.json();
    
    if (!extractedText) {
      return NextResponse.json(
        { error: 'No text content provided for analysis' },
        { status: 400 }
      );
    }
    
    // Determine the analysis type based on user prompt
    let analysisPrompt: string;
    
    if (userPrompt) {
      // User has a specific question about the document
      analysisPrompt = `You are analyzing a ${fileType} document named "${fileName}". 

**Document Content:**
${extractedText}

**User's Question:**
${userPrompt}

Please provide a comprehensive answer to the user's question based on the document content. If the document doesn't contain information relevant to their question, let them know and suggest what information is available in the document instead.

**Response Format:**
- Answer their specific question directly
- Quote relevant parts of the document when helpful
- If the question can't be answered from the document, explain why and suggest alternative questions
- Be concise but thorough`;
    } else {
      // Generate a general summary and analysis
      analysisPrompt = `You are analyzing a ${fileType} document named "${fileName}". 

**Document Content:**
${extractedText}

Please provide a comprehensive analysis of this document including:

1. **Document Summary:** A brief overview of what this document contains
2. **Key Information:** The most important points, facts, or data
3. **Document Type:** What kind of document this appears to be (academic paper, report, notes, etc.)
4. **Main Topics:** The primary subjects or themes covered
5. **Educational Value:** How this document could be useful for learning
6. **Questions for Further Study:** 3-5 questions a student might ask about this content

**Response Format:**
- Use clear headings for each section
- Be informative but concise
- Focus on educational value and learning opportunities
- If it's academic content, highlight key concepts and their importance`;
    }
    
    // Get AI analysis
    const aiResponse = await dualAIService.generateResponse(analysisPrompt);
    
    return NextResponse.json({
      success: true,
      analysis: aiResponse,
      fileName,
      fileType,
      hasUserPrompt: !!userPrompt
    });
    
  } catch (error: any) {
    console.error('Document analysis API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze document',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

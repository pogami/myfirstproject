import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageWithFreeVision, FreeVisionAnalysisInput } from '@/ai/services/free-vision-analysis-service';

export async function POST(request: NextRequest) {
  try {
    const { fileData, fileName, fileType, tutorSpecialty, tutorDescription } = await request.json();

    if (!fileData || !fileName) {
      return NextResponse.json(
        { error: 'File data and name are required' },
        { status: 400 }
      );
    }

    // Determine the type of analysis needed
    const isImage = fileType.startsWith('image/');
    const isPDF = fileType === 'application/pdf';
    const isDocument = fileType.includes('document') || fileType.includes('text');

    if (isImage) {
      // Use free vision analysis for images
      const visionInput: FreeVisionAnalysisInput = {
        imageData: fileData,
        fileName,
        fileType,
        tutorSpecialty: tutorSpecialty || 'General',
        tutorDescription: tutorDescription || 'General AI tutor'
      };

      const result = await analyzeImageWithFreeVision(visionInput);
      
      return NextResponse.json({
        analysis: result.analysis,
        fileName,
        fileType,
        tutorSpecialty,
        provider: result.provider,
        extractedText: result.extractedText,
        confidence: result.confidence
      });
    } else {
      // For non-image files, provide a basic analysis
      const analysis = `I can see you've uploaded a document: **${fileName}**

**Document Analysis:**
• File: ${fileName}
• Type: ${fileType}
• Content: Document content detected

**What I can help with:**
• Extract key information if you share the content
• Explain concepts from the document
• Answer questions about the topics covered
• Provide additional context and examples

**Specialized Analysis:**
${tutorSpecialty !== 'General' ? `As your ${tutorSpecialty} specializing in ${tutorDescription}, I can provide expert analysis focused on your field of expertise.` : 'I can provide comprehensive analysis across multiple subjects.'}

**Next Steps:**
Please share the text content from this document, and I can provide detailed analysis and explanations. You can copy and paste the relevant sections you'd like me to analyze.

What specific aspects of this document would you like me to explain?`;
      
      return NextResponse.json({
        analysis,
        fileName,
        fileType,
        tutorSpecialty,
        provider: 'text-analysis'
      });
    }

  } catch (error) {
    console.error('Error analyzing file:', error);
    return NextResponse.json(
      { error: 'Failed to analyze file' },
      { status: 500 }
    );
  }
}

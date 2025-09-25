import { NextRequest, NextResponse } from 'next/server';
import { provideStudyAssistance, StudyAssistanceInput } from '@/ai/services/dual-ai-service';

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

    let analysisPrompt = '';
    
    if (isImage) {
      analysisPrompt = `I need you to analyze this image file: "${fileName}"

Please provide a comprehensive analysis of this image including:
1. **Visual Description**: What do you see in the image? Describe the main elements, objects, text, diagrams, charts, etc.
2. **Content Analysis**: If there's text, diagrams, or educational content, explain what it shows
3. **Educational Value**: How can this image be used for learning? What concepts does it illustrate?
4. **Key Information**: Extract any important facts, data, or concepts shown
5. **Questions**: What questions could a student ask about this image?

${tutorSpecialty !== 'General' ? `As a ${tutorSpecialty} specializing in ${tutorDescription}, focus your analysis on how this image relates to your field of expertise.` : 'Provide a general educational analysis.'}

Be detailed and specific in your analysis. If you can see text, diagrams, or specific content, describe it accurately.`;
    } else if (isPDF) {
      analysisPrompt = `I need you to analyze this PDF document: "${fileName}"

Please provide a comprehensive analysis of this document including:
1. **Document Overview**: What type of document is this? (textbook, article, assignment, etc.)
2. **Key Concepts**: What are the main topics and concepts covered?
3. **Important Information**: Extract key facts, data, formulas, or important points
4. **Structure**: How is the document organized? What sections does it have?
5. **Educational Value**: How can this document be used for learning?
6. **Questions**: What questions could a student ask about this content?

${tutorSpecialty !== 'General' ? `As a ${tutorSpecialty} specializing in ${tutorDescription}, focus your analysis on how this document relates to your field of expertise.` : 'Provide a general educational analysis.'}

Be thorough and educational in your analysis.`;
    } else {
      analysisPrompt = `I need you to analyze this document: "${fileName}" (Type: ${fileType})

Please provide a comprehensive analysis of this document including:
1. **Document Type**: What kind of document is this?
2. **Content Summary**: What is the main content and purpose?
3. **Key Information**: Extract important facts, concepts, or data
4. **Educational Value**: How can this be used for learning?
5. **Key Takeaways**: What are the most important points?

${tutorSpecialty !== 'General' ? `As a ${tutorSpecialty} specializing in ${tutorDescription}, focus your analysis on how this document relates to your field of expertise.` : 'Provide a general educational analysis.'}

Be detailed and educational in your analysis.`;
    }

    // Use the AI service to analyze the file
    const input: StudyAssistanceInput = {
      question: analysisPrompt,
      context: `You are an expert AI tutor analyzing a file upload. The user has uploaded: ${fileName} (${fileType}). ${tutorSpecialty !== 'General' ? `You are specialized as a ${tutorSpecialty} with expertise in ${tutorDescription}.` : 'You are a general AI tutor.'} Provide detailed, educational analysis of the uploaded content.`,
      conversationHistory: []
    };

    const result = await provideStudyAssistance(input);
    
    return NextResponse.json({
      analysis: result.answer,
      fileName,
      fileType,
      tutorSpecialty
    });

  } catch (error) {
    console.error('Error analyzing file:', error);
    return NextResponse.json(
      { error: 'Failed to analyze file' },
      { status: 500 }
    );
  }
}

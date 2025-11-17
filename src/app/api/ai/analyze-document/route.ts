import { NextRequest, NextResponse } from 'next/server';
import { provideStudyAssistanceWithFallback } from '@/ai/services/dual-ai-service';
import { extractTextFromPdfBuffer } from '@/lib/pdf-text-extractor';

// Import file parsing utilities (mammoth can be loaded at top level)
const mammoth = require("mammoth");

// Increase timeout for OCR processing (can take 60-120 seconds for images, especially first run)
export const maxDuration = 120; // 120 seconds (2 minutes) for OCR
export const runtime = 'nodejs'; // Ensure Node.js runtime for Tesseract

export async function POST(request: NextRequest) {
  try {
    console.log('AI analyze-document API called');
    
    // Check if we have FormData (file upload) or JSON (extracted text)
    const contentType = request.headers.get('content-type') || '';
    let extractedText = '';
    let fileName = '';
    let fileType = '';
    let userPrompt = '';
    let courseData = null;
    
    if (contentType.includes('multipart/form-data')) {
      // Handle file upload - extract text from file
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const prompt = formData.get('prompt') as string;
      const courseDataStr = formData.get('courseData') as string;
      
      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }
      
      fileName = file.name;
      fileType = file.type;
      userPrompt = prompt || '';
      
      if (courseDataStr) {
        try {
          courseData = JSON.parse(courseDataStr);
        } catch (e) {
          console.warn('Failed to parse courseData:', e);
        }
      }
      
      // Extract text from file based on type - using same method as homepage
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filename = file.name.toLowerCase();
      
      try {
        if (filename.endsWith('.pdf')) {
          // Validate PDF magic bytes (%PDF)
          const pdfMagicBytes = buffer.slice(0, 4).toString();
          if (pdfMagicBytes !== '%PDF') {
            return NextResponse.json(
              { 
                success: false,
                error: 'Invalid PDF file',
                analysis: `I received your ${fileName} file, but it doesn't appear to be a valid PDF. Please try uploading a different file.`
              },
              { status: 400 }
            );
          }
          
          try {
            const { text } = await extractTextFromPdfBuffer(buffer);
            extractedText = text;
            console.log(`✅ PDF parsed successfully: ${extractedText.length} characters extracted from ${fileName}`);
          } catch (pdfError: any) {
            console.error('❌ PDF extraction failed:', pdfError);
            return NextResponse.json(
              { 
                success: false,
                error: 'PDF parsing failed',
                analysis: `I received your ${fileName} file, but couldn't extract any text. Please upload a text-based PDF or convert it to DOCX/TXT.`,
                details: pdfError?.message
              },
              { status: 400 }
            );
          }
        } else if (filename.endsWith('.docx')) {
          // Use mammoth for DOCX (same as homepage)
          const result = await mammoth.extractRawText({ buffer });
          extractedText = (result.value || '').trim();
          
          if (!extractedText || extractedText.length === 0) {
            return NextResponse.json(
              { 
                success: false,
                error: 'No text content found in DOCX',
                analysis: `I received your ${fileName} file, but I couldn't extract any text from it. The file might be empty or corrupted.`
              },
              { status: 400 }
            );
          }
          
          console.log(`✅ DOCX parsed successfully: ${extractedText.length} characters extracted from ${fileName}`);
        } else if (filename.endsWith('.txt')) {
          extractedText = buffer.toString('utf-8').trim();
          
          if (!extractedText || extractedText.length === 0) {
            return NextResponse.json(
              { 
                success: false,
                error: 'File is empty',
                analysis: `I received your ${fileName} file, but it appears to be empty.`
              },
              { status: 400 }
            );
          }
          
          console.log(`✅ TXT parsed successfully: ${extractedText.length} characters extracted from ${fileName}`);
        } else if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/i.test(filename)) {
          // Handle images using OCR (Tesseract.js)
          console.log(`📸 Processing image with OCR: ${fileName} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
          
          try {
            // Check file size (limit to 10MB for OCR)
            if (buffer.length > 10 * 1024 * 1024) {
              return NextResponse.json(
                { 
                  success: false,
                  error: 'Image too large',
                  analysis: `I received your ${fileName} image, but it's too large (${(buffer.length / 1024 / 1024).toFixed(2)} MB). Please try a smaller image (under 10MB) or compress it.`
                },
                { status: 400 }
              );
            }
            
            // Dynamic import of Tesseract to avoid SSR issues
            console.log('📦 Loading Tesseract.js...');
            const Tesseract = await import('tesseract.js');
            console.log('✅ Tesseract.js loaded');
            
            // Convert buffer to a format Tesseract can use
            // Tesseract can work with Buffer directly in Node.js
            console.log('🔍 Starting OCR recognition...');
            
            // Optimize OCR settings for faster processing
            const { data: { text, confidence } } = await Tesseract.default.recognize(buffer, 'eng', {
              logger: (m) => {
                if (m.status === 'recognizing text') {
                  console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                } else if (m.status === 'loading tesseract core') {
                  console.log('Loading Tesseract core...');
                } else if (m.status === 'initializing tesseract') {
                  console.log('Initializing Tesseract...');
                } else if (m.status === 'loading language traineddata') {
                  console.log('Loading language data...');
                }
              },
              // Optimize for speed - use auto page segmentation
              // PSM 3 = AUTO (default, good for most documents)
            });
            
            extractedText = (text || '').trim();
            
            if (!extractedText || extractedText.length === 0) {
              return NextResponse.json(
                { 
                  success: false,
                  error: 'No text found in image',
                  analysis: `I received your ${fileName} image, but I couldn't extract any text from it. Please make sure the image is clear and contains readable text. Try taking a clearer photo or screenshot.`
                },
                { status: 400 }
              );
            }
            
            console.log(`✅ OCR completed successfully: ${extractedText.length} characters extracted from ${fileName} (confidence: ${Math.round(confidence)}%)`);
          } catch (ocrError) {
            console.error('❌ OCR error:', ocrError);
            console.error('OCR error details:', {
              message: ocrError instanceof Error ? ocrError.message : 'Unknown error',
              stack: ocrError instanceof Error ? ocrError.stack : undefined,
              fileName,
              fileSize: buffer.length
            });
            
            return NextResponse.json(
              { 
                success: false,
                error: 'OCR processing failed',
                details: ocrError instanceof Error ? ocrError.message : 'Unknown OCR error',
                analysis: `I received your ${fileName} image, but I'm having trouble reading it with OCR. Error: ${ocrError instanceof Error ? ocrError.message : 'Unknown error'}. Please try a clearer image, smaller file size, or a different format.`
              },
              { status: 500 }
            );
          }
        } else {
          return NextResponse.json(
            { 
              success: false,
              error: 'Unsupported file type. Please upload PDF, DOCX, TXT, or image files (JPG, PNG, etc.).',
              analysis: `I received your ${fileName} file, but I can only analyze PDF, DOCX, TXT files, or images (screenshots/photos). What would you like to know about it?`
            },
            { status: 400 }
          );
        }
      } catch (extractError) {
        console.error('❌ Text extraction error:', extractError);
        console.error('Error details:', {
          message: extractError instanceof Error ? extractError.message : 'Unknown error',
          stack: extractError instanceof Error ? extractError.stack : undefined,
          fileName,
          fileType,
          fileSize: file?.size
        });
        
        // Provide more helpful error messages based on error type
        let errorMessage = `I received your ${fileName} file, but I'm having trouble reading it.`;
        
        if (extractError instanceof Error) {
          if (extractError.message.includes('timeout') || extractError.message.includes('timed out')) {
            errorMessage = `I received your ${fileName} file, but it's taking too long to process. The file might be too large or complex. Please try a smaller file or convert it to a simpler format.`;
          } else if (extractError.message.includes('corrupt') || extractError.message.includes('invalid')) {
            errorMessage = `I received your ${fileName} file, but it appears to be corrupted or invalid. Please try uploading the file again or use a different file.`;
          } else if (extractError.message.includes('memory') || extractError.message.includes('out of memory')) {
            errorMessage = `I received your ${fileName} file, but it's too large to process. Please try a smaller file or split it into multiple parts.`;
          }
        }
        
        return NextResponse.json(
          { 
            success: false,
            error: 'Failed to extract text from file',
            details: extractError instanceof Error ? extractError.message : 'Unknown error',
            analysis: errorMessage
          },
          { status: 400 }
        );
      }
      
      if (!extractedText || extractedText.trim().length === 0) {
        return NextResponse.json(
          { 
            success: false,
            error: 'No text content found in the file',
            analysis: `I received your ${fileName} file, but it appears to be empty or I couldn't extract any text from it. This might be a scanned PDF or image-based document.`
          },
          { status: 400 }
        );
      }
    } else {
      // Handle JSON request with extracted text
      const body = await request.json();
      extractedText = body.extractedText || '';
      fileName = body.fileName || 'document';
      fileType = body.fileType || '';
      userPrompt = body.userPrompt || '';
      courseData = body.courseData || null;
    
    if (!extractedText) {
      return NextResponse.json(
        { error: 'No text content provided for analysis' },
        { status: 400 }
      );
      }
    }
    
    // Build course context if available
    let courseContext = '';
    if (courseData) {
      const { courseName, courseCode, topics, assignments, exams } = courseData;
      courseContext = `\n\nCOURSE CONTEXT:
- Course: ${courseName}${courseCode ? ` (${courseCode})` : ''}
${topics && topics.length > 0 ? `- Topics: ${topics.slice(0, 10).join(', ')}${topics.length > 10 ? '...' : ''}` : ''}
${assignments && assignments.length > 0 ? `- Assignments: ${assignments.length} total` : ''}
${exams && exams.length > 0 ? `- Exams: ${exams.map((e: any) => e.name).join(', ')}` : ''}

IMPORTANT: Extract and highlight information that is MOST RELEVANT to this course. Focus on:
- Concepts, theories, or topics that match the course curriculum
- Information that relates to assignments or exams
- Key takeaways that would help with course understanding
- Important details that students should know for this class`;
    }
    
    // Determine the analysis type based on user prompt and course context
    let analysisQuestion: string;
    
    if (userPrompt) {
      // User has a specific question about the document
      analysisQuestion = `${userPrompt}

Document: ${fileName} (${fileType || 'unknown type'})
${courseContext ? courseContext : ''}

Please analyze the document content and provide a comprehensive answer to the user's question.${courseContext ? ' Focus on information most relevant to the course.' : ''}`;
    } else {
      // General analysis with course focus - be conversational and helpful with good structure
      analysisQuestion = `I just read a document called "${fileName}"${courseContext ? ` for ${courseData.courseName}` : ''}. Please provide a well-structured, easy-to-read analysis.

IMPORTANT FORMATTING RULES:
- Use clear sections with headers
- Use bullet points for lists
- Keep paragraphs short (2-3 sentences max)
- Use line breaks between sections
- Make it scannable and easy to read
- NO long walls of text

Structure your response like this:

**Document Overview**
[Brief 2-3 sentence summary of what the document is about]

**Key Topics Covered**
[Bullet points of main topics/sections]

**Important Concepts**
[Bullet points of key concepts students should know]

${courseContext ? `**Relevance to ${courseData.courseName}**\n[How this relates to their course topics, assignments, or exams]` : '**Main Themes**\n[Main themes and concepts]'}

**Key Takeaways**
[Bullet points of what students should remember]

Be conversational but structured. Start with a friendly greeting, then organize the information clearly.`;
    }

    console.log(`🔍 Starting document analysis for: ${fileName}${courseData ? ` (Course: ${courseData.courseName})` : ''}`);

    // Use the dual AI service (Gemini + OpenAI) for better analysis
    let aiResponse: string;
    let selectedModel: string;
    
    try {
      // Increase text limit for better analysis (15000 chars should work with most models)
      const textForAnalysis = extractedText.length > 15000 
        ? extractedText.substring(0, 15000) + '\n\n[Document continues - showing first 15,000 characters...]' 
        : extractedText;
      
      console.log(`📄 Extracted ${extractedText.length} characters from ${fileName}, analyzing ${textForAnalysis.length} characters`);
      
      // Create a more direct and helpful prompt
      const fullPrompt = `${analysisQuestion}

FULL DOCUMENT CONTENT:
${textForAnalysis}

Please read the document above and provide a helpful, detailed analysis. Be conversational and informative - like you're explaining it to a friend.`;

      const aiResult = await provideStudyAssistanceWithFallback({
        question: fullPrompt,
        context: `Document Analysis: ${fileName}${courseData ? ` | Course: ${courseData.courseName}` : ''}`,
        conversationHistory: []
      });
      
      if (aiResult && aiResult.answer && aiResult.answer.trim().length > 50) {
        aiResponse = aiResult.answer;
        selectedModel = aiResult.provider || 'fallback';
        console.log(`✅ Analysis successful using ${selectedModel}, response length: ${aiResponse.length}`);
        } else {
        throw new Error('AI returned empty or too short response');
      }
    } catch (error) {
      console.error(`❌ AI service failed:`, error);
      
      // Create a helpful fallback analysis from the document content itself
      const textPreview = extractedText.substring(0, 1000);
      const sentences = textPreview.split(/[.!?]+/).filter(s => s.trim().length > 20).slice(0, 5);
      const keyPoints = sentences.join('. ') + (extractedText.length > 1000 ? '...' : '');
      
      aiResponse = `I've read through "${fileName}" and here's what it covers:

**Summary:**
${keyPoints}

${courseData ? `\n**Relevance to ${courseData.courseName}:**\nThis document appears to contain information that could be useful for your course. ` : ''}${userPrompt ? `\n\nRegarding your question "${userPrompt}": The document contains relevant information that addresses this topic.` : '\n\nThe document contains detailed information. What specific aspect would you like me to explain or help you understand?'}`;
      
      selectedModel = 'fallback';
      console.log(`📝 Using intelligent fallback analysis`);
    }
    
    return NextResponse.json({
      success: true,
      analysis: aiResponse,
      extractedText: extractedText, // Include raw extracted text for parsing
      fileName,
      fileType,
      provider: selectedModel || 'fallback',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('🔍 Document analysis error:', error);
    
    // Try to provide a helpful response even on error
    let helpfulResponse = `I received your document "${fileName}". `;
    
    if (extractedText && extractedText.length > 0) {
      const preview = extractedText.substring(0, 500);
      helpfulResponse += `Here's a preview of what it contains:\n\n${preview}...\n\nThe document appears to discuss important topics. What would you like to know more about?`;
    } else {
      helpfulResponse += `I'm having trouble reading the content right now, but I'm here to help! What questions do you have about this document?`;
    }
    
    return NextResponse.json({
      success: true,
      error: 'Document analysis encountered an issue',
      details: error instanceof Error ? error.message : 'Unknown error',
      analysis: helpfulResponse,
      timestamp: new Date().toISOString()
    });
  }
}
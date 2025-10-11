import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload a DOCX file.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          success: false, 
          error: `File too large. Maximum size is 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB` 
        },
        { status: 400 }
      );
    }

    try {
      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Use mammoth library to extract text
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer: arrayBuffer });
      
      const extractedText = result.value.trim();

      if (!extractedText || extractedText.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No text content found in the DOCX file' },
          { status: 400 }
        );
      }

      // Return success response
      return NextResponse.json({
        success: true,
        text: extractedText,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          extractedAt: new Date().toISOString(),
          textLength: extractedText.length
        }
      });

    } catch (extractionError: any) {
      console.error('DOCX extraction error:', extractionError);
      
      // Fallback to helpful guidance if extraction fails
      const helpfulMessage = `DOCX text extraction failed: ${extractionError.message}

While we work on improving DOCX processing, here are some quick alternatives:

**Easiest Options:**
1. **Copy & Paste**: Select all text in your DOCX (Ctrl+A) and paste into a .txt file
2. **Save As**: Open DOCX in Word → File → Save As → Plain Text (.txt)
3. **Google Docs**: Upload DOCX to Google Docs → Download as TXT

**Online Converters:**
- SmallPDF.com (DOCX to TXT)
- ILovePDF.com (DOCX to TXT)
- PDF24.org (free online tools)

Once converted to TXT format, you can upload it here for immediate processing!`;

      return NextResponse.json({
        success: false,
        error: helpfulMessage,
        alternatives: [
          'Copy text from DOCX and paste into a .txt file',
          'Use Microsoft Word: File → Save As → Plain Text',
          'Use Google Docs: Upload DOCX → Download as TXT',
          'Use online converters like SmallPDF or ILovePDF'
        ],
        note: 'TXT files work perfectly! We\'re working on improving DOCX text extraction.'
      }, { status: 200 });
    }

  } catch (error: any) {
    console.error('DOCX processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'DOCX processing is temporarily unavailable. Please try converting to TXT format.',
        alternatives: [
          'Copy text from DOCX and paste into a .txt file',
          'Use Microsoft Word: File → Save As → Plain Text',
          'Use Google Docs: Upload DOCX → Download as TXT'
        ]
      },
      { status: 200 }
    );
  }
}

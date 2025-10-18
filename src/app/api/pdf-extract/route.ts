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
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload a PDF file.' },
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
      console.log('🔍 Step 1: Converting file to ArrayBuffer...');
      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      console.log('✅ Step 1 complete: ArrayBuffer size:', arrayBuffer.byteLength);
      
      console.log('🔍 Step 2: Importing pdf-parse library...');
      // Use pdf-parse library to extract text
      const pdfParse = await import('pdf-parse');
      console.log('✅ Step 2 complete: pdf-parse imported');
      console.log('📦 pdf-parse structure:', Object.keys(pdfParse));
      console.log('📦 pdf-parse.default type:', typeof pdfParse.default);
      
      console.log('🔍 Step 3: Calling pdf-parse on ArrayBuffer...');
      const data = await pdfParse.default(arrayBuffer);
      console.log('✅ Step 3 complete: PDF parsed');
      console.log('📄 Data structure:', Object.keys(data));
      console.log('📄 Text length:', data.text?.length);
      
      const extractedText = data.text.trim();
      console.log('📝 Extracted text preview:', extractedText.substring(0, 200));

      if (!extractedText || extractedText.length === 0) {
        console.error('❌ No text found in PDF');
        return NextResponse.json(
          { success: false, error: 'No text content found in the PDF file' },
          { status: 400 }
        );
      }

      console.log('✅ PDF extraction successful!');
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
      console.error('PDF extraction error:', extractionError);
      
      // Fallback to helpful guidance if extraction fails
      const helpfulMessage = `PDF text extraction failed: ${extractionError.message}

While we work on improving PDF processing, here are some quick alternatives:

**Easiest Options:**
1. **Copy & Paste**: Select all text in your PDF (Ctrl+A) and paste into a .txt file
2. **Google Docs**: Upload PDF to Google Docs → Download as DOCX
3. **Microsoft Word**: Open PDF directly in Word (if text-based)

**Online Converters:**
- SmallPDF.com (PDF to TXT)
- ILovePDF.com (PDF to TXT)
- PDF24.org (free online tools)

Once converted to TXT format, you can upload it here for immediate processing!`;

      return NextResponse.json({
        success: false,
        error: helpfulMessage,
        alternatives: [
          'Copy text from PDF and paste into a .txt file',
          'Use Google Docs: Upload PDF → Download as DOCX',
          'Use Microsoft Word: File → Open → Select PDF',
          'Use online converters like SmallPDF or ILovePDF'
        ],
        note: 'TXT files work perfectly! We\'re working on improving PDF text extraction.'
      }, { status: 200 });
    }

  } catch (error: any) {
    console.error('PDF processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'PDF processing is temporarily unavailable. Please try converting to TXT format.',
        alternatives: [
          'Copy text from PDF and paste into a .txt file',
          'Use Google Docs: Upload PDF → Download as DOCX',
          'Use Microsoft Word: File → Open → Select PDF'
        ]
      },
      { status: 200 }
    );
  }
}
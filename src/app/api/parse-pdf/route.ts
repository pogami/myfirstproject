import { NextRequest, NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { extractTextFromPdfBuffer } from '@/lib/pdf-text-extractor';

// CRITICAL: This route MUST run on Node.js runtime only (not Edge runtime)
// pdf2json requires Node.js APIs (Buffer, fs, etc.) and cannot run on Edge
// This is a server-side only API route - client code calls this via fetch()
export const runtime = 'nodejs';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

// Set maximum duration to 30 seconds for PDF parsing
export const maxDuration = 30;

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
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
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
      console.log('📥 Received PDF file:', { 
        fileName: file.name, 
        fileSize: file.size, 
        fileType: file.type 
      });

      // Convert file to ArrayBuffer, then to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      console.log('📦 Buffer created:', { bufferSize: buffer.length });

      let extractedText = '';
      let pageCount = 1;
      const extractionMethod = 'pdf2json';

      try {
        const extractionResult = await extractTextFromPdfBuffer(buffer);
        extractedText = extractionResult.text;
        pageCount = extractionResult.pageCount;
      } catch (pdf2jsonError: any) {
        const errorMessage = pdf2jsonError.message || '';
        console.error('❌ pdf2json extraction failed:', errorMessage);
        
        throw new Error(
          'Unable to extract text from this PDF. This might be a scanned PDF (image-based) or the file may be corrupted. ' +
          'Please try uploading a text-based PDF, or convert it to TXT or DOCX format.'
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
          textLength: extractedText.length,
          pageCount: pageCount,
          extractionMethod
        }
      });

    } catch (extractionError: any) {
      console.error('❌ PDF extraction error:', extractionError);
      console.error('❌ Error stack:', extractionError.stack);
      console.error('❌ Error details:', {
        message: extractionError.message,
        name: extractionError.name,
        code: extractionError.code
      });

      return NextResponse.json({
        success: false,
        error: `PDF text extraction failed: ${extractionError.message}`,
        errorDetails: process.env.NODE_ENV === 'development' ? {
          stack: extractionError.stack,
          name: extractionError.name,
          code: extractionError.code
        } : undefined,
        alternatives: [
          'Copy text from PDF and paste into a .txt file',
          'Use Adobe Reader: File → Save As → Text',
          'Use Google Docs: Upload PDF → Download as TXT',
          'Use online converters like SmallPDF or ILovePDF'
        ],
        note: 'TXT and DOCX files work perfectly!'
      }, { status: 200 });
    }

  } catch (error: any) {
    console.error('❌ PDF processing error (outer catch):', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: `PDF processing failed: ${error.message}`,
        errorDetails: process.env.NODE_ENV === 'development' ? {
          stack: error.stack,
          name: error.name,
          code: error.code
        } : undefined,
        alternatives: [
          'Copy text from PDF and paste into a .txt file',
          'Use Adobe Reader: File → Save As → Text',
          'Use Google Docs: Upload PDF → Download as TXT'
        ]
      },
      { status: 200 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { ensurePdfNodeSupport, loadPdfParse } from '@/lib/pdf-node-utils';

/**
 * Simple PDF text extraction using pdf-parse
 * Clean, reliable implementation for Next.js
 */
export async function POST(request: NextRequest) {
  try {
    // Get file from FormData
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

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate PDF magic bytes (%PDF)
    const pdfMagicBytes = buffer.slice(0, 4).toString();
    if (pdfMagicBytes !== '%PDF') {
      return NextResponse.json(
        { success: false, error: 'Invalid PDF file: file does not appear to be a valid PDF' },
        { status: 400 }
      );
    }

    // Configure pdfjs-dist and load pdf-parse in an ESM-friendly way
    await ensurePdfNodeSupport();
    const pdfParse = await loadPdfParse();
    
    // Convert Buffer to Uint8Array (pdf-parse requires Uint8Array)
    const uint8Array = new Uint8Array(buffer);
    
    // Extract text directly (pdf-parse v2.4.3 default export)
    const result = await pdfParse(uint8Array);
    
    // Get extracted text and page count
    // pdf-parse returns: { text: string, numpages: number, info: object, metadata: object }
    const extractedText = (result?.text || '').trim();
    const pageCount = result?.numpages || result?.numPages || 1;

    if (!extractedText || extractedText.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No text content found in the PDF. This might be a scanned PDF (image-based).',
          isScannedPDF: true
        },
        { status: 400 }
      );
    }

    // Return success
    return NextResponse.json({
      success: true,
      text: extractedText,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        extractedAt: new Date().toISOString(),
        textLength: extractedText.length,
        pageCount: pageCount
      }
    });

  } catch (error: any) {
    console.error('PDF processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `PDF processing failed: ${error.message}`,
        errorDetails: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPdfBuffer } from '@/lib/pdf-text-extractor';

/**
 * Simple PDF text extraction using pdf2json helper
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

    const { text: extractedText, pageCount } = await extractTextFromPdfBuffer(buffer);

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


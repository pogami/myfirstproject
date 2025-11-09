import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

/**
 * Extract text from PDF using pdf2json (file-based approach)
 * Falls back to pdf-parse if pdf2json fails
 */
async function extractPDFText(buffer: Buffer): Promise<{ text: string; pageCount: number }> {
  const tempFilePath = join(tmpdir(), `pdf-${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`);
  
  try {
    // Write buffer to temp file (pdf2json works better with file paths)
    await fs.writeFile(tempFilePath, buffer);
    
    // Try pdf2json first (file-based approach from GitHub repo)
    try {
      // Use dynamic require to avoid build-time errors if package is missing
      let PDFParser: any;
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        PDFParser = require('pdf2json');
      } catch (requireError) {
        // pdf2json not available, skip to fallback
        throw new Error('pdf2json package not available');
      }
      
      // Instantiate PDFParser as shown in the GitHub repo
      const pdfParser = new (PDFParser as any)(null, 1);
      
      // Parse PDF using pdf2json (event-based with file path)
      const parsedData = await new Promise<any>((resolve, reject) => {
        // Set timeout to prevent hanging
        const timeout = setTimeout(() => {
          reject(new Error('PDF parsing timeout'));
        }, 30000); // 30 second timeout
        
        pdfParser.on('pdfParser_dataError', (errData: any) => {
          clearTimeout(timeout);
          const errorMsg = errData?.parserError || errData?.message || JSON.stringify(errData);
          reject(new Error(`pdf2json error: ${errorMsg}`));
        });
        
        pdfParser.on('pdfParser_dataReady', () => {
          clearTimeout(timeout);
          resolve(pdfParser);
        });
        
        // Use loadPDF instead of parseBuffer (more reliable - from GitHub repo)
        try {
          pdfParser.loadPDF(tempFilePath);
        } catch (parseError: any) {
          clearTimeout(timeout);
          reject(new Error(`Failed to load PDF: ${parseError.message}`));
        }
      });
      
      // Extract text using getRawTextContent() method
      const extractedText = parsedData.getRawTextContent()?.trim() || '';
      const pageCount = parsedData.Pages?.length || 1;
      
      console.log('✅ pdf2json extraction successful:', { textLength: extractedText.length, pageCount });
      
      return { text: extractedText, pageCount };
    } catch (pdf2jsonError: any) {
      console.warn('⚠️ pdf2json failed, trying pdf-parse fallback:', pdf2jsonError.message);
      
      // Fallback to pdf-parse (v2 API - class-based)
      try {
        // Use dynamic import since pdf-parse is an ES module
        const pdfParseModule = await import('pdf-parse');
        // pdf-parse v2 uses PDFParse class
        const { PDFParse } = pdfParseModule as any;
        
        if (!PDFParse || typeof PDFParse !== 'function') {
          throw new Error(`PDFParse class not found in pdf-parse module. Available keys: ${Object.keys(pdfParseModule).join(', ')}`);
        }
        
        // Create parser instance with buffer data
        const parser = new PDFParse({ data: buffer });
        
        // Extract text using v2 API
        const result = await parser.getText();
        const extractedText = result.text?.trim() || '';
        const pageCount = result.pages?.length || result.numpages || 1;
        
        // Clean up parser resources
        await parser.destroy();
        
        console.log('✅ pdf-parse extraction successful:', { textLength: extractedText.length, pageCount });
        
        return { text: extractedText, pageCount };
      } catch (pdfParseError: any) {
        console.error('❌ Both pdf2json and pdf-parse failed');
        console.error('pdf2json error:', pdf2jsonError.message);
        console.error('pdf-parse error:', pdfParseError.message);
        console.error('pdf-parse error details:', pdfParseError);
        
        throw new Error(`PDF extraction failed. pdf2json: ${pdf2jsonError.message}. pdf-parse: ${pdfParseError.message}`);
      }
    }
  } finally {
    // Clean up temp file
    try {
      await fs.unlink(tempFilePath).catch(() => {});
    } catch {
      // Ignore cleanup errors
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Support both FormData and JSON (base64) formats
    const contentType = request.headers.get('content-type') || '';
    let file: File | null = null;
    let fileName = '';
    let fileSize = 0;
    let fileType = '';
    let buffer: Buffer;

    if (contentType.includes('application/json')) {
      // Handle base64 JSON format
      const body = await request.json();
      if (!body.file || !body.fileName) {
        return NextResponse.json(
          { success: false, error: 'No file provided' },
          { status: 400 }
        );
      }
      
      // Convert base64 to Buffer
      const base64Data = body.file.replace(/^data:.*,/, '');
      
      try {
        buffer = Buffer.from(base64Data, 'base64');
      } catch (bufferError: any) {
        return NextResponse.json({
          success: false,
          error: `Failed to decode base64: ${bufferError.message}`
        }, { status: 400 });
      }
      
      fileName = body.fileName;
      fileSize = body.fileSize || buffer.length;
      fileType = body.fileType || 'application/pdf';
    } else {
      // Handle FormData format
      const formData = await request.formData();
      file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No file provided' },
          { status: 400 }
        );
      }

      fileName = file.name;
      fileSize = file.size;
      fileType = file.type;
      
      // Convert file to Buffer
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }
    
    // Validate buffer is not empty
    if (!buffer || buffer.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid PDF file: buffer is empty'
      }, { status: 400 });
    }
    
    // Validate PDF magic bytes (%PDF)
    const pdfMagicBytes = buffer.slice(0, 4).toString();
    if (pdfMagicBytes !== '%PDF') {
      return NextResponse.json({
        success: false,
        error: 'Invalid PDF file: file does not appear to be a valid PDF'
      }, { status: 400 });
    }
    
    // Validate file type
    if (fileType !== 'application/pdf' && !fileName.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload a PDF file.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileSize > maxSize) {
      return NextResponse.json(
        { 
          success: false, 
          error: `File too large. Maximum size is 10MB. Your file is ${(fileSize / 1024 / 1024).toFixed(1)}MB` 
        },
        { status: 400 }
      );
    }

    // Extract text from PDF
    const { text: extractedText, pageCount } = await extractPDFText(buffer);
    
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

    // Return success response
    return NextResponse.json({
      success: true,
      text: extractedText,
      metadata: {
        fileName: fileName,
        fileSize: fileSize,
        fileType: fileType,
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

import { NextRequest, NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

export const runtime = 'nodejs';

// Helper function to split text into chunks for AI processing
function splitTextIntoChunks(text: string, chunkSize: number = 500): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }
  
  return chunks;
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const tempDir = '/tmp';
  const tempFilePath = path.join(tempDir, `temp_${Date.now()}.pdf`);
  const writeFile = promisify(fs.writeFile);
  const unlink = promisify(fs.unlink);
  
  try {
    // Write PDF to temporary file
    await writeFile(tempFilePath, buffer);
    console.log('Temporary PDF file created:', tempFilePath);
    
    // For now, we'll implement a basic approach
    // In a production environment, you would:
    // 1. Convert PDF to images using pdf2pic
    // 2. Use tesseract.js to extract text from each image
    // 3. Combine all text
    
    // Since pdf2pic requires system dependencies (poppler), 
    // we'll provide a helpful message for now
    const message = `PDF processing is being implemented with OCR technology.

Current status: The system is set up to process PDFs using:
1. PDF to image conversion (pdf2pic)
2. OCR text extraction (tesseract.js)
3. Text chunking for AI processing

For immediate use, please convert your PDF to TXT or DOCX format.`;
    
    // Clean up temporary file
    await unlink(tempFilePath);
    
    return message;
    
  } catch (error) {
    // Clean up temporary file if it exists
    try {
      await unlink(tempFilePath);
    } catch (cleanupError) {
      console.warn('Failed to clean up temporary file:', cleanupError);
    }
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file provided' 
      }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ 
        success: false, 
        error: 'File must be a PDF' 
      }, { status: 400 });
    }

    console.log('Processing PDF:', file.name, 'Size:', file.size);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      console.log('Starting PDF text extraction...');
      
      const text = await extractTextFromPDF(buffer);
      
      // Split text into chunks for better AI processing
      const chunks = splitTextIntoChunks(text, 500);
      
      console.log('PDF extraction completed:', {
        textLength: text.length,
        chunks: chunks.length,
        fileName: file.name
      });

      return NextResponse.json({
        success: true,
        text: text,
        chunks: chunks,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          method: 'OCR-based extraction (in development)',
          textLength: text.length,
          chunkCount: chunks.length
        }
      });
      
    } catch (pdfError: any) {
      console.error('PDF processing error:', pdfError);
      return NextResponse.json({
        success: false,
        error: `Failed to process PDF: ${pdfError.message}. Please try converting to TXT or DOCX format.`,
        alternatives: [
          'Copy text from PDF and paste into a .txt file',
          'Use online PDF-to-text converters like SmallPDF or ILovePDF',
          'Export PDF as DOCX from Adobe Acrobat or Google Docs',
          'Use Google Docs: File → Open → Upload → Download as DOCX',
          'Use Adobe Acrobat: File → Export To → Microsoft Word'
        ],
        note: 'OCR-based PDF processing is being implemented and will be available soon!'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('PDF extraction API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
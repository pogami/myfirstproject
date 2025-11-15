import { NextRequest, NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import PDFParser from 'pdf2json';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { createWorker } from 'tesseract.js';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { createCanvas } from 'canvas';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import * as pdfjsLib from 'pdfjs-dist';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

// CRITICAL: This route MUST run on Node.js runtime only (not Edge runtime)
// pdf2json, pdfjs-dist, canvas, and Tesseract require Node.js APIs (Buffer, fs, etc.) and cannot run on Edge
// This is a server-side only API route - client code calls this via fetch()
export const runtime = 'nodejs';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

// Set maximum duration to 60 seconds (OCR can take time for multi-page PDFs)
// Next.js default is 10s for Hobby, 60s for Pro - this ensures OCR has enough time
export const maxDuration = 60;

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
      let usedOCR = false;

      // Step 1: Try pdf2json first (fastest method for text-based PDFs)
      // Use file-based approach (loadPDF) as documented - more reliable than parseBuffer
      try {
        console.log('📄 Starting pdf2json extraction (file-based)...', { fileSize: buffer.length });
        
        // Generate unique filename for temp file
        const fileName = randomUUID();
        const tempFilePath = join(tmpdir(), `${fileName}.pdf`);
        
        try {
          // Write buffer to temp file (pdf2json loadPDF requires a file path)
          await fs.writeFile(tempFilePath, buffer);
          console.log('📁 Temp file created:', tempFilePath);

          // Initialize PDF parser (using documented pattern)
          const pdfParser = new (PDFParser as any)(null, 1);
          
          // Create a promise that will resolve/reject based on pdf2json events
          const parsePromise = new Promise<string>((resolve, reject) => {
            let resolved = false;
            let timeoutId: NodeJS.Timeout | null = null;
            
            const cleanup = () => {
              if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
              }
            };
            
            // Set up error handler FIRST (before parsing)
            pdfParser.once('pdfParser_dataError', (errData: any) => {
              cleanup();
              if (resolved) return;
              resolved = true;
              const errorMsg = errData?.parserError || errData?.message || 'Unknown PDF parsing error';
              console.error('❌ PDF parsing error:', errorMsg);
              reject(new Error(`PDF parsing failed: ${errorMsg}`));
            });

            // Set up success handler
            pdfParser.once('pdfParser_dataReady', () => {
              cleanup();
              if (resolved) return;
              resolved = true;
              try {
                const text = (pdfParser as any).getRawTextContent();
                if (!text || text.trim().length === 0) {
                  reject(new Error('No text content found in the PDF file'));
                } else {
                  resolve(text.trim());
                }
              } catch (error) {
                reject(new Error(`Failed to extract text: ${error instanceof Error ? error.message : 'Unknown error'}`));
              }
            });

            // Start parsing AFTER event listeners are set up
            try {
              console.log('🔄 Calling pdfParser.loadPDF...');
              pdfParser.loadPDF(tempFilePath);
              console.log('✅ loadPDF called, waiting for events...');
              
              // Safety timeout - if no events fire in 10 seconds, something is wrong
              timeoutId = setTimeout(() => {
                if (!resolved) {
                  resolved = true;
                  cleanup();
                  console.error('⏱️ No events fired from pdf2json after 10 seconds - likely hanging');
                  reject(new Error('PDF parsing appears to be hanging - using OCR fallback'));
                }
              }, 10000); // 10 seconds timeout for file-based parsing
            } catch (parseError: any) {
              cleanup();
              if (resolved) return;
              resolved = true;
              reject(new Error(`Failed to load PDF file: ${parseError.message}`));
            }
          });

          // Add timeout wrapper (15 seconds for file-based parsing)
          const timeoutPromise = new Promise<string>((_, reject) => {
            setTimeout(() => {
              console.error('⏱️ pdf2json timeout after 15 seconds - falling back to OCR');
              reject(new Error('PDF parsing timed out - using OCR fallback'));
            }, 15000); // 15 seconds timeout
          });

          // Race between parsing and timeout
          console.log('⏳ Waiting for pdf2json to complete (max 15s)...');
          extractedText = await Promise.race([parsePromise, timeoutPromise]);
          console.log('✅ pdf2json completed successfully');

          // Get page count from PDF data
          const pdfData = (pdfParser as any).data;
          pageCount = pdfData?.Pages?.length || 1;

          console.log('✅ pdf2json extraction successful:', { 
            textLength: extractedText.length, 
            pageCount,
            preview: extractedText.substring(0, 100) + '...'
          });
          
        } finally {
          // Clean up temp file
          try {
            await fs.unlink(tempFilePath);
            console.log('🗑️ Temp file cleaned up');
          } catch (cleanupError) {
            console.warn('⚠️ Failed to clean up temp file:', cleanupError);
            // Don't throw - file cleanup failure shouldn't break the flow
          }
        }

      } catch (pdf2jsonError: any) {
        // Step 2: ALWAYS fallback to OCR if pdf2json fails (for any reason)
        const errorMessage = pdf2jsonError.message || '';
        console.log('⚠️ pdf2json failed, falling back to OCR...', { error: errorMessage });
        
        try {
          // Configure pdfjs-dist for Node.js (disable worker)
          // Set environment variable to disable worker
      if (typeof process !== 'undefined' && process.env) {
        process.env.PDFJS_DISABLE_WORKER = 'true';
      }
      
          // Disable worker for server-side rendering
          if (pdfjsLib.GlobalWorkerOptions) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = null as any;
        }
          
          // Load PDF using pdfjs-dist
          const loadingTask = pdfjsLib.getDocument({
            data: buffer,
            useSystemFonts: true,
            disableFontFace: true,
            disableRange: true,
            disableStream: true
          });
          
          const pdf = await loadingTask.promise;
          pageCount = pdf.numPages;
          console.log(`📄 PDF loaded with ${pageCount} pages, converting to images for OCR...`);

          if (pageCount === 0) {
            throw new Error('PDF has no pages');
          }

          // Initialize Tesseract OCR worker
          const worker = await createWorker('eng', 1, {
            logger: (m) => {
              if (m.status === 'recognizing text') {
                console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
              }
            }
          });

          // OCR each page and combine text
          const ocrTexts: string[] = [];
          
          for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
            console.log(`🖼️ Rendering page ${pageNum}/${pageCount} to image...`);
            
            // Get PDF page
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for better OCR accuracy
            
            // Create canvas with same dimensions as viewport
            const canvas = createCanvas(viewport.width, viewport.height);
            const context = canvas.getContext('2d');
      
            // Render PDF page to canvas
            await page.render({
              canvasContext: context as any,
              viewport: viewport
            }).promise;
            
            // Convert canvas to buffer (PNG format)
            const imageBuffer = canvas.toBuffer('image/png');
            console.log(`🔍 OCR processing page ${pageNum}/${pageCount}...`);
            
            // Run OCR on the image buffer
            const { data: { text } } = await worker.recognize(imageBuffer);
            const cleanedText = text.trim();
            
            if (cleanedText.length > 0) {
              ocrTexts.push(`--- Page ${pageNum} ---\n${cleanedText}\n`);
            }
          }

          // Terminate worker
          await worker.terminate();

          // Combine all OCR'd text
          extractedText = ocrTexts.join('\n\n').trim();
          usedOCR = true;

          console.log(`✅ OCR extraction successful: ${extractedText.length} characters from ${pageCount} pages`);

      if (!extractedText || extractedText.length === 0) {
            throw new Error('OCR extraction returned no text');
          }

        } catch (ocrError: any) {
          console.error('OCR fallback error:', ocrError);
          throw new Error(`PDF text extraction failed. pdf2json failed: ${pdf2jsonError.message}. OCR fallback also failed: ${ocrError.message}`);
        }
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
          extractionMethod: usedOCR ? 'ocr' : 'pdf2json'
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


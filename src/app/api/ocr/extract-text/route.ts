import { NextRequest, NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';

export const runtime = 'nodejs';
export const maxDuration = 120; // 2 minutes for OCR

export async function POST(req: NextRequest) {
  let worker;
  
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    console.log(`📸 Starting OCR for: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

    const buffer = Buffer.from(await file.arrayBuffer());

    // Create and initialize worker
    console.log('🔧 Creating Tesseract worker...');
    worker = await createWorker('eng', 1, {
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
    });

    console.log('✅ Worker initialized, starting recognition...');
    const { data } = await worker.recognize(buffer);

    console.log(`✅ OCR completed: ${data.text.length} characters extracted (confidence: ${Math.round(data.confidence)}%)`);

    // Clean up worker
    await worker.terminate();

    return NextResponse.json({
      success: true,
      text: data.text.trim(),
      confidence: data.confidence,
      fileName: file.name,
    });

  } catch (error) {
    console.error('❌ OCR error:', error);
    
    // Make sure to terminate worker on error
    if (worker) {
      try {
        await worker.terminate();
      } catch (e) {
        console.error('Error terminating worker:', e);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'OCR processing failed',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}



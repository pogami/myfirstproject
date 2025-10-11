import { NextRequest, NextResponse } from 'next/server';

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
  // For now, provide helpful guidance for PDF processing
  // In a production environment, you would implement proper PDF text extraction
  // using libraries like pdf2pic + tesseract.js for OCR, or pdf-parse for text-based PDFs
  
  const helpfulMessage = `PDF text extraction is currently being enhanced.

While we work on implementing full PDF processing capabilities, here are some quick alternatives:

**Easiest Options:**
1. **Copy & Paste**: Select all text in your PDF (Ctrl+A) and paste into a .txt file
2. **Google Docs**: Upload PDF to Google Docs → Download as DOCX
3. **Microsoft Word**: Open PDF directly in Word (if text-based)

**Online Converters:**
- SmallPDF.com (free, no registration)
- ILovePDF.com (free PDF to Word)
- PDF24.org (free online tools)

**Professional Tools:**
- Adobe Acrobat: File → Export To → Microsoft Word
- Microsoft Word: File → Open → Select PDF file

Once converted to TXT or DOCX format, you can upload it here for immediate processing!

We're implementing proper PDF text extraction that will be available soon.`;

  throw new Error(helpfulMessage);
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

    console.log('PDF upload received:', file.name, 'Size:', file.size);

    // Provide helpful guidance for PDF processing
    const helpfulMessage = `PDF text extraction is currently being enhanced.

While we work on implementing full PDF processing capabilities, here are some quick alternatives:

**Easiest Options:**
1. **Copy & Paste**: Select all text in your PDF (Ctrl+A) and paste into a .txt file
2. **Google Docs**: Upload PDF to Google Docs → Download as DOCX
3. **Microsoft Word**: Open PDF directly in Word (if text-based)

**Online Converters:**
- SmallPDF.com (free, no registration)
- ILovePDF.com (free PDF to Word)
- PDF24.org (free online tools)

**Professional Tools:**
- Adobe Acrobat: File → Export To → Microsoft Word
- Microsoft Word: File → Open → Select PDF file

Once converted to TXT or DOCX format, you can upload it here for immediate processing!

We're implementing proper PDF text extraction that will be available soon.`;

    return NextResponse.json({
      success: false,
      error: helpfulMessage,
      alternatives: [
        'Copy text from PDF and paste into a .txt file',
        'Use Google Docs: Upload PDF → Download as DOCX',
        'Use Microsoft Word: File → Open → Select PDF',
        'Use online converters like SmallPDF or ILovePDF',
        'Use Adobe Acrobat: Export PDF as Word document'
      ],
      note: 'TXT and DOCX files work perfectly! We\'re working on PDF text extraction.'
    }, { status: 200 });

  } catch (error: any) {
    console.error('PDF extraction API error:', error);
    return NextResponse.json({
      success: false,
      error: 'PDF processing is temporarily unavailable. Please try converting to TXT or DOCX format.',
      alternatives: [
        'Copy text from PDF and paste into a .txt file',
        'Use Google Docs: Upload PDF → Download as DOCX',
        'Use Microsoft Word: File → Open → Select PDF'
      ]
    }, { status: 200 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { ensurePdfNodeSupport, loadPdfjsDist } from "@/lib/pdf-node-utils";

// CRITICAL: This route MUST run on Node.js runtime only (not Edge runtime)
// pdfjs-dist requires Node.js APIs that are not available in Edge runtime
export const runtime = 'nodejs';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

// Set maximum duration to 60 seconds for PDF processing
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    console.log('📥 Received request to /api/parse-data');
    const formData: FormData = await req.formData();
    const uploadedFiles = formData.getAll("FILE");
    
    if (!uploadedFiles || uploadedFiles.length === 0) {
      console.log('No files found.');
      return new NextResponse("No File Found. Please make sure the file is uploaded with the key 'FILE'.", { 
        status: 400 
      });
    }

    const uploadedFile = uploadedFiles[0];
    console.log('Uploaded file:', {
      name: uploadedFile instanceof File ? uploadedFile.name : 'unknown',
      type: uploadedFile instanceof File ? uploadedFile.type : 'unknown',
      size: uploadedFile instanceof File ? uploadedFile.size : 'unknown'
    });

    if (!(uploadedFile instanceof File)) {
      console.log('Uploaded file is not in the expected format.');
      return new NextResponse("Uploaded file is not in the expected format.", {
        status: 400,
      });
    }

    // Validate file type
    const isPdf = uploadedFile.type === 'application/pdf' || 
                  uploadedFile.name.toLowerCase().endsWith('.pdf');
    
    if (!isPdf) {
      return new NextResponse(`Invalid file type. Expected PDF file, got: ${uploadedFile.type || 'unknown'}. File name: ${uploadedFile.name}`, {
        status: 400,
      });
    }

    // Parse PDF using pdfjs-dist (matching the exact pattern from the example)
    await ensurePdfNodeSupport();
    const pdfjsLib = await loadPdfjsDist();
    const arrayBuffer = await uploadedFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    if (!fullText || fullText.trim().length === 0) {
      return new NextResponse("No text content found in the PDF file.", {
        status: 400,
      });
    }

    // Return parsed text
    const response = new NextResponse(fullText.trim());
    response.headers.set("FileName", uploadedFile.name);
    return response;

  } catch (error: any) {
    console.error('PDF parsing error:', error);
    return new NextResponse(`PDF parsing failed: ${error.message || 'Unknown error'}`, {
      status: 500,
    });
  }
}


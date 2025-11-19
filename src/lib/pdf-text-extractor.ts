// Use require for pdf-parse v1.1.1 compatibility
const pdfParse = require('pdf-parse');

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
}

export interface PdfExtractionOptions {
  parseTimeoutMs?: number;
  eventTimeoutMs?: number; // Not used with pdf-parse, kept for compatibility
}

/**
 * Extracts text from a PDF buffer using pdf-parse.
 * This is more reliable than pdf2json for text extraction.
 */
export async function extractTextFromPdfBuffer(
  buffer: Buffer,
  options: PdfExtractionOptions = {}
): Promise<PdfExtractionResult> {
  try {
    const data = await pdfParse(buffer);

    if (!data.text || data.text.trim().length === 0) {
      throw new Error('No text content found in the PDF file');
    }

    return {
      text: data.text.trim(),
      pageCount: data.numpages
    };
  } catch (error: any) {
    console.error('PDF extraction error:', error);
    throw new Error(error?.message || 'Failed to extract text from PDF');
  }
}

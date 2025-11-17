import PDFParser from 'pdf2json';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
}

export interface PdfExtractionOptions {
  parseTimeoutMs?: number;
  eventTimeoutMs?: number;
}

/**
 * Extracts text from a PDF buffer using pdf2json.
 * This helper writes the buffer to a temp file because pdf2json expects a file path.
 */
export async function extractTextFromPdfBuffer(
  buffer: Buffer,
  options: PdfExtractionOptions = {}
): Promise<PdfExtractionResult> {
  const parseTimeoutMs = options.parseTimeoutMs ?? 15000;
  const eventTimeoutMs = options.eventTimeoutMs ?? 10000;

  // Generate unique temp file path
  const tempFilePath = join(tmpdir(), `${randomUUID()}.pdf`);

  await fs.writeFile(tempFilePath, buffer);

  try {
    const pdfParser = new (PDFParser as any)(null, 1);

    const parsePromise = new Promise<PdfExtractionResult>((resolve, reject) => {
      let resolved = false;
      let eventTimeout: NodeJS.Timeout | null = null;

      const cleanup = () => {
        if (eventTimeout) {
          clearTimeout(eventTimeout);
          eventTimeout = null;
        }
      };

      pdfParser.once('pdfParser_dataError', (errData: any) => {
        cleanup();
        if (resolved) return;
        resolved = true;
        const errorMsg = errData?.parserError || errData?.message || 'Unknown PDF parsing error';
        reject(new Error(errorMsg));
      });

      pdfParser.once('pdfParser_dataReady', () => {
        cleanup();
        if (resolved) return;
        resolved = true;

        try {
          const text = (pdfParser as any).getRawTextContent();
          const pdfData = (pdfParser as any).data;
          const pageCount = pdfData?.Pages?.length || 1;

          if (!text || text.trim().length === 0) {
            reject(new Error('No text content found in the PDF file'));
          } else {
            resolve({
              text: text.trim(),
              pageCount
            });
          }
        } catch (error: any) {
          reject(new Error(error?.message || 'Failed to extract text from PDF'));
        }
      });

      try {
        pdfParser.loadPDF(tempFilePath);

        // Failsafe if events never fire
        eventTimeout = setTimeout(() => {
          if (resolved) return;
          resolved = true;
          cleanup();
          reject(new Error('PDF parsing timed out. Please try a different file.'));
        }, eventTimeoutMs);
      } catch (parseError: any) {
        cleanup();
        if (resolved) return;
        resolved = true;
        reject(new Error(parseError?.message || 'Failed to load PDF file'));
      }
    });

    return await Promise.race([
      parsePromise,
      new Promise<PdfExtractionResult>((_, reject) => {
        setTimeout(() => {
          reject(new Error('PDF parsing exceeded the allowed time. Please try a smaller file.'));
        }, parseTimeoutMs);
      })
    ]);
  } finally {
    // Clean up temp file
    try {
      await fs.unlink(tempFilePath);
    } catch {
      // ignore cleanup errors
    }
  }
}


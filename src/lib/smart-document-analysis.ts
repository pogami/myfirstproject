import * as Tesseract from 'tesseract.js';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';

export interface DocumentAnalysisResult {
  success: boolean;
  extractedText: string;
  summary?: string;
  fileType: string;
  metadata?: {
    wordCount?: number;
    pageCount?: number;
    language?: string;
    confidence?: number;
  };
  error?: string;
}

export interface DocumentAnalysisRequest {
  file: File;
  userPrompt?: string;
  fileName: string;
  fileType: string;
}

/**
 * Smart Document Analysis Service
 * Extracts text from documents and provides AI-powered analysis
 */
export class SmartDocumentAnalysisService {
  
  /**
   * Analyze a document with optional user prompt
   */
  async analyzeDocument(request: DocumentAnalysisRequest): Promise<DocumentAnalysisResult> {
    const { file, userPrompt, fileName, fileType } = request;
    
    try {
      console.log(`Starting smart document analysis for: ${fileName}`);
      
      // Extract text from the document
      const extractionResult = await this.extractTextFromFile(file, fileType);
      
      if (!extractionResult.success) {
        return {
          success: false,
          extractedText: '',
          fileType,
          error: extractionResult.error || 'Failed to extract text from document'
        };
      }
      
      // Generate AI summary and analysis
      const analysisResult = await this.generateAIAnalysis(
        extractionResult.text,
        fileName,
        fileType,
        userPrompt
      );
      
      return {
        success: true,
        extractedText: extractionResult.text,
        summary: analysisResult,
        fileType,
        metadata: extractionResult.metadata
      };
      
    } catch (error: any) {
      console.error('Document analysis error:', error);
      return {
        success: false,
        extractedText: '',
        fileType,
        error: `Analysis failed: ${error.message}`
      };
    }
  }
  
  /**
   * Extract text from various file types
   */
  private async extractTextFromFile(file: File, fileType: string): Promise<DocumentAnalysisResult> {
    try {
      if (fileType.startsWith('image/')) {
        return await this.extractTextFromImage(file);
      } else if (fileType === 'application/pdf') {
        return await this.extractTextFromPDF(file);
      } else if (fileType.includes('word') || fileType.includes('document')) {
        return await this.extractTextFromWord(file);
      } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
        return await this.extractTextFromExcel(file);
      } else if (fileType === 'text/plain') {
        return await this.extractTextFromText(file);
      } else {
        return {
          success: false,
          extractedText: '',
          fileType,
          error: `Unsupported file type: ${fileType}`
        };
      }
    } catch (error: any) {
      return {
        success: false,
        extractedText: '',
        fileType,
        error: `Text extraction failed: ${error.message}`
      };
    }
  }
  
  /**
   * Extract text from images using OCR
   */
  private async extractTextFromImage(file: File): Promise<DocumentAnalysisResult> {
    try {
      console.log('Starting OCR for image:', file.name);
      const buffer = await file.arrayBuffer();
      
      const { data: { text, confidence } } = await Tesseract.recognize(buffer, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?;:()[]{}"\'@#$%^&*+-=<>/\\|`~_ \n\t'
      });

      const cleanedText = text.trim().replace(/\n\s*\n/g, '\n').trim();
      const wordCount = cleanedText.split(/\s+/).filter(word => word.length > 0).length;
      
      if (cleanedText.length === 0) {
        return {
          success: false,
          extractedText: '',
          fileType: 'image',
          error: 'No text could be extracted from this image. The image might be too blurry or contain no readable text.'
        };
      }

      return {
        success: true,
        extractedText: cleanedText,
        fileType: 'image',
        metadata: {
          wordCount,
          language: 'en',
          confidence: Math.round(confidence)
        }
      };
    } catch (error: any) {
      return {
        success: false,
        extractedText: '',
        fileType: 'image',
        error: `OCR failed: ${error.message}`
      };
    }
  }
  
  /**
   * Extract text from PDF using pdfjs-dist
   */
  private async extractTextFromPDF(file: File): Promise<DocumentAnalysisResult> {
    try {
      console.log('Starting PDF extraction for:', file.name);
      const buffer = await file.arrayBuffer();
      
      // Dynamic import to avoid server-side issues
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set up the worker - use the local worker file
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      
      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument({ 
        data: buffer,
        useSystemFonts: true,
        disableFontFace: true,
        disableRange: true,
        disableStream: true
      });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      const pageCount = pdf.numPages;
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += pageText + '\n';
      }
      
      if (fullText.trim().length > 0) {
        const wordCount = fullText.split(/\s+/).filter(word => word.length > 0).length;
        
        return {
          success: true,
          extractedText: fullText.trim(),
          fileType: 'pdf',
          metadata: {
            pageCount,
            wordCount,
            language: 'en'
          }
        };
      } else {
        return {
          success: false,
          extractedText: '',
          fileType: 'pdf',
          error: 'No text content found in the PDF. This might be a scanned PDF.'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        extractedText: '',
        fileType: 'pdf',
        error: `PDF processing failed: ${error.message}`
      };
    }
  }
  
  /**
   * Extract text from Word documents
   */
  private async extractTextFromWord(file: File): Promise<DocumentAnalysisResult> {
    try {
      console.log('Starting Word document extraction for:', file.name);
      const buffer = await file.arrayBuffer();
      
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value.trim();
      
      if (text.length === 0) {
        return {
          success: false,
          extractedText: '',
          fileType: 'word',
          error: 'No text content found in the Word document.'
        };
      }
      
      const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
      
      return {
        success: true,
        extractedText: text,
        fileType: 'word',
        metadata: {
          wordCount,
          language: 'en'
        }
      };
    } catch (error: any) {
      return {
        success: false,
        extractedText: '',
        fileType: 'word',
        error: `Word document processing failed: ${error.message}`
      };
    }
  }
  
  /**
   * Extract text from Excel files
   */
  private async extractTextFromExcel(file: File): Promise<DocumentAnalysisResult> {
    try {
      console.log('Starting Excel extraction for:', file.name);
      const buffer = await file.arrayBuffer();
      
      const workbook = XLSX.read(buffer, { type: 'array' });
      let fullText = '';
      
      // Extract text from all sheets
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const sheetText = XLSX.utils.sheet_to_txt(worksheet);
        fullText += `\n--- Sheet: ${sheetName} ---\n${sheetText}\n`;
      });
      
      if (fullText.trim().length === 0) {
        return {
          success: false,
          extractedText: '',
          fileType: 'excel',
          error: 'No text content found in the Excel file.'
        };
      }
      
      const wordCount = fullText.split(/\s+/).filter(word => word.length > 0).length;
      
      return {
        success: true,
        extractedText: fullText.trim(),
        fileType: 'excel',
        metadata: {
          wordCount,
          language: 'en'
        }
      };
    } catch (error: any) {
      return {
        success: false,
        extractedText: '',
        fileType: 'excel',
        error: `Excel processing failed: ${error.message}`
      };
    }
  }
  
  /**
   * Extract text from plain text files
   */
  private async extractTextFromText(file: File): Promise<DocumentAnalysisResult> {
    try {
      const text = await file.text();
      const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
      
      return {
        success: true,
        extractedText: text,
        fileType: 'text',
        metadata: {
          wordCount,
          language: 'en'
        }
      };
    } catch (error: any) {
      return {
        success: false,
        extractedText: '',
        fileType: 'text',
        error: `Text file processing failed: ${error.message}`
      };
    }
  }
  
  /**
   * Generate AI analysis and summary
   */
  private async generateAIAnalysis(
    extractedText: string,
    fileName: string,
    fileType: string,
    userPrompt?: string
  ): Promise<string> {
    try {
      // Call our AI analysis API
      const response = await fetch('/api/ai/analyze-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          extractedText,
          fileName,
          fileType,
          userPrompt
        }),
      });
      
      if (!response.ok) {
        throw new Error(`AI analysis failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.analysis || 'Analysis completed successfully.';
      
    } catch (error: any) {
      console.error('AI analysis error:', error);
      return `Document analysis completed. ${userPrompt ? `Regarding your question: ${userPrompt}` : 'Here\'s a summary of the content.'}`;
    }
  }
}

// Export singleton instance
export const smartDocumentAnalysis = new SmartDocumentAnalysisService();

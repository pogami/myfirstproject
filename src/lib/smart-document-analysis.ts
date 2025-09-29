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
      console.log('[analyzeDocument] Starting text extraction for:', fileName, fileType);
      const extractionResult = await this.extractTextFromFile(file, fileType);
      console.log('[analyzeDocument] Extraction result:', extractionResult);
      
      if (!extractionResult.success) {
        console.log('[analyzeDocument] Text extraction failed:', extractionResult.error);
        return {
          success: false,
          extractedText: '',
          fileType,
          error: extractionResult.error || 'Failed to extract text from document'
        };
      }

      console.log('[analyzeDocument] Text extracted successfully, length:', extractionResult.extractedText?.length || 0);
      
      // Generate AI summary and analysis
      const analysisResult = await this.generateAIAnalysis(
        extractionResult.extractedText || '',
        fileName,
        fileType,
        userPrompt
      );
      
      return {
        success: true,
        extractedText: extractionResult.extractedText || '',
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
        const res = await this.extractTextFromImage(file);
        return res;
      } else if (fileType === 'application/pdf') {
        const res = await this.extractTextFromPDF(file);
        return res;
      } else if (fileType.includes('word') || fileType.includes('document')) {
        const res = await this.extractTextFromWord(file);
        return res;
      } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
        const res = await this.extractTextFromExcel(file);
        return res;
      } else if (fileType === 'text/plain') {
        const res = await this.extractTextFromText(file);
        return res;
      } else {
        console.log(`[extractTextFromFile] Unsupported fileType: ${fileType}`);
        return { success: false, extractedText: '', fileType, error: `Unsupported file type: ${fileType}` };
      }
    } catch (error: any) {
      console.error('[extractTextFromFile] Top-level catch:', error);
      return { success: false, extractedText: '', fileType, error: `Text extraction failed: ${error.message}` };
    }
  }
  
  /**
   * Extract text from images using OCR
   */
  private async extractTextFromImage(file: File): Promise<DocumentAnalysisResult> {
    try {
      console.log('[extractTextFromImage] Starting OCR for image:', file.name, 'Size:', file.size);
      const buffer = await file.arrayBuffer();
      console.log('[extractTextFromImage] Buffer size:', buffer.byteLength);
      
      const { data: { text, confidence } } = await Tesseract.recognize(buffer, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`[extractTextFromImage] OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?;:()[]{}"\'@#$%^&*+-=<>/\\|`~_ \n\t'
      });

      console.log('[extractTextFromImage] OCR completed. Raw text length:', text?.length || 0);
      console.log('[extractTextFromImage] Raw text preview:', text?.substring(0, 100) || 'No text');
      console.log('[extractTextFromImage] Confidence:', confidence);

      const cleanedText = text.trim().replace(/\n\s*\n/g, '\n').trim();
      const wordCount = cleanedText.split(/\s+/).filter(word => word.length > 0).length;
      
      console.log('[extractTextFromImage] Cleaned text length:', cleanedText.length);
      console.log('[extractTextFromImage] Word count:', wordCount);
      
      if (cleanedText.length === 0) {
        console.log('[extractTextFromImage] No text extracted from OCR');
        return {
          success: false,
          extractedText: '',
          fileType: 'image',
          error: 'No text could be extracted from this image. The image might be too blurry or contain no readable text.'
        };
      }

      console.log('[extractTextFromImage] Successfully extracted text');
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
      console.error('[extractTextFromImage] OCR Error:', error);
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
      console.log('[extractTextFromText] Starting text file processing for:', file.name);
      const text = await file.text();
      console.log('[extractTextFromText] Raw text length:', text?.length || 0);
      console.log('[extractTextFromText] Text preview:', text?.substring(0, 100) || 'No text');
      
      const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
      console.log('[extractTextFromText] Word count:', wordCount);
      
      if (!text || text.trim().length === 0) {
        return {
          success: false,
          extractedText: '',
          fileType: 'text',
          error: 'File appears to be empty or contains no readable text'
        };
      }
      
      return {
        success: true,
        extractedText: text.trim(),
        fileType: 'text',
        metadata: {
          wordCount,
          language: 'en'
        }
      };
    } catch (error: any) {
      console.error('[extractTextFromText] Error:', error);
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
    const payload = { extractedText, fileName, fileType, userPrompt };
    try {
      console.log('[generateAIAnalysis] ExtractedText length:', extractedText?.length || 0);
      console.log('[generateAIAnalysis] FileName:', fileName);
      console.log('[generateAIAnalysis] FileType:', fileType);
      console.log('[generateAIAnalysis] UserPrompt:', userPrompt);

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text content to analyze');
      }
      const response = await fetch('/api/ai/analyze-document', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      const textResponse = await response.text();
      if (!response.ok) {
        console.error('[generateAIAnalysis] Response error:', response.status, textResponse);
        throw new Error(`AI analysis failed: ${response.statusText}`);
      }
      let json: any;
      try {
        json = JSON.parse(textResponse);
      } catch (e) {
        console.error('[generateAIAnalysis] JSON parse fail:', textResponse);
        throw new Error(`AI analysis failed: ${response.statusText}`);
      }
      return json?.analysis || 'Analysis completed successfully.';
    } catch (error: any) {
      console.error('AI analysis error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const smartDocumentAnalysis = new SmartDocumentAnalysisService();

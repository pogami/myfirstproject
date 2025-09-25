'use server';

import * as Tesseract from 'tesseract.js';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';

export type FileType = 'image' | 'pdf' | 'word' | 'excel' | 'text' | 'unknown';

export interface TextExtractionResult {
  success: boolean;
  text: string;
  fileType: FileType;
  confidence?: number;
  error?: string;
  metadata?: {
    pageCount?: number;
    wordCount?: number;
    language?: string;
  };
}

export interface FileInput {
  file: File;
  fileName: string;
  fileType: string;
}

/**
 * Comprehensive text extraction service for all file types
 * Supports: Images (OCR), PDFs, Word docs, Excel files, and text files
 */
export async function extractFileText(input: FileInput): Promise<TextExtractionResult> {
  const { file, fileName, fileType } = input;

  try {
    // Determine file type
    const detectedType = detectFileType(fileType, fileName);
    
    switch (detectedType) {
      case 'image':
        return await extractTextFromImage(file);
      
      case 'pdf':
        return await extractTextFromPDF(file);
      
      case 'word':
        return await extractTextFromWord(file);
      
      case 'excel':
        return await extractTextFromExcel(file);
      
      case 'text':
        return await extractTextFromTextFile(file);
      
      default:
        return {
          success: false,
          text: '',
          fileType: 'unknown',
          error: `Unsupported file type: ${fileType}`
        };
    }
  } catch (error: any) {
    console.error('Text extraction error:', error);
    return {
      success: false,
      text: '',
      fileType: 'unknown',
      error: error.message || 'Unknown error occurred during text extraction'
    };
  }
}

/**
 * Detect file type based on MIME type and filename
 */
function detectFileType(fileType: string, fileName: string): FileType {
  const lowerFileType = fileType.toLowerCase();
  const lowerFileName = fileName.toLowerCase();

  // Image files
  if (lowerFileType.startsWith('image/') || 
      lowerFileName.match(/\.(jpg|jpeg|png|gif|bmp|tiff|webp)$/)) {
    return 'image';
  }

  // PDF files
  if (lowerFileType === 'application/pdf' || lowerFileName.endsWith('.pdf')) {
    return 'pdf';
  }

  // Word documents
  if (lowerFileType.includes('document') || 
      lowerFileType.includes('word') ||
      lowerFileName.match(/\.(doc|docx)$/)) {
    return 'word';
  }

  // Excel files
  if (lowerFileType.includes('spreadsheet') ||
      lowerFileType.includes('excel') ||
      lowerFileName.match(/\.(xls|xlsx)$/)) {
    return 'excel';
  }

  // Text files
  if (lowerFileType.startsWith('text/') ||
      lowerFileName.match(/\.(txt|md|rtf)$/)) {
    return 'text';
  }

  return 'unknown';
}

/**
 * Extract text from images using OCR
 */
async function extractTextFromImage(file: File): Promise<TextExtractionResult> {
  try {
    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    
    // Use Tesseract.js for OCR
    const { data: { text, confidence } } = await Tesseract.recognize(buffer, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    const cleanedText = text.trim().replace(/\n\s*\n/g, '\n').trim();
    const wordCount = cleanedText.split(/\s+/).filter(word => word.length > 0).length;

    return {
      success: true,
      text: cleanedText,
      fileType: 'image',
      confidence: Math.round(confidence),
      metadata: {
        wordCount,
        language: 'en'
      }
    };
  } catch (error: any) {
    return {
      success: false,
      text: '',
      fileType: 'image',
      error: `OCR failed: ${error.message}`
    };
  }
}

/**
 * Extract text from PDF files
 */
async function extractTextFromPDF(file: File): Promise<TextExtractionResult> {
  try {
    const buffer = await file.arrayBuffer();
    
    // Try to extract text directly first
    const pdfData = await pdfParse.default(buffer);
    
    if (pdfData.text && pdfData.text.trim().length > 0) {
      // PDF has selectable text
      const wordCount = pdfData.text.split(/\s+/).filter(word => word.length > 0).length;
      
      return {
        success: true,
        text: pdfData.text.trim(),
        fileType: 'pdf',
        metadata: {
          pageCount: pdfData.numpages,
          wordCount,
          language: 'en'
        }
      };
    } else {
      // PDF is scanned (images) - would need pdf2image + OCR
      // For now, return a message asking user to describe the content
      return {
        success: false,
        text: '',
        fileType: 'pdf',
        error: 'This appears to be a scanned PDF. Please describe the content or share the text manually.'
      };
    }
  } catch (error: any) {
    return {
      success: false,
      text: '',
      fileType: 'pdf',
      error: `PDF processing failed: ${error.message}`
    };
  }
}

/**
 * Extract text from Word documents
 */
async function extractTextFromWord(file: File): Promise<TextExtractionResult> {
  try {
    const buffer = await file.arrayBuffer();
    
    const result = await mammoth.extractRawText({ buffer });
    
    if (result.value && result.value.trim().length > 0) {
      const wordCount = result.value.split(/\s+/).filter(word => word.length > 0).length;
      
      return {
        success: true,
        text: result.value.trim(),
        fileType: 'word',
        metadata: {
          wordCount,
          language: 'en'
        }
      };
    } else {
      return {
        success: false,
        text: '',
        fileType: 'word',
        error: 'No text content found in the Word document'
      };
    }
  } catch (error: any) {
    return {
      success: false,
      text: '',
      fileType: 'word',
      error: `Word document processing failed: ${error.message}`
    };
  }
}

/**
 * Extract text from Excel files
 */
async function extractTextFromExcel(file: File): Promise<TextExtractionResult> {
  try {
    const buffer = await file.arrayBuffer();
    
    const workbook = XLSX.read(buffer, { type: 'array' });
    
    let extractedText = '';
    let totalCells = 0;
    
    // Process each worksheet
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_txt(worksheet);
      
      if (sheetData && sheetData.trim().length > 0) {
        extractedText += `\n--- Sheet: ${sheetName} ---\n${sheetData}\n`;
        totalCells += Object.keys(worksheet).length;
      }
    });

    if (extractedText.trim().length > 0) {
      const wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;
      
      return {
        success: true,
        text: extractedText.trim(),
        fileType: 'excel',
        metadata: {
          wordCount,
          language: 'en'
        }
      };
    } else {
      return {
        success: false,
        text: '',
        fileType: 'excel',
        error: 'No data found in the Excel file'
      };
    }
  } catch (error: any) {
    return {
      success: false,
      text: '',
      fileType: 'excel',
      error: `Excel file processing failed: ${error.message}`
    };
  }
}

/**
 * Extract text from text files
 */
async function extractTextFromTextFile(file: File): Promise<TextExtractionResult> {
  try {
    const text = await file.text();
    
    if (text && text.trim().length > 0) {
      const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
      
      return {
        success: true,
        text: text.trim(),
        fileType: 'text',
        metadata: {
          wordCount,
          language: 'en'
        }
      };
    } else {
      return {
        success: false,
        text: '',
        fileType: 'text',
        error: 'File appears to be empty'
      };
    }
  } catch (error: any) {
    return {
      success: false,
      text: '',
      fileType: 'text',
      error: `Text file processing failed: ${error.message}`
    };
  }
}

/**
 * Format extracted text for display in chat
 */
export function formatExtractedText(result: TextExtractionResult, fileName: string): string {
  if (!result.success) {
    return `❌ **Text extraction failed for ${fileName}**\n\n**Error:** ${result.error}\n\n**What you can do:**\n• Describe the content manually\n• Ask specific questions about the file\n• Share the text content directly`;
  }

  const { text, fileType, confidence, metadata } = result;
  
  let formattedText = `📄 **Text extracted from ${fileName}**\n\n`;
  
  // Add metadata
  if (metadata) {
    if (metadata.wordCount) {
      formattedText += `📊 **Word Count:** ${metadata.wordCount}\n`;
    }
    if (metadata.pageCount) {
      formattedText += `📄 **Pages:** ${metadata.pageCount}\n`;
    }
    if (confidence && fileType === 'image') {
      formattedText += `🎯 **OCR Confidence:** ${confidence}%\n`;
    }
    formattedText += `📁 **File Type:** ${fileType.toUpperCase()}\n\n`;
  }
  
  // Add extracted text
  formattedText += `---\n\n**Extracted Content:**\n\n${text}`;
  
  // Add helpful suggestions
  formattedText += `\n\n---\n\n**💡 What I can help with:**\n`;
  formattedText += `• Explain any concepts from this content\n`;
  formattedText += `• Answer questions about the information\n`;
  formattedText += `• Provide additional context or examples\n`;
  formattedText += `• Help with related topics or assignments`;
  
  return formattedText;
}

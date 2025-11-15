import { GoogleGenerativeAI } from '@google/generative-ai';

interface FileAnalysisResult {
  success: boolean;
  content?: string;
  summary?: string;
  error?: string;
  fileType: string;
  fileName: string;
}

interface FileAnalysisInput {
  file: File;
  question?: string;
}

export class FileAnalysisService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('Google AI API key not found');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async analyzeFile(input: FileAnalysisInput): Promise<FileAnalysisResult> {
    const { file, question } = input;
    
    try {
      // Handle different file types
      if (file.type.startsWith('image/')) {
        return await this.analyzeImage(file, question);
      } else if (file.type === 'application/pdf') {
        return await this.analyzePDF(file, question);
      } else if (file.type.includes('text/') || file.type.includes('document')) {
        return await this.analyzeTextFile(file, question);
      } else {
        return {
          success: false,
          error: `Unsupported file type: ${file.type}`,
          fileType: file.type,
          fileName: file.name
        };
      }
    } catch (error) {
      console.error('File analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        fileType: file.type,
        fileName: file.name
      };
    }
  }

  private async analyzeImage(file: File, question?: string): Promise<FileAnalysisResult> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Convert file to base64
      const base64 = await this.fileToBase64(file);
      
      const prompt = question 
        ? `Analyze this image and answer the specific question: "${question}". Provide detailed information about what you see in the image.`
        : `Analyze this image and provide a detailed description of what you see. Include any text, objects, people, settings, or other relevant details.`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64,
            mimeType: file.type
          }
        }
      ]);

      const response = await result.response;
      const content = response.text();

      return {
        success: true,
        content,
        summary: this.generateSummary(content),
        fileType: file.type,
        fileName: file.name
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        fileType: file.type,
        fileName: file.name
      };
    }
  }

  private async analyzePDF(file: File, question?: string): Promise<FileAnalysisResult> {
    try {
      // For PDF analysis, we'll need to extract text first
      // This is a simplified version - in production, you'd use a PDF parsing library
      const text = await this.extractTextFromPDF(file);
      
      if (!text) {
        return {
          success: false,
          error: 'Could not extract text from PDF',
          fileType: file.type,
          fileName: file.name
        };
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = question 
        ? `Analyze this PDF document and answer the specific question: "${question}". Here's the document content:\n\n${text}`
        : `Analyze this PDF document and provide a comprehensive summary. Here's the document content:\n\n${text}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      return {
        success: true,
        content,
        summary: this.generateSummary(content),
        fileType: file.type,
        fileName: file.name
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to analyze PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        fileType: file.type,
        fileName: file.name
      };
    }
  }

  private async analyzeTextFile(file: File, question?: string): Promise<FileAnalysisResult> {
    try {
      const text = await file.text();
      
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = question 
        ? `Analyze this document and answer the specific question: "${question}". Here's the document content:\n\n${text}`
        : `Analyze this document and provide a comprehensive summary. Here's the document content:\n\n${text}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      return {
        success: true,
        content,
        summary: this.generateSummary(content),
        fileType: file.type,
        fileName: file.name
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to analyze text file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        fileType: file.type,
        fileName: file.name
      };
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async extractTextFromPDF(file: File): Promise<string | null> {
    try {
      // Use DocumentProcessorClient for PDF extraction
      const { DocumentProcessorClient } = await import('@/lib/syllabus-parser/document-processor-client');
      const result = await DocumentProcessorClient.extractFromPDF(file);
      return result.text || null;
    } catch (error) {
      console.error('PDF extraction error:', error);
      return null;
    }
  }

  private generateSummary(content: string): string {
    // Generate a brief summary of the analysis
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.slice(0, 2).join('. ') + '.';
  }
}

// Export a singleton instance
export const fileAnalysisService = new FileAnalysisService();

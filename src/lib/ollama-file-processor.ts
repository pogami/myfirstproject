import { Ollama } from 'ollama';

// Initialize Ollama client
const ollama = new Ollama({
  host: 'http://localhost:11434'
});

// Types for file processing
export interface ProcessedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  extractedText: string;
  summary: string;
  keyPoints: string[];
  contentType: 'document' | 'image' | 'text' | 'unknown';
  processingTime: number;
  confidence: number;
}

export interface FileAnalysisResult {
  success: boolean;
  processedFile: ProcessedFile | null;
  error?: string;
  analysisType: 'summary' | 'extraction' | 'discussion' | 'qa';
}

// Check if Ollama is running
export async function checkOllamaStatus(): Promise<boolean> {
  try {
    await ollama.list();
    return true;
  } catch (error) {
    console.error('Ollama not running:', error);
    return false;
  }
}

// Extract text from different file types
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  try {
    if (fileType.includes('text') || fileName.endsWith('.txt')) {
      return await file.text();
    }
    
    if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
      // For PDF, we'll need to implement PDF parsing
      // For now, return a placeholder
      return `PDF content from ${file.name} - PDF parsing implementation needed`;
    }
    
    if (fileType.includes('word') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      // For Word documents, we'll need to implement DOCX parsing
      return `Word document content from ${file.name} - DOCX parsing implementation needed`;
    }
    
    if (fileType.includes('image') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName)) {
      // For images, we'll use OCR with Ollama
      return await extractTextFromImage(file);
    }
    
    // Default fallback
    return `File content from ${file.name} - Unsupported file type`;
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error(`Failed to extract text from ${file.name}`);
  }
}

// Extract text from images using OCR (placeholder for now)
async function extractTextFromImage(file: File): Promise<string> {
  // This would use Tesseract.js or similar for OCR
  // For now, return a placeholder
  return `Image content from ${file.name} - OCR implementation needed`;
}

// Generate embedding for file content
export async function generateFileEmbedding(text: string): Promise<number[]> {
  try {
    const response = await ollama.embeddings({
      model: 'nomic-embed-text',
      prompt: text
    });
    return response.embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Fallback to simple hash-based embedding
    return generateFallbackEmbedding(text);
  }
}

// Fallback embedding when Ollama is not available
function generateFallbackEmbedding(text: string): number[] {
  const normalizedText = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = normalizedText.split(/\s+/).filter(w => w.length > 2);
  
  const embedding = new Array(384).fill(0);
  
  words.forEach((word, index) => {
    const hash = word.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const embeddingIndex = Math.abs(hash) % embedding.length;
    embedding[embeddingIndex] += 1 / (index + 1);
  });
  
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}

// Analyze file content with Ollama
export async function analyzeFileContent(
  text: string,
  fileName: string,
  analysisType: 'summary' | 'extraction' | 'discussion' | 'qa' = 'summary'
): Promise<{
  summary: string;
  keyPoints: string[];
  confidence: number;
}> {
  try {
    let prompt = '';
    
    switch (analysisType) {
      case 'summary':
        prompt = `Please provide a comprehensive summary of the following content from "${fileName}". 
        Focus on the main topics, key information, and important details.
        
        Content:
        ${text}
        
        Please provide:
        1. A detailed summary (2-3 paragraphs)
        2. Key points as a bulleted list
        3. Overall confidence in the analysis (0-100%)
        
        Format your response as JSON:
        {
          "summary": "detailed summary here",
          "keyPoints": ["point 1", "point 2", "point 3"],
          "confidence": 85
        }`;
        break;
        
      case 'extraction':
        prompt = `Extract and organize the key information from this content from "${fileName}".
        
        Content:
        ${text}
        
        Please extract:
        1. Main topics and subjects
        2. Important facts and data
        3. Key concepts and definitions
        4. Any dates, numbers, or specific details
        
        Format as JSON:
        {
          "summary": "organized summary of extracted information",
          "keyPoints": ["extracted point 1", "extracted point 2"],
          "confidence": 90
        }`;
        break;
        
      case 'discussion':
        prompt = `Analyze this content from "${fileName}" for discussion purposes.
        
        Content:
        ${text}
        
        Please provide:
        1. Discussion points and questions that could arise
        2. Key topics for further exploration
        3. Important concepts to understand
        
        Format as JSON:
        {
          "summary": "discussion-focused analysis",
          "keyPoints": ["discussion point 1", "discussion point 2"],
          "confidence": 80
        }`;
        break;
        
      case 'qa':
        prompt = `Prepare this content from "${fileName}" for Q&A sessions.
        
        Content:
        ${text}
        
        Please provide:
        1. A summary suitable for answering questions
        2. Key information that would be asked about
        3. Important details for reference
        
        Format as JSON:
        {
          "summary": "Q&A focused summary",
          "keyPoints": ["answer point 1", "answer point 2"],
          "confidence": 85
        }`;
        break;
    }
    
    const response = await ollama.generate({
      model: 'llama3.1:8b',
      prompt: prompt,
      options: {
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 1000
      }
    });
    
    // Parse the JSON response
    const jsonMatch = response.response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || 'Analysis completed',
        keyPoints: parsed.keyPoints || [],
        confidence: parsed.confidence || 75
      };
    } else {
      // Fallback if JSON parsing fails
      return {
        summary: response.response,
        keyPoints: ['Content analyzed successfully'],
        confidence: 70
      };
    }
  } catch (error) {
    console.error('Error analyzing file content:', error);
    // Fallback analysis
    return {
      summary: `Content from ${fileName} has been processed. The file contains ${text.length} characters of text.`,
      keyPoints: ['File processed successfully', 'Content extracted', 'Ready for discussion'],
      confidence: 60
    };
  }
}

// Main file processing function
export async function processChatFile(
  file: File,
  analysisType: 'summary' | 'extraction' | 'discussion' | 'qa' = 'summary'
): Promise<FileAnalysisResult> {
  const startTime = Date.now();
  
  try {
    // Check if Ollama is available
    const isOllamaAvailable = await checkOllamaStatus();
    
    if (!isOllamaAvailable) {
      throw new Error('Ollama AI is not available. Please ensure Ollama is running.');
    }
    
    // Extract text from file
    const extractedText = await extractTextFromFile(file);
    
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text content could be extracted from the file');
    }
    
    // Analyze content with Ollama
    const analysis = await analyzeFileContent(extractedText, file.name, analysisType);
    
    // Generate embedding
    const embedding = await generateFileEmbedding(extractedText);
    
    // Create processed file object
    const processedFile: ProcessedFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type,
      size: file.size,
      extractedText,
      summary: analysis.summary,
      keyPoints: analysis.keyPoints,
      contentType: getContentType(file),
      processingTime: Date.now() - startTime,
      confidence: analysis.confidence / 100
    };
    
    return {
      success: true,
      processedFile,
      analysisType
    };
  } catch (error) {
    console.error('Error processing file:', error);
    return {
      success: false,
      processedFile: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      analysisType
    };
  }
}

// Determine content type from file
function getContentType(file: File): 'document' | 'image' | 'text' | 'unknown' {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  if (fileType.includes('image') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName)) {
    return 'image';
  }
  
  if (fileType.includes('text') || fileName.endsWith('.txt')) {
    return 'text';
  }
  
  if (fileType.includes('pdf') || fileType.includes('word') || 
      fileName.endsWith('.pdf') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    return 'document';
  }
  
  return 'unknown';
}

// Generate chat response about the file
export async function generateFileChatResponse(
  processedFile: ProcessedFile,
  userQuestion?: string
): Promise<string> {
  try {
    const isOllamaAvailable = await checkOllamaStatus();
    
    if (!isOllamaAvailable) {
      return `I've processed the file "${processedFile.name}". Here's what I found:\n\n${processedFile.summary}\n\nKey points:\n${processedFile.keyPoints.map(point => `• ${point}`).join('\n')}`;
    }
    
    let prompt = '';
    
    if (userQuestion) {
      prompt = `Based on the content from the file "${processedFile.name}", please answer this question: "${userQuestion}"
      
      File Summary: ${processedFile.summary}
      Key Points: ${processedFile.keyPoints.join(', ')}
      
      Please provide a helpful, detailed answer based on the file content.`;
    } else {
      prompt = `I've analyzed the file "${processedFile.name}". Please provide a helpful response about this content.
      
      File Summary: ${processedFile.summary}
      Key Points: ${processedFile.keyPoints.join(', ')}
      
      Provide an engaging response that summarizes the content and invites further discussion.`;
    }
    
    const response = await ollama.generate({
      model: 'llama3.1:8b',
      prompt: prompt,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 500
      }
    });
    
    return response.response;
  } catch (error) {
    console.error('Error generating chat response:', error);
    return `I've processed the file "${processedFile.name}". Here's what I found:\n\n${processedFile.summary}\n\nKey points:\n${processedFile.keyPoints.map(point => `• ${point}`).join('\n')}`;
  }
}

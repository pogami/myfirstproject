import { Ollama } from 'ollama';

// Initialize Ollama client
const ollama = new Ollama({
  host: 'http://localhost:11434'
});

// Types for Ollama processing
export interface OllamaExtractedData {
  courseCode: string | null;
  courseTitle: string | null;
  instructor: string | null;
  instructorEmail: string | null;
  semester: string | null;
  year: string | null;
  university: string | null;
  department: string | null;
  confidence: number;
  extractedAt: number;
}

export interface OllamaEmbedding {
  id: string;
  embedding: number[];
  text: string;
  metadata: {
    courseCode: string;
    courseTitle: string;
    university: string;
  };
  createdAt: number;
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

// Generate embeddings using Ollama
export async function generateOllamaEmbedding(text: string): Promise<number[]> {
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

// Parse syllabus using Ollama AI
export async function parseSyllabusWithOllama(text: string): Promise<OllamaExtractedData> {
  try {
    const prompt = `Extract course information from this syllabus text. Return ONLY a valid JSON object with these exact fields:

{
  "courseCode": "extracted course code or null",
  "courseTitle": "extracted course title or null", 
  "instructor": "extracted instructor name or null",
  "instructorEmail": "extracted instructor email or null",
  "semester": "extracted semester (fall/spring/summer/winter) or null",
  "year": "extracted year or null",
  "university": "extracted university name or null",
  "department": "extracted department name or null"
}

Syllabus text:
${text}

JSON:`;

    const response = await ollama.generate({
      model: 'llama3.1:8b',
      prompt: prompt,
      options: {
        temperature: 0.1,
        top_p: 0.9,
        max_tokens: 500
      }
    });

    // Parse the JSON response
    const jsonMatch = response.response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Calculate confidence based on how many fields were extracted
      const fields = Object.values(parsed).filter(value => value !== null && value !== '');
      const confidence = fields.length / 8; // 8 total fields
      
      return {
        ...parsed,
        confidence: Math.min(confidence, 1),
        extractedAt: Date.now()
      };
    } else {
      throw new Error('No valid JSON found in response');
    }
  } catch (error) {
    console.error('Error parsing with Ollama:', error);
    // Fallback to regex-based parsing
    return parseSyllabusWithRegex(text);
  }
}

// Fallback regex-based parsing when Ollama fails
function parseSyllabusWithRegex(text: string): OllamaExtractedData {
  const normalizedText = text.toLowerCase();
  
  // Course code patterns
  const courseCodePatterns = [
    /(?:course\s+code|catalog\s+number|subject\s+code)[:\s]*([a-z]{2,4}[-_\s]?\d{3,4}[a-z]?)/i,
    /([a-z]{2,4}[-_\s]?\d{3,4}[a-z]?)/i,
    /(?:csci|cse|math|eng|bio|chem|phys|econ|hist|engl)[-_\s]?\d{3,4}[a-z]?/i
  ];
  
  // Course title patterns
  const courseTitlePatterns = [
    /(?:course\s+title|title)[:\s]*([^\n\r]+)/i,
    /(?:introduction\s+to|fundamentals\s+of|principles\s+of)\s+([^\n\r]+)/i,
    /([a-z\s]+(?:introduction|fundamentals|principles|basics|overview))/i
  ];
  
  // Instructor patterns
  const instructorPatterns = [
    /(?:instructor|professor|teacher)[:\s]*([^\n\r@]+)/i,
    /([a-z]+\s+[a-z]+)\s*@[a-z]+\.[a-z]+/i,
    /([a-z]+\s+[a-z]+)\s*\([a-z]+@[a-z]+\.[a-z]+\)/i
  ];
  
  // Email patterns
  const emailPatterns = [
    /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi
  ];
  
  // Semester patterns
  const semesterPatterns = [
    /(fall|spring|summer|winter|autumn)\s+(\d{4})/i,
    /(f|s|su|w|a)\s*(\d{4})/i,
    /(?:semester|term)[:\s]*(fall|spring|summer|winter|autumn)/i
  ];
  
  // University patterns
  const universityPatterns = [
    /(university\s+of\s+[^,\n\r]+)/i,
    /([^,\n\r]+\s+university)/i,
    /(college\s+of\s+[^,\n\r]+)/i,
    /([^,\n\r]+\s+college)/i
  ];
  
  // Department patterns
  const departmentPatterns = [
    /(?:department|school|division)\s+of\s+([^,\n\r]+)/i,
    /([^,\n\r]+\s+department)/i,
    /([^,\n\r]+\s+school)/i
  ];
  
  // Extract course code
  let courseCode: string | null = null;
  for (const pattern of courseCodePatterns) {
    const match = text.match(pattern);
    if (match) {
      courseCode = match[1].toUpperCase().replace(/[-_\s]/g, '');
      break;
    }
  }
  
  // Extract course title
  let courseTitle: string | null = null;
  for (const pattern of courseTitlePatterns) {
    const match = text.match(pattern);
    if (match) {
      courseTitle = match[1].trim();
      break;
    }
  }
  
  // Extract instructor
  let instructor: string | null = null;
  for (const pattern of instructorPatterns) {
    const match = text.match(pattern);
    if (match) {
      instructor = match[1].trim();
      break;
    }
  }
  
  // Extract email
  let instructorEmail: string | null = null;
  for (const pattern of emailPatterns) {
    const match = text.match(pattern);
    if (match) {
      instructorEmail = match[1].toLowerCase();
      break;
    }
  }
  
  // Extract semester and year
  let semester: string | null = null;
  let year: string | null = null;
  for (const pattern of semesterPatterns) {
    const match = text.match(pattern);
    if (match) {
      const sem = match[1].toLowerCase();
      if (sem.startsWith('f')) semester = 'fall';
      else if (sem.startsWith('s') && sem.length > 1) semester = 'spring';
      else if (sem.startsWith('su')) semester = 'summer';
      else if (sem.startsWith('w')) semester = 'winter';
      else if (sem.startsWith('a')) semester = 'autumn';
      else semester = sem;
      
      year = match[2] || match[1].match(/\d{4}/)?.[0] || null;
      break;
    }
  }
  
  // Extract university
  let university: string | null = null;
  for (const pattern of universityPatterns) {
    const match = text.match(pattern);
    if (match) {
      university = match[1].trim();
      break;
    }
  }
  
  // Extract department
  let department: string | null = null;
  for (const pattern of departmentPatterns) {
    const match = text.match(pattern);
    if (match) {
      department = match[1].trim();
      break;
    }
  }
  
  // Calculate confidence
  const fields = [courseCode, courseTitle, instructor, semester, year, university, department].filter(Boolean);
  const confidence = fields.length / 7;
  
  return {
    courseCode,
    courseTitle,
    instructor,
    instructorEmail,
    semester,
    year,
    university,
    department,
    confidence,
    extractedAt: Date.now()
  };
}

// Calculate cosine similarity between embeddings
export function cosineSimilarity(embedding1: number[], embedding2: number[]): number {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have the same length');
  }
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }
  
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

// Create embedding for syllabus text
export async function createSyllabusEmbedding(
  extractedData: OllamaExtractedData,
  signatureId: string
): Promise<OllamaEmbedding> {
  const searchableText = [
    extractedData.courseCode,
    extractedData.courseTitle,
    extractedData.instructor,
    extractedData.university,
    extractedData.department,
    extractedData.semester,
    extractedData.year
  ].filter(Boolean).join(' ');
  
  const embedding = await generateOllamaEmbedding(searchableText);
  
  return {
    id: `emb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    embedding,
    text: searchableText,
    metadata: {
      courseCode: extractedData.courseCode || 'unknown',
      courseTitle: extractedData.courseTitle || 'unknown',
      university: extractedData.university || 'unknown'
    },
    createdAt: Date.now()
  };
}

// Main processing function
export async function processSyllabusWithOllama(
  text: string,
  userId: string
): Promise<{
  extractedData: OllamaExtractedData;
  embedding: OllamaEmbedding;
  isOllamaAvailable: boolean;
}> {
  const isOllamaAvailable = await checkOllamaStatus();
  
  // Parse syllabus
  const extractedData = await parseSyllabusWithOllama(text);
  
  // Create embedding
  const embedding = await createSyllabusEmbedding(extractedData, `sig-${Date.now()}`);
  
  return {
    extractedData,
    embedding,
    isOllamaAvailable
  };
}

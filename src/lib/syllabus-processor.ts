import { db } from './firebase/client';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// Types for syllabus processing
export interface SyllabusFile {
  name: string;
  type: string;
  size: number;
  content: string; // Base64 or text content
}

export interface ExtractedSyllabusData {
  courseCode: string | null;
  courseTitle: string | null;
  instructor: string | null;
  instructorEmail: string | null;
  semester: string | null;
  year: string | null;
  university: string | null;
  department: string | null;
  rawText: string;
  confidence: number; // 0-1 confidence score
  extractedAt: number;
}

export interface SyllabusSignature {
  id: string;
  courseCode: string;
  courseTitle: string;
  semester: string;
  year: string;
  university: string;
  signature: string; // Normalized signature for matching
  embedding?: number[]; // Vector embedding for semantic matching
  createdAt: number;
  userId: string;
}

// File type detection and validation
export const SUPPORTED_FORMATS = {
  pdf: ['application/pdf'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  pptx: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  txt: ['text/plain'],
  images: ['image/jpeg', 'image/png', 'image/jpg']
};

export function validateFileType(file: File): boolean {
  const allTypes = Object.values(SUPPORTED_FORMATS).flat();
  return allTypes.includes(file.type);
}

export function getFileCategory(file: File): string {
  if (SUPPORTED_FORMATS.pdf.includes(file.type)) return 'pdf';
  if (SUPPORTED_FORMATS.docx.includes(file.type)) return 'docx';
  if (SUPPORTED_FORMATS.pptx.includes(file.type)) return 'pptx';
  if (SUPPORTED_FORMATS.txt.includes(file.type)) return 'txt';
  if (SUPPORTED_FORMATS.images.includes(file.type)) return 'image';
  return 'unknown';
}

// Text extraction functions (these would be implemented with actual libraries)
export async function extractTextFromFile(file: File): Promise<string> {
  const category = getFileCategory(file);
  
  switch (category) {
    case 'pdf':
      return await extractTextFromPDF(file);
    case 'docx':
      return await extractTextFromDOCX(file);
    case 'pptx':
      return await extractTextFromPPTX(file);
    case 'txt':
      return await extractTextFromTXT(file);
    case 'image':
      return await extractTextFromImage(file);
    default:
      throw new Error(`Unsupported file type: ${file.type}`);
  }
}

// Placeholder implementations - these would use actual libraries
async function extractTextFromPDF(file: File): Promise<string> {
  // Would use pdfplumber or similar
  return `PDF text extraction for ${file.name} - Implementation needed with pdfplumber`;
}

async function extractTextFromDOCX(file: File): Promise<string> {
  // Would use python-docx or mammoth.js
  return `DOCX text extraction for ${file.name} - Implementation needed with python-docx or mammoth.js`;
}

async function extractTextFromPPTX(file: File): Promise<string> {
  // Would use python-pptx or similar
  return `PPTX text extraction for ${file.name} - Implementation needed with python-pptx`;
}

async function extractTextFromTXT(file: File): Promise<string> {
  return await file.text();
}

async function extractTextFromImage(file: File): Promise<string> {
  // Would use Tesseract.js or similar for OCR
  return `OCR text extraction for ${file.name} - Implementation needed with Tesseract.js`;
}

// Advanced text normalization
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Key information extraction with advanced patterns
export function extractSyllabusData(rawText: string): ExtractedSyllabusData {
  const normalizedText = normalizeText(rawText);
  
  // Course code patterns (more comprehensive)
  const courseCodePatterns = [
    /(?:course\s+code|catalog\s+number|subject\s+code)[:\s]*([a-z]{2,4}[-_\s]?\d{3,4}[a-z]?)/i,
    /([a-z]{2,4}[-_\s]?\d{3,4}[a-z]?)/i, // General pattern
    /(?:csci|cse|math|eng|bio|chem|phys|econ|hist|engl)[-_\s]?\d{3,4}[a-z]?/i // Common prefixes
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
    /([a-z]+\s+[a-z]+)\s*@[a-z]+\.[a-z]+/i, // Name before email
    /([a-z]+\s+[a-z]+)\s*\([a-z]+@[a-z]+\.[a-z]+\)/i // Name (email)
  ];
  
  // Email patterns
  const emailPatterns = [
    /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi
  ];
  
  // Semester patterns
  const semesterPatterns = [
    /(fall|spring|summer|winter|autumn)\s+(\d{4})/i,
    /(f|s|su|w|a)\s*(\d{4})/i, // F2024, S2025, etc.
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
    const match = rawText.match(pattern);
    if (match) {
      courseCode = match[1].toUpperCase().replace(/[-_\s]/g, '');
      break;
    }
  }
  
  // Extract course title
  let courseTitle: string | null = null;
  for (const pattern of courseTitlePatterns) {
    const match = rawText.match(pattern);
    if (match) {
      courseTitle = match[1].trim();
      break;
    }
  }
  
  // Extract instructor
  let instructor: string | null = null;
  for (const pattern of instructorPatterns) {
    const match = rawText.match(pattern);
    if (match) {
      instructor = match[1].trim();
      break;
    }
  }
  
  // Extract email
  let instructorEmail: string | null = null;
  for (const pattern of emailPatterns) {
    const match = rawText.match(pattern);
    if (match) {
      instructorEmail = match[1].toLowerCase();
      break;
    }
  }
  
  // Extract semester and year
  let semester: string | null = null;
  let year: string | null = null;
  for (const pattern of semesterPatterns) {
    const match = rawText.match(pattern);
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
    const match = rawText.match(pattern);
    if (match) {
      university = match[1].trim();
      break;
    }
  }
  
  // Extract department
  let department: string | null = null;
  for (const pattern of departmentPatterns) {
    const match = rawText.match(pattern);
    if (match) {
      department = match[1].trim();
      break;
    }
  }
  
  // Calculate confidence score
  const confidence = calculateConfidence({
    courseCode,
    courseTitle,
    instructor,
    semester,
    year,
    university
  });
  
  return {
    courseCode,
    courseTitle,
    instructor,
    instructorEmail,
    semester,
    year,
    university,
    department,
    rawText,
    confidence,
    extractedAt: Date.now()
  };
}

// Confidence scoring
function calculateConfidence(data: Partial<ExtractedSyllabusData>): number {
  let score = 0;
  const maxScore = 6;
  
  if (data.courseCode) score += 1.5;
  if (data.courseTitle) score += 1;
  if (data.instructor) score += 1;
  if (data.semester) score += 0.5;
  if (data.year) score += 0.5;
  if (data.university) score += 1.5;
  
  return Math.min(score / maxScore, 1);
}

// Create syllabus signature for matching
export function createSyllabusSignature(data: ExtractedSyllabusData, userId: string): SyllabusSignature {
  const signature = [
    data.courseCode || 'unknown',
    data.courseTitle || 'unknown',
    data.semester || 'unknown',
    data.year || 'unknown',
    data.university || 'unknown'
  ].join('|').toLowerCase().replace(/[^a-z0-9|]/g, '');
  
  return {
    id: `sig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    courseCode: data.courseCode || 'unknown',
    courseTitle: data.courseTitle || 'unknown',
    semester: data.semester || 'unknown',
    year: data.year || 'unknown',
    university: data.university || 'unknown',
    signature,
    createdAt: Date.now(),
    userId
  };
}

// Fuzzy matching for syllabus signatures
export function calculateSimilarity(sig1: SyllabusSignature, sig2: SyllabusSignature): number {
  // Simple string similarity (would use fuzzywuzzy in real implementation)
  const s1 = sig1.signature;
  const s2 = sig2.signature;
  
  if (s1 === s2) return 1.0;
  
  // Calculate Jaccard similarity
  const set1 = new Set(s1.split('|'));
  const set2 = new Set(s2.split('|'));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

// Find matching syllabus signatures
export async function findMatchingSignatures(
  newSignature: SyllabusSignature,
  threshold: number = 0.8
): Promise<SyllabusSignature[]> {
  try {
    const signaturesRef = collection(db, 'syllabusSignatures');
    const q = query(signaturesRef, orderBy('createdAt', 'desc'), limit(100));
    
    const querySnapshot = await getDocs(q);
    const matches: SyllabusSignature[] = [];
    
    for (const doc of querySnapshot.docs) {
      const existingSig = doc.data() as SyllabusSignature;
      const similarity = calculateSimilarity(newSignature, existingSig);
      
      if (similarity >= threshold) {
        matches.push({
          ...existingSig,
          id: doc.id
        });
      }
    }
    
    return matches.sort((a, b) => {
      const simA = calculateSimilarity(newSignature, a);
      const simB = calculateSimilarity(newSignature, b);
      return simB - simA;
    });
  } catch (error) {
    console.error('Error finding matching signatures:', error);
    return [];
  }
}

// Store syllabus signature
export async function storeSyllabusSignature(signature: SyllabusSignature): Promise<string> {
  try {
    const signaturesRef = collection(db, 'syllabusSignatures');
    const docRef = await addDoc(signaturesRef, signature);
    return docRef.id;
  } catch (error) {
    console.error('Error storing syllabus signature:', error);
    throw error;
  }
}

// Main processing pipeline
export async function processSyllabusFile(
  file: File,
  userId: string
): Promise<{
  extractedData: ExtractedSyllabusData;
  signature: SyllabusSignature;
  matches: SyllabusSignature[];
  shouldCreateNew: boolean;
}> {
  // 1. Extract text from file
  const rawText = await extractTextFromFile(file);
  
  // 2. Extract key information
  const extractedData = extractSyllabusData(rawText);
  
  // 3. Create signature
  const signature = createSyllabusSignature(extractedData, userId);
  
  // 4. Find matches
  const matches = await findMatchingSignatures(signature);
  
  // 5. Determine if new group should be created
  const shouldCreateNew = matches.length === 0 || extractedData.confidence < 0.5;
  
  return {
    extractedData,
    signature,
    matches,
    shouldCreateNew
  };
}

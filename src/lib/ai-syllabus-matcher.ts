// AI-enhanced syllabus matching using embeddings and semantic similarity
import { db } from './firebase/client';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { ExtractedSyllabusData, SyllabusSignature } from './syllabus-processor';

// Types for AI-enhanced matching
export interface SyllabusEmbedding {
  id: string;
  signatureId: string;
  embedding: number[];
  text: string;
  metadata: {
    courseCode: string;
    courseTitle: string;
    university: string;
    semester: string;
    year: string;
  };
  createdAt: number;
}

export interface SemanticMatch {
  signature: SyllabusSignature;
  similarity: number;
  embedding: SyllabusEmbedding;
  reason: string; // Why it matched
}

// Mock embedding function (would use OpenAI or HuggingFace in production)
export async function generateEmbedding(text: string): Promise<number[]> {
  // In production, this would call OpenAI's text-embedding-3-small or similar
  // For now, we'll create a mock embedding based on text characteristics
  
  const normalizedText = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = normalizedText.split(/\s+/).filter(w => w.length > 2);
  
  // Create a simple hash-based embedding (not real, just for demo)
  const embedding = new Array(384).fill(0); // OpenAI embedding size
  
  words.forEach((word, index) => {
    const hash = word.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const embeddingIndex = Math.abs(hash) % embedding.length;
    embedding[embeddingIndex] += 1 / (index + 1);
  });
  
  // Normalize the embedding
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}

// Calculate cosine similarity between two embeddings
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
  extractedData: ExtractedSyllabusData,
  signatureId: string
): Promise<SyllabusEmbedding> {
  // Combine key information into a searchable text
  const searchableText = [
    extractedData.courseCode,
    extractedData.courseTitle,
    extractedData.instructor,
    extractedData.university,
    extractedData.department,
    extractedData.semester,
    extractedData.year
  ].filter(Boolean).join(' ');
  
  // Generate embedding
  const embedding = await generateEmbedding(searchableText);
  
  return {
    id: `emb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    signatureId,
    embedding,
    text: searchableText,
    metadata: {
      courseCode: extractedData.courseCode || 'unknown',
      courseTitle: extractedData.courseTitle || 'unknown',
      university: extractedData.university || 'unknown',
      semester: extractedData.semester || 'unknown',
      year: extractedData.year || 'unknown'
    },
    createdAt: Date.now()
  };
}

// Store embedding in database
export async function storeSyllabusEmbedding(embedding: SyllabusEmbedding): Promise<string> {
  try {
    const embeddingsRef = collection(db, 'syllabusEmbeddings');
    const docRef = await addDoc(embeddingsRef, embedding);
    return docRef.id;
  } catch (error) {
    console.error('Error storing syllabus embedding:', error);
    throw error;
  }
}

// Find semantic matches using embeddings
export async function findSemanticMatches(
  newEmbedding: SyllabusEmbedding,
  threshold: number = 0.7
): Promise<SemanticMatch[]> {
  try {
    const embeddingsRef = collection(db, 'syllabusEmbeddings');
    const q = query(embeddingsRef, orderBy('createdAt', 'desc'), limit(100));
    
    const querySnapshot = await getDocs(q);
    const matches: SemanticMatch[] = [];
    
    for (const doc of querySnapshot.docs) {
      const existingEmbedding = doc.data() as SyllabusEmbedding;
      
      // Skip if it's the same embedding
      if (existingEmbedding.id === newEmbedding.id) continue;
      
      // Calculate similarity
      const similarity = cosineSimilarity(newEmbedding.embedding, existingEmbedding.embedding);
      
      if (similarity >= threshold) {
        // Get the associated signature
        const signaturesRef = collection(db, 'syllabusSignatures');
        const sigQuery = query(signaturesRef, where('id', '==', existingEmbedding.signatureId));
        const sigSnapshot = await getDocs(sigQuery);
        
        if (!sigSnapshot.empty) {
          const signature = sigSnapshot.docs[0].data() as SyllabusSignature;
          
          matches.push({
            signature: {
              ...signature,
              id: sigSnapshot.docs[0].id
            },
            similarity,
            embedding: existingEmbedding,
            reason: generateMatchReason(newEmbedding, existingEmbedding, similarity)
          });
        }
      }
    }
    
    return matches.sort((a, b) => b.similarity - a.similarity);
  } catch (error) {
    console.error('Error finding semantic matches:', error);
    return [];
  }
}

// Generate human-readable reason for match
function generateMatchReason(
  newEmbedding: SyllabusEmbedding,
  existingEmbedding: SyllabusEmbedding,
  similarity: number
): string {
  const reasons: string[] = [];
  
  // Check for exact matches in metadata
  if (newEmbedding.metadata.courseCode === existingEmbedding.metadata.courseCode) {
    reasons.push('Same course code');
  }
  
  if (newEmbedding.metadata.university === existingEmbedding.metadata.university) {
    reasons.push('Same university');
  }
  
  if (newEmbedding.metadata.semester === existingEmbedding.metadata.semester) {
    reasons.push('Same semester');
  }
  
  if (newEmbedding.metadata.year === existingEmbedding.metadata.year) {
    reasons.push('Same year');
  }
  
  // Check for similar course titles
  const title1 = newEmbedding.metadata.courseTitle.toLowerCase();
  const title2 = existingEmbedding.metadata.courseTitle.toLowerCase();
  
  if (title1.includes(title2) || title2.includes(title1)) {
    reasons.push('Similar course title');
  }
  
  // Add similarity score
  reasons.push(`${Math.round(similarity * 100)}% semantic similarity`);
  
  return reasons.join(', ');
}

// Hybrid matching: combine fuzzy matching with semantic matching
export async function findHybridMatches(
  extractedData: ExtractedSyllabusData,
  signature: SyllabusSignature,
  userId: string
): Promise<{
  fuzzyMatches: any[];
  semanticMatches: SemanticMatch[];
  bestMatch: SemanticMatch | null;
  recommendation: 'join' | 'create' | 'confirm';
}> {
  // Create embedding for semantic matching
  const embedding = await createSyllabusEmbedding(extractedData, signature.id);
  
  // Find semantic matches
  const semanticMatches = await findSemanticMatches(embedding, 0.6);
  
  // Find fuzzy matches (from existing syllabus-processor)
  const { findMatchingSignatures } = await import('./syllabus-processor');
  const fuzzyMatches = await findMatchingSignatures(signature, 0.7);
  
  // Determine best match
  let bestMatch: SemanticMatch | null = null;
  let recommendation: 'join' | 'create' | 'confirm' = 'create';
  
  if (semanticMatches.length > 0) {
    bestMatch = semanticMatches[0];
    
    if (bestMatch.similarity >= 0.8) {
      recommendation = 'join';
    } else if (bestMatch.similarity >= 0.6) {
      recommendation = 'confirm';
    }
  } else if (fuzzyMatches.length > 0) {
    // Convert fuzzy match to semantic match format
    bestMatch = {
      signature: fuzzyMatches[0],
      similarity: 0.7, // Default fuzzy similarity
      embedding: {} as SyllabusEmbedding,
      reason: 'Fuzzy string match'
    };
    recommendation = 'confirm';
  }
  
  return {
    fuzzyMatches,
    semanticMatches,
    bestMatch,
    recommendation
  };
}

// Enhanced syllabus processing with AI
export async function processSyllabusWithAI(
  file: File,
  userId: string
): Promise<{
  extractedData: ExtractedSyllabusData;
  signature: SyllabusSignature;
  matches: {
    fuzzyMatches: any[];
    semanticMatches: SemanticMatch[];
    bestMatch: SemanticMatch | null;
    recommendation: 'join' | 'create' | 'confirm';
  };
  embedding: SyllabusEmbedding;
}> {
  // Import the basic processor
  const { processSyllabusFile } = await import('./syllabus-processor');
  
  // Process with basic pipeline
  const basicResult = await processSyllabusFile(file, userId);
  
  // Create embedding
  const embedding = await createSyllabusEmbedding(basicResult.extractedData, basicResult.signature.id);
  
  // Find hybrid matches
  const matches = await findHybridMatches(
    basicResult.extractedData,
    basicResult.signature,
    userId
  );
  
  // Store embedding
  await storeSyllabusEmbedding(embedding);
  
  return {
    extractedData: basicResult.extractedData,
    signature: basicResult.signature,
    matches,
    embedding
  };
}

import { db } from '@/lib/firebase/client';
import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, arrayUnion, arrayRemove } from 'firebase/firestore';

export interface SyllabusData {
  id: string;
  className: string;
  classCode: string;
  university?: string;
  instructor?: string;
  semester?: string;
  year?: string;
  uploadedBy: string;
  uploadedAt: number;
  fileHash?: string;
  isPublic: boolean;
}

export interface ClassGroup {
  id: string;
  className: string;
  classCode: string;
  university?: string;
  semester?: string;
  year?: string;
  members: string[];
  createdAt: number;
  chatId: string;
  isPublic: boolean;
}

export interface ChatPreference {
  type: 'ai-only' | 'public-chat';
  allowJoining: boolean;
}

/**
 * Calculate similarity between two syllabus data objects
 */
function calculateSimilarity(syllabus1: SyllabusData, syllabus2: SyllabusData): number {
  let score = 0;
  let factors = 0;

  // Class code similarity (most important)
  if (syllabus1.classCode && syllabus2.classCode) {
    const code1 = syllabus1.classCode.toLowerCase().replace(/[^a-z0-9]/g, '');
    const code2 = syllabus2.classCode.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (code1 === code2) {
      score += 40;
    } else if (code1.includes(code2) || code2.includes(code1)) {
      score += 20;
    }
    factors++;
  }

  // Class name similarity
  if (syllabus1.className && syllabus2.className) {
    const name1 = syllabus1.className.toLowerCase();
    const name2 = syllabus2.className.toLowerCase();
    const commonWords = name1.split(' ').filter(word => 
      word.length > 2 && name2.includes(word)
    );
    const similarity = (commonWords.length / Math.max(name1.split(' ').length, name2.split(' ').length)) * 30;
    score += similarity;
    factors++;
  }

  // University similarity
  if (syllabus1.university && syllabus2.university) {
    if (syllabus1.university.toLowerCase() === syllabus2.university.toLowerCase()) {
      score += 20;
    }
    factors++;
  }

  // Semester/year similarity
  if (syllabus1.semester && syllabus2.semester && syllabus1.year && syllabus2.year) {
    if (syllabus1.semester === syllabus2.semester && syllabus1.year === syllabus2.year) {
      score += 10;
    }
    factors++;
  }

  return factors > 0 ? score : 0; // Return total score, not average
}

/**
 * Find existing class groups that match the uploaded syllabus
 */
export async function findMatchingClassGroups(syllabusData: SyllabusData): Promise<ClassGroup[]> {
  try {
    // First, try to find an exact match by chat ID
    const deterministicChatId = generateClassChatId(syllabusData);
    const classGroupsRef = collection(db, 'classGroups');
    
    // Look for exact chat ID match first
    const exactMatchQuery = query(
      classGroupsRef,
      where('chatId', '==', deterministicChatId),
      where('isPublic', '==', true)
    );
    
    const exactMatchSnapshot = await getDocs(exactMatchQuery);
    if (!exactMatchSnapshot.empty) {
      const exactMatch = exactMatchSnapshot.docs[0].data() as ClassGroup;
      return [{
        ...exactMatch,
        id: exactMatchSnapshot.docs[0].id
      }];
    }
    
    // If no exact match, look for similar groups
    const q = query(
      classGroupsRef,
      where('isPublic', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const matchingGroups: ClassGroup[] = [];

    for (const docSnapshot of querySnapshot.docs) {
      const groupData = docSnapshot.data() as ClassGroup;
      const similarity = calculateSimilarity(syllabusData, groupData);
      
      // If similarity is above 60%, consider it a match
      if (similarity >= 60) {
        matchingGroups.push({
          ...groupData,
          id: docSnapshot.id
        });
      }
    }

    // Sort by similarity (highest first)
    return matchingGroups.sort((a, b) => {
      const similarityA = calculateSimilarity(syllabusData, a);
      const similarityB = calculateSimilarity(syllabusData, b);
      return similarityB - similarityA;
    });
  } catch (error) {
    console.error('Error finding matching class groups:', error);
    return [];
  }
}

/**
 * Create a new class group or join existing one
 */
export async function createClassGroup(
  syllabusData: SyllabusData,
  chatId: string,
  preferences: ChatPreference
): Promise<string> {
  try {
    // Use deterministic group ID based on course info
    const classCode = syllabusData.classCode.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const university = syllabusData.university?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'unknown';
    const semester = syllabusData.semester?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'unknown';
    const year = syllabusData.year || 'unknown';
    const groupId = `group-${classCode}-${university}-${semester}-${year}`;
    
    // Check if group already exists
    const existingGroupRef = doc(db, 'classGroups', groupId);
    const existingGroupSnap = await getDoc(existingGroupRef);
    
    if (existingGroupSnap.exists()) {
      // Group exists, add user to it
      const existingGroup = existingGroupSnap.data() as ClassGroup;
      if (!existingGroup.members.includes(syllabusData.uploadedBy)) {
        await updateDoc(existingGroupRef, {
          members: arrayUnion(syllabusData.uploadedBy)
        });
      }
      return groupId;
    }
    
    // Create new group
    const classGroup: ClassGroup = {
      id: groupId,
      className: syllabusData.className,
      classCode: syllabusData.classCode,
      university: syllabusData.university || null,
      semester: syllabusData.semester || null,
      year: syllabusData.year || null,
      members: [syllabusData.uploadedBy],
      createdAt: Date.now(),
      chatId: chatId,
      isPublic: preferences.type === 'public-chat'
    };

    await setDoc(doc(db, 'classGroups', groupId), classGroup);
    
    // Also store the syllabus data
    await setDoc(doc(db, 'syllabi', syllabusData.id), syllabusData);
    
    return groupId;
  } catch (error) {
    console.error('Error creating class group:', error);
    throw error;
  }
}

/**
 * Join an existing class group
 */
export async function joinClassGroup(groupId: string, userId: string): Promise<void> {
  try {
    const groupRef = doc(db, 'classGroups', groupId);
    await updateDoc(groupRef, {
      members: arrayUnion(userId)
    });
  } catch (error) {
    console.error('Error joining class group:', error);
    throw error;
  }
}

/**
 * Leave a class group
 */
export async function leaveClassGroup(groupId: string, userId: string): Promise<void> {
  try {
    const groupRef = doc(db, 'classGroups', groupId);
    await updateDoc(groupRef, {
      members: arrayRemove(userId)
    });
  } catch (error) {
    console.error('Error leaving class group:', error);
    throw error;
  }
}

/**
 * Get class groups for a user
 */
export async function getUserClassGroups(userId: string): Promise<ClassGroup[]> {
  try {
    const classGroupsRef = collection(db, 'classGroups');
    const q = query(
      classGroupsRef,
      where('members', 'array-contains', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const userGroups: ClassGroup[] = [];

    querySnapshot.forEach((doc) => {
      userGroups.push({
        ...doc.data() as ClassGroup,
        id: doc.id
      });
    });

    return userGroups;
  } catch (error) {
    console.error('Error getting user class groups:', error);
    return [];
  }
}

/**
 * Generate a deterministic chat ID for a class (same syllabus = same chat)
 */
export function generateClassChatId(syllabusData: SyllabusData): string {
  // Create a deterministic ID based on class code, university, and semester/year
  const classCode = syllabusData.classCode.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const university = syllabusData.university?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'unknown';
  const semester = syllabusData.semester?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'unknown';
  const year = syllabusData.year || 'unknown';
  
  // Create a deterministic ID that will be the same for identical course info
  return `class-${classCode}-${university}-${semester}-${year}`;
}

/**
 * Generate a deterministic syllabus ID (same course info = same ID)
 */
export function generateSyllabusId(syllabusData: Omit<SyllabusData, 'id'>): string {
  const classCode = syllabusData.classCode.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const university = syllabusData.university?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'unknown';
  const semester = syllabusData.semester?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'unknown';
  const year = syllabusData.year || 'unknown';
  
  return `syllabus-${classCode}-${university}-${semester}-${year}`;
}

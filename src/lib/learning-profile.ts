import { db } from '@/lib/firebase/server';

interface UserLearningProfile {
  userId: string;
  strugglingWith: string[];
  strengths?: string[];
  lastUpdated?: Date;
  learningStyle?: string;
  preferredComplexity?: 'basic' | 'intermediate' | 'advanced';
}

const LEARNING_PROFILES_COLLECTION = 'userLearningProfiles';

export async function getUserLearningProfile(userId: string): Promise<UserLearningProfile | null> {
  if (!userId) return null;
  try {
    const docRef = db.collection(LEARNING_PROFILES_COLLECTION).doc(userId);
    const doc = await docRef.get();
    if (doc.exists) {
      return doc.data() as UserLearningProfile;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching learning profile for user ${userId}:`, error);
    return null;
  }
}

export async function updateLearningProfile(userId: string, updates: Partial<UserLearningProfile>): Promise<void> {
  if (!userId) return;
  try {
    const docRef = db.collection(LEARNING_PROFILES_COLLECTION).doc(userId);
    await docRef.set(
      {
        userId,
        ...updates,
        lastUpdated: new Date(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error(`Error updating learning profile for user ${userId}:`, error);
  }
}

export async function addStrugglingTopic(userId: string, topic: string): Promise<void> {
  if (!userId || !topic) return;
  const normalizedTopic = topic.toLowerCase().trim();
  try {
    const profile = await getUserLearningProfile(userId);
    const currentStruggles = new Set(profile?.strugglingWith || []);
    if (!currentStruggles.has(normalizedTopic)) {
      currentStruggles.add(normalizedTopic);
      await updateLearningProfile(userId, { strugglingWith: Array.from(currentStruggles) });
    }
  } catch (error) {
    console.error(`Error adding struggling topic for user ${userId}:`, error);
  }
}

export async function removeStrugglingTopic(userId: string, topic: string): Promise<void> {
  if (!userId || !topic) return;
  const normalizedTopic = topic.toLowerCase().trim();
  try {
    const profile = await getUserLearningProfile(userId);
    const currentStruggles = new Set(profile?.strugglingWith || []);
    if (currentStruggles.has(normalizedTopic)) {
      currentStruggles.delete(normalizedTopic);
      await updateLearningProfile(userId, { strugglingWith: Array.from(currentStruggles) });
    }
  } catch (error) {
    console.error(`Error removing struggling topic for user ${userId}:`, error);
  }
}

export function detectStrugglingTopics(message: string, fallbackContext = ''): string[] {
  if (!message) return [];
  const phrases = [
    /i (don't|do not) (understand|get|grasp)\s+([^.?!]+)/i,
    /i'm (confused|lost) about\s+([^.?!]+)/i,
    /struggling with\s+([^.?!]+)/i,
    /hard time with\s+([^.?!]+)/i,
    /can't solve\s+([^.?!]+)/i,
  ];

  const topics = new Set<string>();
  for (const pattern of phrases) {
    const match = message.match(pattern);
    if (match && match[3]) {
      topics.add(match[3].trim().toLowerCase());
    } else if (match && match[2]) {
      topics.add(match[2].trim().toLowerCase());
    }
  }

  if (topics.size === 0 && fallbackContext) {
    topics.add(fallbackContext.toLowerCase());
  }

  return Array.from(topics);
}

export function formatLearningProfileForAI(profile: UserLearningProfile | null): string {
  if (!profile || !profile.strugglingWith || profile.strugglingWith.length === 0) {
    return '';
  }

  return `\n\nSTUDENT'S LEARNING PROFILE:\n- Struggling with: ${profile.strugglingWith.join(', ')}\n`;
}


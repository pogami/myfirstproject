export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  subscriptionPlan: 'free' | 'advanced-ai-scholar';
  learningPreferences: LearningPreferences;
  conversationHistory: ConversationSummary[];
  classTutors: ClassTutorProfile[];
  createdAt: number;
  lastActive: number;
}

export interface LearningPreferences {
  studyStyle: 'visual' | 'textual' | 'hands-on' | 'mixed';
  preferredSubjects: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  learningGoals: string[];
  timeZone: string;
  preferredLanguage: string;
}

export interface ConversationSummary {
  chatId: string;
  className?: string;
  subject?: string;
  topics: string[];
  keyPoints: string[];
  struggles: string[];
  achievements: string[];
  lastConversation: number;
  messageCount: number;
}

export interface ClassTutorProfile {
  classId: string;
  className: string;
  subject: string;
  instructor?: string;
  semester?: string;
  year?: number;
  personalizedContext: PersonalizedContext;
  studyPlan: StudyPlan;
  lastInteraction: number;
  totalInteractions: number;
}

export interface PersonalizedContext {
  userStrengths: string[];
  userWeaknesses: string[];
  learningPatterns: string[];
  preferredExplanationStyle: 'detailed' | 'concise' | 'step-by-step' | 'examples-heavy';
  commonQuestions: string[];
  masteredTopics: string[];
  strugglingTopics: string[];
}

export interface StudyPlan {
  currentFocus: string[];
  upcomingTopics: string[];
  reviewSchedule: ReviewItem[];
  practiceRecommendations: string[];
  examPreparation: ExamPrep[];
}

export interface ReviewItem {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed: number;
  nextReview: number;
  masteryLevel: number; // 0-100
}

export interface ExamPrep {
  examType: string;
  examDate?: number;
  preparationSteps: string[];
  practiceMaterials: string[];
  confidenceLevel: number; // 0-100
}

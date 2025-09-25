import { db } from '@/lib/firebase/client';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { UserProfile, LearningPreferences, ConversationSummary, ClassTutorProfile, PersonalizedContext } from '@/types/user-profile';

export class AdvancedAIScholarService {
  private static instance: AdvancedAIScholarService;
  
  static getInstance(): AdvancedAIScholarService {
    if (!AdvancedAIScholarService.instance) {
      AdvancedAIScholarService.instance = new AdvancedAIScholarService();
    }
    return AdvancedAIScholarService.instance;
  }

  /**
   * Get or create user profile for Advanced AI Scholar
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'userProfiles', userId));
      
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      
      // Create new profile for Advanced AI Scholar
      const newProfile: UserProfile = {
        id: userId,
        email: '',
        displayName: '',
        subscriptionPlan: 'advanced-ai-scholar',
        learningPreferences: {
          studyStyle: 'mixed',
          preferredSubjects: [],
          difficultyLevel: 'intermediate',
          learningGoals: [],
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          preferredLanguage: 'en'
        },
        conversationHistory: [],
        classTutors: [],
        createdAt: Date.now(),
        lastActive: Date.now()
      };
      
      await setDoc(doc(db, 'userProfiles', userId), newProfile);
      return newProfile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Update user learning preferences
   */
  async updateLearningPreferences(userId: string, preferences: Partial<LearningPreferences>): Promise<boolean> {
    try {
      const userRef = doc(db, 'userProfiles', userId);
      await updateDoc(userRef, {
        'learningPreferences': preferences,
        lastActive: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating learning preferences:', error);
      return false;
    }
  }

  /**
   * Add conversation summary to user's history
   */
  async addConversationSummary(userId: string, summary: ConversationSummary): Promise<boolean> {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) return false;

      // Update or add conversation summary
      const existingIndex = userProfile.conversationHistory.findIndex(c => c.chatId === summary.chatId);
      
      if (existingIndex >= 0) {
        userProfile.conversationHistory[existingIndex] = summary;
      } else {
        userProfile.conversationHistory.push(summary);
      }

      // Keep only last 50 conversations
      if (userProfile.conversationHistory.length > 50) {
        userProfile.conversationHistory = userProfile.conversationHistory
          .sort((a, b) => b.lastConversation - a.lastConversation)
          .slice(0, 50);
      }

      await setDoc(doc(db, 'userProfiles', userId), userProfile);
      return true;
    } catch (error) {
      console.error('Error adding conversation summary:', error);
      return false;
    }
  }

  /**
   * Get or create class tutor profile
   */
  async getClassTutorProfile(userId: string, classId: string, className: string, subject: string): Promise<ClassTutorProfile | null> {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) return null;

      // Find existing class tutor
      let classTutor = userProfile.classTutors.find(t => t.classId === classId);
      
      if (!classTutor) {
        // Create new class tutor profile
        classTutor = {
          classId,
          className,
          subject,
          personalizedContext: {
            userStrengths: [],
            userWeaknesses: [],
            learningPatterns: [],
            preferredExplanationStyle: 'step-by-step',
            commonQuestions: [],
            masteredTopics: [],
            strugglingTopics: []
          },
          studyPlan: {
            currentFocus: [],
            upcomingTopics: [],
            reviewSchedule: [],
            practiceRecommendations: [],
            examPreparation: []
          },
          lastInteraction: Date.now(),
          totalInteractions: 0
        };
        
        userProfile.classTutors.push(classTutor);
        await setDoc(doc(db, 'userProfiles', userId), userProfile);
      }

      return classTutor;
    } catch (error) {
      console.error('Error getting class tutor profile:', error);
      return null;
    }
  }

  /**
   * Update class tutor with new interaction data
   */
  async updateClassTutorInteraction(
    userId: string, 
    classId: string, 
    interactionData: {
      topics?: string[];
      struggles?: string[];
      achievements?: string[];
      questions?: string[];
      masteryLevel?: { topic: string; level: number }[];
    }
  ): Promise<boolean> {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) return false;

      const classTutor = userProfile.classTutors.find(t => t.classId === classId);
      if (!classTutor) return false;

      // Update interaction data
      classTutor.lastInteraction = Date.now();
      classTutor.totalInteractions++;

      // Update personalized context
      if (interactionData.topics) {
        interactionData.topics.forEach(topic => {
          if (!classTutor.personalizedContext.masteredTopics.includes(topic)) {
            classTutor.personalizedContext.masteredTopics.push(topic);
          }
        });
      }

      if (interactionData.struggles) {
        interactionData.struggles.forEach(struggle => {
          if (!classTutor.personalizedContext.strugglingTopics.includes(struggle)) {
            classTutor.personalizedContext.strugglingTopics.push(struggle);
          }
        });
      }

      if (interactionData.questions) {
        interactionData.questions.forEach(question => {
          if (!classTutor.personalizedContext.commonQuestions.includes(question)) {
            classTutor.personalizedContext.commonQuestions.push(question);
          }
        });
      }

      await setDoc(doc(db, 'userProfiles', userId), userProfile);
      return true;
    } catch (error) {
      console.error('Error updating class tutor interaction:', error);
      return false;
    }
  }

  /**
   * Generate personalized context for AI responses
   */
  generatePersonalizedContext(userProfile: UserProfile, classTutor?: ClassTutorProfile): string {
    let context = `User Profile:
- Study Style: ${userProfile.learningPreferences.studyStyle}
- Difficulty Level: ${userProfile.learningPreferences.difficultyLevel}
- Preferred Subjects: ${userProfile.learningPreferences.preferredSubjects.join(', ') || 'None specified'}
- Learning Goals: ${userProfile.learningPreferences.learningGoals.join(', ') || 'None specified'}

Recent Conversation History:
`;

    // Add recent conversation summaries
    const recentConversations = userProfile.conversationHistory
      .sort((a, b) => b.lastConversation - a.lastConversation)
      .slice(0, 5);

    recentConversations.forEach(conv => {
      context += `- ${conv.className || 'General'}: ${conv.topics.join(', ')} (${conv.messageCount} messages)\n`;
    });

    if (classTutor) {
      context += `\nClass-Specific Context (${classTutor.className}):
- Mastered Topics: ${classTutor.personalizedContext.masteredTopics.join(', ') || 'None yet'}
- Struggling Topics: ${classTutor.personalizedContext.strugglingTopics.join(', ') || 'None identified'}
- Common Questions: ${classTutor.personalizedContext.commonQuestions.slice(0, 3).join(', ') || 'None yet'}
- Total Interactions: ${classTutor.totalInteractions}
- Preferred Explanation Style: ${classTutor.personalizedContext.preferredExplanationStyle}
`;
    }

    return context;
  }

  /**
   * Check if user has Advanced AI Scholar subscription
   */
  async hasAdvancedAIScholar(userId: string): Promise<boolean> {
    try {
      const userProfile = await this.getUserProfile(userId);
      return userProfile?.subscriptionPlan === 'advanced-ai-scholar';
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  }
}

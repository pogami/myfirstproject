"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Brain, BookOpen, Target, TrendingUp, Clock, Star, Users, MessageCircle } from 'lucide-react';
import { CourseConnectLogo } from '@/components/icons/courseconnect-logo';
import { AdvancedAIScholarService } from '@/services/advanced-ai-scholar-service';
import { UserProfile, ClassTutorProfile } from '@/types/user-profile';
import { cn } from '@/lib/utils';

interface PersonalizedAITutorProps {
  userId: string;
  classId?: string;
  className?: string;
  subject?: string;
  onStartChat: (chatId: string) => void;
  className?: string;
}

export function PersonalizedAITutor({ 
  userId, 
  classId, 
  className: classNameProp, 
  subject, 
  onStartChat,
  className: wrapperClassName 
}: PersonalizedAITutorProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [classTutor, setClassTutor] = useState<ClassTutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAdvancedPlan, setHasAdvancedPlan] = useState(false);

  const service = AdvancedAIScholarService.getInstance();

  useEffect(() => {
    loadUserData();
  }, [userId, classId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Check if user has Advanced AI Scholar plan
      const hasPlan = await service.hasAdvancedAIScholar(userId);
      setHasAdvancedPlan(hasPlan);

      if (!hasPlan) {
        setLoading(false);
        return;
      }

      // Load user profile
      const profile = await service.getUserProfile(userId);
      setUserProfile(profile);

      // Load class tutor if classId provided
      if (classId && classNameProp && subject) {
        const tutor = await service.getClassTutorProfile(userId, classId, classNameProp, subject);
        setClassTutor(tutor);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = () => {
    const chatId = classId ? `class-${classId}-${Date.now()}` : `general-advanced-${Date.now()}`;
    onStartChat(chatId);
  };

  if (loading) {
    return (
      <Card className={cn("w-full", wrapperClassName)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading your personalized AI tutor...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasAdvancedPlan) {
    return (
      <Card className={cn("w-full border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20", wrapperClassName)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Star className="h-5 w-5" />
            Advanced AI Scholar Plan Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700 dark:text-amber-300 mb-4">
            Unlock personalized AI tutoring with persistent memory, learning preferences, and class-specific context.
          </p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
              <Brain className="h-4 w-4" />
              Persistent memory across conversations
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
              <Target className="h-4 w-4" />
              Personalized learning preferences
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
              <BookOpen className="h-4 w-4" />
              Class-specific AI tutors
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
              <TrendingUp className="h-4 w-4" />
              Smart study plans and reminders
            </div>
          </div>
          <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
            Upgrade to Advanced AI Scholar - Only $5/month
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10", wrapperClassName)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-bold text-lg">
              <CourseConnectLogo className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-primary">
              {classTutor ? `${classTutor.className} AI Tutor` : 'Personalized AI Tutor'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Advanced AI Scholar • Persistent Memory Active
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Learning Profile Summary */}
        {userProfile && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Your Learning Profile</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Badge variant="secondary" className="justify-start">
                Style: {userProfile.learningPreferences.studyStyle}
              </Badge>
              <Badge variant="secondary" className="justify-start">
                Level: {userProfile.learningPreferences.difficultyLevel}
              </Badge>
            </div>
            {userProfile.learningPreferences.preferredSubjects.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {userProfile.learningPreferences.preferredSubjects.slice(0, 3).map((subject, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {subject}
                  </Badge>
                ))}
                {userProfile.learningPreferences.preferredSubjects.length > 3 && (
                  <div className="relative group">
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                      +{userProfile.learningPreferences.preferredSubjects.length - 3} more
                    </Badge>
                    <div className="absolute bottom-full left-0 mb-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[300px] max-w-[90vw] sm:max-w-[400px]"
                         role="tooltip" aria-label="All preferred subjects">
                      <div className="text-sm font-semibold mb-3 text-center text-gray-900 dark:text-gray-100">All Preferred Subjects</div>
                      <div className="grid grid-cols-2 gap-2">
                        {userProfile.learningPreferences.preferredSubjects.map((subject, index) => (
                          <div key={index} className="text-xs p-2 bg-gray-50 dark:bg-gray-700 rounded-md text-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                            {subject}
                          </div>
                        ))}
                      </div>
                      <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-200 dark:border-t-gray-700"></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Class-Specific Context */}
        {classTutor && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Class Context</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span>{classTutor.personalizedContext.masteredTopics.length} mastered</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-orange-500" />
                <span>{classTutor.personalizedContext.strugglingTopics.length} struggling</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MessageCircle className="h-3 w-3" />
              <span>{classTutor.totalInteractions} interactions</span>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {userProfile && userProfile.conversationHistory.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Recent Activity</span>
            </div>
            <div className="space-y-1">
              {userProfile.conversationHistory.slice(0, 2).map((conv, index) => (
                <div key={index} className="text-xs text-muted-foreground">
                  {conv.className || 'General'}: {conv.topics.slice(0, 2).join(', ')}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Start Chat Button */}
        <Button 
          onClick={handleStartChat}
          className="w-full bg-primary hover:bg-primary/90 text-white"
        >
          <Brain className="h-4 w-4 mr-2" />
          Start Personalized Chat
        </Button>
      </CardContent>
    </Card>
  );
}

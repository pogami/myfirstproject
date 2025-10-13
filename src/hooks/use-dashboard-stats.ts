'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase/client';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc, 
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { User } from 'firebase/auth';

export interface DashboardStats {
  studyTimeToday: number; // in minutes
  assignmentsCompleted: number;
  studyStreak: number;
  upcomingDeadlines: number;
  lastStudyDate: string;
  totalStudyTime: number;
  averageStudyTime: number;
}

export interface StudySession {
  id: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  duration: number; // in minutes
  subject?: string;
  type: 'focused' | 'break' | 'review';
}

export interface Assignment {
  id: string;
  title: string;
  dueDate: Timestamp;
  completed: boolean;
  completedAt?: Timestamp;
  classId: string;
  priority: 'low' | 'medium' | 'high';
}

export function useDashboardStats(user: User | null) {
  const [stats, setStats] = useState<DashboardStats>({
    studyTimeToday: 0,
    assignmentsCompleted: 0,
    studyStreak: 0,
    upcomingDeadlines: 0,
    lastStudyDate: '',
    totalStudyTime: 0,
    averageStudyTime: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get today's date string for comparison
  const getTodayString = () => new Date().toDateString();

  // Calculate study streak
  const calculateStudyStreak = async (userId: string) => {
    try {
      const today = getTodayString();
      let streak = 0;
      let currentDate = new Date();

      // Check consecutive days backwards
      for (let i = 0; i < 30; i++) { // Check up to 30 days
        const dateString = currentDate.toDateString();
        const dayStatsRef = doc(db, 'userStats', userId, 'dailyStats', dateString);
        const dayStatsSnap = await getDoc(dayStatsRef);
        
        if (dayStatsSnap.exists() && dayStatsSnap.data().studyTime > 0) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating study streak:', error);
      return 0;
    }
  };

  // Get upcoming deadlines (next 7 days)
  const getUpcomingDeadlines = async (userId: string) => {
    try {
      const assignmentsRef = collection(db, 'assignments');
      const q = query(
        assignmentsRef,
        where('userId', '==', userId),
        where('completed', '==', false),
        orderBy('dueDate', 'asc'),
        limit(20)
      );

      const snapshot = await getDocs(q);
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      return snapshot.docs.filter(doc => {
        const dueDate = doc.data().dueDate.toDate();
        return dueDate >= now && dueDate <= nextWeek;
      }).length;
    } catch (error) {
      console.warn('Firebase offline, returning 0 for upcoming deadlines:', error);
      return 0;
    }
  };

  // Get completed assignments count
  const getCompletedAssignments = async (userId: string) => {
    try {
      const assignmentsRef = collection(db, 'assignments');
      const q = query(
        assignmentsRef,
        where('userId', '==', userId),
        where('completed', '==', true)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.warn('Firebase offline, returning 0 for completed assignments:', error);
      return 0;
    }
  };

  // Update daily study time
  const updateStudyTime = async (minutes: number) => {
    if (!user) return;

    try {
      const today = getTodayString();
      const dayStatsRef = doc(db, 'userStats', user.uid, 'dailyStats', today);
      const dayStatsSnap = await getDoc(dayStatsRef);

      if (dayStatsSnap.exists()) {
        await updateDoc(dayStatsRef, {
          studyTime: dayStatsSnap.data().studyTime + minutes,
          lastUpdated: serverTimestamp()
        });
      } else {
        await setDoc(dayStatsRef, {
          studyTime: minutes,
          date: today,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating study time:', error);
    }
  };

  // Start a study session
  const startStudySession = async (subject?: string, type: 'focused' | 'break' | 'review' = 'focused') => {
    if (!user) return null;

    try {
      const sessionData = {
        userId: user.uid,
        startTime: serverTimestamp(),
        subject: subject || 'General Study',
        type,
        duration: 0
      };

      const sessionsRef = collection(db, 'studySessions');
      const docRef = await setDoc(doc(sessionsRef), sessionData);
      return docRef;
    } catch (error) {
      console.error('Error starting study session:', error);
      return null;
    }
  };

  // End a study session
  const endStudySession = async (sessionId: string, duration: number) => {
    if (!user) return;

    try {
      const sessionRef = doc(db, 'studySessions', sessionId);
      await updateDoc(sessionRef, {
        endTime: serverTimestamp(),
        duration
      });

      // Update daily study time
      await updateStudyTime(duration);
    } catch (error) {
      console.error('Error ending study session:', error);
    }
  };

  // Load dashboard stats
  useEffect(() => {
    if (!user) {
      setStats({
        studyTimeToday: 0,
        assignmentsCompleted: 0,
        studyStreak: 0,
        upcomingDeadlines: 0,
        lastStudyDate: '',
        totalStudyTime: 0,
        averageStudyTime: 0
      });
      setIsLoading(false);
      return;
    }

    const loadStats = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const today = getTodayString();
        
        // Get today's study time with offline fallback
        let studyTimeToday = 0;
        try {
          const dayStatsRef = doc(db, 'userStats', user.uid, 'dailyStats', today);
          const dayStatsSnap = await getDoc(dayStatsRef);
          studyTimeToday = dayStatsSnap.exists() ? dayStatsSnap.data().studyTime || 0 : 0;
        } catch (firebaseError) {
          console.warn('Firebase offline, using default values:', firebaseError);
          studyTimeToday = 0;
        }

        // Get other stats with offline fallback
        let assignmentsCompleted = 0;
        let upcomingDeadlines = 0;
        let studyStreak = 0;

        try {
          [assignmentsCompleted, upcomingDeadlines, studyStreak] = await Promise.all([
            getCompletedAssignments(user.uid),
            getUpcomingDeadlines(user.uid),
            calculateStudyStreak(user.uid)
          ]);
        } catch (firebaseError) {
          console.warn('Firebase offline, using default values for assignments and streak:', firebaseError);
          // Use default values when offline
          assignmentsCompleted = 0;
          upcomingDeadlines = 0;
          studyStreak = 0;
        }

        setStats({
          studyTimeToday,
          assignmentsCompleted,
          studyStreak,
          upcomingDeadlines,
          lastStudyDate: today,
          totalStudyTime: 0, // TODO: Calculate total study time
          averageStudyTime: 0 // TODO: Calculate average study time
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        setError('Failed to load dashboard stats');
        // Set default values on error
        setStats({
          studyTimeToday: 0,
          assignmentsCompleted: 0,
          studyStreak: 0,
          upcomingDeadlines: 0,
          lastStudyDate: '',
          totalStudyTime: 0,
          averageStudyTime: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();

    // Listen for real-time updates to today's study time with offline handling
    const today = getTodayString();
    const dayStatsRef = doc(db, 'userStats', user.uid, 'dailyStats', today);
    
    let unsubscribe: (() => void) | undefined;
    
    try {
      unsubscribe = onSnapshot(
        dayStatsRef, 
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setStats(prev => ({
              ...prev,
              studyTimeToday: data.studyTime || 0
            }));
          }
        },
        (error) => {
          console.warn('Firebase offline, real-time updates disabled:', error);
          // Don't set error state for offline, just log it
        }
      );
    } catch (error) {
      console.warn('Failed to set up real-time listener:', error);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  return {
    stats,
    isLoading,
    error,
    updateStudyTime,
    startStudySession,
    endStudySession
  };
}

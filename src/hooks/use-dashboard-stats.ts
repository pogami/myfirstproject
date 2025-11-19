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
import { useChatStore } from '@/hooks/use-chat-store';

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
  const { chats } = useChatStore();
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

  // Calculate website visit streak (not study sessions)
  const calculateWebsiteStreak = async (userId: string) => {
    try {
      const today = getTodayString();
      let streak = 0;
      let currentDate = new Date();

      // Check consecutive days backwards
      for (let i = 0; i < 30; i++) { // Check up to 30 days
        const dateString = currentDate.toDateString();
        const dayStatsRef = doc(db, 'userStats', userId, 'dailyStats', dateString);
        const dayStatsSnap = await getDoc(dayStatsRef);
        
        if (dayStatsSnap.exists() && dayStatsSnap.data().visitedToday) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
      

      return streak;
    } catch (error) {
      console.error('Error calculating website streak:', error);
      return 0;
    }
  };

  // Get upcoming deadlines (next 7 days) from chat data
  const getUpcomingDeadlines = async (userId: string) => {
    try {
      // Get user's chat IDs
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) return 0;
      
      const userData = userDocSnap.data();
      const userChatIds = userData.chats || [];
      
      let upcomingCount = 0;
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      for (const chatId of userChatIds) {
        try {
          const chatRef = doc(db, 'chats', chatId);
          const chatSnap = await getDoc(chatRef);
          
          if (chatSnap.exists()) {
            const chatData = chatSnap.data();
            
            // Count assignments due this week
            if (chatData.chatType === 'class' && chatData.courseData?.assignments) {
              chatData.courseData.assignments.forEach((assignment: any) => {
                if (assignment.dueDate && assignment.dueDate !== 'null') {
                  const dueDate = new Date(assignment.dueDate);
                  if (dueDate >= now && dueDate <= nextWeek) {
                    upcomingCount++;
                  }
                }
              });
            }
            
            // Count exams due this week
            if (chatData.chatType === 'class' && chatData.courseData?.exams) {
              chatData.courseData.exams.forEach((exam: any) => {
                if (exam.date && exam.date !== 'null') {
                  const examDate = new Date(exam.date);
                  if (examDate >= now && examDate <= nextWeek) {
                    upcomingCount++;
                  }
                }
              });
            }
          }
        } catch (error) {
          console.warn('Error reading chat for deadlines:', chatId, error);
        }
      }
      
      return upcomingCount;
    } catch (error) {
      console.warn('Firebase offline, returning 0 for upcoming deadlines:', error);
      return 0;
    }
  };

  // Get completed assignments count from actual chat data
  const getCompletedAssignments = async (userId: string) => {
    try {
      // Get all chats for the user
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('userId', '==', userId),
        where('chatType', '==', 'class')
      );

      const snapshot = await getDocs(q);
      let completedCount = 0;

      snapshot.docs.forEach(doc => {
        const chatData = doc.data();
        if (chatData.courseData?.assignments) {
          chatData.courseData.assignments.forEach((assignment: any) => {
            if (assignment.status === 'Completed') {
              completedCount++;
            }
          });
        }
      });

      return completedCount;
    } catch (error) {
      console.warn('Firebase offline, returning 0 for completed assignments:', error);
      return 0;
    }
  };

  // Track website time spent (not study sessions)
  const updateWebsiteTime = async (minutes: number) => {
    if (!user) return;

    // Handle guest or anonymous users in localStorage to avoid Firestore permission issues
    if ((user as any).isGuest || (user as any).isAnonymous) {
      try {
        const today = getTodayString();
        const dayStatsKey = `guest-stats-${today}`;
        const existingStats = localStorage.getItem(dayStatsKey);
        
        let currentTime = 0;
        if (existingStats) {
          try {
            const stats = JSON.parse(existingStats);
            currentTime = stats.websiteTime || 0;
          } catch (error) {
            console.warn('Error parsing existing guest stats:', error);
          }
        }
        
        const newTime = currentTime + minutes;
        console.log('⏰ Guest: Updating website time from', currentTime, 'to', newTime, 'minutes');
        
        const updatedStats = {
          websiteTime: newTime,
          date: today,
          lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem(dayStatsKey, JSON.stringify(updatedStats));
        console.log('⏰ Guest: Saved to localStorage');
        
        // Immediately refresh stats for real-time UI update
        console.log('⏰ Guest: Refreshing stats immediately');
        loadGuestStats();
        return;
      } catch (error) {
        console.error('Error updating guest website time:', error);
        return;
      }
    }

    // Handle fully authenticated users - store in Firebase
    try {
      const today = getTodayString();
      const dayStatsRef = doc(db, 'userStats', user.uid, 'dailyStats', today);
      const dayStatsSnap = await getDoc(dayStatsRef);

      if (dayStatsSnap.exists()) {
        const currentTime = dayStatsSnap.data().websiteTime || 0;
        const newTime = currentTime + minutes;
        console.log('⏰ Firebase: Updating website time from', currentTime, 'to', newTime, 'minutes');
        await updateDoc(dayStatsRef, {
          websiteTime: newTime,
          lastVisit: serverTimestamp(),
          lastUpdated: serverTimestamp()
        });
      } else {
        console.log('⏰ Firebase: Creating new day stats with', minutes, 'minutes');
        await setDoc(dayStatsRef, {
          websiteTime: minutes,
          date: today,
          createdAt: serverTimestamp(),
          lastVisit: serverTimestamp(),
          lastUpdated: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating website time:', error);
    }
  };

  // Track daily website visit
  const trackWebsiteVisit = async () => {
    if (!user) return;

    // Handle guest or anonymous users differently - store in localStorage
    if ((user as any).isGuest || (user as any).isAnonymous) {
      try {
        const today = getTodayString();
        const dayStatsKey = `guest-stats-${today}`;
        const streakKey = 'guest-streak';
        
        // Update visit stats
        const existingStats = localStorage.getItem(dayStatsKey);
        let visitCount = 1;
        if (existingStats) {
          try {
            const stats = JSON.parse(existingStats);
            visitCount = (stats.visitCount || 0) + 1;
          } catch (error) {
            console.warn('Error parsing existing guest stats:', error);
          }
        }
        
        const updatedStats = {
          visitedToday: true,
          visitCount: visitCount,
          websiteTime: 0,
          date: today,
          lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem(dayStatsKey, JSON.stringify(updatedStats));
        
        // Update streak
        const streakData = localStorage.getItem(streakKey);
        let currentStreak = 1;
        if (streakData) {
          try {
            const streak = JSON.parse(streakData);
            currentStreak = streak.currentStreak || 1;
          } catch (error) {
            console.warn('Error parsing guest streak:', error);
          }
        }
        
        localStorage.setItem(streakKey, JSON.stringify({
          currentStreak: currentStreak,
          lastVisit: today
        }));
        
        console.log('⏰ Guest: Tracked website visit, streak:', currentStreak);
        
        // Immediately refresh stats for real-time UI update
        console.log('⏰ Guest: Refreshing stats after visit tracking');
        loadGuestStats();
        return;
      } catch (error) {
        console.error('Error tracking guest website visit:', error);
        return;
      }
    }

    // Handle authenticated users - store in Firebase
    try {
      const today = getTodayString();
      const dayStatsRef = doc(db, 'userStats', user.uid, 'dailyStats', today);
      const dayStatsSnap = await getDoc(dayStatsRef);

      if (dayStatsSnap.exists()) {
        await updateDoc(dayStatsRef, {
          visitedToday: true,
          lastVisit: serverTimestamp(),
          visitCount: (dayStatsSnap.data().visitCount || 0) + 1
        });
      } else {
        await setDoc(dayStatsRef, {
          visitedToday: true,
          websiteTime: 0,
          date: today,
          createdAt: serverTimestamp(),
          lastVisit: serverTimestamp(),
          visitCount: 1
        });
      }
    } catch (error) {
      console.error('Error tracking website visit:', error);
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

  // Load guest user stats from localStorage
  const loadGuestStats = () => {
    try {
      const today = getTodayString();
      
      // Get study time from localStorage
      const dayStats = localStorage.getItem(`guest-stats-${today}`);
      let studyTimeToday = 0;
      if (dayStats) {
        try {
          const stats = JSON.parse(dayStats);
          studyTimeToday = stats.websiteTime || 0;
        } catch (error) {
          console.warn('Error parsing guest stats:', error);
        }
      }

      // Get fresh chats data from the store
      const currentChats = useChatStore.getState().chats;

      // Get assignments completed from chat store
      let assignmentsCompleted = 0;
      Object.values(currentChats).forEach(chat => {
        if (chat.chatType === 'class' && chat.courseData?.assignments) {
          chat.courseData.assignments.forEach((assignment: any) => {
            if (assignment.status === 'Completed') {
              assignmentsCompleted++;
            }
          });
        }
      });

      // Get upcoming deadlines from chat store
      let upcomingDeadlines = 0;
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      Object.values(currentChats).forEach(chat => {
        if (chat.chatType === 'class') {
          // Count assignments due this week
          if (chat.courseData?.assignments) {
            chat.courseData.assignments.forEach((assignment: any) => {
              if (assignment.dueDate && assignment.dueDate !== 'null') {
                const dueDate = new Date(assignment.dueDate);
                if (dueDate >= now && dueDate <= nextWeek) {
                  upcomingDeadlines++;
                }
              }
            });
          }
          
          // Count exams due this week
          if (chat.courseData?.exams) {
            chat.courseData.exams.forEach((exam: any) => {
              if (exam.date && exam.date !== 'null') {
                const examDate = new Date(exam.date);
                if (examDate >= now && examDate <= nextWeek) {
                  upcomingDeadlines++;
                }
              }
            });
          }
        }
      });

      // Get streak from localStorage
      let studyStreak = 0;
      const streakData = localStorage.getItem('guest-streak');
      if (streakData) {
        try {
          studyStreak = JSON.parse(streakData).currentStreak || 0;
        } catch (error) {
          console.warn('Error parsing guest streak:', error);
        }
      }

      const guestStats = {
        studyTimeToday,
        assignmentsCompleted,
        studyStreak,
        upcomingDeadlines,
        lastStudyDate: today,
        totalStudyTime: 0,
        averageStudyTime: 0
      };

      setStats(guestStats);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading guest stats:', error);
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

    // Handle guest users differently
    if (user.isGuest) {
      loadGuestStats();
      return;
    }

    const loadStats = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const today = getTodayString();
        
        // Get today's website time with offline fallback
        let studyTimeToday = 0;
        try {
          const dayStatsRef = doc(db, 'userStats', user.uid, 'dailyStats', today);
          const dayStatsSnap = await getDoc(dayStatsRef);
          studyTimeToday = dayStatsSnap.exists() ? dayStatsSnap.data().websiteTime || 0 : 0;
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
            calculateWebsiteStreak(user.uid)
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

    // Listen for real-time updates to today's website time with offline handling
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
              studyTimeToday: data.websiteTime || 0
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

    // Listen for real-time assignment changes directly from Firebase
    let unsubscribeAssignments: (() => void) | undefined;
    
    // Set up assignment listeners asynchronously
    const setupAssignmentListeners = async () => {
      try {
        // Get user's chat IDs first
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const userChatIds = userData.chats || [];
          
          if (userChatIds.length > 0) {
            // Listen to each chat document for changes
            const unsubscribes: (() => void)[] = [];
            
            userChatIds.forEach((chatId: string) => {
              const chatDocRef = doc(db, 'chats', chatId);
              const unsubscribe = onSnapshot(chatDocRef, async (chatDoc) => {
                if (chatDoc.exists()) {
                  const chatData = chatDoc.data();
                  
                  // Recalculate ALL stats from ALL user chats when any chat changes
                  let totalCompleted = 0;
                  let upcomingCount = 0;
                  const now = new Date();
                  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                  
                  for (const id of userChatIds) {
                    try {
                      const chatRef = doc(db, 'chats', id);
                      const chatSnap = await getDoc(chatRef);
                      
                      if (chatSnap.exists()) {
                        const data = chatSnap.data();
                        if (data.chatType === 'class') {
                          // Count completed assignments
                          if (data.courseData?.assignments) {
                            data.courseData.assignments.forEach((assignment: any) => {
                              if (assignment.status === 'Completed') {
                                totalCompleted++;
                              }
                              // Count upcoming deadlines
                              if (assignment.dueDate && assignment.dueDate !== 'null' && assignment.status !== 'Completed') {
                                const dueDate = new Date(assignment.dueDate);
                                if (dueDate >= now && dueDate <= nextWeek) {
                                  upcomingCount++;
                                }
                              }
                            });
                          }
                          
                          // Count upcoming exams
                          if (data.courseData?.exams) {
                            data.courseData.exams.forEach((exam: any) => {
                              if (exam.date && exam.date !== 'null') {
                                const examDate = new Date(exam.date);
                                if (examDate >= now && examDate <= nextWeek) {
                                  upcomingCount++;
                                }
                              }
                            });
                          }
                        }
                      }
                    } catch (error) {
                      console.warn('Error reading chat:', id, error);
                    }
                  }
                  
                  setStats(prev => ({
                    ...prev,
                    assignmentsCompleted: totalCompleted,
                    upcomingDeadlines: upcomingCount
                  }));
                }
              }, (error) => {
                console.warn('Firebase offline, chat updates disabled:', error);
              });
              
              unsubscribes.push(unsubscribe);
            });
            
            unsubscribeAssignments = () => {
              unsubscribes.forEach(unsub => unsub());
            };
          }
        }
      } catch (error) {
        console.warn('Failed to set up assignment listener:', error);
      }
    };
    
    setupAssignmentListeners();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (unsubscribeAssignments) {
        unsubscribeAssignments();
      }
    };
  }, [user, chats]);

  // Separate useEffect for guest user real-time updates - updates when chats change
  useEffect(() => {
    if (user && user.isGuest) {
      loadGuestStats();
    }
  }, [chats, user]);

  return {
    stats,
    isLoading,
    error,
    updateWebsiteTime,
    trackWebsiteVisit,
    startStudySession,
    endStudySession,
    refreshStats: loadGuestStats // Expose refresh function for manual updates
  };
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useChatStore } from '@/hooks/use-chat-store';

interface GuestData {
  chatsCount: number;
  studyTime: number;
  assignmentsCompleted: number;
  streak: number;
}

export function useGuestRetention() {
  const [showRetentionPopup, setShowRetentionPopup] = useState(false);
  const [guestData, setGuestData] = useState<GuestData | null>(null);
  const { chats } = useChatStore();

  // Calculate guest user's progress
  const calculateGuestData = useCallback((): GuestData => {
    const chatsCount = Object.keys(chats).filter(key => key !== 'general-chat').length;
    
    // Calculate study time from localStorage
    const today = new Date().toDateString();
    const dayStats = localStorage.getItem(`guest-stats-${today}`);
    let studyTime = 0;
    if (dayStats) {
      try {
        const stats = JSON.parse(dayStats);
        studyTime = stats.websiteTime || 0;
      } catch (error) {
        console.warn('Error parsing guest stats:', error);
      }
    }

    // Calculate completed assignments
    let assignmentsCompleted = 0;
    Object.values(chats).forEach(chat => {
      if (chat.chatType === 'class' && chat.courseData?.assignments) {
        chat.courseData.assignments.forEach((assignment: any) => {
          if (assignment.status === 'Completed') {
            assignmentsCompleted++;
          }
        });
      }
    });

    // Calculate streak from localStorage
    let streak = 0;
    const streakData = localStorage.getItem('guest-streak');
    if (streakData) {
      try {
        streak = JSON.parse(streakData).currentStreak || 0;
      } catch (error) {
        console.warn('Error parsing guest streak:', error);
      }
    }

    return {
      chatsCount,
      studyTime,
      assignmentsCompleted,
      streak
    };
  }, [chats]);

  // Check if user has made significant progress
  const hasSignificantProgress = useCallback((data: GuestData): boolean => {
    return (
      data.chatsCount > 0 ||
      data.studyTime > 5 || // More than 5 minutes
      data.assignmentsCompleted > 0 ||
      data.streak > 0
    );
  }, []);

  // Set up beforeunload listener for guest users
  useEffect(() => {
    const guestUserData = localStorage.getItem('guestUser');
    if (!guestUserData) return; // Not a guest user

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const data = calculateGuestData();
      
      if (hasSignificantProgress(data)) {
        // Store the data for the popup
        setGuestData(data);
        
        // Show browser's native confirmation dialog
        event.preventDefault();
        event.returnValue = 'You have unsaved progress. Are you sure you want to leave?';
        return event.returnValue;
      }
    };

    // Add the event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [calculateGuestData, hasSignificantProgress]);

  // Show popup when user tries to navigate away (for SPA navigation)
  useEffect(() => {
    const guestUserData = localStorage.getItem('guestUser');
    if (!guestUserData) return;

    const handlePopState = () => {
      const data = calculateGuestData();
      if (hasSignificantProgress(data)) {
        setGuestData(data);
        setShowRetentionPopup(true);
      }
    };

    // Listen for browser back/forward buttons
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [calculateGuestData, hasSignificantProgress]);

  // Function to handle sign up
  const handleSignUp = useCallback(() => {
    // Store guest data for migration
    if (guestData) {
      localStorage.setItem('guest-data-for-migration', JSON.stringify(guestData));
    }
    
    // Clear the popup
    setShowRetentionPopup(false);
    setGuestData(null);
  }, [guestData]);

  // Function to close popup
  const handleClosePopup = useCallback(() => {
    setShowRetentionPopup(false);
    setGuestData(null);
  }, []);

  return {
    showRetentionPopup,
    guestData,
    handleSignUp,
    handleClosePopup,
    calculateGuestData
  };
}

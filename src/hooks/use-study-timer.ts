'use client';

import { useState, useEffect, useCallback } from 'react';

interface StudyTimerHook {
  studyTime: number; // in minutes
  isStudying: boolean;
  startStudying: () => void;
  stopStudying: () => void;
  resetTimer: () => void;
  shouldTakeBreak: boolean;
}

export function useStudyTimer(): StudyTimerHook {
  const [studyTime, setStudyTime] = useState(0);
  const [isStudying, setIsStudying] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Check for user activity
  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now());
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isStudying) {
      interval = setInterval(() => {
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivity;
        
        // Only count time if user has been active in the last 5 minutes
        if (timeSinceLastActivity < 5 * 60 * 1000) {
          setStudyTime(prev => prev + 1);
        }
      }, 60000); // Update every minute
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStudying, lastActivity]);

  const startStudying = useCallback(() => {
    setIsStudying(true);
    setLastActivity(Date.now());
  }, []);

  const stopStudying = useCallback(() => {
    setIsStudying(false);
  }, []);

  const resetTimer = useCallback(() => {
    setStudyTime(0);
    setIsStudying(false);
  }, []);

  // Should take break after 25 minutes (Pomodoro technique) or 2 hours
  const shouldTakeBreak = studyTime >= 25 && studyTime % 25 === 0;

  return {
    studyTime,
    isStudying,
    startStudying,
    stopStudying,
    resetTimer,
    shouldTakeBreak
  };
}

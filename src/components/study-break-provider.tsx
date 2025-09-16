'use client';

import { useState, useEffect } from 'react';
import { BreakReminder } from '@/components/break-reminder';
import { useStudyTimer } from '@/hooks/use-study-timer';

interface StudyBreakProviderProps {
  children: React.ReactNode;
}

export function StudyBreakProvider({ children }: StudyBreakProviderProps) {
  const { studyTime, shouldTakeBreak, startStudying, stopStudying } = useStudyTimer();
  const [showBreakReminder, setShowBreakReminder] = useState(false);
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [isDemoMode] = useState(true); // Demo mode - enable break system for demo
  const [demoBreakTriggered, setDemoBreakTriggered] = useState(false);

  // Auto-start studying when user is on the site
  useEffect(() => {
    if (!isDemoMode) {
      startStudying();
    }
  }, [startStudying, isDemoMode]);

  // Demo break trigger - show after 2 minutes for demo purposes
  useEffect(() => {
    if (isDemoMode && !demoBreakTriggered) {
      const timer = setTimeout(() => {
        setShowBreakReminder(true);
        setDemoBreakTriggered(true);
      }, 120000); // 2 minutes for demo
      return () => clearTimeout(timer);
    }
  }, [isDemoMode, demoBreakTriggered]);

  // Demo break trigger listener
  useEffect(() => {
    const handleDemoBreak = () => {
      setShowBreakReminder(true);
    };

    window.addEventListener('demo-break-trigger', handleDemoBreak);
    return () => window.removeEventListener('demo-break-trigger', handleDemoBreak);
  }, []);

  const handleBreakStart = () => {
    setIsBreakActive(true);
    setShowBreakReminder(false);
    stopStudying();
  };

  const handleBreakEnd = () => {
    setIsBreakActive(false);
    setShowBreakReminder(false);
    startStudying();
  };

  return (
    <>
      {children}
      <BreakReminder 
        isOpen={showBreakReminder}
        onClose={handleBreakStart}
        studyTime={studyTime}
      />
      {isBreakActive && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-background p-8 rounded-lg shadow-xl max-w-md mx-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Break Time!</h2>
            <p className="text-muted-foreground mb-6">
              The site is locked during your break. Take some time to rest and recharge.
            </p>
            <button 
              onClick={handleBreakEnd}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              End Break
            </button>
          </div>
        </div>
      )}
    </>
  );
}

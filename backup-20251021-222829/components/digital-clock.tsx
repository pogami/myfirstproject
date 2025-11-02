"use client";

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface DigitalClockProps {
  timestamp: number;
  className?: string;
}

export function DigitalClock({ timestamp, className = "" }: DigitalClockProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side rendered to prevent hydration mismatch
    setIsClient(true);
    
    // Get user's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Format the timestamp to user's local time
    const formatTime = () => {
      const date = new Date(timestamp);
      const timeString = date.toLocaleTimeString('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        timeZone: timezone
      });
      setCurrentTime(timeString);
    };

    formatTime();

    // Update every second for live clock effect
    const interval = setInterval(formatTime, 1000);

    return () => clearInterval(interval);
  }, [timestamp]);

  // Don't render anything on server-side to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className={`flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 ${className}`}>
        <Clock className="w-3 h-3" />
        <span className="font-mono">--:--:--</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 ${className}`}>
      <Clock className="w-3 h-3" />
      <span className="font-mono">{currentTime}</span>
    </div>
  );
}

"use client";

import { useState, useEffect } from 'react';

interface MessageTimestampProps {
  timestamp: number;
  className?: string;
}

export function MessageTimestamp({ timestamp, className = "" }: MessageTimestampProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Update time every second for real-time clock
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isClient) {
    return null;
  }

  const messageTime = new Date(timestamp);
  const now = currentTime;
  
  // Calculate time difference
  const diffInSeconds = Math.floor((now.getTime() - messageTime.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // Format time display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Determine what to show
  let timeDisplay: string;
  let isRealTime = false;

  if (diffInSeconds < 60) {
    timeDisplay = `${diffInSeconds}s ago`;
    isRealTime = true;
  } else if (diffInMinutes < 60) {
    timeDisplay = `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    timeDisplay = `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    timeDisplay = `${diffInDays}d ago`;
  } else {
    timeDisplay = formatDate(messageTime);
  }

  return (
    <div className={`flex items-center gap-1 text-sm text-muted-foreground/80 font-medium ${className}`}>
      <span className="font-mono">
        {isRealTime ? (
          <span className="text-green-500/90 animate-pulse font-semibold">
            {formatTime(messageTime)}
          </span>
        ) : (
          <span className="text-muted-foreground/70 font-medium">
            {timeDisplay}
          </span>
        )}
      </span>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

interface GeolocationGreetingProps {
  userName?: string;
  fallbackName?: string;
}

// More engaging, ChatGPT-style greetings based on time of day
const getEngagingGreeting = (timeGreeting: string, displayName: string): string => {
  const hour = new Date().getHours();
  const name = displayName === 'Guest' ? '' : ` ${displayName}`;
  
  // Morning (5 AM - 12 PM)
  if (hour >= 5 && hour < 12) {
    const morningGreetings = [
      `Good morning${name}! Ready to tackle today's studies?`,
      `Good morning${name}! What would you like to learn today?`,
      `Good morning${name}! How can I help you succeed today?`,
      `Good morning${name}! Let's make today productive.`,
      `Good morning${name}! What's on your study agenda?`,
    ];
    return morningGreetings[Math.floor(Math.random() * morningGreetings.length)];
  }
  
  // Afternoon (12 PM - 5 PM)
  if (hour >= 12 && hour < 17) {
    const afternoonGreetings = [
      `Good afternoon${name}! How can I help you learn?`,
      `Good afternoon${name}! What would you like to explore?`,
      `Good afternoon${name}! Ready to dive into your studies?`,
      `Good afternoon${name}! How can I assist you today?`,
      `Good afternoon${name}! What's on your mind?`,
    ];
    return afternoonGreetings[Math.floor(Math.random() * afternoonGreetings.length)];
  }
  
  // Evening (5 PM - 9 PM)
  if (hour >= 17 && hour < 21) {
    const eveningGreetings = [
      `Good evening${name}! How can I help you study?`,
      `Good evening${name}! What would you like to work on?`,
      `Good evening${name}! Ready to continue learning?`,
      `Good evening${name}! How can I assist you tonight?`,
      `Good evening${name}! What's your focus for this evening?`,
    ];
    return eveningGreetings[Math.floor(Math.random() * eveningGreetings.length)];
  }
  
  // Night (9 PM - 5 AM)
  const nightGreetings = [
    `Good evening${name}! Still studying? I'm here to help.`,
    `Good evening${name}! What would you like to learn?`,
    `Good evening${name}! How can I assist you?`,
    `Good evening${name}! Ready to continue?`,
    `Good evening${name}! What's on your mind?`,
  ];
  return nightGreetings[Math.floor(Math.random() * nightGreetings.length)];
};

export default function GeolocationGreeting({ 
  userName, 
  fallbackName = 'Guest' 
}: GeolocationGreetingProps) {
  const [greeting, setGreeting] = useState('Good morning');
  const [displayText, setDisplayText] = useState('Good morning! How can I help you today?');
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

  // Get user's current time based on their location
  const getCurrentTime = async (lat: number, lon: number) => {
    try {
      // Use a simple timezone offset calculation based on longitude
      // This is more reliable than external APIs
      const timezoneOffset = Math.round(lon / 15); // Approximate timezone offset
      const localTime = new Date();
      const utcTime = localTime.getTime() + (localTime.getTimezoneOffset() * 60000);
      const targetTime = new Date(utcTime + (timezoneOffset * 3600000));
      
      return targetTime;
    } catch (error) {
      console.warn('Error calculating timezone, using local time:', error);
      // Fallback to local time
      return new Date();
    }
  };

  // Determine greeting based on time
  const getGreeting = (currentTime: Date) => {
    const hour = currentTime.getHours();
    
    if (hour >= 5 && hour < 12) {
      return 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good Afternoon';
    } else if (hour >= 17 && hour < 21) {
      return 'Good Evening';
    } else {
      return 'Good Night';
    }
  };

  // Get user's geolocation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      // Fallback to local time
      const localTime = new Date();
      const timeBasedGreeting = getGreeting(localTime);
      setGreeting(timeBasedGreeting);
      const displayName = userName || fallbackName;
      setDisplayText(getEngagingGreeting(timeBasedGreeting, displayName));
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lon: longitude });
        
        try {
          const currentTime = await getCurrentTime(latitude, longitude);
          const timeBasedGreeting = getGreeting(currentTime);
          setGreeting(timeBasedGreeting);
          const displayName = userName || fallbackName;
          setDisplayText(getEngagingGreeting(timeBasedGreeting, displayName));
        } catch (error) {
          console.warn('Error getting time-based greeting, using local time:', error);
          // Fallback to local time
          const localTime = new Date();
          const timeBasedGreeting = getGreeting(localTime);
          setGreeting(timeBasedGreeting);
          const displayName = userName || fallbackName;
          setDisplayText(getEngagingGreeting(timeBasedGreeting, displayName));
        }
        
        setIsLoading(false);
      },
      (error) => {
        console.warn('Error getting location, using local time:', error);
        // Fallback to local time if geolocation fails
        const localTime = new Date();
        const timeBasedGreeting = getGreeting(localTime);
        setGreeting(timeBasedGreeting);
        const displayName = userName || fallbackName;
        setDisplayText(getEngagingGreeting(timeBasedGreeting, displayName));
        setIsLoading(false);
      },
      {
        enableHighAccuracy: false, // Reduce accuracy requirements
        timeout: 5000, // Shorter timeout
        maximumAge: 600000 // 10 minutes
      }
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Update display text when userName changes
  useEffect(() => {
    if (!isLoading) {
      const displayName = userName || fallbackName;
      setDisplayText(getEngagingGreeting(greeting, displayName));
    }
  }, [userName, fallbackName, greeting, isLoading]);

  return (
    <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight mb-1 sm:mb-2 leading-tight text-gray-900 dark:text-white">
      {displayText}
    </h1>
  );
}

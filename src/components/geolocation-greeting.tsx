'use client';

import { useState, useEffect } from 'react';

interface GeolocationGreetingProps {
  userName?: string;
  fallbackName?: string;
}

export default function GeolocationGreeting({ 
  userName, 
  fallbackName = 'Guest' 
}: GeolocationGreetingProps) {
  const [greeting, setGreeting] = useState('Welcome back');
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
        } catch (error) {
          console.warn('Error getting time-based greeting, using local time:', error);
          // Fallback to local time
          const localTime = new Date();
          const timeBasedGreeting = getGreeting(localTime);
          setGreeting(timeBasedGreeting);
        }
        
        setIsLoading(false);
      },
      (error) => {
        console.warn('Error getting location, using local time:', error);
        // Fallback to local time if geolocation fails
        const localTime = new Date();
        const timeBasedGreeting = getGreeting(localTime);
        setGreeting(timeBasedGreeting);
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

  const displayName = userName || fallbackName;

  if (isLoading) {
    return (
      <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight mb-1 sm:mb-2 leading-tight">
        Welcome back, {displayName}!
      </h1>
    );
  }

  return (
    <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight mb-1 sm:mb-2 leading-tight">
      {greeting}, {displayName}!
    </h1>
  );
}

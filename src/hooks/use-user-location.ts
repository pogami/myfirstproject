/**
 * React hook for getting user's location and timezone
 */

import { useState, useEffect } from 'react';

interface UserLocation {
  timezone: string;
  city: string;
  country: string;
  currentTime: string;
  isLoading: boolean;
  error: string | null;
}

export function useUserLocation(): UserLocation {
  const [location, setLocation] = useState<UserLocation>({
    timezone: 'UTC',
    city: 'Unknown',
    country: 'Unknown',
    currentTime: new Date().toLocaleTimeString(),
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const getLocation = async () => {
      try {
        // Get timezone from Intl API
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Get current time in user's timezone
        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-US', {
          timeZone: timezone,
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        // Try to get city and country from timezone
        const parts = timezone.split('/');
        const city = parts[parts.length - 1] || 'Unknown'; // Get the last part (city name)
        const country = parts[0] || 'Unknown';
        
        setLocation({
          timezone,
          city: city.replace(/_/g, ' '), // Replace underscores with spaces
          country: country.replace(/_/g, ' '),
          currentTime,
          isLoading: false,
          error: null
        });

        // Update time every second
        const interval = setInterval(() => {
          const newTime = new Date().toLocaleTimeString('en-US', {
            timeZone: timezone,
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
          
          setLocation(prev => ({
            ...prev,
            currentTime: newTime
          }));
        }, 1000);

        return () => clearInterval(interval);
      } catch (error) {
        console.error('Failed to get user location:', error);
        setLocation(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to get location'
        }));
      }
    };

    getLocation();
  }, []);

  return location;
}

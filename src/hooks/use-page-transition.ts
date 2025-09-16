"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    // Reset transition state when pathname changes
    setIsTransitioning(false);
    setProgress(0);
  }, [pathname]);

  const startTransition = () => {
    setIsTransitioning(true);
    setProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90; // Don't complete until page loads
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    return () => clearInterval(interval);
  };

  const completeTransition = () => {
    setProgress(100);
    setTimeout(() => {
      setIsTransitioning(false);
      setProgress(0);
    }, 200);
  };

  return {
    isTransitioning,
    progress,
    startTransition,
    completeTransition
  };
}

"use client";

import { useEffect } from 'react';
import { usePageTransition } from '@/hooks/use-page-transition';

export function PageTransitionBar() {
  const { isTransitioning, progress, completeTransition } = usePageTransition();

  useEffect(() => {
    if (isTransitioning) {
      // Complete transition after a short delay
      const timer = setTimeout(completeTransition, 800);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, completeTransition]);

  if (!isTransitioning) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-background/20 backdrop-blur-sm">
      <div 
        className="h-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 transition-all duration-500 ease-out shadow-lg"
        style={{ width: `${progress}%` }}
      />
      {/* Animated shimmer effect */}
      <div 
        className="absolute top-0 h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"
        style={{ 
          left: `${Math.max(0, progress - 20)}%`,
          animationDuration: '1.5s'
        }}
      />
    </div>
  );
}

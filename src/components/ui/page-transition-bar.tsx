"use client";

import { useEffect } from 'react';
import { usePageTransition } from '@/hooks/use-page-transition';

export function PageTransitionBar() {
  const { isTransitioning, progress, completeTransition } = usePageTransition();

  useEffect(() => {
    if (isTransitioning) {
      // Complete transition after a short delay
      const timer = setTimeout(completeTransition, 500);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, completeTransition]);

  if (!isTransitioning) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-background">
      <div 
        className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

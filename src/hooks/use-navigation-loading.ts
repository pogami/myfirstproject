"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useNavigationLoading() {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Reset loading state when pathname changes
    setIsNavigating(false);
  }, [pathname]);

  const startNavigation = () => {
    setIsNavigating(true);
  };

  return {
    isNavigating,
    startNavigation
  };
}

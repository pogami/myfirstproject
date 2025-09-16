
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    // Add a small delay to ensure proper hydration
    const timer = setTimeout(() => {
      router.push('/home');
      setIsRedirecting(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  if (!isRedirecting) {
    return null;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted border-t-primary mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">CourseConnect</h1>
        <p className="text-muted-foreground">Loading your workspace...</p>
      </div>
    </div>
  );
}

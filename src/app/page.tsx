
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";

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

  return <PageLoadingSpinner />;
}

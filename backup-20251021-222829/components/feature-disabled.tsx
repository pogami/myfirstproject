import React from 'react';
import { AlertCircle, Wrench } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface FeatureDisabledProps {
  featureName: string;
  inline?: boolean;
}

export function FeatureDisabled({ featureName, inline = false }: FeatureDisabledProps) {
  if (inline) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm">
        <Wrench className="w-4 h-4" />
        <span className="font-medium">{featureName} temporarily unavailable</span>
      </div>
    );
  }

  return (
    <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
      <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-900 dark:text-amber-300 font-semibold">
        Feature Temporarily Unavailable
      </AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-400">
        <span className="font-semibold">{featureName}</span> is currently disabled for maintenance. 
        We'll have it back up soon. Thank you for your patience!
      </AlertDescription>
    </Alert>
  );
}


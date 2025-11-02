"use client";

import React from 'react';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JoinMessageProps {
  message: {
    text: string;
    timestamp: number;
    userId?: string;
  };
  className?: string;
}

export function JoinMessage({ message, className }: JoinMessageProps) {
  return (
    <div className={cn("flex items-center justify-center py-2", className)}>
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm">
        <Users className="h-3 w-3" />
        <span className="font-medium">{message.text}</span>
      </div>
    </div>
  );
}

import React from 'react';
import { Bot } from 'lucide-react';

interface GradientStarProps {
  className?: string;
  size?: number;
}

export function GradientStar({ className = "", size = 24 }: GradientStarProps) {
  return <Bot className={className} size={size} />;
}

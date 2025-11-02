'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function TypewriterText({ 
  text, 
  className = "",
  delay = 0
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Typewriter effect
  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsTyping(true);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!isTyping) return;
    
    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText(text.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      } else {
        setIsTyping(false);
      }
    }, 80);

    return () => clearTimeout(timer);
  }, [currentIndex, text, isTyping]);

  return (
    <span className={className}>
      {displayText}
      {/* Typewriter cursor */}
      {isTyping && (
        <motion.span
          className="inline-block w-0.5 h-6 bg-current ml-1"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </span>
  );
}

// Simple static text component
export function StaticText({ text, className }: { text: string; className?: string }) {
  return <span className={className}>{text}</span>;
}

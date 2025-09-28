'use client';

import React, { useState, useEffect } from 'react';

interface StretchingTextProps {
  text: string;
  className?: string;
  interval?: number;
  stretchDuration?: number;
}

export function StretchingText({ 
  text, 
  className = "",
  interval = 2000,
  stretchDuration = 800
}: StretchingTextProps) {
  const [stretchingLetters, setStretchingLetters] = useState<number[]>([]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Get all letter positions that can stretch (excluding spaces)
      const letterPositions = text.split('').map((_, index) => index).filter(index => text[index] !== ' ');
      
      // Randomly select 2 letters to stretch
      const shuffled = [...letterPositions].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 2);
      
      setStretchingLetters(selected);
      
      // Reset after animation duration
      setTimeout(() => {
        setStretchingLetters([]);
      }, stretchDuration);
    }, interval);

    return () => clearInterval(intervalId);
  }, [text, interval, stretchDuration]);

  return (
    <span className={className}>
      {text.split('').map((letter, index) => {
        const isStretching = stretchingLetters.includes(index);
        const isSpace = letter === ' ';
        
        return (
          <span
            key={index}
            className={`
              inline-block transition-all duration-300 ease-in-out
              ${isStretching ? 'transform scale-x-150 scale-y-110' : 'transform scale-100'}
              ${isSpace ? 'w-2' : ''}
            `}
            style={{
              transformOrigin: 'center',
              transition: 'transform 0.3s ease-in-out',
            }}
          >
            {letter}
          </span>
        );
      })}
    </span>
  );
}

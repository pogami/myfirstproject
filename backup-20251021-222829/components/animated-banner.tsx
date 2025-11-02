'use client';

import React, { useState, useEffect } from 'react';

interface AnimatedBannerProps {
  text?: string;
  className?: string;
}

export function AnimatedBanner({ 
  text = "LEARNING SOON", 
  className = "" 
}: AnimatedBannerProps) {
  const [stretchingLetters, setStretchingLetters] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Get all letter positions that can stretch (excluding spaces)
      const letterPositions = text.split('').map((_, index) => index).filter(index => text[index] !== ' ');
      
      // Randomly select 2 letters to stretch
      const shuffled = [...letterPositions].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 2);
      
      setStretchingLetters(selected);
      
      // Reset after animation duration
      setTimeout(() => {
        setStretchingLetters([]);
      }, 800);
    }, 2000);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className={`relative flex items-center justify-center min-h-[120px] bg-black text-white ${className}`}>
      <div className="flex items-center justify-center space-x-1 sm:space-x-2">
        {text.split('').map((letter, index) => {
          const isStretching = stretchingLetters.includes(index);
          const isSpace = letter === ' ';
          
          return (
            <span
              key={index}
              className={`
                inline-block font-bold text-4xl sm:text-5xl lg:text-6xl uppercase tracking-wider
                transition-all duration-300 ease-in-out
                ${isStretching ? 'transform scale-x-150 scale-y-110' : 'transform scale-100'}
                ${isSpace ? 'w-4 sm:w-6 lg:w-8' : ''}
              `}
              style={{
                transformOrigin: 'center',
                transition: 'transform 0.3s ease-in-out',
              }}
            >
              {letter === 'O' ? (
                <span className="inline-block w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white rounded-lg"></span>
              ) : (
                letter
              )}
            </span>
          );
        })}
      </div>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
      
      {/* Debug indicator */}
      <div className="absolute top-2 right-2 text-xs text-white/50">
        Banner Active
      </div>
    </div>
  );
}

// Alternative version with more education-focused text options
export function EducationBanner({ 
  variant = "learning",
  className = "" 
}: { 
  variant?: "learning" | "studying" | "growing" | "excelling";
  className?: string;
}) {
  const textOptions = {
    learning: "LEARNING SOON",
    studying: "STUDYING SOON", 
    growing: "GROWING SOON",
    excelling: "EXCELLING SOON"
  };

  return (
    <AnimatedBanner 
      text={textOptions[variant]} 
      className={className}
    />
  );
}

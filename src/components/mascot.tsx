"use client";

import { useEffect, useState } from "react";
import { Sparkles, BookOpen, GraduationCap } from "lucide-react";

interface MascotProps {
  className?: string;
}

export function Mascot({ className = "" }: MascotProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    // Show mascot after a short delay
    const showTimer = setTimeout(() => setIsVisible(true), 1000);
    
    // Start bouncing animation
    const bounceTimer = setTimeout(() => setBounce(true), 2000);
    
    return () => {
      clearTimeout(showTimer);
      clearTimeout(bounceTimer);
    };
  }, []);

  return (
    <div className={`fixed bottom-8 right-8 z-50 ${className}`}>
      {/* Floating Sparkles */}
      <div className="absolute -top-4 -left-4">
        <Sparkles 
          className={`w-6 h-6 text-yellow-400 animate-pulse transition-all duration-1000 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
          style={{ animationDelay: '0.5s' }}
        />
      </div>
      
      <div className="absolute -top-2 -right-6">
        <Sparkles 
          className={`w-4 h-4 text-blue-400 animate-pulse transition-all duration-1000 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
          style={{ animationDelay: '1s' }}
        />
      </div>

      {/* Main Mascot */}
      <div 
        className={`relative transition-all duration-1000 ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-4'
        }`}
      >
        {/* Mascot Body */}
        <div 
          className={`relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-2xl border-4 border-white/20 backdrop-blur-sm ${
            bounce ? 'animate-bounce' : ''
          }`}
          style={{ animationDuration: '2s' }}
        >
          {/* Eyes */}
          <div className="absolute top-4 left-3 w-3 h-3 bg-white rounded-full"></div>
          <div className="absolute top-4 right-3 w-3 h-3 bg-white rounded-full"></div>
          <div className="absolute top-5 left-4 w-1.5 h-1.5 bg-black rounded-full"></div>
          <div className="absolute top-5 right-4 w-1.5 h-1.5 bg-black rounded-full"></div>
          
          {/* Smile */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-8 h-4 border-2 border-white rounded-full border-t-transparent"></div>
          
          {/* Graduation Cap */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <GraduationCap className="w-8 h-8 text-yellow-400" />
          </div>
          
          {/* Book Icon */}
          <div className="absolute -bottom-1 -right-1">
            <BookOpen className="w-6 h-6 text-white/80" />
          </div>
        </div>

        {/* Speech Bubble */}
        <div 
          className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 transition-all duration-1000 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
          style={{ animationDelay: '1.5s' }}
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg border border-primary/20">
            <p className="text-sm font-medium text-gray-800 whitespace-nowrap">
              Upload your syllabus! 📚
            </p>
            {/* Speech bubble tail */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/95"></div>
          </div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 bg-primary/60 rounded-full animate-ping ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                top: `${20 + (i * 10)}%`,
                left: `${15 + (i * 12)}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

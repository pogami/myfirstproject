'use client';

import React from 'react';

interface PillElementProps {
  className?: string;
  children?: React.ReactNode;
}

const PillElement: React.FC<PillElementProps> = ({ className = '', children }) => (
  <div className={`absolute rounded-full backdrop-blur-xl ${className}`}>
    {children}
  </div>
);

export const GlassmorphismBackground: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden">
      {/* Large Blue Pill - Top Left */}
      <PillElement className="top-1/4 left-1/4 w-64 h-24 bg-blue-500/20 shadow-lg shadow-blue-500/30 transform -rotate-12" />
      
      {/* Large Red Pill - Bottom Right */}
      <PillElement className="bottom-1/3 right-1/4 w-80 h-32 bg-red-500/20 shadow-lg shadow-red-500/30 transform rotate-45" />
      
      {/* Medium Purple Pill - Center */}
      <PillElement className="top-1/2 left-1/2 w-48 h-16 bg-purple-500/20 shadow-md shadow-purple-500/20 transform translate-x-[-50%] translate-y-[-50%] rotate-24" />
      
      {/* Small Blue Pill - Top Right */}
      <PillElement className="top-1/6 right-1/6 w-32 h-12 bg-blue-400/15 shadow-sm shadow-blue-400/20 transform rotate-12" />
      
      {/* Medium Red Pill - Bottom Left */}
      <PillElement className="bottom-1/4 left-1/6 w-56 h-20 bg-red-400/15 shadow-md shadow-red-400/25 transform -rotate-30" />
      
      {/* Small Purple Pill - Center Left */}
      <PillElement className="top-1/3 left-1/12 w-40 h-14 bg-purple-400/15 shadow-sm shadow-purple-400/20 transform rotate-60" />
      
      {/* Large Blue Pill - Bottom Center */}
      <PillElement className="bottom-1/6 left-1/2 w-72 h-28 bg-blue-600/20 shadow-lg shadow-blue-600/30 transform -translate-x-1/2 rotate-15" />
      
      {/* Medium Red Pill - Top Center */}
      <PillElement className="top-1/12 left-1/2 w-48 h-18 bg-red-600/20 shadow-md shadow-red-600/25 transform -translate-x-1/2 -rotate-20" />
      
      {/* Small Purple Pill - Right Center */}
      <PillElement className="top-1/2 right-1/12 w-36 h-12 bg-purple-600/15 shadow-sm shadow-purple-600/20 transform translate-y-[-50%] rotate-45" />
      
      {/* Extra Large Pill - Far Right */}
      <PillElement className="top-1/3 right-0 w-96 h-40 bg-gradient-to-r from-blue-500/10 to-purple-500/10 shadow-xl shadow-blue-500/20 transform rotate-30" />
      
      {/* Extra Large Pill - Far Left */}
      <PillElement className="bottom-1/3 left-0 w-88 h-36 bg-gradient-to-r from-red-500/10 to-blue-500/10 shadow-xl shadow-red-500/20 transform -rotate-25" />
    </div>
  );
};

export default GlassmorphismBackground;

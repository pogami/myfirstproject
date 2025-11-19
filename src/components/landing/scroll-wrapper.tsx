'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ScrollWrapperProps {
  children: React.ReactNode;
}

export function ScrollWrapper({ children }: ScrollWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Background color transitions as you scroll deeper
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    [
      'rgb(255, 255, 255)', // White at top
      'rgb(249, 250, 251)', // Light gray
      'rgb(243, 244, 246)', // Gray
      'rgb(229, 231, 235)', // Darker gray
      'rgb(17, 24, 39)', // Dark
      'rgb(3, 7, 18)', // Very dark (diving deeper)
    ]
  );

  const darkBackgroundColor = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    [
      'rgb(3, 7, 18)', // Dark at top
      'rgb(15, 23, 42)', // Slightly lighter
      'rgb(30, 41, 59)', // Lighter
      'rgb(51, 65, 85)', // Even lighter
      'rgb(71, 85, 105)', // Light
      'rgb(100, 116, 139)', // Very light (diving deeper)
    ]
  );

  return (
    <div ref={containerRef} className="relative">
      <motion.div
        className="fixed inset-0 -z-10"
        style={{
          backgroundColor: darkBackgroundColor,
        }}
      />
      <motion.div
        className="fixed inset-0 -z-10 dark:hidden"
        style={{
          backgroundColor: backgroundColor,
        }}
      />
      {children}
    </div>
  );
}


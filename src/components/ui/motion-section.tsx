'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MotionSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

// A reusable viewport-aware fade + slide section to match home animations
export function MotionSection({ children, className = '', delay = 0 }: MotionSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

interface MotionHeadlineProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function MotionHeadline({ children, delay = 0.1, className = '' }: MotionHeadlineProps) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.h2>
  );
}

export function MotionCard({ children, className = '', delay = 0 }: MotionSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 16 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}




import React from 'react';
import { motion } from 'framer-motion';

interface CleanThinkingAnimationProps {
  isVisible: boolean;
  className?: string;
}

export function CleanThinkingAnimation({ isVisible, className = "" }: CleanThinkingAnimationProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      className={`flex items-center gap-3 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {/* Clean Spinner */}
      <div className="relative w-4 h-4">
        <motion.div
          className="absolute inset-0 border-2 border-primary/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 border-2 border-transparent border-t-primary rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      {/* Status Text */}
      <span className="text-sm text-muted-foreground font-medium">
        CourseConnect AI is thinking...
      </span>
    </motion.div>
  );
}

interface SimpleResponseAnimationProps {
  isVisible: boolean;
  className?: string;
}

export function SimpleResponseAnimation({ isVisible, className = "" }: SimpleResponseAnimationProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      className={`flex items-center gap-2 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {/* Simple Dot Animation */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-primary rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      {/* Status Text */}
      <span className="text-sm text-muted-foreground">
        Responding...
      </span>
    </motion.div>
  );
}

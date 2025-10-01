"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  users: Array<{
    userId: string;
    userName: string;
  }>;
  className?: string;
}

export function TypingIndicator({ users, className = "" }: TypingIndicatorProps) {
  if (users.length === 0) return null;
  
  // Debug log for typing users
  console.log('TypingIndicator rendering users:', users.map(u => ({ 
    userId: u.userId, 
    userName: u.userName
  })));

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].userName} is typing...`;
    } else if (users.length === 2) {
      return `${users[0].userName} and ${users[1].userName} are typing...`;
    } else if (users.length === 3) {
      return `${users[0].userName}, ${users[1].userName}, and ${users[2].userName} are typing...`;
    } else {
      const firstThree = users.slice(0, 3).map(u => u.userName).join(', ');
      return `${firstThree}, and ${users.length - 3} others are typing...`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex items-center gap-2 text-xs ${className}`}
    >
      {/* Compact typing dots */}
      <div className="flex items-center gap-1">
        <motion.div
          className="w-1.5 h-1.5 bg-primary/60 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.4, 1, 0.4]
          }}
          transition={{ 
            duration: 1.2, 
            repeat: Infinity, 
            delay: 0,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="w-1.5 h-1.5 bg-primary/60 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.4, 1, 0.4]
          }}
          transition={{ 
            duration: 1.2, 
            repeat: Infinity, 
            delay: 0.2,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="w-1.5 h-1.5 bg-primary/60 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.4, 1, 0.4]
          }}
          transition={{ 
            duration: 1.2, 
            repeat: Infinity, 
            delay: 0.4,
            ease: "easeInOut"
          }}
        />
      </div>
      
      <span className="text-muted-foreground font-medium">
        {getTypingText()}
      </span>
    </motion.div>
  );
}

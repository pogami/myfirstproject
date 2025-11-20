"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles, Brain, Zap } from 'lucide-react';

// ============================================================================
// VARIANT 1: THE NEURAL ORB (Gemini/Siri style)
// Best for: Major AI processing, voice mode, or full-screen waiting
// ============================================================================
export const NeuralOrb = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative flex items-center justify-center w-24 h-24", className)}>
      {/* Core Core */}
      <motion.div
        className="absolute w-12 h-12 bg-white dark:bg-white rounded-full blur-md z-20"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Inner Blue Glow */}
      <motion.div
        className="absolute w-16 h-16 bg-blue-500 rounded-full blur-xl z-10 opacity-60"
        animate={{
          scale: [1, 1.2, 0.9, 1],
          rotate: [0, 90, 180, 360],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Outer Purple Nebula */}
      <motion.div
        className="absolute w-20 h-20 bg-purple-600 rounded-full blur-2xl z-0 opacity-40"
        animate={{
          scale: [1.2, 1, 1.3, 1.2],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Orbiting Particle */}
      <motion.div
        className="absolute w-full h-full z-30"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-2 h-2 bg-cyan-300 rounded-full absolute top-0 left-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(103,232,249,1)]" />
      </motion.div>
    </div>
  );
};

// ============================================================================
// VARIANT 2: THE LOGO BREATH (ChatGPT style)
// Best for: Inline responses, header status
// ============================================================================
export const LogoBreath = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative flex items-center justify-center w-12 h-12", className)}>
      <motion.div
        className="absolute inset-0 bg-primary/20 rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="relative z-10 bg-primary text-primary-foreground p-2 rounded-lg shadow-lg"
        animate={{
          y: [0, -2, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Brain className="w-5 h-5" />
      </motion.div>
    </div>
  );
};

// ============================================================================
// VARIANT 3: HARMONIC WAVE (Voice/Audio style)
// Best for: Voice input processing
// ============================================================================
export const HarmonicWave = () => {
  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="w-1 bg-primary rounded-full"
          animate={{
            height: ["20%", "80%", "20%"],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1,
          }}
          style={{ height: "40%" }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// VARIANT 4: CLAUDE DOTS (Minimalist)
// Best for: Text streaming wait time
// ============================================================================
export const ClaudeDots = () => {
  return (
    <div className="flex items-center gap-1 px-3 py-2 rounded-full bg-muted/50 w-fit">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-foreground/60 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// VARIANT 5: THE SEARCHING RING (Perplexity style)
// Best for: Web search or "Deep Research" steps
// ============================================================================
export const SearchingRing = () => {
  return (
    <div className="relative w-8 h-8">
      <motion.span
        className="absolute inset-0 border-2 border-primary/30 rounded-full"
      />
      <motion.span
        className="absolute inset-0 border-t-2 border-primary rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};

// ============================================================================
// VARIANT 6: DATA FLOW (Streaming/Processing)
// Best for: Data ingestion, parsing files, or server communication
// ============================================================================
export const DataFlow = () => {
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="relative w-3 h-3">
          <div className="absolute inset-0 bg-primary/20 rounded-sm transform rotate-45" />
          <motion.div
            className="absolute inset-0 bg-primary rounded-sm transform rotate-45"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
              x: [0, 10, 20]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "linear"
            }}
          />
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// VARIANT 7: THINKING GRID (Neural Network)
// Best for: Complex reasoning or connecting concepts
// ============================================================================
export const ThinkingGrid = () => {
  const dots = Array.from({ length: 9 });
  return (
    <div className="grid grid-cols-3 gap-2 p-2">
      {dots.map((_, i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-primary rounded-full"
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// VARIANT 8: PULSE RING (Notification/Alert)
// Best for: Attention grabber or success state
// ============================================================================
export const PulseRing = () => {
  return (
    <div className="relative flex items-center justify-center w-16 h-16">
      <div className="w-4 h-4 bg-primary rounded-full z-10" />
      <motion.div
        className="absolute inset-0 border-2 border-primary rounded-full"
        animate={{
          scale: [0.5, 1.5],
          opacity: [1, 0]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeOut"
        }}
      />
       <motion.div
        className="absolute inset-0 border-2 border-primary/50 rounded-full"
        animate={{
          scale: [0.5, 1.5],
          opacity: [1, 0]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: 0.5,
          ease: "easeOut"
        }}
      />
    </div>
  );
};

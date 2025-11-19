'use client';

import React from 'react';
import { motion } from 'framer-motion';

const scenarios = [
  "Stacked finals week", 
  "Prof who changes the schedule every Sunday",
  "Group project with ghost partners",
  "Two labs + calc + writing seminar",
  "Commuter schedule with night classes",
  "Transfer eval limbo",
  "18 credit overload",
  "Organic chem + bio lab combo",
  "Studio critique deadlines",
  "Honors thesis sprint",
  "Exam on same day as presentation",
  "Midterm moved up a week",
  "Lectures recorded late",
  "Weekly Canvas surprise",
  "Advisor ghosted me"
];

export function SocialProofSection() {
  return (
    <section className="py-10 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4 mb-6 text-center">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          Built for the chaos students actually deal with
        </p>
      </div>
      
      <div className="relative flex overflow-x-hidden group">
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10" />

        <motion.div 
          className="flex gap-12 md:gap-24 whitespace-nowrap py-2"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ 
            repeat: Infinity, 
            duration: 30, 
            ease: "linear" 
          }}
        >
          {/* Repeat the list twice to create seamless loop */}
          {[...scenarios, ...scenarios].map((item, idx) => (
            <span 
              key={idx} 
              className="text-base md:text-lg font-semibold text-gray-400 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-500 transition-colors cursor-default"
            >
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

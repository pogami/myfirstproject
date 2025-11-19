'use client';

import React from 'react';
import { motion } from 'framer-motion';

const scenarios = [
  "Stacked finals week",
  "Prof who changes the schedule every Sunday",
  "Group project with ghost partners",
  "18-credit semesters",
  "Thesis deadlines",
  "Dual majors",
  "Night classes",
  "Organic Chem labs",
];

export function SocialProofSection() {
  return (
    <section className="py-16 border-y border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white dark:from-gray-950 to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white dark:from-gray-950 to-transparent z-10" />
      
      <div className="container mx-auto px-4 mb-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest"
        >
          Built for the chaos students actually deal with
        </motion.p>
      </div>
      
      <motion.div 
        className="flex gap-12 md:gap-16 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ 
          repeat: Infinity, 
          duration: 15, 
          ease: "linear" 
        }}
      >
        {[...scenarios, ...scenarios].map((item, idx) => (
          <span 
            key={idx} 
            className="text-lg md:text-xl font-semibold text-gray-300 dark:text-gray-700 hover:text-gray-400 dark:hover:text-gray-600 transition-colors cursor-default"
          >
            {item}
          </span>
        ))}
      </motion.div>
    </section>
  );
}


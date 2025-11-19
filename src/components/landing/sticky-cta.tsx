'use client';

import React, { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Upload } from 'lucide-react';
import Link from 'next/link';

export function StickyCTA() {
  const { scrollY } = useScroll();
  const [isVisible, setIsVisible] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsVisible(latest > 400);
  });

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ 
        y: isVisible ? 0 : 100, 
        opacity: isVisible ? 1 : 0 
      }}
      transition={{ 
        duration: 0.4, 
        ease: [0.16, 1, 0.3, 1],
        opacity: { duration: 0.3 }
      }}
      className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none"
    >
      <div className="max-w-6xl mx-auto pointer-events-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ 
            scale: isVisible ? 1 : 0.95,
            opacity: isVisible ? 1 : 0 
          }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="relative group"
        >
          {/* Gradient glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-2xl p-6 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-gray-900 dark:text-white mb-1">
                  Ready to get organized?
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload your syllabus and see every deadline in one place
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="lg"
                  asChild
                  className="h-11 px-6 text-base font-semibold rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 whitespace-nowrap"
                >
                  <Link href="/dashboard/upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Syllabus
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-11 px-6 text-base font-semibold rounded-full border-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 transition-all duration-300 hover:scale-105 whitespace-nowrap"
                >
                  <Link href="/signup">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

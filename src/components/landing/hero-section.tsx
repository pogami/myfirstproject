'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles, Lock, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { TypewriterText } from '@/components/saas-typography';
import InteractiveSyllabusDemo from '@/components/interactive-syllabus-demo';

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-900">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-400/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-pink-400/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] dark:opacity-[0.05]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center max-w-5xl mx-auto">

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-[1.1]"
          >
            School is hard. <br className="hidden md:block" />
            <span className="relative inline-block">
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-2xl opacity-30"></span>
              <span className="relative bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                We make it easy.
              </span>
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            The all-in-one AI study companion that turns your syllabus into personalized tutoring, schedule tracking, and instant grades.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24"
          >
            <Button
              size="lg"
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 px-8 py-6 text-lg font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 min-w-[200px]"
              onClick={() => window.location.href = '/login?state=signup'}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-gray-200 dark:border-gray-700 px-8 py-6 text-lg font-bold rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-105 transition-all duration-300 min-w-[200px] backdrop-blur-sm bg-white/50 dark:bg-gray-900/50"
              onClick={() => document.getElementById('live-demo')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Play className="mr-2 h-5 w-5 fill-current" />
              Try Here
            </Button>
          </motion.div>
        </div>

        {/* Interactive Syllabus Demo Section - Floating Card Effect */}
        <motion.div
          id="live-demo"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto max-w-5xl"
        >
          {/* Glow effect behind the card */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 blur-3xl rounded-[3rem]"></div>

          <div className="relative bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-2 md:p-4 bg-gray-50/30 dark:bg-gray-900/30">
              <InteractiveSyllabusDemo />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

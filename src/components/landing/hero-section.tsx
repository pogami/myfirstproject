'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { TypewriterText, StaticText } from '@/components/saas-typography';
import InteractiveSyllabusDemo from '@/components/interactive-syllabus-demo';
import LiveActivityPill from '@/components/live-activity-pill';

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Background Visual Layer (image fallback) */}
      <div
        className="absolute inset-0 pointer-events-none select-none opacity-20 dark:opacity-25 bg-center bg-cover"
        style={{ backgroundImage: "url('/screenshots/desktop-dashboard.png')" }}
      />
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          {/* Live Activity Pill */}
          <LiveActivityPill />

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6"
          >
            <StaticText 
              text="Connect with " 
              className="text-gray-900 dark:text-white"
            />
            <TypewriterText 
              text="Classmates" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              delay={500}
            />
            <br />
            <StaticText 
              text="Get " 
              className="text-gray-900 dark:text-white"
            />
            <TypewriterText 
              text="AI Tutoring" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
              delay={2000}
            />
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Upload your syllabus, find classmates taking the same course, and get instant AI help with homework, assignments, and exam prep.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 mobile-stack"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto mobile-button mobile-full-width"
              onClick={() => window.location.href = '/login'}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 text-lg font-semibold rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 w-full sm:w-auto mobile-button mobile-full-width"
              onClick={() => document.getElementById('live-demo')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Play className="mr-2 h-5 w-5" />
              Try Demo
            </Button>
          </motion.div>

          {/* Logo strip removed */}

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                2,500+
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Active Students
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                150+
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Universities
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                87%
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Satisfaction Rate
              </div>
            </div>
          </motion.div>
        </div>

        {/* Live demo teaser removed */}

        {/* Interactive Syllabus Demo Section */}
        <motion.div
          id="live-demo"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 relative"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Try CourseConnect AI Right Now
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Upload your syllabus to see how AI extracts professor info, exam dates, topics, and assignments. 
              No signup required for the demo!
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <InteractiveSyllabusDemo />
          </div>
        </motion.div>
      </div>

    </div>
  );
}

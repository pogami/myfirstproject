'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Target, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { UploadDemo, FocusDemo, ScheduleDemo } from './feature-demos';

export function ModernFeaturesShowcase() {
  return (
    <section className="py-20 lg:py-32 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-wide">
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mt-3 mb-4">
              From Syllabus to Success in{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                10 Seconds
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Upload once. Get personalized AI tutoring that knows your entire course.
            </p>
          </motion.div>
        </div>

        {/* 3-Card Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {/* Card 1: Upload Syllabus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group relative"
          >
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 rounded-3xl p-8 h-full border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-2xl flex flex-col">
              {/* Visual Icon Substitute */}
              <div className="mb-6 h-12 w-12 relative">
                 <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-xl transform rotate-3 group-hover:rotate-6 transition-transform" />
                 <div className="absolute inset-0 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-center shadow-sm transform -rotate-3 group-hover:-rotate-6 transition-transform">
                    <div className="h-6 w-4 border-2 border-blue-500 rounded-sm border-dashed" />
                 </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Upload Your Syllabus
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">
                Drag & drop any syllabus (PDF, DOCX, or TXT). Our AI instantly extracts topics, assignments, and exam dates.
              </p>

              {/* Visual Demo */}
              <UploadDemo />

            </div>
          </motion.div>

          {/* Card 2: Study Focus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative md:scale-105"
          >
            <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-3xl p-8 h-full border-2 border-green-300 dark:border-green-600 hover:border-green-400 dark:hover:border-green-500 transition-all duration-300 hover:shadow-2xl flex flex-col">
              {/* Visual Icon Substitute */}
              <div className="mb-6 h-12 w-12 relative">
                 <div className="absolute inset-0 bg-green-100 dark:bg-green-900/30 rounded-xl transform rotate-2 group-hover:rotate-4 transition-transform" />
                 <div className="absolute inset-0 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 rounded-xl flex items-center justify-center shadow-sm transform -rotate-2 group-hover:-rotate-4 transition-transform">
                   <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                 </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Pinpoint What Matters
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">
                Stop passively re-reading notes. We analyze your chat history and quiz performance to flag the exact concepts you're struggling with—before they cost you points.
              </p>

              {/* Interactive Demo Visual */}
              <FocusDemo />

            </div>
          </motion.div>

          {/* Card 3: Track Everything */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="group relative"
          >
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-purple-900/20 rounded-3xl p-8 h-full border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-2xl flex flex-col">
              {/* Visual Icon Substitute */}
              <div className="mb-6 h-12 w-12 relative bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-800 shadow-sm overflow-hidden group-hover:shadow-md transition-all">
                 <div className="h-4 bg-purple-500 w-full" />
                 <div className="p-2 grid grid-cols-3 gap-1">
                   {[...Array(6)].map((_, i) => (
                     <div key={i} className={`h-1.5 rounded-sm ${i === 4 ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                   ))}
                 </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Never Miss a Deadline
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">
                All your courses, assignments, and exams organized in one dashboard. The AI knows what's coming up.
              </p>

              {/* Visual Demo */}
              <ScheduleDemo />

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

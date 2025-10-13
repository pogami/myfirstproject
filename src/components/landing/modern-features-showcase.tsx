'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Upload, MessageSquare, Calendar, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { InteractiveChatDemo } from './interactive-chat-demo';

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
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 rounded-3xl p-8 h-full border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-2xl">
              {/* Icon */}
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Upload className="h-7 w-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Upload Your Syllabus
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Drag & drop any syllabus (PDF, DOCX, TXT). Our AI instantly extracts topics, assignments, and exam dates.
              </p>

              {/* Visual Demo */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-inner">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">15 topics identified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">5 assignments found</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">3 exams scheduled</span>
                  </div>
                </div>
              </div>

              {/* Badge */}
              <div className="absolute top-4 right-4">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                  Step 1
                </span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Interactive AI Tutor (Middle - Interactive) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative md:scale-105"
          >
            <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-3xl p-8 h-full border-2 border-green-300 dark:border-green-600 hover:border-green-400 dark:hover:border-green-500 transition-all duration-300 hover:shadow-2xl">
              {/* Icon */}
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Get Instant AI Help
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Ask questions, get quizzes, and receive help that's tailored to your exact course content and deadlines.
              </p>

              {/* Interactive Demo Visual */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-inner">
                <div className="space-y-3">
                  {/* Simulated chat bubbles */}
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded-2xl text-sm max-w-[80%]">
                      Quiz me on Baroque music
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 rounded-2xl text-sm max-w-[80%] border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-3 w-3 text-purple-600" />
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">AI</span>
                      </div>
                      Q: Who composed "The Four Seasons"?
                    </div>
                  </div>
                </div>
              </div>

              {/* Badge - Special */}
              <div className="absolute top-4 right-4">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Interactive
                </span>
              </div>
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
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-purple-900/20 rounded-3xl p-8 h-full border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-2xl">
              {/* Icon */}
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="h-7 w-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Never Miss a Deadline
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                All your courses, assignments, and exams organized in one dashboard. The AI knows what's coming up.
              </p>

              {/* Visual Demo */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-inner">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Music Exam</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Oct 20, 2025</p>
                    </div>
                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs font-semibold">3 days</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Essay Due</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Oct 22, 2025</p>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs font-semibold">5 days</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Lab Report</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Oct 25, 2025</p>
                    </div>
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs font-semibold">8 days</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badge */}
              <div className="absolute top-4 right-4">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                  Step 3
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Interactive Demo Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Try It Yourself
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Ask the AI anything. It already knows your course!
            </p>
          </div>
          <InteractiveChatDemo />
        </motion.div>
      </div>
    </section>
  );
}


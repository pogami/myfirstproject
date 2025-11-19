'use client';

import React, { useState } from 'react';
import {
  Zap,
  Calendar as CalendarIcon,
  Target,
  Users,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardDemo, FlashcardsDemo, ScheduleDemo, FocusDemo } from './feature-demos';

export function BentoGridSection() {
  return (
    <section className="py-32 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-8 tracking-tight"
          >
            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">excel</span>
          </motion.h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Powerful tools designed to help you study smarter, not harder.
            No more all-nighters, just smart planning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-4 md:grid-rows-3 gap-6 lg:gap-8 h-auto md:h-[900px]">

          {/* Feature 1: Dashboard Overview (Large) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="md:col-span-2 md:row-span-2 rounded-[2.5rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 lg:p-12 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 flex flex-col"
          >
            <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-blue-500/5 rounded-full blur-3xl -mr-24 -mt-24 transition-all group-hover:bg-blue-500/10"></div>

            <div className="relative z-10 flex-1 flex flex-col">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Unified Dashboard</h3>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md">
                  Daily briefings, study streaks, and a clear view of what's next—updated in real-time.
                </p>
              </div>

              <div className="mt-auto w-full">
                 <DashboardDemo />
              </div>
            </div>
          </motion.div>

          {/* Feature 2: Flashcards (Tall) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1 md:row-span-2 rounded-[2.5rem] bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border border-purple-100 dark:border-gray-700 p-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 flex flex-col"
          >
            {/* Replaced "fake" grid pattern with simple subtle gradient overlay */}
            <div className="absolute inset-0 bg-white/5 opacity-20"></div>

            {/* Content */}
            <div className="relative z-10 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Instant Flashcards</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Turn your notes into interactive study sets. Click to flip and test yourself.
              </p>
            </div>

            <FlashcardsDemo />
          </motion.div>

          {/* Feature 3: Deadline Tracking */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-[2.5rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 group hover:border-orange-400/50 transition-colors flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Deadline Tracking</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Syncs dates from your syllabus automatically. Never miss a due date again.
              </p>
            </div>

            {/* Smart Schedule Visual */}
            <div className="mt-6 h-[160px]">
               <ScheduleDemo />
            </div>
          </motion.div>

          {/* Feature 4: Exam Readiness (Replaces Mastery Tracker) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="rounded-[2.5rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 group hover:border-green-400/50 transition-colors flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Exam Readiness</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Get a prioritized plan focusing on high-yield topics you need to review.
              </p>
            </div>

            {/* Triage Plan Visual */}
            <div className="mt-6 h-[160px]">
               <FocusDemo />
            </div>
          </motion.div>

          {/* Feature 5: Collaborate (Coming Soon) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="rounded-[2.5rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 group hover:border-pink-400/50 transition-colors flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>

            {/* Coming Soon Badge */}
            <div className="absolute top-6 right-6">
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-gray-200 dark:border-gray-600">
                Coming Soon
              </span>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-pink-600 dark:text-pink-400">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Collaborate</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Upload your syllabus to join a dedicated study group. Connect with classmates and AI tutors instantly.
              </p>
            </div>

            {/* User Avatars Visual */}
            <div className="mt-6 flex -space-x-3 justify-center opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gradient-to-br ${i === 1 ? 'from-blue-400 to-blue-600' :
                  i === 2 ? 'from-purple-400 to-purple-600' :
                    i === 3 ? 'from-pink-400 to-pink-600' : 'from-orange-400 to-orange-600'
                  } shadow-sm`} />
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
                <Lock className="w-3 h-3" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, BookOpen, GraduationCap, Calendar, Library, Sparkles } from 'lucide-react';

const useCases = [
  {
    id: 1,
    title: "The Overwhelmed Freshman",
    scenario: "5 new syllabi, 200 pages of reading, and no clue where to start.",
    solution: "CourseConnect organizes every deadline into one master calendar instantly.",
    icon: <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    color: "bg-blue-100 dark:bg-blue-900/30",
    rotation: -2
  },
  {
    id: 2,
    title: "The Pre-Med Student",
    scenario: "Need to memorize complex chemical pathways for Organic Chemistry.",
    solution: "AI generates active recall flashcards directly from lecture slides.",
    icon: <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
    color: "bg-purple-100 dark:bg-purple-900/30",
    rotation: 1
  },
  {
    id: 3,
    title: "The Working Student",
    scenario: "Balancing a part-time job with full-time classes.",
    solution: "Smart scheduling finds the perfect study gaps in your busy week.",
    icon: <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />,
    color: "bg-green-100 dark:bg-green-900/30",
    rotation: -1
  },
  {
    id: 4,
    title: "The Last-Minute Crammer",
    scenario: "Exam is tomorrow and you haven't started reviewing.",
    solution: "Get a prioritized 'Triage Plan' focusing on high-yield topics.",
    icon: <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
    color: "bg-orange-100 dark:bg-orange-900/30",
    rotation: 3
  },
  {
    id: 5,
    title: "The Visual Learner",
    scenario: "Textbooks are dense and boring.",
    solution: "Chat with your AI tutor to get simple analogies and diagrams.",
    icon: <Library className="w-5 h-5 text-pink-600 dark:text-pink-400" />,
    color: "bg-pink-100 dark:bg-pink-900/30",
    rotation: -3
  },
  {
    id: 6,
    title: "The High Achiever",
    scenario: "Aiming for a 4.0 GPA across all subjects.",
    solution: "Track your mastery level for every topic in real-time.",
    icon: <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
    color: "bg-indigo-100 dark:bg-indigo-900/30",
    rotation: 2
  }
];

import { Clock } from 'lucide-react';

export function TestimonialWall() {
  return (
    <section className="py-32 bg-white dark:bg-gray-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6"
          >
            <Star className="w-4 h-4 fill-current" />
            <span>Built for Real Life</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            Study smarter in <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">every scenario.</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Whether you're ahead of schedule or pulling an all-nighter, we've got your back.
          </p>
        </div>

        <div className="relative">
          {/* Gradient overlay for fade effect */}
          {/* Gradient overlay removed to fix visual artifact */}

          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 p-4">
            {useCases.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`break-inside-avoid relative bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}
                style={{ rotate: `${item.rotation}deg` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color}`}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{item.title}</h4>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                    "{item.scenario}"
                  </p>
                  <div className="h-px bg-gray-200 dark:bg-gray-700" />
                  <p className="text-gray-900 dark:text-gray-200 text-sm font-medium">
                    💡 {item.solution}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

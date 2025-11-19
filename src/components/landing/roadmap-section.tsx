'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Smartphone, Users, Clock } from 'lucide-react';

const roadmapItems = [
  {
    title: 'Calendar Sync',
    description: 'Automatically sync your deadlines with Google Calendar, Outlook, and Apple Calendar. Never miss a due date again.',
    icon: Calendar,
    color: 'blue',
    status: 'Coming Soon'
  },
  {
    title: 'Study Groups',
    description: 'Connect with classmates, share notes, and prepare for exams together in AI-moderated study groups.',
    icon: Users,
    color: 'purple',
    status: 'Future'
  },
  {
    title: 'Mobile App',
    description: 'Access your syllabus, deadlines, and AI tutor on the go with our dedicated iOS and Android apps.',
    icon: Smartphone,
    color: 'pink',
    status: 'Future'
  }
];

const colorClasses = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-100 dark:border-blue-900/40',
    icon: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    hover: 'from-blue-500/5'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-100 dark:border-purple-900/40',
    icon: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    hover: 'from-purple-500/5'
  },
  pink: {
    bg: 'bg-pink-50 dark:bg-pink-950/30',
    border: 'border-pink-100 dark:border-pink-900/40',
    icon: 'text-pink-600 dark:text-pink-400',
    badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
    hover: 'from-pink-500/5'
  }
};

export function RoadmapSection() {
  return (
    <section className="py-24 bg-white dark:bg-gray-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-semibold uppercase tracking-wider mb-6">
              Future Roadmap
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
              We're just getting started.
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              We're building the ultimate study companion. Here's a sneak peek at what's coming next to help you ace your classes.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {roadmapItems.map((item, idx) => {
            const Icon = item.icon;
            const colors = colorClasses[item.color as keyof typeof colorClasses];

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative"
              >
                <div className="relative h-full p-8 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-none hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  {/* Gradient Glow on Hover */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${colors.hover} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`p-3 rounded-2xl ${colors.bg} ${colors.border} border`}>
                        <Icon className={`w-6 h-6 ${colors.icon}`} />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors.badge}`}>
                        {item.status}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {item.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


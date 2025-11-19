'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Upload, CalendarDays, MessageCircle, Target } from 'lucide-react';

const tickerStats = [
  { 
    title: 'Daily Briefing', 
    detail: 'Pushes a prioritised rundown to your inbox at 7 AM every day'
  },
  { 
    title: 'Exam Triage Plan', 
    detail: 'Ranks weak topics using your chat history, quizzes, and syllabus context'
  },
  { 
    title: 'Class Chat Memory', 
    detail: 'Cites the exact syllabus section or upload inside every AI answer'
  },
  { 
    title: 'Auto deadlines', 
    detail: 'Pulls every date straight from your PDF/DOCX/TXT uploads after parsing'
  },
];

const processSteps = [
  {
    title: 'Upload once',
    description:
      'Stop digging through syllabi. Drag your syllabus once, and we instantly extract every deadline, reading, and grading policy for you.',
    tag: 'Syllabus Intelligence',
    icon: Upload,
  },
  {
    title: 'Daily Briefing',
    description:
      'Waking up scattered? Get a daily briefing that prioritizes your deadlines, classes, and knowledge gaps before you even get out of bed.',
    tag: 'AI Briefing',
    icon: CalendarDays,
  },
  {
    title: 'Class chat that remembers',
    description:
      'Your notes are everywhere. Ask the Class Chat, and it pulls answers from your syllabus, uploads, and past questions in seconds.',
    tag: 'Contextual Tutor',
    icon: MessageCircle,
  },
  {
    title: 'Exam triage plan',
    description:
      'Stop guessing what to study. We generate a personalized triage plan that targets your weakest topics so you can raise your grade fast.',
    tag: 'Triage Plan',
    icon: Target,
  },
];

export function StatsTickerSection() {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <section
      className="py-10 overflow-hidden bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 border-t border-b border-gray-100 dark:border-gray-800"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="flex gap-6 whitespace-nowrap"
        animate={{ x: ['0%', '-100%'] }}
        transition={{ repeat: Infinity, duration: isHovered ? 10 : 18, ease: 'linear' }}
      >
        {[...tickerStats, ...tickerStats, ...tickerStats].map((stat, idx) => (
          <div
            key={`${stat.title}-${idx}`}
            className="px-8 py-4 rounded-2xl bg-transparent dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm"
          >
            <p className="text-sm font-bold text-gray-900 dark:text-white">{stat.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.detail}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

export function StickyProcessSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-5 gap-12">
        <div className="md:col-span-2">
          <div className="md:sticky md:top-28">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-500 dark:text-blue-300 mb-4">Workflow</p>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
              Built for the way college actually works.
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Every feature mirrors what students already do: upload the syllabus, plan the week, ask classmates, prep
              for exams. We just automated the parts that waste time.
            </p>
          </div>
        </div>
        <div className="md:col-span-3 flex flex-col gap-6">
          {processSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="rounded-3xl border border-blue-100/60 dark:border-blue-900/40 bg-white/90 dark:bg-gray-900/80 backdrop-blur px-6 py-6 shadow-lg shadow-blue-500/5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-300">
                    {step.tag}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-base">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


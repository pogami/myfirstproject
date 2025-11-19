'use client';

import React, { useState } from 'react';
import {
  Zap,
  Calendar as CalendarIcon,
  Target,
  Users,
  Clock,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  FileText,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// --- Upload Demo (Simulated Upload Flow) ---
export function UploadDemo() {
  const [step, setStep] = useState(0); // 0: Idle, 1: Uploading, 2: Processing, 3: Done

  // Auto-cycle through steps for the demo
  React.useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-48 glass-panel rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
          >
            <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Drop syllabus here</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PDF, DOCX, TXT</p>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-[200px] px-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Uploading...</span>
              <span className="text-xs text-gray-400">45%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: "0%" }}
                animate={{ width: "45%" }}
                transition={{ duration: 1.5 }}
              />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-100 dark:border-blue-900 rounded-full animate-spin border-t-blue-500" />
              <Zap className="absolute inset-0 m-auto w-5 h-5 text-blue-500" />
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-3">Extracting dates...</p>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
          >
            <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Ready!</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Found 12 assignments</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Schedule Demo (Mimics Deadline Tracking) ---
export function ScheduleDemo() {
  return (
    <div className="space-y-2">
      {[
        { day: 'Tomorrow', date: 'OCT 24', title: 'Calculus II Midterm', type: 'Exam', color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' },
        { day: '3 Days', date: 'OCT 27', title: 'Chemistry Lab', type: 'Due Soon', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400' },
        { day: '1 Week', date: 'OCT 30', title: 'History Essay', type: 'Pending', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
          <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold leading-tight ${item.color}`}>
            <span className="opacity-70">{item.date.split(' ')[0]}</span>
            <span className="text-sm">{item.date.split(' ')[1]}</span>
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate">{item.title}</h4>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${item.color}`}>
                {item.day}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">{item.type}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Focus Demo (Mimics StudyFocusSuggestions) ---
export function FocusDemo() {
  return (
    <div className="h-full flex flex-col space-y-3">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
          <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
          Study Focus
        </h2>
      </div>

      <div className="space-y-3">
        <div className="relative overflow-hidden border border-amber-200/20 glass-panel shadow-sm rounded-xl p-3 flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-50" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
                <Target className="h-4 w-4" />
              </div>
              <div className="px-2 py-0.5 rounded-full bg-white/80 dark:bg-black/20 border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  High Priority
                </span>
              </div>
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Krebs Cycle Energy Yield</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              You missed the ATP calculation on the practice set. Let's close this gap.
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs font-semibold text-gray-500">Biology 101</span>
              <div className="flex items-center gap-1 text-xs font-semibold text-blue-600">
                Fix Gap <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden border border-blue-200/20 glass-panel shadow-sm rounded-xl p-3 flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-50" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400">
                <Zap className="h-4 w-4" />
              </div>
              <div className="px-2 py-0.5 rounded-full bg-white/80 dark:bg-black/20 border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Next Up
                </span>
              </div>
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">DNA vs RNA Polymerase</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Key distinction for Week 5 Lab. 5 min refresher recommended.
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs font-semibold text-gray-500">Biology 101</span>
              <div className="flex items-center gap-1 text-xs font-semibold text-blue-600">
                Review <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Flashcards Demo (Replaces Shuffling Stack with Real List) ---
const sampleCards = [
  { front: 'Where does photosynthesis happen?', back: 'In the chloroplasts of plant cells.' },
  { front: 'What is the Krebs Cycle?', back: 'A series of reactions that generate energy via acetyl-CoA oxidation.' },
  { front: 'Define mitosis.', back: 'Cell division that produces two identical daughter cells.' }
];

export function FlashcardsDemo() {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const current = sampleCards[index];
  const progress = Math.round(((index + 1) / sampleCards.length) * 100);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip
    setIsFlipped(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % sampleCards.length);
    }, 200);
  };

  return (
    <Card className="border border-white/10 glass-panel shadow-lg h-[360px] flex flex-col overflow-hidden relative">
      {/* Background pattern/gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/10 dark:to-indigo-950/10 z-0" />

      <div className="relative z-10 flex flex-col h-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Deck</p>
              <h3 className="text-sm font-bold text-foreground">Biology 101</h3>
            </div>
          </div>
          <Badge variant="secondary" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-indigo-100 dark:border-indigo-900 text-xs">
            {index + 1} / {sampleCards.length}
          </Badge>
        </div>

        {/* Card Area */}
        <div
          className="flex-1 relative perspective-1000 cursor-pointer group"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className={`relative w-full h-full transition-all duration-500 transform-style-3d shadow-xl rounded-2xl ${isFlipped ? 'rotate-y-180' : ''}`}>
            {/* Front */}
            <div className="absolute inset-0 backface-hidden bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-indigo-900 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-4">Question</span>
              <p className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed">
                {current.front}
              </p>
              <p className="mt-6 text-xs text-muted-foreground flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Tap to flip <ArrowRight className="w-3 h-3" />
              </p>
            </div>

            {/* Back */}
            <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl p-8 flex flex-col items-center justify-center text-center rotate-y-180 text-white shadow-inner">
              <span className="text-xs font-bold text-white/70 uppercase tracking-wider mb-4">Answer</span>
              <p className="text-lg font-medium leading-relaxed">
                {current.back}
              </p>
              <div className="mt-6 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 text-xs bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md"
                  onClick={handleNext}
                >
                  Next Card
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Progress */}
        <div className="mt-6">
          <div className="flex justify-between text-[10px] font-medium text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round(((index + 1) / sampleCards.length) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${((index + 1) / sampleCards.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

// --- Dashboard Demo (Exact Replica of User Request) ---
export function DashboardDemo() {
  const agendaItems = [
    { month: 'OCT', day: '24', pill: 'TOMORROW', pillColor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', title: 'Calculus II Midterm', subtitle: 'Exam', icon: GraduationCap },
    { month: 'OCT', day: '27', pill: '3 DAYS', pillColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', title: 'Chemistry Lab Report', subtitle: 'Due Soon', icon: FileText },
    { month: 'OCT', day: '30', pill: '1 WEEK', pillColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', title: 'World History Essay', subtitle: 'In Progress', icon: FileText }
  ];

  return (
    <div className="glass-panel rounded-2xl border border-white/10 shadow-sm p-6 h-full flex flex-col font-sans">
      {/* Stats Row */}
      <div className="flex items-center justify-between mb-8 divide-x divide-gray-100 dark:divide-gray-800">
        <div className="px-2 flex-1 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">STUDY TIME</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">2h 18m</p>
        </div>
        <div className="px-2 flex-1 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">ASSIGNMENTS DONE</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">5</p>
        </div>
        <div className="px-2 flex-1 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">STREAK</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1">
            7 <span className="text-sm font-normal text-gray-500">days</span>
          </p>
        </div>
      </div>

      {/* Agenda Section */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">AGENDA</p>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Daily Briefing</h3>
          </div>
          <button className="text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            View all
          </button>
        </div>

        <div className="space-y-3">
          {agendaItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 group cursor-pointer">
              {/* Date Box */}
              <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors">
                <span className="text-[9px] font-bold uppercase text-gray-400">{item.month}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white leading-none">{item.day}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 py-1 border-b border-gray-50 dark:border-gray-800 group-last:border-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide ${item.pillColor}`}>
                    {item.pill}
                  </span>
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">{item.subtitle}</span>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

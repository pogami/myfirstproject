'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/landing/navigation';
import { Footer } from '@/components/landing/footer';
import { FeaturesSection } from '@/components/landing/features-section';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Users, FileText, MessageCircle, Clock, Zap, Shield, Globe, Play, Sparkles, Target, TrendingUp, MessageSquare, Bell, Upload, BookOpen } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MotionHeadline } from '@/components/ui/motion-section';

export default function FeaturesPage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const renderFeatureDemo = (feature: any) => {
    switch (feature.title) {
      case 'AI-Powered Class Chats':
        return (
          <motion.div
            animate={{
              rotate: [0, 2, -2, 0],
              scale: [1, 1.01, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-6 shadow-2xl border border-purple-200 dark:border-slate-700"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-slate-600 dark:text-slate-300 ml-2">CS 101 - AI Tutor</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-3 max-w-xs shadow-sm border border-gray-200 dark:border-slate-700">
                    <p className="text-sm text-gray-800 dark:text-white">Hi! I know your CS 101 syllabus. How can I help with your programming assignment?</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl p-3 max-w-xs shadow-sm">
                    <p className="text-sm">What's the deadline for Project 2?</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                </div>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-3 max-w-xs shadow-sm border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      <span className="text-xs text-gray-500 dark:text-slate-400">CourseConnect AI is typing...</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        );

      case 'Syllabus Upload & Analysis':
        return (
          <motion.div
            animate={{
              rotate: [0, -1, 1, 0],
              scale: [1, 1.01, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-6 shadow-2xl border border-emerald-200 dark:border-slate-700"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-slate-600 dark:text-slate-300 ml-2">Syllabus Upload</span>
              </div>
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700/30 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
                      <Upload className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">CS 101 - Introduction to Programming</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Assignments:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">8 projects</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Exams:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">2 midterms, 1 final</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Grading:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Projects 60%, Exams 40%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Syllabus processed successfully</span>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'General AI Chat':
        return (
          <motion.div
            animate={{
              rotate: [0, 1, -1, 0],
              scale: [1, 1.01, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-6 shadow-2xl border border-blue-200 dark:border-slate-700"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-slate-600 dark:text-slate-300 ml-2">General AI Chat</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-3 max-w-xs shadow-sm border border-gray-200 dark:border-slate-700">
                    <p className="text-sm text-gray-800 dark:text-white">Hi! I can help with any academic question. What do you need help with?</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-3 max-w-xs shadow-sm">
                    <p className="text-sm">Explain photosynthesis</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                </div>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-3 max-w-xs shadow-sm border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      <span className="text-xs text-gray-500 dark:text-slate-400">CourseConnect AI is typing...</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        );

      case 'Smart Notifications':
        return (
          <motion.div
            animate={{
              rotate: [0, 1, -1, 0],
              scale: [1, 1.01, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-slate-300 ml-2">Notifications</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-900/30 to-blue-800/20 rounded-xl border border-blue-700/30">
                  <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg"></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">AI Response Ready</p>
                    <p className="text-xs text-slate-300">CS 101: Your question about loops</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-900/30 to-green-800/20 rounded-xl border border-green-700/30">
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg"></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">Assignment Reminder</p>
                    <p className="text-xs text-slate-300">Project 2 due tomorrow</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-900/30 to-purple-800/20 rounded-xl border border-purple-700/30">
                  <div className="w-3 h-3 bg-purple-500 rounded-full shadow-lg"></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">Course Update</p>
                    <p className="text-xs text-slate-300">New syllabus uploaded</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'File Management':
        return (
          <motion.div
            animate={{
              rotate: [0, -1, 1, 0],
              scale: [1, 1.01, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-6 shadow-2xl border border-orange-200 dark:border-slate-700"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-slate-600 dark:text-slate-300 ml-2">File Manager</span>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-xl border border-orange-200 dark:border-orange-700/30 shadow-sm">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-white flex-1">CS101_Syllabus.pdf</span>
                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-xl border border-orange-200 dark:border-orange-700/30 shadow-sm">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-white flex-1">MATH201_Syllabus.pdf</span>
                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center shadow-lg">
                      <Upload className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex-1">Upload new syllabus...</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'Study Tracking':
        return (
          <motion.div
            animate={{
              rotate: [0, 1, -1, 0],
              scale: [1, 1.005, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-500 ml-2">Study Tracker</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Today's Progress</span>
                  <span className="text-sm text-blue-600">2h 45m</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <motion.div
                    animate={{ width: ["0%", "75%"] }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="font-medium">Math</div>
                    <div className="text-blue-600">1h 20m</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="font-medium">Physics</div>
                    <div className="text-purple-600">1h 25m</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Currently studying: Calculus</span>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'Syllabus Analysis':
        return (
          <motion.div
            animate={{
              rotate: [0, 2, -2, 0],
              scale: [1, 1.01, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-500 ml-2">Syllabus Analyzer</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">MATH-2211 Calculus I</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Course Code</span>
                    <span className="text-blue-600">MATH-2211</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Instructor</span>
                    <span className="text-blue-600">Dr. Smith</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Credits</span>
                    <span className="text-blue-600">4</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Semester</span>
                    <span className="text-blue-600">Fall 2024</span>
                  </div>
                </div>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-600">Analysis Complete - 95% Confidence</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        );

      case 'Real-time Chat':
        return (
          <motion.div
            animate={{
              rotate: [0, 1, -1, 0],
              scale: [1, 1.005, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-500 ml-2">Live Chat</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">3 members online</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 max-w-xs">
                      <p className="text-xs">Hey everyone! 👋</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 justify-end">
                    <div className="bg-blue-600 text-white rounded-lg p-2 max-w-xs">
                      <p className="text-xs">Hi! Ready for the exam?</p>
                    </div>
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">B</div>
                  </div>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex items-start gap-2"
                  >
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">C</div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 max-w-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-gray-500 rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1 h-1 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'Smart Notifications':
        return (
          <motion.div
            animate={{
              rotate: [0, 1, -1, 0],
              scale: [1, 1.005, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-500 ml-2">Notifications</span>
              </div>
              <div className="space-y-3">
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border-l-4 border-blue-500"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-medium">Assignment Due</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Calculus homework due in 2 hours</p>
                </motion.div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border-l-4 border-green-500">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-medium">Study Group</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">New member joined your group</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border-l-4 border-purple-500">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">AI Suggestion</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Time for your daily study session</p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'Privacy & Security':
        return (
          <motion.div
            animate={{
              rotate: [0, 1, -1, 0],
              scale: [1, 1.005, 1],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-500 ml-2">Security Dashboard</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Security Status</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Data Encryption</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Local Processing</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600">Enabled</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Privacy Mode</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600">On</span>
                    </div>
                  </div>
                </div>
                <motion.div
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-600">All systems secure</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        );

      case 'Multi-Platform Access':
        return (
          <motion.div
            animate={{
              rotate: [0, 1, -1, 0],
              scale: [1, 1.005, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-500 ml-2">Platform Status</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Connected Devices</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Web Browser</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-600">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Mobile App</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600">Synced</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Desktop App</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-yellow-600">Offline</span>
                    </div>
                  </div>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <span className="text-xs text-blue-600">Cross-platform sync active</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return (
          <motion.div
            animate={{
              rotate: [0, 2, -2, 0],
              scale: [1, 1.01, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-blue-200 dark:bg-blue-900 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  const features = [
    {
      icon: MessageSquare,
      title: 'AI-Powered Class Chats',
      description: 'Get personalized AI tutoring that understands your specific courses and syllabus.',
      benefits: [
        'Course-specific AI knowledge',
        'Instant homework help',
        'Exam preparation support',
        '24/7 availability'
      ]
    },
    {
      icon: FileText,
      title: 'Syllabus Upload & Analysis',
      description: 'Upload your syllabus and automatically create AI-powered class chats.',
      benefits: [
        'Smart content extraction',
        'Automatic class creation',
        'Assignment tracking',
        'Course structure analysis'
      ]
    },
    {
      icon: MessageCircle,
      title: 'General AI Chat',
      description: 'Get instant AI help for any academic question across all subjects.',
      benefits: [
        'Ask any academic question',
        'Get instant responses',
        'Multi-subject expertise',
        'Always available'
      ]
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Stay updated with AI responses and important course updates.',
      benefits: [
        'AI response alerts',
        'Assignment reminders',
        'Course notifications',
        'Study suggestions'
      ]
    },
    {
      icon: Upload,
      title: 'File Management',
      description: 'Upload and manage your syllabi and course materials securely.',
      benefits: [
        'Secure file storage',
        'PDF processing',
        'Document organization',
        'Easy access'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navigation />
      
      {/* Header */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-20 left-20 w-32 h-32 bg-blue-200/20 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              x: [0, -150, 0],
              y: [0, 100, 0],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-40 right-20 w-24 h-24 bg-purple-200/20 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              x: [0, 80, 0],
              y: [0, -80, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-20 left-1/3 w-16 h-16 bg-pink-200/20 rounded-full blur-lg"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <Button
                variant="ghost"
                onClick={() => window.history.back()}
                className="mb-4 hover:bg-white/50 backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </motion.div>
            
            <MotionHeadline className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              AI-Powered Study Tools for{' '}
              <motion.span 
                className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  backgroundSize: "200% 200%"
                }}
              >
                Student Success
              </motion.span>
            </MotionHeadline>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              Upload your syllabi and get personalized AI tutoring for each course. Track assignments, 
              get instant help, and excel in your studies with CourseConnect.
            </motion.p>

            {/* Interactive Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-8 mb-12"
            >
              {[
                { number: "AI", label: "Powered", icon: Sparkles },
                { number: "Syllabus", label: "Upload", icon: Upload },
                { number: "Instant", label: "Chat", icon: MessageSquare },
                { number: "Smart", label: "Notifications", icon: Bell }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl px-6 py-4 border border-gray-200/50 dark:border-gray-700/50"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.number}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Interactive Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Feature Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          {features.map((feature, index) => (
            <motion.button
              key={feature.title}
              onClick={() => setActiveFeature(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeFeature === index
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {React.createElement(feature.icon, { className: "h-4 w-4 inline mr-2" })}
              {feature.title}
            </motion.button>
          ))}
        </motion.div>

        {/* Active Feature Showcase */}
        <motion.div
          key={activeFeature}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-8 md:p-12 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6"
                >
                  {React.createElement(features[activeFeature].icon, { className: "h-10 w-10 text-white" })}
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  {features[activeFeature].title}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  {features[activeFeature].description}
                </p>
                <ul className="space-y-4">
                  {features[activeFeature].benefits.map((benefit, benefitIndex) => (
                    <motion.li
                      key={benefitIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + benefitIndex * 0.1 }}
                      className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      {benefit}
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                {renderFeatureDemo(features[activeFeature])}
              </div>
            </div>
          </div>
        </motion.div>

        {/* All Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -10,
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
              onClick={() => setActiveFeature(index)}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-all duration-300">
                  {React.createElement(feature.icon, { className: "h-6 w-6 text-white" })}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {feature.title}
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                {feature.description}
              </p>
              
              <ul className="space-y-2">
                {feature.benefits.slice(0, 3).map((benefit, benefitIndex) => (
                  <motion.li
                    key={benefitIndex}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: benefitIndex * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
                  >
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {benefit}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Interactive CTA Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-full blur-lg"
          />
        </div>

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.h2
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              style={{
                background: "linear-gradient(45deg, #ffffff, #e0e7ff, #ffffff)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              Ready to Transform Your Learning?
            </motion.h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of students who are already using CourseConnect to excel in their studies.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => window.location.href = '/login'}
              >
                <Play className="h-5 w-5 mr-2" />
                Get Started Free
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/landing/navigation';
import { Footer } from '@/components/landing/footer';
import { FeaturesSection } from '@/components/landing/features-section';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Users, FileText, MessageCircle, Clock, Zap, Shield, Globe, Play, Sparkles, Target, TrendingUp } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

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
      case 'AI-Powered Tutoring':
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
                <span className="text-sm text-gray-500 ml-2">AI Tutor Chat</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-xs">
                    <p className="text-sm">Hi! I'm your AI tutor. How can I help you with calculus today?</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
                    <p className="text-sm">Can you explain derivatives?</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      <span className="text-xs text-gray-500">AI is typing...</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        );

      case 'Study Groups':
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
                <span className="text-sm text-gray-500 ml-2">Study Group Chat</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">CSCI 1301 Study Group (4 online)</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 max-w-xs">
                      <p className="text-xs">Anyone else struggling with the homework?</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 justify-end">
                    <div className="bg-blue-600 text-white rounded-lg p-2 max-w-xs">
                      <p className="text-xs">I can help! The AI tutor explained it well</p>
                    </div>
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">B</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">C</div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 max-w-xs">
                      <p className="text-xs">Thanks! Can you share your notes?</p>
                    </div>
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
      icon: null,
      title: 'AI-Powered Tutoring',
      description: 'Get instant help with homework, assignments, and exam prep from our advanced AI tutor.',
      benefits: [
        '24/7 availability',
        'Personalized explanations',
        'Step-by-step solutions',
        'Multiple subject support'
      ]
    },
    {
      icon: Users,
      title: 'Study Groups',
      description: 'Connect with classmates taking the same courses and collaborate on assignments.',
      benefits: [
        'Automatic group matching',
        'Real-time collaboration',
        'Shared resources',
        'Peer support network'
      ]
    },
    {
      icon: FileText,
      title: 'Syllabus Analysis',
      description: 'Upload your syllabus and get instant insights about course requirements and structure.',
      benefits: [
        'Smart content extraction',
        'Course overview generation',
        'Assignment tracking',
        'Grade calculation tools'
      ]
    },
    {
      icon: MessageCircle,
      title: 'Real-time Chat',
      description: 'Communicate with study groups and get instant AI assistance through our chat interface.',
      benefits: [
        'Group messaging',
        'AI integration',
        'File sharing',
        'Message history'
      ]
    },
    {
      icon: Clock,
      title: 'Study Tracking',
      description: 'Monitor your study time, track progress, and maintain consistent study habits.',
      benefits: [
        'Time tracking',
        'Progress analytics',
        'Study streaks',
        'Goal setting'
      ]
    },
    {
      icon: Zap,
      title: 'Smart Notifications',
      description: 'Stay updated with assignment deadlines, study reminders, and group activities.',
      benefits: [
        'Customizable alerts',
        'Deadline reminders',
        'Study suggestions',
        'Group updates'
      ]
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'Your data is protected with enterprise-grade security and privacy controls.',
      benefits: [
        'End-to-end encryption',
        'Data privacy controls',
        'Secure file storage',
        'GDPR compliance'
      ]
    },
    {
      icon: Globe,
      title: 'Multi-Platform Access',
      description: 'Access CourseConnect from any device, anywhere, with seamless synchronization.',
      benefits: [
        'Web application',
        'Mobile responsive',
        'Cross-device sync',
        'Offline capabilities'
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
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Powerful Features for{' '}
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
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              Everything you need to excel in your studies, connect with classmates, and achieve your academic goals.
            </motion.p>

            {/* Interactive Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-8 mb-12"
            >
              {[
                { number: "10,000+", label: "Students", icon: Users },
                { number: "500+", label: "Universities", icon: Globe },
                { number: "95%", label: "Success Rate", icon: Target },
                { number: "24/7", label: "AI Support", icon: Clock }
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
                {feature.benefits.length > 3 && (
                  <li className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    +{feature.benefits.length - 3} more benefits
                  </li>
                )}
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
                onClick={() => window.location.href = '/auth'}
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

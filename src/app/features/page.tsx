'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/landing/navigation';
import { Footer } from '@/components/landing/footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Users, FileText, MessageCircle, Clock, Zap, Shield, Globe, Play, Sparkles, Target, TrendingUp, MessageSquare, Bell, Upload, BookOpen } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MotionHeadline } from '@/components/ui/motion-section';
import { FeatureDemos } from '@/components/features/feature-demos';

export default function FeaturesPage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
                Academic Success
              </motion.span>
            </MotionHeadline>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              Discover how CourseConnect transforms your study routine with intelligent tools designed for modern students.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Interactive Features Section */}
      <div className="bg-gray-50/50 dark:bg-gray-900/50 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] dark:opacity-[0.05]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Feature Navigation */}
            <div className="lg:col-span-4 space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <button
                    onClick={() => setActiveFeature(index)}
                    className={`w-full text-left p-6 rounded-2xl transition-all duration-300 border ${activeFeature === index
                        ? 'bg-white dark:bg-gray-800 shadow-lg border-blue-200 dark:border-blue-800 scale-105'
                        : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border-transparent hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl transition-colors duration-300 ${activeFeature === index
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                        {React.createElement(feature.icon, { className: "h-6 w-6" })}
                      </div>
                      <div>
                        <h3 className={`font-bold text-lg transition-colors duration-300 ${activeFeature === index
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-600 dark:text-gray-400'
                          }`}>
                          {feature.title}
                        </h3>
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Feature Showcase */}
            <div className="lg:col-span-8">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="h-full"
              >
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white/50 dark:border-gray-700/50 shadow-2xl h-full flex flex-col">
                  <div className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                      {features[activeFeature].title}
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                      {features[activeFeature].description}
                    </p>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-sm">Key Benefits</h4>
                      <ul className="space-y-3">
                        {features[activeFeature].benefits.map((benefit, i) => (
                          <motion.li
                            key={benefit}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-3 text-gray-600 dark:text-gray-300"
                          >
                            <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            {benefit}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                    <div className="relative min-h-[300px] flex items-center justify-center">
                      <FeatureDemos title={features[activeFeature].title} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
              Ready to Excel?
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed font-medium">
              Join thousands of students who are already studying smarter with CourseConnect.
            </p>
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-6 text-lg font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              onClick={() => window.location.href = '/signup'}
            >
              Get Started Free
            </Button>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

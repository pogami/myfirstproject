'use client';

import React from 'react';
import { Navigation } from '@/components/landing/navigation';
import { Footer } from '@/components/landing/footer';
import { motion, useScroll, useTransform, useInView, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Star, Zap, Sparkles, Rocket, Heart, Users, Clock, TrendingUp, CheckCircle, Shield, Globe, Award } from 'lucide-react';

// Framer-style Hero Section
function FramerStyleHero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8]);

  return (
    <motion.div 
      style={{ y, opacity }}
      className="relative min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 overflow-hidden"
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 dark:from-slate-800 dark:via-slate-900 dark:to-blue-900/30"></div>
      
      <div className="relative max-w-6xl mx-auto px-6 text-center z-10">
        {/* Badge with Framer-style animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8 border border-blue-200/50 dark:border-blue-800/50"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          AI-Powered Learning Platform
        </motion.div>

        {/* Main headline with Framer-style stagger */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight"
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="block"
            >
              Struggling in
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              Class?
            </motion.span>
          </motion.h1>
        </motion.div>

        {/* Subtitle with smooth fade */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Upload your syllabus and get AI tutoring that knows your assignments and exam dates. 
          <span className="text-slate-900 dark:text-white font-medium">No more confusion—just real help when you need it.</span>
        </motion.p>

        {/* CTA buttons with Framer-style interactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 w-full sm:w-auto"
              onClick={() => window.location.href = '/login'}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              variant="outline"
              size="lg"
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-8 py-3 text-lg font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 w-full sm:w-auto"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats with Framer-style stagger */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
        >
          {[
            { number: "10K+", label: "Students Helped" },
            { number: "95%", label: "Success Rate" },
            { number: "24/7", label: "AI Support" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="text-center p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

// Framer-style Features Section
function FramerStyleFeatures() {
  const containerRef = React.useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Star,
      title: 'Smart Syllabus Matching',
      description: 'Upload your syllabus and our AI extracts course information, assignments, and due dates automatically.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: Zap,
      title: 'AI-Powered Tutoring',
      description: 'Get instant help with homework, assignments, and exam prep. CourseConnect AI provides detailed explanations tailored to your course.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      icon: Sparkles,
      title: 'Smart Flashcards',
      description: 'Generate personalized flashcards from your course content. Study with AI-powered quizzes and track your progress.',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      icon: Rocket,
      title: 'Assignment Reminders',
      description: 'Never miss a deadline! Get automatic reminders for assignments and exams based on your uploaded syllabus.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      icon: Heart,
      title: 'Study Analytics',
      description: 'Track your study progress, see which topics you need to focus on, and get personalized recommendations for improvement.',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20'
    },
    {
      icon: Users,
      title: 'Study Groups',
      description: 'Join or create study groups with students from your class. Collaborate on assignments and share study materials.',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    }
  ];

  return (
    <div ref={containerRef} id="features" className="py-24 bg-slate-50 dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header with Framer-style animation */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6"
          >
            Everything you need to{' '}
            <span className="text-blue-600 dark:text-blue-400">
              ace your courses
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto"
          >
            CourseConnect AI combines the power of AI tutoring with the support of your classmates to help you succeed in your studies.
          </motion.p>
        </div>

        {/* Features grid with Framer-style stagger */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 dark:border-slate-700"
            >
              {/* Icon with Framer-style hover */}
              <motion.div 
                className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-6`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </motion.div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Framer-style CTA Section
function FramerStyleCTA() {
  const containerRef = React.useRef(null);
  const isInView = useInView(containerRef, { once: true });

  return (
    <motion.div
      ref={containerRef}
      className="py-24 bg-blue-600"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold text-white mb-6"
        >
          Ready to ace your courses?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
        >
          Join thousands of students who are already succeeding with CourseConnect AI.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              onClick={() => window.location.href = '/dashboard'}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-200"
              onClick={() => window.location.href = '/features'}
            >
              Learn More
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function TestAnimationsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navigation />
      <main>
        <FramerStyleHero />
        <FramerStyleFeatures />
        <FramerStyleCTA />
      </main>
      <Footer />
    </div>
  );
}
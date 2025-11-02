'use client';

import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Upload, MessageCircle, FileText, BarChart3, Sparkles, CheckCircle2, Clock, Users, Calendar, TrendingUp, Zap, Target, Shield, Brain, Rocket, Award, BookOpen } from 'lucide-react';
import { Navigation } from '@/components/landing/navigation';
import { Footer } from '@/components/landing/footer';

export default function LandingPage2() {
  const [activeFeature, setActiveFeature] = useState(0);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Get instant explanations tailored to your learning style',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
    },
    {
      icon: FileText,
      title: 'Smart Syllabus',
      description: 'Upload once, get everything organized automatically',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
    },
    {
      icon: Target,
      title: 'Study Analytics',
      description: 'Track progress and identify areas for improvement',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
    },
    {
      icon: Rocket,
      title: 'Achieve Goals',
      description: 'Reach your academic targets faster with AI assistance',
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navigation />
      
      {/* Hero Section - Bold & Modern */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-800"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </motion.div>
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  AI-Powered Learning Platform
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight"
              >
                <span className="text-gray-900 dark:text-white">Stop</span>{' '}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Struggling
                </span>
                <br />
                <span className="text-gray-900 dark:text-white">Start</span>{' '}
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                  Succeeding
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed"
              >
                Your personal AI tutor that knows your syllabus, tracks your progress, and helps you ace every exam.
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-8"
              >
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">50K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Students</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">1M+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Questions Answered</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">4.9★</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Rating</div>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
                    onClick={() => window.location.href = '/login'}
                  >
                    Start Learning Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-6 text-lg font-semibold rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Watch Demo
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Side - Interactive Demo */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative"
            >
              {/* 3D Glassmorphism Card */}
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                
                {/* Main Card */}
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/20">
                  {/* Chat Interface */}
                  <div className="space-y-4">
                    {/* Chat Header */}
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">CourseConnect AI</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Always learning, always ready</p>
                      </div>
                      <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-semibold text-green-700 dark:text-green-400">Online</span>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="space-y-3">
                      {/* User Message */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                        className="flex justify-end"
                      >
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-2xl rounded-br-sm max-w-[85%] shadow-lg">
                          <p className="text-sm">Help me understand calculus derivatives</p>
                        </div>
                      </motion.div>

                      {/* AI Response */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-2xl rounded-bl-sm max-w-[85%]">
                          <div className="flex items-center gap-2 mb-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <Sparkles className="h-3 w-3 text-purple-600" />
                            </motion.div>
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">AI Tutor</span>
                          </div>
                          <p className="text-sm">Let me explain derivatives step by step... A derivative measures the rate of change...</p>
                        </div>
                      </motion.div>

                      {/* Analysis Card */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2 }}
                        className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </motion.div>
                          <span className="text-xs font-bold text-green-700 dark:text-green-300">Syllabus Analyzed</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-700 dark:text-gray-300">
                          <div className="text-center">
                            <div className="font-bold text-green-600">15</div>
                            <div>Topics</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-blue-600">5</div>
                            <div>Assignments</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-purple-600">3</div>
                            <div>Exams</div>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Input */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                          Ask your AI tutor...
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl p-2">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Unique Interactive Design */}
      <section className="py-32 bg-white dark:bg-gray-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Ace Every Course
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Powered by advanced AI that understands your learning style and adapts to help you succeed
            </p>
          </motion.div>

          {/* Interactive Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => setActiveFeature(index)}
                className={`relative cursor-pointer rounded-3xl p-8 transition-all duration-300 ${
                  activeFeature === index 
                    ? `bg-gradient-to-br ${feature.bgGradient} shadow-2xl scale-105` 
                    : 'bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl'
                } border-2 ${activeFeature === index ? 'border-transparent' : 'border-gray-200 dark:border-gray-700'}`}
              >
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
                  activeFeature === index 
                    ? `bg-gradient-to-br ${feature.gradient} shadow-lg` 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <feature.icon className={`h-8 w-8 ${
                    activeFeature === index ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                  }`} />
                </div>

                {/* Content */}
                <h3 className={`text-xl font-bold mb-3 ${
                  activeFeature === index 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {feature.title}
                </h3>
                <p className={`text-sm leading-relaxed ${
                  activeFeature === index 
                    ? 'text-gray-700 dark:text-gray-300' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {feature.description}
                </p>

                {/* Active Indicator */}
                {activeFeature === index && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {[
              { number: '50K+', label: 'Active Students', icon: Users },
              { number: '1M+', label: 'Questions Answered', icon: MessageCircle },
              { number: '95%', label: 'Pass Rate Improvement', icon: Award }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-white"
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-5xl font-black mb-2">{stat.number}</div>
                <div className="text-xl text-white/90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
              Ready to Transform Your{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Academic Journey?
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of students who are already acing their courses with AI-powered tutoring
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-6 text-lg font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
                  onClick={() => window.location.href = '/login'}
                >
                  Start Free Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-10 py-6 text-lg font-semibold rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch How It Works
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
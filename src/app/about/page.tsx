'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/landing/navigation';
import { Footer } from '@/components/landing/footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Target, Lightbulb, Heart, Award, Globe, Zap, TrendingUp, Clock, CheckCircle, Star, Play, Sparkles, Shield, MessageCircle } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MotionSection, MotionHeadline, MotionCard } from '@/components/ui/motion-section';

export default function AboutPage() {
  const [activeValue, setActiveValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const renderValueDemo = (value: any) => {
    switch (value.title) {
      case 'Student-Centered':
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
                <span className="text-sm text-gray-500 ml-2">Student Dashboard</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Student Success Metrics</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Study Time</span>
                    <span className="text-green-600">+25%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Grade Improvement</span>
                    <span className="text-green-600">+15%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Peer Connections</span>
                    <span className="text-green-600">+40%</span>
                  </div>
                </div>
                <motion.div
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-600">Students love our platform</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        );

      case 'Academic Excellence':
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
                <span className="text-sm text-gray-500 ml-2">Achievement Tracker</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Academic Goals</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>GPA Improvement</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600">On Track</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Study Goals</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600">Achieved</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Exam Prep</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-yellow-600">In Progress</span>
                    </div>
                  </div>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-blue-600" />
                    <span className="text-xs text-blue-600">Excellence in every interaction</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        );

      case 'Innovation':
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
                <span className="text-sm text-gray-500 ml-2">Innovation Lab</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Latest Features</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>AI-Powered Study Plans</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span>Smart Notifications</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Advanced Analytics</span>
                  </div>
                </div>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-purple-600" />
                    <span className="text-xs text-purple-600">Always innovating</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        );

      case 'Community':
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
                <span className="text-sm text-gray-500 ml-2">Community Hub</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Active Members</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Study Groups</span>
                    <span className="text-blue-600">1,247</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Peer Connections</span>
                    <span className="text-blue-600">8,932</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Knowledge Shared</span>
                    <span className="text-blue-600">15,678</span>
                  </div>
                </div>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-pink-600" />
                    <span className="text-xs text-pink-600">Building connections daily</span>
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

  const values = [
    {
      icon: Users,
      title: 'Student-Centered',
      description: 'Every feature is designed with students\' needs in mind, from AI tutoring to study group collaboration.'
    },
    {
      icon: Target,
      title: 'Academic Excellence',
      description: 'We believe in empowering students to achieve their highest potential through innovative learning tools.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We continuously push the boundaries of educational technology to create better learning experiences.'
    },
    {
      icon: Heart,
      title: 'Community',
      description: 'Building connections between students and fostering collaborative learning environments.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Students' },
    { number: '500+', label: 'Universities' },
    { number: '95%', label: 'Satisfaction Rate' },
    { number: '24/7', label: 'AI Support' }
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
              About{' '}
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
                CourseConnect
              </motion.span>
            </MotionHeadline>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              We're on a mission to revolutionize how students learn, collaborate, and succeed in their academic journey.
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

      {/* Interactive Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Our Story
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          
          {/* Timeline Items */}
          <div className="space-y-16">
            {[
              {
                year: "Aug 2025",
                title: "The Beginning",
                description: "Started this project as a solo developer, inspired by students' struggles to find study partners, get help with difficult concepts, and stay organized in their academic journey.",
                icon: Lightbulb,
                side: "left"
              },
              {
                year: "Sep 2025",
                title: "Current State",
                description: "Built the core platform leveraging AI technology and modern collaboration tools. Currently developing features to transform how students learn and succeed.",
                icon: Users,
                side: "right"
              },
              {
                year: "Oct 2025",
                title: "Future Growth",
                description: "Plans to expand the platform's capabilities, onboard more universities, and build a comprehensive ecosystem connecting students nationwide.",
                icon: TrendingUp,
                side: "left"
              },
              {
                year: "Nov 2025",
                title: "Future Vision",
                description: "Envision CourseConnect becoming more than just a study platform—a community where students support each other and achieve their academic goals together.",
                icon: Heart,
                side: "right"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: item.side === 'left' ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`flex items-center ${item.side === 'left' ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div className={`w-1/2 ${item.side === 'left' ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className={`flex items-center gap-3 ${item.side === 'left' ? 'justify-end' : 'justify-start'} mb-4`}>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <item.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{item.year}</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{item.title}</h3>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                  </motion.div>
                </div>
                
                {/* Timeline Dot */}
                <div className="relative z-10 w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full border-4 border-white dark:border-gray-900"></div>
                
                <div className="w-1/2"></div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Future Milestones Section - Add new entries here as milestones are achieved */}
        {/* 
        To add new milestones:
        1. Add new objects to the timeline array above
        2. Follow the same format: { year: "DATE", title: "TITLE", description: "DESCRIPTION", icon: IconComponent, side: "left" or "right" }
        3. Import any new icons needed at the top
        4. Update the timeline to reflect new achievements
        
        Example future entry:
        {
          year: "Dec 2025",
          title: "Platform Launch",
          description: "Official launch with universities and student onboarding programs.",
          icon: Rocket,
          side: "left"
        }
        */}
      </div>

      {/* Interactive Values Section */}
      <div className="bg-gray-50 dark:bg-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              These core principles guide everything we do at CourseConnect.
            </p>
          </motion.div>
          
          {/* Value Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4 mb-16"
          >
            {values.map((value, index) => (
              <motion.button
                key={value.title}
                onClick={() => setActiveValue(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeValue === index
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {React.createElement(value.icon, { className: "h-4 w-4 inline mr-2" })}
                {value.title}
              </motion.button>
            ))}
          </motion.div>

          {/* Active Value Showcase */}
          <motion.div
            key={activeValue}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-16"
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
                    {React.createElement(values[activeValue].icon, { className: "h-10 w-10 text-white" })}
                  </motion.div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                    {values[activeValue].title}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                    {values[activeValue].description}
                  </p>
                </div>
                <div className="relative">
                  {renderValueDemo(values[activeValue])}
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* All Values Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 cursor-pointer group text-center"
                onClick={() => setActiveValue(index)}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300"
                >
                  {React.createElement(value.icon, { className: "h-8 w-8 text-white" })}
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Interactive Stats Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              By the Numbers
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our impact on student success speaks for itself.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                className="text-center bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2"
                >
                  {stat.number}
                </motion.div>
                <div className="text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              To democratize access to quality education by connecting students with AI-powered tutoring, 
              study groups, and collaborative learning tools that help them succeed academically and beyond.
            </p>
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => window.location.href = '/auth'}
            >
              Join Our Mission
            </Button>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Users, 
  MessageCircle, 
  BookOpen, 
  Target,
  Shield,
  Zap,
  Clock,
  TrendingUp,
  FileText,
  Calendar
} from 'lucide-react';

const features = [
  {
    icon: Upload,
    title: 'Smart Syllabus Matching',
    description: 'Upload your syllabus and our AI extracts course information, assignments, and due dates automatically.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: MessageCircle,
    title: 'AI-Powered Tutoring',
    description: 'Get instant help with homework, assignments, and exam prep. CourseConnect AI provides detailed explanations tailored to your course.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: FileText,
    title: 'Smart Flashcards',
    description: 'Generate personalized flashcards from your course content. Study with AI-powered quizzes and track your progress.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Calendar,
    title: 'Assignment Reminders',
    description: 'Never miss a deadline! Get automatic reminders for assignments and exams based on your uploaded syllabus.',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: TrendingUp,
    title: 'Study Analytics',
    description: 'Track your study progress, see which topics you need to focus on, and get personalized recommendations for improvement.',
    color: 'from-pink-500 to-rose-500'
  },
  {
    icon: Users,
    title: 'Study Groups (Coming Soon)',
    description: 'Join or create study groups with students from your class. Collaborate on assignments and share study materials.',
    color: 'from-indigo-500 to-blue-500'
  }
];

export function FeaturesSection() {
  return (
    <div className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ace your courses
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            CourseConnect AI combines the power of AI tutoring with the support of your classmates to help you succeed in your studies.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-transparent"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
              
              {/* Icon */}
              <div className={`relative w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How it works
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get started in minutes and see results immediately
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Upload Syllabus',
                description: 'Add your course syllabus or docs to get started',
                icon: Upload
              },
              {
                step: '2',
                title: 'Get AI Help',
                description: 'Chat with CourseConnect AI for instant explanations',
                icon: MessageCircle
              },
              {
                step: '3',
                title: 'Generate Flashcards',
                description: 'Create and study smart flashcards from your content',
                icon: FileText
              },
              {
                step: '4',
                title: 'Stay On Track',
                description: 'Receive assignment reminders so you never miss deadlines',
                icon: Calendar
              }
            ].map((step, index) => (
              <div key={step.step} className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}

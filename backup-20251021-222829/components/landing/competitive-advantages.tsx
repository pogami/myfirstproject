'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap, Users, BookOpen, MessageSquare, Brain, Shield } from 'lucide-react';

const competitors = [
  {
    name: 'CourseConnect AI',
    logo: '🎓',
    features: {
      'AI Tutoring': true,
      'Study Groups': true,
      'Syllabus Analysis': true,
      'Mobile App': true,
      'Personalized Learning': true,
      'Real-time Collaboration': true,
      'Academic Integration': true,
      'Free Tier': true
    },
    price: '$4.99/mo',
    highlight: true
  },
  {
    name: 'Chegg',
    logo: '📚',
    features: {
      'AI Tutoring': false,
      'Study Groups': false,
      'Syllabus Analysis': false,
      'Mobile App': true,
      'Personalized Learning': false,
      'Real-time Collaboration': false,
      'Academic Integration': false,
      'Free Tier': false
    },
    price: '$14.95/mo'
  },
  {
    name: 'Khan Academy',
    logo: '🎯',
    features: {
      'AI Tutoring': false,
      'Study Groups': false,
      'Syllabus Analysis': false,
      'Mobile App': true,
      'Personalized Learning': true,
      'Real-time Collaboration': false,
      'Academic Integration': false,
      'Free Tier': true
    },
    price: 'Free'
  },
  {
    name: 'Quizlet',
    logo: '🧠',
    features: {
      'AI Tutoring': false,
      'Study Groups': true,
      'Syllabus Analysis': false,
      'Mobile App': true,
      'Personalized Learning': true,
      'Real-time Collaboration': false,
      'Academic Integration': false,
      'Free Tier': true
    },
    price: '$35.99/year'
  }
];

const features = [
  'AI Tutoring',
  'Study Groups', 
  'Syllabus Analysis',
  'Mobile App',
  'Personalized Learning',
  'Real-time Collaboration',
  'Academic Integration',
  'Free Tier'
];

const advantages = [
  {
    icon: Brain,
    title: 'Advanced AI Technology',
    description: 'Unlike basic chatbot responses, our AI provides contextual, personalized tutoring that adapts to your learning style.',
    benefit: '3x better understanding'
  },
  {
    icon: Users,
    title: 'True Study Collaboration',
    description: 'Real study groups with classmates from your actual courses, not random internet users.',
    benefit: 'Higher study effectiveness'
  },
  {
    icon: BookOpen,
    title: 'Smart Syllabus Integration',
    description: 'Upload your actual course syllabus for AI recommendations tailored to your specific assignments.',
    benefit: 'Never miss assignments'
  },
  {
    icon: Shield,
    title: 'Academic-Grade Privacy',
    description: 'Student data protection with education-specific compliance that other platforms lack.',
    benefit: 'Your data stays private'
  }
];

export function CompetitiveAdvantages() {
  return (
    <div className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Why Choose{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CourseConnect AI
            </span>{' '}
            Over Competitors?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We're not just another study app. Compare our cutting-edge AI tutoring and collaboration features side-by-side.
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden mb-20"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left p-6 font-semibold text-gray-900 dark:text-white">
                    Features
                  </th>
                  {competitors.map((competitor) => (
                    <th key={competitor.name} className={`text-center p-6 font-semibold ${
                      competitor.highlight 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      <div className="flex flex-col items-center">
                        <div className="text-2xl mb-2">{competitor.logo}</div>
                        <div className="font-bold">{competitor.name}</div>
                        <div className="text-sm opacity-80">{competitor.price}</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <motion.tr
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`border-b border-gray-200 dark:border-gray-700 ${
                      index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <td className="p-6 font-medium text-gray-900 dark:text-white">
                      {feature}
                    </td>
                    {competitors.map((competitor) => (
                      <td key={competitor.name} className="text-center p-6">
                        {competitor.features[feature] ? (
                          <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${
                            competitor.highlight
                              ? 'bg-green-500 text-white'
                              : 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                          }`}>
                            <Check className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${
                            competitor.highlight
                              ? 'bg-red-500 text-white'
                              : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                          }`}>
                            <X className="h-5 w-5" />
                          </div>
                        )}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Key Advantages */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Unique Advantages
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              What makes CourseConnect AI the smart choice for serious students
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {advantages.map((advantage, index) => (
              <motion.div
                key={advantage.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <advantage.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {advantage.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      {advantage.description}
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-full">
                      <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                        {advantage.benefit}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Study Smarter?
            </h3>
            <p className="text-xl opacity-90 mb-6 max-w-2xl mx-auto">
              Join thousands of students who've switched to CourseConnect AI for better grades and study collaboration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-300">
                Start Free Trial
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300">
                View Pricing
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
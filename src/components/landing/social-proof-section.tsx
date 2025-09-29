'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, Users, MessageSquare, Award, CheckCircle } from 'lucide-react';

const universities = [
  'Stanford', 'MIT', 'Harvard', 'UC Berkeley', 'Yale', 'Princeton'
];

const testimonials = [
  {
    name: 'Sarah Chen',
    university: 'Georgia State University (GSU)',
    major: 'Computer Science',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    quote: 'CourseConnect AI helped me boost my GPA from 3.2 to 3.8 in one semester. The AI tutor understood exactly where I was struggling with calculus.',
    gpaBefore: '3.2',
    gpaAfter: '3.8',
    improvement: '+0.6 GPA'
  },
  {
    name: 'Marcus Rodriguez',
    university: 'Kennesaw State University (KSU)',
    major: 'Engineering',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
    quote: 'Finding study groups for my engineering courses was impossible before CourseConnect. Now I collaborate with classmates from day one.',
    gpaBefore: '3.0',
    gpaAfter: '3.6',
    improvement: '+0.6 GPA'
  },
  {
    name: 'Priya Patel',
    university: 'University of Georgia (UGA)',
    major: 'Biology',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
    quote: 'The AI explained organic chemistry concepts in ways my professor never could. I went from failing to getting an A-!',
    gpaBefore: '2.8',
    gpaAfter: '3.4',
    improvement: '+0.6 GPA'
  }
];

const stats = [
  {
    icon: Users,
    number: '10,000+',
    label: 'Active Students',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: MessageSquare,
    number: '500,000+',
    label: 'Questions Answered',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: TrendingUp,
    number: '23%',
    label: 'Average GPA Improvement',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: Award,
    number: '500+',
    label: 'Universities Supported',
    color: 'from-orange-500 to-orange-600'
  }
];

export function SocialProofSection() {
  return (
    <div className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* University Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
            Trusted by students at top universities around the world
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {universities.map((university, index) => (
              <div key={university} className="flex items-center">
                <div className="text-xl font-bold text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                  {university}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Usage Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Real Results from Real Students
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              See how CourseConnect AI is transforming academic success for students nationwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
              >
                {/* GPA Improvement Badge */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    GPA: {testimonial.gpaBefore} → {testimonial.gpaAfter}
                  </div>
                  <div className="text-green-600 font-semibold text-sm">
                    {testimonial.improvement}
                  </div>
                </div>

                {/* Quote */}
                <blockquote className="text-gray-700 dark:text-gray-300 mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.major}, {testimonial.university}
                    </div>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Student Data Protected</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>30-Day Money Back Guarantee</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

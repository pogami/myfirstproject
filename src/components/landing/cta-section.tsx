'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Users, BarChart3 } from 'lucide-react';

export function CTASection() {
  return (
    <div className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse delay-500"></div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4 mr-2" />
            AI-Powered Study Platform
          </div>

          {/* Main Headline */}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Ready to ace your{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              courses?
            </span>
          </h2>

          {/* Subheadline with Logo */}
          <div className="flex flex-col items-center gap-4 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <img 
                src="/pageicon.png" 
                alt="CourseConnect Logo" 
                className="h-10 w-auto md:h-12 md:w-auto"
              />
              <span className="text-xl md:text-2xl text-white font-bold">
                CourseConnect AI
              </span>
            </div>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed text-center">
              Upload your syllabus, chat with AI tutors, get assignment reminders, and create flashcards to ace your courses.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => window.location.href = '/login'}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white/20 px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm transition-all duration-300 shadow-lg bg-white/10"
              onClick={() => window.location.href = '/login?state=signup'}
            >
              <Users className="mr-2 h-5 w-5" />
              Join Now
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-white/90">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm">AI-Powered Tutoring</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-white/90">
              <BarChart3 className="h-5 w-5" />
              <span className="text-sm">Study Analytics</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

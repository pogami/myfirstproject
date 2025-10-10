"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Zap, Brain, Users, BookOpen, MessageSquare, Shield, Star, Plus } from 'lucide-react';
import Image from 'next/image';

const educationPlatforms = [
  {
    name: 'CourseConnect AI',
    logo: '/courseconnect-logo-profile.svg',
    description: 'Academic-focused AI with study groups',
    features: {
      'Academic Context': true,
      'Study Groups': true,
      'Syllabus Analysis': true,
      'Real-time Chat': true,
      'File Upload': true,
      'Free Tier': true,
      'Campus Integration': true
    },
    price: '$4.99/mo',
    highlight: true,
    color: 'from-blue-500 to-purple-600'
  },
  {
    name: 'Chegg',
    logo: '/logos/chegg-logo.svg',
    description: 'Homework help and textbook solutions',
    features: {
      'Academic Context': true,
      'Study Groups': false,
      'Syllabus Analysis': false,
      'Real-time Chat': true,
      'File Upload': true,
      'Free Tier': false,
      'Campus Integration': false
    },
    price: '$14.95/mo',
    color: 'from-orange-500 to-red-500'
  },
  {
    name: 'Course Hero',
    logo: '/logos/course-hero-logo.svg',
    description: 'Study resources and tutoring',
    features: {
      'Academic Context': true,
      'Study Groups': false,
      'Syllabus Analysis': false,
      'Real-time Chat': true,
      'File Upload': true,
      'Free Tier': false,
      'Campus Integration': false
    },
    price: '$19.95/mo',
    color: 'from-blue-600 to-blue-800'
  },
  {
    name: '+ More',
    logo: null,
    description: 'Other education platforms',
    features: {
      'Academic Context': false,
      'Study Groups': false,
      'Syllabus Analysis': false,
      'Real-time Chat': false,
      'File Upload': false,
      'Free Tier': false,
      'Campus Integration': false
    },
    price: 'Varies',
    color: 'from-gray-400 to-gray-600',
    isMore: true
  }
];

const aiPlatforms = [
  {
    name: 'CourseConnect AI',
    logo: '/courseconnect-logo-profile.svg',
    description: 'Academic-focused AI with study groups',
    features: {
      'Academic Context': true,
      'Study Groups': true,
      'Syllabus Analysis': true,
      'Real-time Chat': true,
      'File Upload': true,
      'Free Tier': true,
      'Campus Integration': true
    },
    price: '$4.99/mo',
    highlight: true,
    color: 'from-blue-500 to-purple-600'
  },
  {
    name: 'ChatGPT',
    logo: '🤖',
    description: 'General-purpose AI assistant',
    features: {
      'Academic Context': false,
      'Study Groups': false,
      'Syllabus Analysis': false,
      'Real-time Chat': true,
      'File Upload': true,
      'Free Tier': true,
      'Campus Integration': false
    },
    price: '$20/mo',
    color: 'from-green-500 to-emerald-600'
  },
  {
    name: 'Gemini',
    logo: '💎',
    description: 'Google\'s multimodal AI',
    features: {
      'Academic Context': false,
      'Study Groups': false,
      'Syllabus Analysis': false,
      'Real-time Chat': true,
      'File Upload': true,
      'Free Tier': true,
      'Campus Integration': false
    },
    price: 'Free',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    name: 'Claude',
    logo: '🧠',
    description: 'Anthropic\'s AI assistant',
    features: {
      'Academic Context': false,
      'Study Groups': false,
      'Syllabus Analysis': false,
      'Real-time Chat': true,
      'File Upload': true,
      'Free Tier': true,
      'Campus Integration': false
    },
    price: '$20/mo',
    color: 'from-orange-500 to-red-600'
  },
  {
    name: '+ More',
    logo: null,
    description: 'Other AI platforms',
    features: {
      'Academic Context': false,
      'Study Groups': false,
      'Syllabus Analysis': false,
      'Real-time Chat': false,
      'File Upload': false,
      'Free Tier': false,
      'Campus Integration': false
    },
    price: 'Varies',
    color: 'from-gray-400 to-gray-600',
    isMore: true
  }
];

const features = [
  'Academic Context',
  'Study Groups', 
  'Syllabus Analysis',
  'Real-time Chat',
  'File Upload',
  'Free Tier',
  'Campus Integration'
];

const PlatformCard = ({ platform, features }: { platform: any, features: string[] }) => (
  <Card 
    className={`relative border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
      platform.highlight 
        ? 'ring-2 ring-primary/20 bg-gradient-to-br from-primary/5 to-primary/10' 
        : 'bg-gradient-to-br from-card to-card/50'
    }`}
  >
    {platform.highlight && (
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
        <Badge className="bg-primary text-primary-foreground shadow-lg">
          <Star className="w-3 h-3 mr-1" />
          Best for Students
        </Badge>
      </div>
    )}
    
    <CardHeader className="text-center pb-4">
      <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${platform.color} flex items-center justify-center mb-3 shadow-lg overflow-hidden`}>
        {platform.logo && platform.logo.startsWith('/') ? (
          <div className="w-12 h-12 flex items-center justify-center bg-white/90 rounded-lg p-1">
            <Image 
              src={platform.logo} 
              alt={platform.name}
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
            />
          </div>
        ) : platform.isMore ? (
          <div className="w-12 h-12 flex items-center justify-center">
            <Plus className="w-8 h-8 text-white" />
          </div>
        ) : (
          <span className="text-2xl">{platform.logo}</span>
        )}
      </div>
      <CardTitle className="text-lg">{platform.name}</CardTitle>
      <p className="text-sm text-muted-foreground">{platform.description}</p>
      <div className="mt-3">
        {platform.price === 'Free' ? (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-3 py-1">
            Free
          </Badge>
        ) : platform.price === 'Varies' ? (
          <Badge variant="outline" className="px-3 py-1">
            Varies
          </Badge>
        ) : platform.highlight ? (
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg px-3 py-2 text-white shadow-lg">
            <div className="text-lg font-bold">{platform.price}</div>
            <div className="text-xs opacity-90">per month</div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg px-3 py-2 border border-primary/20">
            <div className="text-lg font-bold text-primary">{platform.price}</div>
            <div className="text-xs text-muted-foreground">per month</div>
          </div>
        )}
      </div>
    </CardHeader>
    
    <CardContent className="pt-0">
      <div className="space-y-2">
        {features.map((feature) => (
          <div key={feature} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{feature}</span>
            <div className="flex items-center">
              {platform.features[feature as keyof typeof platform.features] ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export function AIComparisonSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Star className="w-3 h-3 mr-1" />
            Platform Comparison
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            CourseConnect AI vs Other Platforms
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            See how CourseConnect AI compares to other education and AI platforms. 
            Built specifically for students with academic-focused features.
          </p>
        </div>

        {/* Education Platforms Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">vs. Other Education Platforms</h3>
            <p className="text-muted-foreground">Compare CourseConnect AI with traditional education platforms</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {educationPlatforms.map((platform) => (
              <PlatformCard key={platform.name} platform={platform} features={features} />
            ))}
          </div>
        </div>

        {/* AI Platforms Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">vs. Other AI Platforms</h3>
            <p className="text-muted-foreground">Compare CourseConnect AI with general-purpose AI assistants</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {aiPlatforms.map((platform) => (
              <PlatformCard key={platform.name} platform={platform} features={features} />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="border-0 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Ready to Experience CourseConnect AI?</h3>
              <p className="text-muted-foreground mb-6">
                Join thousands of students who are already using CourseConnect AI to excel in their studies.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-4 py-2">
                  <Shield className="w-4 h-4 mr-2" />
                  Affordable Pricing
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 px-4 py-2">
                  <Users className="w-4 h-4 mr-2" />
                  2,500+ Students
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 px-4 py-2">
                  <Star className="w-4 h-4 mr-2" />
                  4.9/5 Rating
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

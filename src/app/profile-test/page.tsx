"use client";

import React from 'react';
import { ProfileHoverCard, ProfileData } from '@/components/profile-hover-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User, GraduationCap } from 'lucide-react';

// Test profile data
const testProfiles: ProfileData[] = [
  {
    id: 'ai-tutor',
    name: 'CourseConnect AI',
    role: 'ai-tutor',
    bio: 'Your intelligent study companion powered by advanced AI. I can help with homework, explain concepts, and provide personalized learning assistance.',
    capabilities: ['Homework Help', 'Concept Explanation', 'Study Planning', 'Test Prep'],
    subjects: ['Mathematics', 'Science', 'English', 'History', 'Computer Science'],
    rating: 4.9,
    experience: 'Always Available'
  },
  {
    id: 'student-alex',
    name: 'Alex Johnson',
    role: 'student',
    school: 'Stanford University',
    major: 'Computer Science',
    year: 'Junior',
    skills: ['React', 'Python', 'Machine Learning'],
    rating: 4.8,
    earnings: 2500
  },
  {
    id: 'instructor-sarah',
    name: 'Dr. Sarah Chen',
    role: 'instructor',
    school: 'MIT',
    subjects: ['Advanced Mathematics', 'Calculus', 'Linear Algebra'],
    coursesCreated: 12,
    rating: 4.9,
    hourlyRate: 85,
    earnings: 45000
  }
];

export default function ProfileTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-slate-800 dark:text-slate-200">
          Profile Card Test Demo
        </h1>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold mb-6 text-slate-700 dark:text-slate-300">
            Hover over the avatars and names below to see profile cards:
          </h2>
          
          <div className="space-y-8">
            {/* AI Tutor Test */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                <ProfileHoverCard 
                  profile={testProfiles[0]}
                  placement="top"
                  delay={200}
                  onAction={() => {
                    console.log('AI Tutor action clicked');
                    alert('AI Tutor clicked!');
                  }}
                >
                  <Avatar className="h-12 w-12 border-2 border-blue-200 dark:border-blue-700 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      <Bot className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                </ProfileHoverCard>
                
                <ProfileHoverCard 
                  profile={testProfiles[0]}
                  placement="top"
                  delay={200}
                  onAction={() => {
                    console.log('AI Tutor name action clicked');
                    alert('AI Tutor name clicked!');
                  }}
                >
                  <span className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    CourseConnect AI
                  </span>
                </ProfileHoverCard>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Hover over the avatar or name to see the AI tutor profile card
              </p>
            </div>

            {/* Student Test */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                <ProfileHoverCard 
                  profile={testProfiles[1]}
                  placement="top"
                  delay={200}
                  onAction={() => {
                    console.log('Student action clicked');
                    alert('Student clicked!');
                  }}
                >
                  <Avatar className="h-12 w-12 border-2 border-green-200 dark:border-green-700 cursor-pointer hover:ring-2 hover:ring-green-400 transition-all">
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-teal-500 text-white">
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                </ProfileHoverCard>
                
                <ProfileHoverCard 
                  profile={testProfiles[1]}
                  placement="top"
                  delay={200}
                  onAction={() => {
                    console.log('Student name action clicked');
                    alert('Student name clicked!');
                  }}
                >
                  <span className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Alex Johnson
                  </span>
                </ProfileHoverCard>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Hover over the avatar or name to see the student profile card
              </p>
            </div>

            {/* Instructor Test */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                <ProfileHoverCard 
                  profile={testProfiles[2]}
                  placement="top"
                  delay={200}
                  onAction={() => {
                    console.log('Instructor action clicked');
                    alert('Instructor clicked!');
                  }}
                >
                  <Avatar className="h-12 w-12 border-2 border-purple-200 dark:border-purple-700 cursor-pointer hover:ring-2 hover:ring-purple-400 transition-all">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      <GraduationCap className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                </ProfileHoverCard>
                
                <ProfileHoverCard 
                  profile={testProfiles[2]}
                  placement="top"
                  delay={200}
                  onAction={() => {
                    console.log('Instructor name action clicked');
                    alert('Instructor name clicked!');
                  }}
                >
                  <span className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    Dr. Sarah Chen
                  </span>
                </ProfileHoverCard>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Hover over the avatar or name to see the instructor profile card
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Debug Instructions:</h3>
            <ol className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
              <li>1. Open browser console (F12 → Console)</li>
              <li>2. Hover over any avatar or name above</li>
              <li>3. Look for "ProfileHoverCard showCard called for profile: [name]" in console</li>
              <li>4. Profile card should appear after 200ms delay</li>
              <li>5. Click the action button to test interactions</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

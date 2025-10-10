"use client";

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, Upload, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActivityItem {
  id: string;
  user: string;
  university: string;
  course: string;
  timestamp: number;
  action: 'uploaded' | 'joined' | 'analyzed';
}

export default function LiveActivityPill() {
  const [currentActivity, setCurrentActivity] = useState<ActivityItem | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [activityCount, setActivityCount] = useState(0);

  // Real activity tracking
  useEffect(() => {
    // Listen for real syllabus uploads
    const handleSyllabusUpload = async (event: CustomEvent) => {
      const { courseName, university, professor, courseCode } = event.detail;
      
      // Track via API
      try {
        await fetch('/api/activity/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseName, university, professor, courseCode })
        });
      } catch (error) {
        console.log('Activity tracking failed:', error);
      }
      
      // Update count and show count activity
      setActivityCount(prev => prev + 1);
      
      // Always show count activity instead of individual activities
      const countActivity: ActivityItem = {
        id: 'count',
        user: `${activityCount + 1}`,
        university: 'students',
        course: 'syllabi processed',
        timestamp: Date.now(),
        action: 'analyzed'
      };
      
      setCurrentActivity(countActivity);
    };

    // Listen for real activity
    window.addEventListener('syllabus-uploaded', handleSyllabusUpload as EventListener);
    

    return () => {
      window.removeEventListener('syllabus-uploaded', handleSyllabusUpload as EventListener);
    };
  }, [activityCount]);

  // Load persistent count on component mount and refresh periodically
  useEffect(() => {
    const loadPersistentCount = async () => {
      try {
        const response = await fetch('/api/activity/track');
        const data = await response.json();
        if (data.activityCount) {
          setActivityCount(data.activityCount);
        }
      } catch (error) {
        console.log('Failed to load persistent count:', error);
      }
    };
    
    loadPersistentCount();
    
    // Refresh count every 10 seconds to stay updated
    const interval = setInterval(loadPersistentCount, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Always show count activity (even when 0)
  useEffect(() => {
    const showCountActivity: ActivityItem = {
      id: 'count',
      user: `${activityCount}`,
      university: 'students',
      course: 'syllabi processed',
      timestamp: Date.now(),
      action: 'analyzed'
    };
    setCurrentActivity(showCountActivity);
  }, [activityCount]);

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 120) return '1 minute ago';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    return `${Math.floor(seconds / 3600)} hours ago`;
  };

  // Show dynamic count when there's activity
  if (currentActivity && currentActivity.id === 'count') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center mb-8"
      >
        <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">LIVE</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Zap className="size-3 text-purple-600 dark:text-purple-400" />
              <span className="font-semibold text-gray-800 dark:text-gray-200">{activityCount}</span>
              <span className="text-green-600 dark:text-green-400 hidden sm:inline">syllabi were just analyzed</span>
              <span className="text-green-600 dark:text-green-400 sm:hidden">analyzed</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Show individual activity (with null check)
  if (!currentActivity) {
    return null; // Don't render anything if no activity
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center mb-8"
    >
      <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm max-w-full">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">LIVE</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            {currentActivity.action === 'uploaded' && <Upload className="size-3 text-green-600 dark:text-green-400" />}
            {currentActivity.action === 'joined' && <Users className="size-3 text-blue-600 dark:text-blue-400" />}
            {currentActivity.action === 'analyzed' && <Zap className="size-3 text-purple-600 dark:text-purple-400" />}
            <span className="font-semibold text-gray-800 dark:text-gray-200">{currentActivity.user}</span>
            <span className="text-green-600 dark:text-green-400 hidden sm:inline">from</span>
            <span className="text-green-600 dark:text-green-400 sm:hidden">@</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">{currentActivity.university}</span>
            <span className="text-green-600 dark:text-green-400 hidden sm:inline">
              {currentActivity.action === 'uploaded' && 'uploaded'}
              {currentActivity.action === 'joined' && 'joined'}
              {currentActivity.action === 'analyzed' && 'processed'}
            </span>
            <span className="text-green-600 dark:text-green-400 sm:hidden">
              {currentActivity.action === 'uploaded' && '+'}
              {currentActivity.action === 'joined' && '→'}
              {currentActivity.action === 'analyzed' && '⚡'}
            </span>
            <span className="font-bold text-gray-800 dark:text-gray-200">{currentActivity.course}</span>
            <span className="text-xs text-green-600/70 dark:text-green-400/70 ml-1 hidden sm:inline">
              {formatTimeAgo(currentActivity.timestamp)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
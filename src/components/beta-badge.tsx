"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BetaBadge() {
  const [showReportForm, setShowReportForm] = useState(false);
  const [bugTitle, setBugTitle] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmitBug = () => {
    if (!bugTitle.trim()) return;

    setIsSubmitting(true);

    // Save to localStorage for developer feedback page
    const bugReport = {
      type: 'bug',
      title: bugTitle,
      description: bugDescription,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    };

    try {
      const existingReports = JSON.parse(localStorage.getItem('bug-reports') || '[]');
      existingReports.unshift(bugReport);
      localStorage.setItem('bug-reports', JSON.stringify(existingReports));

      // Dispatch event for real-time updates on feedback page
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bugReported', { detail: bugReport }));
      }

      // Show success message
      setShowSuccess(true);
      setBugTitle('');
      setBugDescription('');
      
      setTimeout(() => {
        setShowSuccess(false);
        setShowReportForm(false);
      }, 2500);
    } catch (error) {
      console.error('Failed to save bug report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex justify-center mb-8"
      >
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          {/* Beta Badge */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                Beta
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-500">v0.1.0</span>
          </div>
          
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
          
          {/* Report Button */}
          <button
            onClick={() => setShowReportForm(true)}
            className="group inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 rounded transition-colors"
          >
            <Bug className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
            <span>Report Issue</span>
          </button>
        </div>
      </motion.div>

      {/* Bug Report Modal */}
      <AnimatePresence>
        {showReportForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={() => !showSuccess && setShowReportForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full"
            >
              {!showSuccess ? (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Bug className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Report an Issue
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowReportForm(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Issue Title *
                      </label>
                      <input
                        type="text"
                        value={bugTitle}
                        onChange={(e) => setBugTitle(e.target.value)}
                        placeholder="e.g., Chat not loading, AI response error..."
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Description (optional)
                      </label>
                      <textarea
                        value={bugDescription}
                        onChange={(e) => setBugDescription(e.target.value)}
                        placeholder="What happened? What were you doing when the issue occurred?"
                        rows={4}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm resize-none"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => setShowReportForm(false)}
                        variant="ghost"
                        className="flex-1"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmitBug}
                        disabled={!bugTitle.trim() || isSubmitting}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Report'}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 flex flex-col items-center justify-center gap-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                      Report Submitted!
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Thank you for helping us improve CourseConnect
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


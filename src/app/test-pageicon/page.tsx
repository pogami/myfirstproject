"use client";

import { Metadata } from 'next';

export default function TestPageiconPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Genuine Preview Test - All Platforms
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Desktop Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Desktop Preview</h2>
            <div className="border rounded-lg p-4 bg-white dark:bg-slate-800">
              <div className="flex gap-3">
                <img 
                  src="/genuine.png" 
                  alt="CourseConnect" 
                  className="w-16 h-16 rounded object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2">
                    CourseConnect AI - Your AI-Powered Study Companion
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                    Upload your syllabus and let AI help you ace your courses. Get personalized study plans, interactive quizzes, and smart tutoring tailored to your classes.
                  </p>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    courseconnectai.com
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Mobile Preview</h2>
            <div className="border rounded-lg p-3 bg-white dark:bg-slate-800 max-w-xs">
              <div className="space-y-2">
                <div>
                  <img 
                    src="/opengraph2.png" 
                    alt="CourseConnect" 
                    className="w-full h-32 rounded object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2">
                    CourseConnect AI - Your AI-Powered Study Companion
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    Upload your syllabus and let AI help you ace your courses.
                  </p>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    courseconnectai.com
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Twitter Card Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Twitter Card</h2>
            <div className="border rounded-lg bg-white dark:bg-slate-800">
              <img 
                src="/opengraph2.png" 
                alt="CourseConnect" 
                className="w-full h-48 rounded-t-lg object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-sm leading-tight mb-2">
                  CourseConnect AI - Your AI-Powered Study Companion
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Upload your syllabus and let AI help you ace your courses. Get personalized study plans, interactive quizzes, and smart tutoring tailored to your classes.
                </p>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  courseconnectai.com
                </div>
              </div>
            </div>
          </div>

          {/* Facebook Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Facebook Preview</h2>
            <div className="border rounded-lg bg-white dark:bg-slate-800">
              <img 
                src="/opengraph2.png" 
                alt="CourseConnect" 
                className="w-full h-40 rounded-t-lg object-cover"
              />
              <div className="p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">COURSECONNECTAI.COM</div>
                <h3 className="font-semibold text-sm leading-tight mb-2">
                  CourseConnect AI - Your AI-Powered Study Companion
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Upload your syllabus and let AI help you ace your courses. Get personalized study plans, interactive quizzes, and smart tutoring tailored to your classes.
                </p>
              </div>
            </div>
          </div>

          {/* LinkedIn Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">LinkedIn Preview</h2>
            <div className="border rounded-lg bg-white dark:bg-slate-800">
              <div className="flex items-start">
                <img 
                  src="/genuine.png" 
                  alt="CourseConnect" 
                  className="w-20 h-20 rounded-l-lg object-cover flex-shrink-0 mt-4 ml-2"
                />
                <div className="p-4 flex-1">
                  <h3 className="font-semibold text-sm leading-tight mb-1">
                    CourseConnect AI - Your AI-Powered Study Companion
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Upload your syllabus and let AI help you ace your courses. Get personalized study plans, interactive quizzes, and smart tutoring tailored to your classes.
                  </p>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    courseconnectai.com
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">WhatsApp Preview</h2>
            <div className="border rounded-lg p-3 bg-white dark:bg-slate-800 max-w-xs">
              <div className="space-y-2">
                <div>
                  <img 
                    src="/opengraph2.png" 
                    alt="CourseConnect" 
                    className="w-full h-24 rounded object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2">
                    CourseConnect AI - Your AI-Powered Study Companion
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    Upload your syllabus and let AI help you ace your courses.
                  </p>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    courseconnectai.com
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Raw Image Display */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Raw OpenGraph2 Image</h2>
          <div className="flex justify-center">
            <img 
              src="/opengraph2.png" 
              alt="OpenGraph2 Raw" 
              className="max-w-full h-auto rounded-lg border"
            />
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Direct URL: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">/opengraph2.png</code>
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">How to Test:</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Share this page URL on different platforms</li>
            <li>• Check how favicon-32x32.png appears in each preview</li>
            <li>• Test on mobile vs desktop</li>
            <li>• Compare with current social sharing images</li>
          </ul>
        </div>

      </div>
    </div>
  );
}

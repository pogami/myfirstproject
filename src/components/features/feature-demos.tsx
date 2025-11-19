'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, FileText, CheckCircle, Upload, MessageCircle, Shield, Globe, Bell, Zap } from 'lucide-react';

interface FeatureDemosProps {
    title: string;
}

export function FeatureDemos({ title }: FeatureDemosProps) {
    switch (title) {
        case 'AI-Powered Class Chats':
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/50 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-700/50 pb-4">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 bg-red-400/80 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-400/80 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-400/80 rounded-full"></div>
                            </div>
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-2">CS 101 - AI Tutor</span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                                    <MessageSquare className="h-4 w-4 text-white" />
                                </div>
                                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl rounded-tl-none p-4 max-w-[85%] shadow-sm border border-gray-100 dark:border-gray-700">
                                    <p className="text-sm text-gray-800 dark:text-white leading-relaxed">Hi! I know your CS 101 syllabus. How can I help with your programming assignment?</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 justify-end">
                                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl rounded-tr-none p-4 max-w-[85%] shadow-lg shadow-purple-500/20">
                                    <p className="text-sm leading-relaxed">What's the deadline for Project 2?</p>
                                </div>
                                <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Users className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                                </div>
                            </div>

                            <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="flex items-start gap-3"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                                    <MessageSquare className="h-4 w-4 text-white" />
                                </div>
                                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            );

        case 'Syllabus Upload & Analysis':
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/50 relative overflow-hidden"
                >
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-700/50 pb-4">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 bg-red-400/80 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-400/80 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-400/80 rounded-full"></div>
                            </div>
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-2">Analysis</span>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                        <Upload className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">CS 101 - Intro to Programming</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Processing syllabus...</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs p-2 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-lg">
                                        <span className="text-gray-600 dark:text-gray-300">Assignments Found</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">8 Projects</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs p-2 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-lg">
                                        <span className="text-gray-600 dark:text-gray-300">Exams Detected</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">3 Exams</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs p-2 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-lg">
                                        <span className="text-gray-600 dark:text-gray-300">Grading Scheme</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">Extracted</span>
                                    </div>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/30"
                            >
                                <CheckCircle className="h-4 w-4" />
                                <span className="font-medium">Syllabus successfully analyzed</span>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            );

        case 'General AI Chat':
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/50 relative overflow-hidden"
                >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-blue-500/5 to-indigo-500/5 pointer-events-none" />

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-700/50 pb-4">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 bg-red-400/80 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-400/80 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-400/80 rounded-full"></div>
                            </div>
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-2">Universal Chat</span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <MessageCircle className="h-4 w-4 text-white" />
                                </div>
                                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl rounded-tl-none p-4 max-w-[85%] shadow-sm border border-gray-100 dark:border-gray-700">
                                    <p className="text-sm text-gray-800 dark:text-white leading-relaxed">Hi! I can help with any academic question across all subjects. What do you need help with?</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 justify-end">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-none p-4 max-w-[85%] shadow-lg shadow-blue-500/20">
                                    <p className="text-sm leading-relaxed">Can you explain the concept of photosynthesis?</p>
                                </div>
                                <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Users className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                                </div>
                            </div>

                            <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="flex items-start gap-3"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <MessageCircle className="h-4 w-4 text-white" />
                                </div>
                                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            );

        case 'Smart Notifications':
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/50 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-700/50 pb-4">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 bg-red-400/80 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-400/80 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-400/80 rounded-full"></div>
                            </div>
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-2">Alerts</span>
                        </div>

                        <div className="space-y-3">
                            <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border-l-4 border-blue-500 shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">Assignment Due</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Calculus homework due in 2 hours</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 4, delay: 1, repeat: Infinity, ease: "easeInOut" }}
                                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border-l-4 border-green-500 shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">Study Group</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">New member joined your group</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 4, delay: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border-l-4 border-purple-500 shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <Bell className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">AI Suggestion</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Time for your daily study session</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            );

        case 'File Management':
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/50 relative overflow-hidden"
                >
                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mb-10 pointer-events-none" />

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-700/50 pb-4">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 bg-red-400/80 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-400/80 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-400/80 rounded-full"></div>
                            </div>
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-2">Files</span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors cursor-pointer group">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                                    <FileText className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">CS101_Syllabus.pdf</p>
                                    <p className="text-xs text-gray-500">2.4 MB • Uploaded 2h ago</p>
                                </div>
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors cursor-pointer group">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
                                    <FileText className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">MATH201_Syllabus.pdf</p>
                                    <p className="text-xs text-gray-500">1.8 MB • Uploaded yesterday</p>
                                </div>
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="flex items-center gap-3 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                            >
                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                    <Upload className="h-5 w-5 text-gray-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Upload new syllabus...</span>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            );

        default:
            return null;
    }
}

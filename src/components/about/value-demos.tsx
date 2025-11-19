'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Lightbulb, Heart, Star, Zap, MessageCircle } from 'lucide-react';

interface ValueDemosProps {
    title: string;
}

export function ValueDemos({ title }: ValueDemosProps) {
    switch (title) {
        case 'Student-Centered':
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/50 relative overflow-hidden"
                >
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-700/50 pb-4">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 bg-red-400/80 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-400/80 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-400/80 rounded-full"></div>
                            </div>
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-2">Roadmap</span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100/50 dark:bg-blue-900/30 rounded-lg">
                                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">Student Success Features</span>
                            </div>

                            <div className="space-y-3 pl-2">
                                {[
                                    { label: 'AI Chat', status: 'Live', color: 'green' },
                                    { label: 'Syllabus Analysis', status: 'Working', color: 'green' },
                                    { label: 'Study Tools', status: 'Coming Soon', color: 'blue' }
                                ].map((item, i) => (
                                    <motion.div
                                        key={item.label}
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center justify-between text-sm p-2 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                                    >
                                        <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${item.color === 'green' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-blue-500'}`}></div>
                                            <span className={`text-xs font-medium ${item.color === 'green' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30"
                            >
                                <div className="flex items-center gap-3">
                                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300">"Building with students, for students"</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            );

        case 'Academic Excellence':
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/50 relative overflow-hidden"
                >
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-700/50 pb-4">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 bg-red-400/80 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-400/80 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-400/80 rounded-full"></div>
                            </div>
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-2">AI Core</span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-lg">
                                    <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">Excellence Tools</span>
                            </div>

                            <div className="space-y-3 pl-2">
                                {[
                                    { label: 'Smart Chat', status: 'Live', color: 'green' },
                                    { label: 'Deep Analysis', status: 'Working', color: 'green' },
                                    { label: 'Study Plans', status: 'Coming Soon', color: 'blue' }
                                ].map((item, i) => (
                                    <motion.div
                                        key={item.label}
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center justify-between text-sm p-2 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                                    >
                                        <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${item.color === 'green' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-blue-500'}`}></div>
                                            <span className={`text-xs font-medium ${item.color === 'green' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                animate={{ scale: [1, 1.02, 1] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800/30"
                            >
                                <div className="flex items-center gap-3">
                                    <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Empowering academic success</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            );

        case 'Innovation':
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/50 relative overflow-hidden"
                >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-yellow-500/5 to-orange-500/5 pointer-events-none" />

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-700/50 pb-4">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 bg-red-400/80 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-400/80 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-400/80 rounded-full"></div>
                            </div>
                            <span className="text-sm text-gray-500 ml-2">Dev Hub</span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-lg">
                                    <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">Current Features</span>
                            </div>

                            <div className="space-y-3 pl-2">
                                {['AI-Powered Chat', 'Syllabus Upload', 'Smart Analysis'].map((feature, i) => (
                                    <div key={feature} className="flex items-center gap-3 text-sm p-2">
                                        <motion.div
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
                                            className="w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                                        />
                                        <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <motion.div
                                animate={{ opacity: [0.8, 1, 0.8] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-yellow-100 dark:border-yellow-800/30"
                            >
                                <div className="flex items-center gap-3">
                                    <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                    <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">Building the future of education</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            );

        case 'Community':
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/50 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-700/50 pb-4">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 bg-red-400/80 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-400/80 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-400/80 rounded-full"></div>
                            </div>
                            <span className="text-sm text-gray-500 ml-2">Vision</span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-pink-100/50 dark:bg-pink-900/30 rounded-lg">
                                    <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                                </div>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">Community Goals</span>
                            </div>

                            <div className="space-y-3 pl-2">
                                {[
                                    { label: 'Study Groups', status: 'In Development' },
                                    { label: 'Peer Connections', status: 'Planned' },
                                    { label: 'Knowledge Sharing', status: 'Future' }
                                ].map((item, i) => (
                                    <motion.div
                                        key={item.label}
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center justify-between text-sm p-2 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                                    >
                                        <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                                        <span className="text-xs font-medium text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/30 px-2 py-1 rounded-full">
                                            {item.status}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="mt-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl p-4 border border-pink-100 dark:border-pink-800/30"
                            >
                                <div className="flex items-center gap-3">
                                    <MessageCircle className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                                    <span className="text-xs font-medium text-pink-700 dark:text-pink-300">Connecting students worldwide</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            );

        default:
            return null;
    }
}

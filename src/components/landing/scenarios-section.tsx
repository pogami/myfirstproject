'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Zap, Clock, AlertTriangle, MessageSquare, TrendingUp } from 'lucide-react';

const scenarios = [
    {
        title: "The Overwhelmed Freshman",
        quote: "5 new syllabi, 200 pages of reading, and no clue where to start.",
        solution: "CourseConnect organizes every deadline into one master calendar instantly.",
        icon: Calendar,
        color: "text-blue-500",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        borderColor: "border-blue-100 dark:border-blue-800"
    },
    {
        title: "The Pre-Med Student",
        quote: "Need to memorize complex chemical pathways for Organic Chemistry.",
        solution: "AI generates active recall flashcards directly from lecture slides.",
        icon: Zap,
        color: "text-purple-500",
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
        borderColor: "border-purple-100 dark:border-purple-800"
    },
    {
        title: "The Working Student",
        quote: "Balancing a part-time job with full-time classes.",
        solution: "Smart scheduling finds the perfect study gaps in your busy week.",
        icon: Clock,
        color: "text-orange-500",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
        borderColor: "border-orange-100 dark:border-orange-800"
    },
    {
        title: "The Last-Minute Crammer",
        quote: "Exam is tomorrow and you haven't started reviewing.",
        solution: "Get a prioritized 'Triage Plan' focusing on high-yield topics.",
        icon: AlertTriangle,
        color: "text-red-500",
        bgColor: "bg-red-50 dark:bg-red-900/20",
        borderColor: "border-red-100 dark:border-red-800"
    },
    {
        title: "The Visual Learner",
        quote: "Textbooks are dense and boring.",
        solution: "Chat with your AI tutor to get simple analogies and diagrams.",
        icon: MessageSquare,
        color: "text-pink-500",
        bgColor: "bg-pink-50 dark:bg-pink-900/20",
        borderColor: "border-pink-100 dark:border-pink-800"
    },
    {
        title: "The High Achiever",
        quote: "Aiming for a 4.0 GPA across all subjects.",
        solution: "Track your mastery level for every topic in real-time.",
        icon: TrendingUp,
        color: "text-green-500",
        bgColor: "bg-green-50 dark:bg-green-900/20",
        borderColor: "border-green-100 dark:border-green-800"
    }
];

export function ScenariosSection() {
    return (
        <section className="py-24 bg-white dark:bg-gray-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight"
                    >
                        Study smarter in <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">every scenario.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
                    >
                        Whether you're ahead of schedule or pulling an all-nighter, we've got your back.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scenarios.map((scenario, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-8 rounded-2xl border ${scenario.borderColor} ${scenario.bgColor} hover:shadow-lg transition-all duration-300 group`}
                        >
                            <div className={`w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                <scenario.icon className={`w-6 h-6 ${scenario.color}`} />
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                {scenario.title}
                            </h3>

                            <div className="mb-4 relative">
                                <span className="absolute -left-2 -top-2 text-4xl text-gray-300 dark:text-gray-600 opacity-50 font-serif">"</span>
                                <p className="text-gray-600 dark:text-gray-300 italic relative z-10 pl-2">
                                    {scenario.quote}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                                <p className="text-sm font-medium text-gray-900 dark:text-white flex items-start gap-2">
                                    <span className="text-lg">💡</span>
                                    {scenario.solution}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}

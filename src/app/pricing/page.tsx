'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Star, Zap, Crown, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';
import { CourseConnectLogo } from '@/components/icons/courseconnect-logo';
import { useTheme } from '@/contexts/theme-context';
import { AISupportWidget } from '@/components/ai-support-widget';

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const plans = [
    {
      name: 'Free',
      price: 'Free',
      period: '',
      description: 'Try CourseConnect without a credit card and learn the basics fast.',
      features: [
        'Core CourseConnect tools',
        '100 starter credits',
        'One agent workspace',
        'Community support & guides'
      ],
      cta: 'Start for free',
      popular: false,
      icon: Star
    },
    {
      name: 'Pro',
      price: isYearly ? '$20' : '$20',
      yearlyPrice: '$20',
      monthlyPrice: '$20',
      period: '',
      description: 'Run larger campaigns with premium tools and more agents.',
      features: [
        'Everything in Free',
        '500 monthly credits',
        'Premium automation tools',
        'Up to 5 agents',
        'Priority email help',
        'Scheduling & analytics'
      ],
      cta: 'Get started',
      popular: true,
      icon: Zap
    },
    {
      name: 'Ultra',
      price: isYearly ? '$50' : '$50',
      yearlyPrice: '$50',
      monthlyPrice: '$50',
      period: '',
      description: 'Scale content production with unlimited agents and early access.',
      features: [
        'Everything in Pro',
        '1,500 monthly credits',
        'Unlimited agents & workspaces',
        'Early beta access',
        'Dedicated success partner',
        'Team usage insights'
      ],
      cta: 'Get started',
      popular: false,
      icon: Crown
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/home" className="flex items-center gap-2">
            <CourseConnectLogo className="h-6 w-6" />
            <span className="text-xl font-bold text-white">CourseConnect AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/home">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Header */}
      <div className="relative bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-100 mb-6">
              Simple Pricing
            </h1>
            
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Choose the best plan for your needs.
            </p>

            {/* Pricing Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <button
                onClick={() => setIsYearly(!isYearly)}
                className="relative inline-flex items-center rounded-full bg-gray-800 p-1"
              >
                <span className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  !isYearly 
                    ? 'bg-white text-gray-900' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}>
                  Monthly
                </span>
                <span className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  isYearly 
                    ? 'bg-white text-gray-900' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}>
                  Yearly
                </span>
                <span className="text-xs text-gray-500 ml-2">Save 20%</span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              className={`relative bg-gray-800 rounded-2xl p-6 shadow-lg border transition-all duration-300 hover:shadow-2xl cursor-pointer ${
                plan.popular 
                  ? 'border-blue-500 scale-105' 
                  : 'border-gray-700 hover:border-gray-600'
              } ${selectedPlan === plan.name ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
              onClick={() => setSelectedPlan(selectedPlan === plan.name ? null : plan.name)}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    🔥 Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-100 mb-4">
                  {plan.name}
                </h3>
                
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-100">
                    {plan.price}
                  </span>
                </div>
                
                <p className="text-gray-400">
                  {plan.description}
                </p>
              </div>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <motion.li 
                    key={featureIndex} 
                    className="flex items-start gap-3 group"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    </motion.div>
                    <span className="text-gray-300 group-hover:text-gray-100 transition-colors">
                      {feature}
                    </span>
                  </motion.li>
                ))}
              </ul>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="w-full py-2.5 text-base font-semibold rounded-lg transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => window.location.href = '/login'}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-800 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-100 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400">
              Everything you need to know about our pricing and plans.
            </p>
          </motion.div>
          
          <div className="space-y-4">
            {[
              {
                question: "Can I change plans anytime?",
                answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
              },
              {
                question: "Is there a free trial?",
                answer: "Yes! Both Pro and Ultra plans come with a 14-day free trial. No credit card required to start."
              },
              {
                question: "What happens to my data if I cancel?",
                answer: "Your data is always yours. You can export your study materials, chat history, and progress data before canceling."
              },
              {
                question: "Do you offer student discounts?",
                answer: "Yes! We offer 50% off for verified students with a valid .edu email address. Contact support for details."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
                className="bg-gray-700 rounded-lg shadow-sm overflow-hidden border border-gray-600"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-600 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-100 pr-4">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: expandedFAQ === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {expandedFAQ === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-0">
                        <motion.p
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -10, opacity: 0 }}
                          transition={{ duration: 0.2, delay: 0.1 }}
                          className="text-gray-300 leading-relaxed"
                        >
                          {faq.answer}
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <SiteFooter />
      <AISupportWidget />
    </div>
  );
}
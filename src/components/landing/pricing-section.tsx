'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X, Star, Zap, Crown, Users } from 'lucide-react';
import { CCLogo } from '@/components/icons/cc-logo';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    icon: Users,
    color: 'from-gray-500 to-gray-600',
    features: [
      'Upload unlimited syllabi',
      'Join study groups',
      'Unlimited AI chat',
      'Community support',
      'Mobile app access'
    ],
    limitations: [
      'No study analytics',
      'Basic file processing'
    ],
    cta: 'Get Started Free',
    popular: false
  },
  {
    name: 'Scholar',
    price: '$4.99',
    period: '/month',
    description: 'Most popular for students',
    icon: Zap,
    color: 'from-blue-500 to-purple-500',
    features: [
      'Advanced syllabus processing',
      'Advanced AI tutoring',
      'Priority support',
      'Study analytics & insights',
      'Advanced file processing',
      'Export study materials',
      'Custom study plans'
    ],
    limitations: [],
    cta: 'Start Scholar Trial',
    popular: true
  },
  {
    name: 'University',
    price: 'Custom',
    period: '',
    description: 'For institutions and departments',
    icon: Crown,
    color: 'from-purple-500 to-pink-500',
    features: [
      'Campus-wide deployment',
      'Admin dashboard',
      'Custom branding',
      'Integration support',
      'Dedicated account manager',
      'Advanced analytics',
      'Bulk user management',
      'API access',
      'White-label options'
    ],
    limitations: [],
    cta: 'Contact Sales',
    popular: false
  }
];

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div id="pricing" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Simple, transparent{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              pricing
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8"
          >
            Choose the plan that works best for you. Upgrade or downgrade at any time.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Save 20%
              </span>
            )}
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                plan.popular 
                  ? 'border-blue-500 dark:border-blue-400' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    Most Popular
                  </div>
                </div>
              )}


              {/* Plan Header */}
              <div className="text-center mb-8">
                {plan.name === 'Scholar' ? (
                  <div className="mx-auto mb-4 flex items-center justify-center">
                    <CCLogo className="h-16 w-auto" />
                  </div>
                ) : (
                  <div className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <plan.icon className="h-8 w-8 text-white" />
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.name === 'University' ? plan.price : isAnnual ? `$${(parseFloat(plan.price.replace('$', '')) * 0.8).toFixed(2)}` : plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300 ml-1">
                    {plan.period}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {feature}
                    </span>
                  </div>
                ))}
                {plan.limitations.map((limitation, limitationIndex) => (
                  <div key={limitationIndex} className="flex items-start gap-3 opacity-60">
                    <X className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {limitation}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                className={`w-full py-3 text-lg font-semibold rounded-xl transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                }`}
                onClick={() => window.location.href = '/pricing'}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                question: 'Can I change plans anytime?',
                answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.'
              },
              {
                question: 'Is there a free trial?',
                answer: 'Yes, Scholar plan comes with a 14-day free trial. No credit card required.'
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards, PayPal, and bank transfers for annual plans.'
              },
              {
                question: 'Do you offer student discounts?',
                answer: 'Yes, we offer 50% off for verified students with a valid .edu email address.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {faq.question}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

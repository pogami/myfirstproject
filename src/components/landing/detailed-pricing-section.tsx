'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X, Star, Zap, Crown, Users, ChevronDown, ChevronUp } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    icon: Users,
    color: 'from-gray-500 to-gray-600',
    status: '',
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
    cta: 'Get Started Free'
  },
  {
    name: 'Scholar',
    price: '$4.99',
    period: '/month',
    description: 'Most popular for students',
    icon: Zap,
    color: 'from-blue-500 to-purple-500',
    status: 'Most Popular',
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
    cta: 'Start Scholar Trial'
  },
  {
    name: 'University',
    price: 'Custom',
    period: '',
    description: 'For institutions and departments',
    icon: Crown,
    color: 'from-purple-500 to-pink-500',
    status: 'Most Popular',
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
    cta: 'Contact Sales'
  }
];

const faqs = [
  {
    question: 'Can I change plans anytime?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
    detailed: 'When you upgrade or downgrade, your billing cycle resets and you\'ll be charged the prorated amount. For downgrades, unused features remain active until the end of your current billing period.'
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes, Scholar plan comes with a 14-day free trial. No credit card required.',
    detailed: 'Your trial gives you full access to all Scholar features. You can cancel anytime during the trial period with no charges. No hidden fees or commitment required.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers for annual plans.',
    detailed: 'We support Visa, Mastercard, American Express, Discover, and PayPal. For annual plans over $500, we also accept ACH bank transfers with a 2% discount.'
  },
  {
    question: 'Do you offer student discounts?',
    answer: 'Yes, we offer 50% off for verified students with a valid .edu email address.',
    detailed: 'To get student pricing, verify your .edu email address during signup. You keep the discount as long as your student status is valid. We may ask for renewal confirmation annually.'
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, cancel your subscription anytime from your account settings.',
    detailed: 'Cancellations take effect at the end of your current billing period. You\'ll continue to have access to plan features until then. No cancellation fees apply.'
  },
  {
    question: 'Is there a money-back guarantee?',
    answer: 'Yes, we offer a 30-day money-back guarantee on all paid plans.',
    detailed: 'If you\'re not satisfied within 30 days of your first payment, contact our support team for a full refund. No questions asked.'
  }
];

export function DetailedPricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const handleFaqToggle = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? -1 : index);
  };

  return (
    <div id="detailed-pricing" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Choose the plan that works best for you. Upgrade or downgrade at any time.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`font-medium transition-colors duration-300 ${!isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                isAnnual ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <motion.span
                animate={{ x: isAnnual ? 24 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
              />
            </button>
            <span className={`font-medium transition-colors duration-300 ${isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm bg-gradient-to-r from-green-400 to-green-500 text-white px-3 py-1 rounded-full font-medium shadow-lg"
              >
                Save 20%
              </motion.span>
            )}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className={`relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 ${
                plan.status === 'Most Popular' ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
              }`}
            >
              {/* Status Badge */}
              {plan.status === 'Most Popular' && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    {plan.status}
                  </div>
                </motion.div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <motion.div
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.2 }}
                  className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
                >
                  <plan.icon className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <motion.span
                    key={plan.price}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-4xl font-bold text-gray-900 dark:text-white"
                  >
                    {isAnnual && plan.name === 'Scholar' ? '$40' : plan.price}
                  </motion.span>
                  {plan.name !== 'University' && (
                    <span className="text-gray-600 dark:text-gray-400 ml-1">/month</span>
                  )}
                </div>
                {isAnnual && plan.name === 'Scholar' && (
                  <div className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                    Billed annually ($40/year)
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <motion.div
                    key={featureIndex}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: featureIndex * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    </motion.div>
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {feature}
                    </span>
                  </motion.div>
                ))}
                {plan.limitations.map((limitation, limitationIndex) => (
                  <motion.div
                    key={limitationIndex}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: limitationIndex * 0.05 }}
                    className="flex items-start gap-3 opacity-60"
                  >
                    <X className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {limitation}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className={`w-full py-3 text-lg font-semibold rounded-xl transition-all duration-300 ${
                    plan.status === 'Most Popular'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                  }`}
                  onClick={() => window.location.href = '/pricing'}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Interactive FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-all duration-300 ${
                  openFaqIndex === index ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600' : ''
                }`}
                style={{ 
                  borderRadius: openFaqIndex === index ? '12px' : '0',
                  marginBottom: openFaqIndex === index ? '16px' : '0'
                }}
              >
                <motion.button
                  onClick={() => handleFaqToggle(index)}
                  className="w-full text-left p-6 focus:outline-none"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-lg pr-4">
                      {faq.question}
                    </h4>
                    <motion.div
                      animate={{ rotate: openFaqIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      {openFaqIndex === index ? (
                        <ChevronUp className="h-5 w-5 text-blue-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </motion.div>
                  </div>
                </motion.button>

                <AnimatePresence>
                  {openFaqIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-2">
                        <p className="text-gray-600 dark:text-gray-300 mb-3 text-lg font-medium">
                          {faq.answer}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                          {faq.detailed}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Newsletter CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white">
              <h4 className="text-xl font-bold mb-2">Still have questions?</h4>
              <p className="opacity-90 mb-4">Our support team is here to help you choose the right plan.</p>
              <Button
                variant="outline"
                className="bg-white text-blue-600 hover:bg-gray-100 border-white font-semibold px-6 py-2 rounded-lg"
                onClick={() => window.open('mailto:support@courseconnectai.com')}
              >
                Contact Support
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
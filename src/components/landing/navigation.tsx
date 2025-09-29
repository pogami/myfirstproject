'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const navigation = [
  { name: 'Features', href: '/features' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Testimonials', href: '#testimonials' },
  { name: 'About', href: '/about' },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-transparent'
          : 'bg-transparent'
      }`}
    >
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isScrolled ? 'px-4' : ''}`}>
        <div className={`flex items-center ${isScrolled ? 'h-12' : 'h-16'}`}>
          {isScrolled ? (
            /* Scrolled state - Full pill shape with gap from top */
            <div className="flex items-center bg-white/10 dark:bg-gray-900/10 backdrop-blur-md shadow-lg border border-white/20 dark:border-gray-700/20 rounded-full px-12 py-6 gap-16 mt-4">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity duration-200">
                <img 
                  src="/courseconnect-favicon.svg" 
                  alt="CourseConnect Logo" 
                  className="w-8 h-8"
                />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  CourseConnect AI
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-16">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium text-lg"
                  >
                    {item.name}
                  </a>
                ))}
              </div>

              {/* Desktop CTA */}
              <div className="hidden md:flex items-center gap-8">
                <Button
                  variant="ghost"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-lg px-8 py-4 h-12"
                  onClick={() => window.location.href = '/auth'}
                >
                  Sign In
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-lg px-10 py-4 h-12"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Get Started
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </div>
            </div>
          ) : (
            /* Normal state - Full width layout */
            <>
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200">
                <img 
                  src="/courseconnect-favicon.svg" 
                  alt="CourseConnect Logo" 
                  className="w-8 h-8"
                />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  CourseConnect AI
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8 ml-auto mr-8">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium"
                  >
                    {item.name}
                  </a>
                ))}
              </div>

              {/* Desktop CTA */}
              <div className="hidden md:flex items-center gap-4">
                <Button
                  variant="ghost"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => window.location.href = '/auth'}
                >
                  Sign In
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {/* Mobile Menu Button */}
          {!isScrolled && (
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-bottom"
          >
            <div className="px-4 py-4 space-y-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 h-12"
                  onClick={() => window.location.href = '/auth'}
                >
                  Sign In
                </Button>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white h-12"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile bottom action bar (always visible when menu closed) */}
      {!isOpen && (
        <div className="mobile-nav md:hidden safe-bottom">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <Button 
              variant="outline" 
              className="flex-1 h-12"
              onClick={() => window.location.href = '/auth'}
            >
              Sign In
            </Button>
            <Button 
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              onClick={() => window.location.href = '/dashboard'}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </motion.nav>
  );
}

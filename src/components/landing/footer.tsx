'use client';

import React, { useState } from 'react';
import { Github, Twitter, Linkedin, Mail, ArrowRight, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/theme-context';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { CCLogo } from '@/components/icons/cc-logo';
import Link from 'next/link';

const footerLinks = {
  product: [
    { name: 'Features', href: '/features' },
  ],
  company: [
    { name: 'About', href: '/about' },
    // { name: 'Contact', href: '/contact' },
    // { name: 'Status', href: '/status' },
  ],
  resources: [
    // { name: 'Changelog', href: '/changelog' },
  ],
  legal: [
    // { name: 'Privacy Policy', href: '/privacy' },
    // { name: 'Terms of Service', href: '/terms' },
  ],
};

const socialLinks = [
  { 
    name: 'GitHub', 
    icon: Github,
  },
  { 
    name: 'Twitter', 
    icon: Twitter,
  },
  { 
    name: 'LinkedIn', 
    icon: Linkedin,
  },
  { 
    name: 'Email', 
    icon: Mail,
  },
];

export function Footer() {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('🎉 Successfully Subscribed!', {
          description: 'Check your email for a welcome message!',
          duration: 5000,
        });
        setEmail('');
        
        // Enhanced confetti animation
        const duration = 4500; // Longer duration
        const animationEnd = Date.now() + duration;
        const defaults = { 
          startVelocity: 35, // Slightly higher velocity
          spread: 360, 
          ticks: 90, // Longer particle life
          zIndex: 0,
          gravity: 0.75, // More noticeable gravity
          drift: 0.05, // Slight horizontal drift
          scalar: 1.2, // Slightly larger particles
          shapes: ['circle', 'square', 'star'], // Add different shapes
          colors: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#8B5A2B', '#FFD700', '#C0C0C0'] // More colors
        };

        function randomInRange(min: number, max: number) {
          return Math.random() * (max - min) + min;
        }

        const interval: NodeJS.Timeout = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 75 * (timeLeft / duration); // Start with more particles
          
          // Launch from left
          confetti(Object.assign({}, defaults, { 
            particleCount: particleCount, 
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
          }));
          // Launch from right
          confetti(Object.assign({}, defaults, { 
            particleCount: particleCount, 
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
          }));
          // Optional: Add a central burst occasionally
          if (Math.random() > 0.7) {
            confetti(Object.assign({}, defaults, {
              particleCount: particleCount / 2,
              angle: randomInRange(60, 120),
              spread: randomInRange(40, 70),
              origin: { x: 0.5, y: 0.5 }
            }));
          }
        }, 200); // Slightly faster interval for more continuous flow
      } else {
        toast.error('Subscription Failed', {
          description: data.error || 'Please try again later.',
          duration: 4000,
        });
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to subscribe. Please try again.',
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <footer className="bg-white text-black dark:bg-gray-900 dark:text-white" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <CCLogo className="h-12 w-auto" />
              <span className="text-xl font-bold">CourseConnect <span className="text-blue-600 dark:text-blue-500">AI</span></span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              Get instant AI help, analyze your syllabus, and ace your courses with personalized study tools.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <button
                  key={social.name}
                  onClick={() => {
                    toast.info('Coming Soon', {
                      description: `${social.name} link will be available soon!`,
                      duration: 3000,
                    });
                  }}
                  aria-label={social.name}
                  className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-all duration-200 hover:scale-110 transform cursor-pointer"
                  title={`${social.name} - Coming Soon`}
                >
                  <social.icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-black dark:text-white uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-black dark:text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links - Hidden */}
          {/* <div>
            <h3 className="text-sm font-semibold text-black dark:text-white uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div> */}

          {/* Legal Links - Hidden */}
          {/* <div>
            <h3 className="text-sm font-semibold text-black dark:text-white uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div> */}
        </div>

        {/* Newsletter Section - Hidden for first stage */}
        {/* <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                Stay updated with CourseConnect <span className="text-blue-600 dark:text-blue-500">AI</span>
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get the latest updates, features, and study tips delivered to your inbox.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 md:w-64 px-4 py-2 bg-white border border-gray-300 rounded-l-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                required
              />
              <Button 
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2 rounded-l-none rounded-r-lg"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </div> */}

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            © 2025 CourseConnect <span className="text-blue-600 dark:text-blue-500">AI</span>. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <Button
              variant="outline"
              className="h-9 px-3 text-sm border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>}
            </Button>
            <div className="flex flex-col items-end gap-1">
              <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
                Made with
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-red-500">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
                for students
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

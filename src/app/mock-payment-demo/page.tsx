'use client';

import { MockPaymentSystem } from '@/components/mock-payment-system';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MockPaymentDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/pricing" className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pricing
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Custom Payment System Demo</h1>
          <div></div>
        </div>
      </header>

      <main className="container mx-auto py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Custom Payment System Demo</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            This demonstrates what a custom payment system would look like. 
            <strong className="text-red-600">This is for demonstration only - no real payments are processed.</strong>
          </p>
        </div>

        <MockPaymentSystem />

        {/* Comparison Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Custom vs Stripe Comparison</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Custom System */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-4">
                Custom Payment System
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-red-600">❌</span>
                  <span>Requires PCI DSS compliance ($500K+ cost)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-600">❌</span>
                  <span>Years of development time</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-600">❌</span>
                  <span>Massive security liability</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-600">❌</span>
                  <span>Need financial services licenses</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-600">❌</span>
                  <span>24/7 monitoring required</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-600">❌</span>
                  <span>Fraud protection algorithms</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-600">❌</span>
                  <span>International payment regulations</span>
                </li>
              </ul>
            </div>

            {/* Stripe */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-4">
                Stripe (Current Setup)
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>PCI compliant out of the box</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Setup in hours, not years</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Stripe handles all security</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>No special licenses needed</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Built-in fraud protection</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Apple Pay, Google Pay included</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Works in 40+ countries</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              <strong>Recommendation:</strong> Stick with Stripe and focus on building amazing features for CourseConnect! 🚀
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}



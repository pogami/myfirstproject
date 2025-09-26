'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CreditCard, XCircle, DollarSign, Calendar, Shield } from 'lucide-react';
import Link from 'next/link';

export default function PaymentTestFailuresPage() {
  const failureScenarios = [
    {
      id: 'card_declined',
      title: 'Card Declined',
      description: 'Bank rejects the transaction',
      icon: <XCircle className="h-6 w-6 text-red-500" />,
      testCard: '4000 0000 0000 0002',
      reason: 'Generic decline - no specific reason given',
      severity: 'high'
    },
    {
      id: 'insufficient_funds',
      title: 'Insufficient Funds',
      description: 'Not enough money in account',
      icon: <DollarSign className="h-6 w-6 text-orange-500" />,
      testCard: '4000 0000 0000 9995',
      reason: 'Account has insufficient funds',
      severity: 'high'
    },
    {
      id: 'expired_card',
      title: 'Expired Card',
      description: 'Card has passed expiry date',
      icon: <Calendar className="h-6 w-6 text-yellow-500" />,
      testCard: '4000 0000 0000 0069',
      reason: 'Card has expired',
      severity: 'medium'
    },
    {
      id: 'incorrect_cvc',
      title: 'Incorrect CVC',
      description: 'Wrong security code',
      icon: <Shield className="h-6 w-6 text-blue-500" />,
      testCard: '4000 0000 0000 0127',
      reason: 'CVC check failed',
      severity: 'medium'
    },
    {
      id: 'processing_error',
      title: 'Processing Error',
      description: 'Temporary system issue',
      icon: <AlertCircle className="h-6 w-6 text-purple-500" />,
      testCard: '4000 0000 0000 0119',
      reason: 'Processing error occurred',
      severity: 'low'
    },
    {
      id: 'network_error',
      title: 'Network Error',
      description: 'Connection timeout or failure',
      icon: <AlertCircle className="h-6 w-6 text-gray-500" />,
      testCard: 'Simulate network failure',
      reason: 'Connection to payment processor failed',
      severity: 'medium'
    },
    {
      id: 'invalid_card',
      title: 'Invalid Card',
      description: 'Card number format is invalid',
      icon: <XCircle className="h-6 w-6 text-red-400" />,
      testCard: '1234 5678 9012 3456',
      reason: 'Card number format is invalid',
      severity: 'medium'
    },
    {
      id: 'rate_limit',
      title: 'Rate Limited',
      description: 'Too many attempts made',
      icon: <AlertCircle className="h-6 w-6 text-yellow-600" />,
      testCard: 'Multiple failed attempts',
      reason: 'Rate limit exceeded',
      severity: 'low'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950 p-4">
      <div className="container mx-auto max-w-6xl py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Payment Failure Test Scenarios</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Test different payment failure scenarios to see how CourseConnect handles errors gracefully.
            These are Stripe test cards that simulate real-world payment failures.
          </p>
        </div>

        {/* Warning */}
        <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <AlertCircle className="h-5 w-5" />
            <span className="font-semibold">Test Mode Only</span>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            These test cards only work in Stripe test mode. No real money will be charged.
          </p>
        </div>

        {/* Failure Scenarios Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {failureScenarios.map((scenario) => {
            const severityColors = {
              high: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20',
              medium: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20',
              low: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20'
            };
            
            const severityLabels = {
              high: 'High Impact',
              medium: 'Medium Impact', 
              low: 'Low Impact'
            };

            return (
              <Card key={scenario.id} className={`hover:shadow-lg transition-shadow ${severityColors[scenario.severity]}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {scenario.icon}
                      <div>
                        <CardTitle className="text-lg">{scenario.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{scenario.description}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      scenario.severity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      scenario.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {severityLabels[scenario.severity]}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs font-mono text-muted-foreground mb-1">Test Card:</p>
                    <p className="font-mono text-sm font-semibold">{scenario.testCard}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Reason:</p>
                    <p className="text-sm">{scenario.reason}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild className="flex-1" variant="outline">
                      <Link href={`/payment-failed?error=${scenario.id}`}>
                        View Error Page
                      </Link>
                    </Button>
                    <Button asChild className="flex-1" variant="secondary">
                      <Link href={`/payment-failed?error=${scenario.id}&message=${encodeURIComponent(scenario.reason)}`}>
                        With Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Test Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              How to Test Payment Failures
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Method 1: Direct Error Pages</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Click the "View Error Page" buttons above to see how each error type is handled.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• See specific error messages</li>
                  <li>• View helpful suggestions</li>
                  <li>• Test the user experience</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Method 2: Live Payment Testing</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Use the test cards in the actual checkout flow to see real Stripe error handling.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Go to /custom-checkout</li>
                  <li>• Use the test card numbers</li>
                  <li>• Experience the full error flow</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <Link href="/custom-checkout">
                <CreditCard className="mr-2 h-5 w-5" />
                Test Live Checkout
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/pricing">
                Back to Pricing
              </Link>
            </Button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            CourseConnect provides comprehensive error handling for all payment scenarios, 
            ensuring users get clear feedback and helpful guidance when payments fail.
          </p>
        </div>
      </div>
    </div>
  );
}

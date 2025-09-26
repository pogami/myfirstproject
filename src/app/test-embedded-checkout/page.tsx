'use client';

import { EmbeddedStripeCheckout } from '@/components/embedded-stripe-checkout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TestEmbeddedCheckoutPage() {
  const priceId = process.env.NEXT_PUBLIC_STRIPE_SCHOLAR_PRICE_ID;

  if (!priceId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Payment Setup Required</h2>
          <p className="text-muted-foreground mb-4">
            Stripe configuration needed. Contact support to enable payments.
          </p>
          <Button asChild>
            <Link href="/pricing">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Plans
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950">
      {/* Simple Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/home" className="flex items-center gap-2">
            <h1 className="text-xl font-bold">CourseConnect</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/pricing">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Test Info */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🧪 Test Embedded Checkout</h1>
          <p className="text-muted-foreground mb-4">
            This page tests the embedded Stripe checkout functionality.
            <br />
            Use test card: <code className="bg-muted px-2 py-1 rounded">4242 4242 4242 4242</code>
          </p>
          <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-lg text-sm">
            ⚠️ This is a test environment. No real payments will be processed.
          </div>
        </div>

        {/* Checkout Form */}
        <div className="bg-background rounded-lg border p-6 shadow-lg">
          <EmbeddedStripeCheckout
            priceId={priceId}
            planName="Scholar"
            onSuccess={() => {
              console.log('Payment successful!');
              alert('🎉 Payment successful! Check the console for details.');
            }}
            onCancel={() => {
              console.log('Payment cancelled');
              alert('Payment cancelled');
            }}
          />
        </div>

        {/* Test Instructions */}
        <div className="mt-8 bg-muted/50 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Test Instructions:</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Use test card: <code>4242 4242 4242 4242</code></li>
            <li>Any future expiry date (e.g., 12/25)</li>
            <li>Any 3-digit CVC (e.g., 123)</li>
            <li>Any ZIP code (e.g., 12345)</li>
            <li>Click "Start Free Trial" to test the payment flow</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

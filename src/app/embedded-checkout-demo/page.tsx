'use client';

import { EmbeddedStripeCheckout } from '@/components/embedded-stripe-checkout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CreditCard, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export default function EmbeddedCheckoutDemoPage() {
  const priceId = process.env.NEXT_PUBLIC_STRIPE_SCHOLAR_PRICE_ID;

  if (!priceId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/home" className="flex items-center gap-2">
            <h1 className="text-xl font-bold">CourseConnect</h1>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle variant="ghost" size="sm" />
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
        {/* Demo Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary p-3 rounded-full">
              <CreditCard className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Embedded Checkout Demo</h1>
          <p className="text-muted-foreground mb-4">
            This demonstrates the embedded Stripe checkout form integrated directly into your site.
            No redirects to external pages - everything happens right here!
          </p>
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-6">
            <CheckCircle className="h-4 w-4" />
            Fully integrated payment experience
          </div>
        </div>

        {/* Plan Summary */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Scholar Plan</CardTitle>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-3xl font-bold">$4.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              14-day free trial
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Unlimited AI tutoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Voice input & analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Image analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Advanced analytics</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Calendar integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Focus music</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Early access features</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Embedded Checkout */}
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle>Complete Your Subscription</CardTitle>
            <p className="text-muted-foreground">Secure payment powered by Stripe</p>
          </CardHeader>
          <CardContent>
            <EmbeddedStripeCheckout
              priceId={priceId}
              planName="Scholar"
              onSuccess={() => {
                window.location.href = '/dashboard';
              }}
              onCancel={() => {
                window.location.href = '/pricing';
              }}
            />
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold mb-4">Why Embedded Checkout?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-2">🎨 Full Design Control</h4>
              <p className="text-muted-foreground">Match your site's exact branding and theme</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-2">⚡ Faster Experience</h4>
              <p className="text-muted-foreground">No redirects or page loads - seamless flow</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-2">🔒 Same Security</h4>
              <p className="text-muted-foreground">Powered by Stripe's secure infrastructure</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

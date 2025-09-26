'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CreditCard, RefreshCw, ArrowLeft, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const sessionId = searchParams.get('session_id');
  const message = searchParams.get('message');

  // Common payment failure scenarios
  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case 'card_declined':
        return {
          title: 'Card Declined',
          message: 'Your card was declined by your bank. This could be due to insufficient funds, expired card, or bank restrictions.',
          suggestions: [
            'Check your account balance',
            'Verify your card details',
            'Contact your bank if the issue persists',
            'Try a different payment method'
          ]
        };
      case 'insufficient_funds':
        return {
          title: 'Insufficient Funds',
          message: 'Your account doesn\'t have enough funds to complete this transaction.',
          suggestions: [
            'Add money to your account',
            'Use a different payment method',
            'Try a different card with sufficient balance'
          ]
        };
      case 'expired_card':
        return {
          title: 'Expired Card',
          message: 'The card you\'re trying to use has expired.',
          suggestions: [
            'Use a different card with a valid expiry date',
            'Update your card information',
            'Contact your bank for a new card'
          ]
        };
      case 'incorrect_cvc':
        return {
          title: 'Incorrect CVC',
          message: 'The security code (CVC) you entered is incorrect.',
          suggestions: [
            'Double-check the 3-digit code on the back of your card',
            'For American Express, use the 4-digit code on the front',
            'Make sure you\'re entering the correct security code'
          ]
        };
      case 'processing_error':
        return {
          title: 'Processing Error',
          message: 'We encountered an error while processing your payment. This is usually temporary.',
          suggestions: [
            'Wait a few minutes and try again',
            'Check your internet connection',
            'Try a different payment method',
            'Contact support if the problem continues'
          ]
        };
      case 'user_cancelled':
        return {
          title: 'Payment Cancelled',
          message: 'You cancelled the payment process. No charges were made to your account.',
          suggestions: [
            'You can try again anytime',
            'Contact us if you need help choosing a plan',
            'Check out our free features in the meantime'
          ]
        };
      case 'network_error':
        return {
          title: 'Connection Error',
          message: 'We couldn\'t connect to our payment processor. This is usually a temporary network issue.',
          suggestions: [
            'Check your internet connection',
            'Wait a few minutes and try again',
            'Try using a different network',
            'Contact support if the problem persists'
          ]
        };
      case 'invalid_card':
        return {
          title: 'Invalid Card Information',
          message: 'The card information you entered appears to be invalid or incomplete.',
          suggestions: [
            'Double-check your card number',
            'Verify the expiry date (MM/YY format)',
            'Make sure the CVC code is correct',
            'Try a different payment method'
          ]
        };
      case 'rate_limit':
        return {
          title: 'Too Many Attempts',
          message: 'You\'ve made too many payment attempts. Please wait before trying again.',
          suggestions: [
            'Wait 15-30 minutes before retrying',
            'Contact support if you need immediate assistance',
            'Try using a different payment method'
          ]
        };
      default:
        return {
          title: 'Payment Failed',
          message: 'We couldn\'t process your payment. Please try again or contact support if the issue persists.',
          suggestions: [
            'Double-check your payment information',
            'Try a different payment method',
            'Contact your bank to ensure the card is active',
            'Reach out to our support team for assistance'
          ]
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-orange-50 to-yellow-50 dark:from-red-950 dark:via-orange-950 dark:to-yellow-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Error Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center shadow-2xl">
            <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-4xl font-bold text-red-600 dark:text-red-400 mb-4">
            Payment Failed
          </h1>
          <p className="text-xl text-muted-foreground">
            We couldn't complete your subscription
          </p>
        </div>

        {/* Error Details */}
        <Card className="mb-8 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-500" />
              {errorInfo.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-6">
                {errorInfo.message}
              </p>
              {message && (
                <div className="bg-muted/30 rounded-lg p-4 mb-6">
                  <p className="text-sm font-mono text-muted-foreground">
                    <strong>Technical Details:</strong> {decodeURIComponent(message)}
                  </p>
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                What you can do:
              </h3>
              <ul className="space-y-2">
                {errorInfo.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary font-bold">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Session Info (for debugging) */}
            {sessionId && (
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Session ID: {sessionId}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <Link href="/custom-checkout">
                <RefreshCw className="mr-2 h-5 w-5" />
                Try Again
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/pricing">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Plans
              </Link>
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/contact">
                <HelpCircle className="mr-2 h-4 w-4" />
                Contact Support
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <CreditCard className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Our support team is here to assist you with any payment issues.
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/client';

interface CustomCheckoutProps {
  priceId: string;
  planName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CustomCheckout({ priceId, planName, onSuccess, onCancel }: CustomCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [user] = useAuthState(auth);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to continue with payment.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.uid,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.sessionId) {
        // Redirect to Stripe Checkout
        const stripe = await import('@stripe/stripe-js').then(({ loadStripe }) => 
          loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
        );
        
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({
            sessionId: data.sessionId,
          });

          if (error) {
            // Handle different types of Stripe errors
            let errorType = 'processing_error';
            let errorMessage = error.message;
            
            if (error.message.includes('declined')) {
              errorType = 'card_declined';
            } else if (error.message.includes('insufficient')) {
              errorType = 'insufficient_funds';
            } else if (error.message.includes('expired')) {
              errorType = 'expired_card';
            } else if (error.message.includes('cvc') || error.message.includes('security code')) {
              errorType = 'incorrect_cvc';
            }
            
            // Redirect to payment failed page with error details
            window.location.href = `/payment-failed?error=${errorType}&message=${encodeURIComponent(errorMessage)}`;
            return;
          }
        }
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Payment Summary */}
        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Plan</span>
            <span className="font-semibold">{planName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Price</span>
            <span className="font-semibold">$4.99/month</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Trial</span>
            <span className="text-green-600 font-semibold">14 days free</span>
          </div>
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-green-600">$0.00</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              After trial: $4.99/month • Cancel anytime
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Button>
          <Button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Start Free Trial
              </>
            )}
          </Button>
        </div>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            🔒 Secure payment powered by Stripe • Your card information is encrypted
          </p>
        </div>
      </div>
    </div>
  );
}

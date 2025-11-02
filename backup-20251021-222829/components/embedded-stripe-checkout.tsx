'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, CheckCircle, ArrowLeft, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/client';
import confetti from 'canvas-confetti';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface EmbeddedCheckoutProps {
  priceId: string;
  planName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutForm({ priceId, planName, onSuccess, onCancel }: EmbeddedCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const [user] = useAuthState(auth);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !user) {
      return;
    }

    setIsLoading(true);

    try {
      // Submit the form to create a subscription
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        throw submitError;
      }

      // Create subscription with the payment method
      const subscriptionResponse = await fetch('/api/stripe/create-subscription', {
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

      const { subscriptionId, clientSecret, status } = await subscriptionResponse.json();

      if (status === 'incomplete' && clientSecret) {
        // Confirm the payment for the subscription
        const { error: paymentError } = await stripe.confirmPayment({
          elements,
          clientSecret,
          redirect: 'never',
        });

        if (paymentError) {
          throw paymentError;
        }
      }

      // Payment succeeded
      setIsSuccess(true);
      toast({
        title: "🎉 Payment Successful!",
        description: "Welcome to Scholar! Your subscription is now active.",
      });

      // Show confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: NodeJS.Timeout = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Launch confetti from different positions
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      // Redirect to success page after a moment
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (error: any) {
      console.error('Payment error:', error);
      
      // Handle specific error types
      let errorType = 'processing_error';
      let errorMessage = error.message;
      
      if (error.message?.includes('declined')) {
        errorType = 'card_declined';
      } else if (error.message?.includes('insufficient')) {
        errorType = 'insufficient_funds';
      } else if (error.message?.includes('expired')) {
        errorType = 'expired_card';
      } else if (error.message?.includes('cvc') || error.message?.includes('security code')) {
        errorType = 'incorrect_cvc';
      }
      
      // Redirect to payment failed page
      window.location.href = `/payment-failed?error=${errorType}&message=${encodeURIComponent(errorMessage)}`;
      return;
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
          Payment Successful! 🎉
        </h3>
        <p className="text-muted-foreground">
          Redirecting you to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <PaymentElement 
          options={{
            layout: 'tabs',
            fields: {
              billingDetails: {
                name: 'auto',
                email: 'auto',
                phone: 'auto',
                address: 'auto',
              },
            },
          }}
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-2 border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-50/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 shadow-none hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Plans
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isLoading}
          className="flex-1 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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

      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
          <Shield className="h-3 w-3 text-green-600 dark:text-green-400" />
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Secure payment powered by Stripe • SSL encrypted
          </p>
        </div>
      </div>
    </form>
  );
}

export function EmbeddedStripeCheckout({ priceId, planName, onSuccess, onCancel }: EmbeddedCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const createPaymentIntent = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/stripe/create-payment-intent', {
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

        const { clientSecret } = await response.json();
        setClientSecret(clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [priceId, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading payment form...</span>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load payment form. Please try again.</p>
        <Button onClick={onCancel} className="mt-4">
          Back to Plans
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* CSS to make Link logo visible in green */}
      <style jsx global>{`
        /* Make Link logo visible in its default green color */
        .StripeElement .LinkLogo,
        .StripeElement [class*="LinkLogo"],
        .StripeElement [class*="link-logo"],
        .StripeElement svg[class*="Link"],
        .StripeElement .Link svg,
        .StripeElement .LinkIcon,
        .StripeElement [class*="LinkIcon"] {
          fill: #00d4aa !important;
          color: #00d4aa !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
        
        /* Target Link logo specifically */
        .StripeElement .LinkLogo svg,
        .StripeElement [class*="LinkLogo"] svg,
        .StripeElement [class*="link-logo"] svg {
          fill: #00d4aa !important;
          color: #00d4aa !important;
        }
        
        /* Make sure Link text is visible - more aggressive targeting */
        .StripeElement .LinkText,
        .StripeElement [class*="LinkText"],
        .StripeElement .Link .Text,
        .StripeElement .Link,
        .StripeElement [class*="Link"] {
          color: #00d4aa !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
        
        /* Target any text that says "link" */
        .StripeElement *:contains("link"),
        .StripeElement *[class*="link"],
        .StripeElement *[class*="Link"] {
          color: #00d4aa !important;
        }
        
        /* Target specific Link text elements */
        .StripeElement span:contains("link"),
        .StripeElement div:contains("link"),
        .StripeElement p:contains("link"),
        .StripeElement a:contains("link") {
          color: #00d4aa !important;
        }
        
        /* Target elements with Link in class name */
        .StripeElement [class*="Link"] span,
        .StripeElement [class*="Link"] div,
        .StripeElement [class*="Link"] p,
        .StripeElement [class*="Link"] a {
          color: #00d4aa !important;
        }
        
        /* Specifically target Link-related elements */
        .StripeElement [data-testid*="link"],
        .StripeElement [aria-label*="link"],
        .StripeElement [title*="link"] {
          color: #00d4aa !important;
        }
        
        /* Hide Link text completely */
        .StripeElement span:contains("link"),
        .StripeElement div:contains("link"),
        .StripeElement p:contains("link"),
        .StripeElement a:contains("link"),
        .StripeElement *:contains("link") {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }
        
        /* Hide Link text elements with class names */
        .StripeElement [class*="Link"] span,
        .StripeElement [class*="Link"] div,
        .StripeElement [class*="Link"] p,
        .StripeElement [class*="Link"] a {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }
        
        /* Show QR codes for Cash App and Amazon Pay */
        .StripeElement [class*="CashApp"]::after,
        .StripeElement [class*="Amazon"]::after {
          content: "";
          display: block;
          width: 120px;
          height: 120px;
          margin: 20px auto;
          background: 
            repeating-linear-gradient(
              0deg,
              #000 0px,
              #000 4px,
              #fff 4px,
              #fff 8px
            ),
            repeating-linear-gradient(
              90deg,
              #000 0px,
              #000 4px,
              #fff 4px,
              #fff 8px
            );
          background-size: 8px 8px;
          border: 2px solid #000;
          border-radius: 8px;
        }
        
        /* Cash App specific styling */
        .StripeElement [class*="CashApp"]::after {
          background-color: #00d632;
        }
        
        /* Amazon Pay specific styling */
        .StripeElement [class*="Amazon"]::after {
          background-color: #ff9900;
        }
      `}</style>
      <Elements 
        stripe={stripePromise} 
        options={{ 
          clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#7c3aed',
            colorBackground: 'hsl(var(--background))',
            colorText: '#ffffff',
            colorTextSecondary: '#e2e8f0',
            colorTextPlaceholder: '#94a3b8',
            colorDanger: '#ef4444',
            colorSuccess: '#10b981',
            fontFamily: 'system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
          },
          rules: {
            // Base styles (dark mode)
            '.Input': {
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              color: '#ffffff',
              fontSize: '16px',
              padding: '12px 16px',
            },
            '.Input:focus': {
              borderColor: '#7c3aed',
              boxShadow: '0 0 0 1px #7c3aed',
            },
            '.Input--invalid': {
              borderColor: '#ef4444',
            },
            '.Label': {
              color: '#e2e8f0',
              fontSize: '14px',
              fontWeight: '500',
            },
            '.Tab': {
              color: '#94a3b8',
              borderColor: 'hsl(var(--border))',
              backgroundColor: 'hsl(var(--muted))',
              border: '1px solid hsl(var(--border))',
            },
            '.Tab:hover': {
              color: '#ffffff',
            },
            '.Tab--selected': {
              color: '#7c3aed',
              borderColor: '#7c3aed',
              backgroundColor: 'hsl(var(--background))',
            },
            '.Error': {
              color: '#ef4444',
              fontSize: '14px',
            },
            '.Block': {
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
            },
          },
        },
      }}
    >
      <CheckoutForm 
        priceId={priceId}
        planName={planName}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Crown, Sparkles, Zap, Brain, Mic, Image, Calendar, Music, Users, BarChart3, Headphones } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/client';
import Link from 'next/link';
import confetti from 'canvas-confetti';

export default function PaymentSuccessPage() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [user] = useAuthState(auth);

  const sessionId = searchParams.get('session_id');
  const subscriptionId = searchParams.get('subscription_id');
  const isEmbedded = searchParams.get('embedded') === 'true';

  useEffect(() => {
    const processPayment = async () => {
      if ((!sessionId && !subscriptionId) || !user) {
        console.log('Missing sessionId/subscriptionId or user:', { sessionId, subscriptionId, user: !!user });
        setIsProcessing(false);
        return;
      }

      try {
        // Use different API endpoints based on payment type
        const apiEndpoint = subscriptionId ? '/api/stripe/process-subscription' : '/api/stripe/process-payment';
        const requestBody = subscriptionId 
          ? { subscriptionId, userId: user.uid }
          : { sessionId, userId: user.uid };

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const result = await response.json();
        console.log('Payment processing result:', result);

                if (result.success) {
                  // Small delay to ensure smooth transition from loading to success
                  await new Promise(resolve => setTimeout(resolve, 500));
                  
                  setIsSuccess(true);
                  
                  // Trigger confetti animation
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

                  toast({
                    title: "🎉 Welcome to Scholar!",
                    description: "You now have access to all premium features!",
                  });
                } else {
                  throw new Error(result.error || 'Payment processing failed');
                }
      } catch (error: any) {
        console.error('Payment processing error:', error);
        toast({
          variant: "destructive",
          title: "Payment Processing Error",
          description: error.message || "Something went wrong. Please contact support.",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    // Start processing immediately
    processPayment();
  }, [sessionId, user, toast]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-green-200 dark:border-green-800">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="h-10 w-10 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Payment Successful! 🎉
            </h2>
            <p className="text-muted-foreground mb-4">
              Activating your Scholar plan and preparing your premium features...
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              This will only take a moment...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
              <Crown className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              🎉 Welcome to Scholar!
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              You now have access to all premium features
            </p>
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              14-day free trial active
            </div>
          </div>

          {/* Scholar Features Grid */}
          <Card className="mb-8 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Zap className="h-6 w-6 text-yellow-500" />
                What You Can Do Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* AI Tutoring */}
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Unlimited AI Tutoring</h3>
                  <p className="text-sm text-muted-foreground">Get personalized help from AI tutors specialized in your subjects</p>
                </div>

                {/* Voice Input */}
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mic className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Voice Input</h3>
                  <p className="text-sm text-muted-foreground">Speak your questions naturally and get instant responses</p>
                </div>

                {/* Image Analysis */}
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Image className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Image Analysis</h3>
                  <p className="text-sm text-muted-foreground">Upload photos, diagrams, and documents for AI analysis</p>
                </div>

                {/* Calendar Integration */}
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Calendar Sync</h3>
                  <p className="text-sm text-muted-foreground">Sync with Google Calendar for smart study scheduling</p>
                </div>

                {/* Focus Music */}
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20">
                  <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Music className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Focus Music</h3>
                  <p className="text-sm text-muted-foreground">Access curated Spotify playlists for optimal focus</p>
                </div>

                {/* Study Groups */}
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Enhanced Groups</h3>
                  <p className="text-sm text-muted-foreground">Create and join advanced study groups with AI assistance</p>
                </div>

                {/* Analytics */}
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20">
                  <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Smart Analytics</h3>
                  <p className="text-sm text-muted-foreground">Track progress and get grade predictions</p>
                </div>

                {/* Priority Support */}
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Headphones className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Priority Support</h3>
                  <p className="text-sm text-muted-foreground">Get faster help with dedicated support</p>
                </div>

                {/* Early Access */}
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
                  <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Early Access</h3>
                  <p className="text-sm text-muted-foreground">Be the first to try new features and updates</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <Link href="/dashboard">
                  <Crown className="mr-2 h-5 w-5" />
                  Go to Dashboard
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/dashboard/chat">
                  <Brain className="mr-2 h-5 w-5" />
                  Start Learning
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Your subscription is active • Cancel anytime from your dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Payment Status Unknown</h2>
          <p className="text-muted-foreground mb-4">
            We couldn't process your payment. Please contact support if you were charged.
          </p>
          <Button asChild>
            <Link href="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, Zap, Crown, Users, BookOpen, Brain, BarChart3, Calendar, Music, Camera, Mic, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CourseConnectLogo } from '@/components/icons/courseconnect-logo';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  limitations: string[];
  icon: React.ReactNode;
  color: string;
  popular?: boolean;
  cta: string;
  href: string;
}

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: isAnnual ? '$0' : '$0',
      period: 'forever',
      description: 'Perfect for getting started with basic study tools',
      icon: <BookOpen className="h-6 w-6" />,
      color: 'bg-blue-500',
      features: [
        'Basic AI chat assistance',
        'Syllabus upload & analysis',
        'Study group creation',
        'Basic flashcards',
        'Mobile app access',
        'Community support'
      ],
      limitations: [
        'Limited AI responses per day',
        'Basic study group features',
        'No advanced analytics'
      ],
      cta: 'Get Started Free',
      href: '/dashboard'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: isAnnual ? '$9.99' : '$11.99',
      period: isAnnual ? '/month' : '/month',
      description: 'Advanced features for serious students',
      icon: <Crown className="h-6 w-6" />,
      color: 'bg-purple-500',
      popular: true,
      features: [
        'Unlimited AI tutor conversations',
        'Advanced AI tutor with specialized subjects',
        'Voice input & image analysis',
        'Grade prediction system',
        'Multi-modal AI processing',
        'Google Calendar integration',
        'Spotify focus music',
        'Enhanced study groups',
        'Advanced analytics & insights',
        'Priority support',
        'Early access to new features'
      ],
      limitations: [],
      cta: 'Upgrade to Pro',
      href: '/dashboard/advanced'
    },
    {
      id: 'university',
      name: 'University',
      price: 'Contact Us',
      period: '',
      description: 'Custom solutions for educational institutions',
      icon: <Users className="h-6 w-6" />,
      color: 'bg-green-500',
      features: [
        'Everything in Pro',
        'Custom branding',
        'Admin dashboard',
        'Bulk user management',
        'Integration with LMS',
        'Custom AI training',
        'Dedicated support',
        'SLA guarantees'
      ],
      limitations: [],
      cta: 'Contact Sales',
      href: '/contact'
    }
  ];

  const advancedFeatures = [
    {
      icon: <Brain className="h-5 w-5" />,
      title: 'Advanced AI Tutor',
      description: 'Specialized tutors for Math, Science, Programming, and more'
    },
    {
      icon: <Mic className="h-5 w-5" />,
      title: 'Voice Input',
      description: 'Ask questions using your voice with speech recognition'
    },
    {
      icon: <Camera className="h-5 w-5" />,
      title: 'Image Analysis',
      description: 'Upload diagrams, equations, and images for AI analysis'
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: 'Grade Predictions',
      description: 'AI-powered grade predictions with personalized recommendations'
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      title: 'Calendar Integration',
      description: 'Sync with Google Calendar for better time management'
    },
    {
      icon: <Music className="h-5 w-5" />,
      title: 'Focus Music',
      description: 'Curated study playlists and ambient sounds for concentration'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 max-w-6xl mx-auto px-6 items-center justify-between">
          <Link href="/home" className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-primary tracking-tight">CourseConnect</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="lg" asChild>
              <Link href="/home">Home</Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="/about">About</Link>
            </Button>
            <Button size="lg" asChild>
              <Link href="/dashboard">Get Started <ArrowRight className="ml-2" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="py-24 bg-background">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold tracking-tight mb-6">
              Choose Your Plan
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Start free and upgrade as you need more advanced features. All plans include our core study tools.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-sm ${!isAnnual ? 'font-medium' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative"
              >
                <div className={`w-6 h-6 rounded-full bg-primary transition-transform ${isAnnual ? 'translate-x-3' : '-translate-x-3'}`} />
              </Button>
              <span className={`text-sm ${isAnnual ? 'font-medium' : 'text-muted-foreground'}`}>
                Annual
              </span>
              {isAnnual && (
                <Badge variant="secondary" className="ml-2">
                  Save 20%
                </Badge>
              )}
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-8 md:grid-cols-3 mb-16">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative transition-all duration-300 hover:shadow-xl ${
                  plan.popular ? 'border-primary shadow-lg scale-105' : 'hover:scale-105'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 rounded-full ${plan.color} flex items-center justify-center text-white mx-auto mb-4`}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <Button asChild className="w-full" size="lg">
                    <Link href={plan.href}>
                      {plan.cta}
                    </Link>
                  </Button>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">What's included:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {plan.limitations.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground">Limitations:</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                            <span>{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Advanced Features Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Pro Features</h2>
            <p className="text-muted-foreground mb-8">
              Unlock advanced AI-powered tools designed for serious students
            </p>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {advancedFeatures.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                      {feature.icon}
                    </div>
                    <h4 className="font-semibold mb-2">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">Can I upgrade or downgrade anytime?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes! You can change your plan at any time. Changes take effect immediately.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">Is there a free trial for Pro?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes! Try Pro features free for 14 days. No credit card required.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
                  <p className="text-sm text-muted-foreground">
                    We accept all major credit cards, PayPal, and Apple Pay.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">Do you offer student discounts?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes! Students get 50% off Pro plans with valid student ID.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t bg-background/95">
        <div className="container max-w-6xl mx-auto px-6 text-center text-muted-foreground">
          © {new Date().getFullYear()} CourseConnect. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  ArrowRight, 
  Users, 
  Brain, 
  BookOpen, 
  Target, 
  Zap, 
  CheckCircle, 
  Star,
  GraduationCap,
  MessageSquare,
  Calendar,
  Music,
  BarChart3,
  Camera,
  Mic,
  Globe,
  Shield,
  Heart
} from 'lucide-react';
import { CourseConnectLogo } from '@/components/icons/courseconnect-logo';


const values = [
  {
    icon: <Heart className="h-6 w-6" />,
    title: 'Student-First',
    description: 'Every feature is designed with student success in mind'
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Privacy & Security',
    description: 'Your data is protected with enterprise-grade security'
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: 'Accessibility',
    description: 'Education should be accessible to everyone, everywhere'
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Innovation',
    description: 'We constantly push the boundaries of what\'s possible in education'
  }
];

const stats = [
  { number: '50,000+', label: 'Students Helped' },
  { number: '1,200+', label: 'Universities' },
  { number: '95%', label: 'Success Rate' },
  { number: '24/7', label: 'AI Support' }
];

export default function AboutPage() {
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
              <Link href="/home#pricing">Pricing</Link>
            </Button>
            <Button size="lg" asChild>
              <Link href="/dashboard">Get Started <ArrowRight className="ml-2" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            About CourseConnect
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            We're revolutionizing education by combining AI-powered learning tools with collaborative study features to help every student succeed.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/dashboard">Try CourseConnect</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/home#pricing">View Pricing</Link>
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <Card>
            <CardContent className="p-12">
              <div className="grid gap-8 md:grid-cols-2 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    We believe that every student deserves access to personalized, AI-powered learning tools that adapt to their unique needs and learning style.
                  </p>
                  <p className="text-muted-foreground mb-6">
                    CourseConnect was born from the frustration of traditional study methods that don't scale with modern academic demands. We've built a platform that combines the power of artificial intelligence with the collaborative nature of learning.
                  </p>
                  <div className="flex gap-4">
                    <Badge variant="secondary" className="px-3 py-1">
                      <GraduationCap className="h-4 w-4 mr-1" />
                      Education Technology
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1">
                      <Brain className="h-4 w-4 mr-1" />
                      AI-Powered Learning
                    </Badge>
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Personalized Learning</h3>
                      <p className="text-sm text-muted-foreground">AI adapts to your learning style</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Collaborative Study</h3>
                      <p className="text-sm text-muted-foreground">Connect with classmates worldwide</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Advanced Analytics</h3>
                      <p className="text-sm text-muted-foreground">Track your progress and performance</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">What Makes Us Different</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Advanced AI Tutor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our AI tutor specializes in different subjects and adapts to your learning pace, providing personalized explanations and study strategies.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Smart Study Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Automatically match with classmates studying the same subjects and collaborate on assignments in real-time.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Grade Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get AI-powered grade predictions and personalized recommendations to improve your academic performance.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Multi-Modal Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Upload images, use voice input, and interact with various content types for a comprehensive learning experience.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Integrated Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sync with Google Calendar and manage your study schedule with AI-powered time management suggestions.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Music className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Focus Music</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access curated study playlists and ambient sounds designed to enhance concentration and focus.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                    {value.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Learning?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of students who are already using CourseConnect to achieve better grades and study more effectively.
              </p>
              <div className="flex justify-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/dashboard">Start Learning Today</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/home#pricing">View Plans</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
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

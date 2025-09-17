"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Users, BookOpen, MessageSquare, Upload, GraduationCap, Sparkles, Heart, Target, Zap, Brain, Mic, Camera, BarChart3, Calendar, Music, Star, CheckCircle } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

const teamMembers = [
  {
    name: "Alex Chen",
    role: "Founder & CEO",
    description: "Computer Science graduate with 5+ years in EdTech",
    image: "AC",
    color: "bg-blue-500"
  },
  {
    name: "Sarah Johnson",
    role: "CTO",
    description: "Full-stack developer specializing in AI integration",
    image: "SJ",
    color: "bg-green-500"
  },
  {
    name: "Michael Rodriguez",
    role: "Head of Product",
    description: "UX/UI designer with focus on student experience",
    image: "MR",
    color: "bg-purple-500"
  },
  {
    name: "Emily Davis",
    role: "AI Research Lead",
    description: "Machine Learning engineer and education specialist",
    image: "ED",
    color: "bg-pink-500"
  }
];

const values = [
  {
    icon: <Users className="h-8 w-8 text-blue-500" />,
    title: "Student-First",
    description: "Every feature is designed with students' needs in mind"
  },
  {
    icon: <Brain className="h-8 w-8 text-purple-500" />,
    title: "Innovation",
    description: "Leveraging cutting-edge AI to enhance learning"
  },
  {
    icon: <Heart className="h-8 w-8 text-red-500" />,
    title: "Accessibility",
    description: "Making quality education tools available to everyone"
  },
  {
    icon: <Target className="h-8 w-8 text-green-500" />,
    title: "Excellence",
    description: "Committed to delivering the best possible experience"
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-transparent backdrop-blur supports-[backdrop-filter]:bg-transparent">
        <div className="container flex h-16 sm:h-20 max-w-6xl mx-auto px-3 sm:px-6 items-center justify-between">
          <Link href="/home" className="flex items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary tracking-tight">CourseConnect</h1>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex h-10 sm:h-11 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]" asChild>
              <Link href="/about">About</Link>
            </Button>
            <Button variant="ghost" size="sm" className="hidden sm:flex h-10 sm:h-11 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]" asChild>
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button variant="ghost" size="sm" className="h-10 sm:h-11 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" className="h-10 sm:h-11 text-sm sm:text-base min-h-[40px] sm:min-h-[44px] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" asChild>
              <Link href="/dashboard">Get Started <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
            About <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">CourseConnect</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're on a mission to revolutionize how college students learn, collaborate, and succeed academically through AI-powered tools and seamless collaboration.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-12 sm:mb-16">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6 sm:p-8">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-primary">Our Mission</h2>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                  To empower every college student with intelligent tools that enhance learning, foster collaboration, 
                  and accelerate academic success. We believe that with the right technology and community support, 
                  every student can achieve their full potential.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Our Values</h2>
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Meet Our Team</h2>
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 rounded-full ${member.color} text-white flex items-center justify-center mx-auto mb-4 text-lg font-semibold`}>
                    {member.image}
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                  <p className="text-sm text-primary mb-2">{member.role}</p>
                  <p className="text-xs text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-12 sm:mb-16">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-blue-800 dark:text-blue-200">Our Impact</h2>
              <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">50,000+</div>
                  <div className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-1">Active Students</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Growing daily</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">500+</div>
                  <div className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-1">Universities</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Worldwide coverage</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">2M+</div>
                  <div className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-1">Study Hours</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Saved monthly</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">94%</div>
                  <div className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-1">Success Rate</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Grade improvement</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">What Makes Us Different</h2>
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">AI-Powered Learning</CardTitle>
                <CardDescription>
                  Advanced AI that adapts to your learning style and provides personalized assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Personalized study plans</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Smart homework help</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Adaptive flashcards</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Seamless Collaboration</CardTitle>
                <CardDescription>
                  Connect with classmates and form study groups effortlessly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Auto-match with classmates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Real-time study sessions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Group project management</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Progress Tracking</CardTitle>
                <CardDescription>
                  Comprehensive analytics to help you stay on track and improve
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Grade predictions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Study time analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Performance insights</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Transform Your Learning?</h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands of students who are already succeeding with CourseConnect
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" asChild>
                  <Link href="/dashboard">
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
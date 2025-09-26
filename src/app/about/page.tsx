"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Users, BookOpen, MessageSquare, Upload, GraduationCap, Sparkles, Heart, Target, Zap, Brain, Mic, Camera, BarChart3, Calendar, Music, Star, CheckCircle, Rocket, Shield, Clock, TrendingUp } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { useState, useEffect } from "react";

const features = [
  {
    icon: <Brain className="h-12 w-12 text-white drop-shadow-lg" />,
    title: "AI-Powered Learning",
    description: "Advanced artificial intelligence that adapts to your learning style and provides personalized assistance",
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20"
  },
  {
    icon: <Users className="h-12 w-12 text-white drop-shadow-lg" />,
    title: "Study Groups",
    description: "Connect with classmates and form study groups for collaborative learning",
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20"
  },
  {
    icon: <BookOpen className="h-12 w-12 text-white drop-shadow-lg" />,
    title: "Syllabus Analysis",
    description: "Upload your course syllabus and get instant insights and study materials",
    gradient: "from-purple-500 to-violet-500",
    bgGradient: "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20"
  },
  {
    icon: <MessageSquare className="h-12 w-12 text-white drop-shadow-lg" />,
    title: "24/7 Support",
    description: "Get help whenever you need it with our comprehensive support system",
    gradient: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20"
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
  const [animatedStats, setAnimatedStats] = useState({
    students: 0,
    universities: 0,
    studyHours: 0,
    successRate: 0
  });

  const targetStats = {
    students: 10000,
    universities: 50,
    studyHours: 50000,
    successRate: 94
  };

  useEffect(() => {
    const animateStats = () => {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const stepDuration = duration / steps;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        
        setAnimatedStats({
          students: Math.floor(targetStats.students * progress),
          universities: Math.floor(targetStats.universities * progress),
          studyHours: Math.floor(targetStats.studyHours * progress),
          successRate: Math.floor(targetStats.successRate * progress)
        });

        if (step >= steps) {
          clearInterval(timer);
          setAnimatedStats(targetStats);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    };

    // Start animation after a short delay
    const timer = setTimeout(animateStats, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-transparent backdrop-blur supports-[backdrop-filter]:bg-transparent">
        <div className="container flex h-16 sm:h-20 max-w-6xl mx-auto px-3 sm:px-6 items-center justify-between">
          <Link href="/home" className="flex items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary tracking-tight">CourseConnect</h1>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex h-10 sm:h-11 text-sm sm:text-base min-h-[40px] sm:min-h-[44px] hover:bg-transparent" asChild>
              <Link href="/about">About</Link>
            </Button>
            <Button variant="ghost" size="sm" className="hidden sm:flex h-10 sm:h-11 text-sm sm:text-base min-h-[40px] sm:min-h-[44px] hover:bg-transparent" asChild>
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button variant="ghost" size="sm" className="h-10 sm:h-11 text-sm sm:text-base min-h-[40px] sm:min-h-[44px] hover:bg-transparent" asChild>
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
        <div className="text-center mb-16 sm:mb-20">
          <div className="relative">
            {/* Animated background elements */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>
            
            <Badge className="mb-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 px-4 py-2 text-sm font-medium animate-bounce">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Education Platform
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 sm:mb-8">
              About <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">CourseConnect</span>
          </h1>
            
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
              CourseConnect is an <span className="text-primary font-semibold">AI-powered study platform</span> that helps college students succeed through smart tools, study groups, and personalized learning.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 h-14 px-8 text-lg font-semibold" asChild>
                <Link href="/dashboard">
                  <Rocket className="mr-2 h-5 w-5" />
                  Get Started Free
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold border-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300" asChild>
                <Link href="/contact">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="mb-16 sm:mb-20">
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10 border-purple-200/20 dark:border-purple-800/20">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-2xl"></div>
            <CardContent className="relative p-8 sm:p-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-6">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Our Mission</h2>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                  We help college students succeed by providing <span className="text-primary font-semibold">AI-powered study tools</span> and 
                  <span className="text-primary font-semibold"> collaborative features</span> that make learning easier and more effective.
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

        {/* Features Section */}
        <div className="mb-16 sm:mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Key Features</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover the powerful tools that make CourseConnect the ultimate study companion
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className={`group relative overflow-hidden bg-gradient-to-br ${feature.bgGradient} border-0 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="relative p-8 text-center">
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${feature.gradient} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-16 sm:mb-20">
          <Card className="relative overflow-hidden bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-blue-200/20 dark:border-blue-800/20">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
            <CardContent className="relative p-8 sm:p-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Platform Highlights</h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl sm:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">24/7</div>
                  <div className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-1">AI Support</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Always available</div>
                </div>
                <div className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl sm:text-5xl font-bold text-green-600 dark:text-green-400 mb-2">100%</div>
                  <div className="text-lg font-semibold text-green-800 dark:text-green-200 mb-1">Free to Start</div>
                  <div className="text-sm text-green-600 dark:text-green-400">No credit card required</div>
                </div>
                <div className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl sm:text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">AI-Powered</div>
                  <div className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-1">Study Tools</div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">Personalized learning</div>
                </div>
                <div className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl sm:text-5xl font-bold text-pink-600 dark:text-pink-400 mb-2">Secure</div>
                  <div className="text-lg font-semibold text-pink-800 dark:text-pink-200 mb-1">Privacy First</div>
                  <div className="text-sm text-pink-600 dark:text-pink-400">Your data is safe</div>
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

        {/* Company Information */}
        <div className="mb-16 sm:mb-20">
          <Card className="relative overflow-hidden bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-blue-200/20 dark:border-blue-800/20">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
            <CardContent className="relative p-8 sm:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">About CourseConnect</h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Founded in 2024, CourseConnect is dedicated to revolutionizing how students learn and collaborate.
                </p>
              </div>
              
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Founded</h3>
                  <p className="text-muted-foreground">2024</p>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl mb-4">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Headquarters</h3>
                  <p className="text-muted-foreground">United States</p>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl mb-4">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Focus</h3>
                  <p className="text-muted-foreground">Student Success</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Section */}
        <div className="mb-16 sm:mb-20">
          <Card className="relative overflow-hidden bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border-green-200/20 dark:border-green-800/20">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-2xl"></div>
            <CardContent className="relative p-8 sm:p-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-6">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Get Support</h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                  Need help? Our team is here to support you.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <div className="flex items-center gap-3 text-green-800 dark:text-green-200 bg-green-50 dark:bg-green-950/20 px-6 py-4 rounded-xl">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                    <div>
                      <span className="font-semibold text-lg">Email:</span>
                      <a href="mailto:courseconnect.noreply@gmail.com" className="text-green-600 dark:text-green-400 hover:underline ml-2 text-lg font-medium">
                        courseconnect.noreply@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-6 flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4" />
                  We respond within 24 hours
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="relative overflow-hidden bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 border-purple-200/20 dark:border-purple-800/20">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
            <CardContent className="relative p-8 sm:p-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-6">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Ready to Transform Your Learning?</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                Start your academic journey with CourseConnect today and experience the future of education
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 h-14 px-8 text-lg font-semibold" asChild>
                  <Link href="/dashboard">
                    <Rocket className="mr-2 h-5 w-5" />
                    Get Started Free
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold border-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300" asChild>
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
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, BookOpen, Bot, Mail, MessageSquare, Users, Upload, GraduationCap, Send, User, CheckCircle, Sparkles, FileText, Clock, Loader2, X, MessageCircle, TrendingUp, Smartphone, Brain, Mic, Camera, BarChart3, Calendar, Music, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Hero } from "@/components/hero";
import { Pricing } from "@/components/pricing";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteFooter } from "@/components/site-footer";

const popularClasses = [
    { name: "BIO-101", description: "Intro to Biology", icon: <Bot className="size-8 text-green-500" />, studentCount: 123 },
    { name: "CS-202", description: "Data Structures", icon: <Users className="size-8 text-blue-500" />, studentCount: 88 },
    { name: "ENG-210", description: "Shakespeare", icon: <MessageSquare className="size-8 text-amber-500" />, studentCount: 45 },
    { name: "HIST-301", description: "American History", icon: <BookOpen className="size-8 text-red-500" />, studentCount: 92 },
    { name: "PSYCH-101", description: "Intro to Psychology", icon: <Bot className="size-8 text-purple-500" />, studentCount: 150 },
    { name: "MATH-203", description: "Linear Algebra", icon: <Users className="size-8 text-indigo-500" />, studentCount: 76 },
]

export default function LandingPage() {
    const { toast } = useToast();

    return (
        <div className="flex min-h-screen flex-col bg-background overflow-hidden relative">
            <style>
                {`
                    :root {
                        --primary-hsl: 203 76% 70%;
                        --background-hsl: 204 100% 96%;
                    }
                    .dark {
                        --primary-hsl: 203 70% 65%;
                        --background-hsl: 210 15% 12%;
                    }
                    
                    /* Ensure proper centering */
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    
                    .container {
                        width: 100%;
                        margin-left: auto;
                        margin-right: auto;
                    }
                `}
            </style>
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
                        <Button size="sm" className="h-10 sm:h-11 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]" asChild>
                            <Link href="/dashboard">Get Started <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" /></Link>
                        </Button>
                    </div>
                </div>
            </header>
            <main className="flex-1">
                <Hero />
                <Tabs defaultValue="features" className="w-full">
                    <div className="container max-w-6xl mx-auto px-3 sm:px-6">
                        <TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8 h-10 sm:h-11 min-h-[40px] sm:min-h-[44px]">
                            <TabsTrigger value="features" className="text-xs sm:text-sm">Features</TabsTrigger>
                            <TabsTrigger value="classes" className="text-xs sm:text-sm">Popular Classes</TabsTrigger>
                            <TabsTrigger value="demo" className="text-xs sm:text-sm">Try Demo</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="features" className="space-y-8 sm:space-y-12 lg:space-y-16">
                            {/* Features Section */}
                            <div className="w-full">
                                <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3 sm:mb-4 lg:mb-6">Everything You Need to Succeed</h2>
                                    <p className="text-sm sm:text-base lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4 sm:px-0">
                                        CourseConnect combines AI-powered analysis with collaborative study tools to help you ace every class.
                                    </p>
                                </div>

                                {/* Feature Cards Grid */}
                                <div className="grid gap-4 sm:gap-6 lg:gap-8 md:grid-cols-2 lg:grid-cols-3 mb-8 sm:mb-12 lg:mb-16">
                            {/* AI Syllabus Analysis */}
                            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                        <FileText className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-xl">AI Syllabus Analysis</CardTitle>
                                    <CardDescription>
                                        Upload any syllabus and get instant insights about course structure, key topics, and study recommendations.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Automatic topic extraction</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Study schedule suggestions</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Difficulty assessment</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Smart Study Groups */}
                            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                        <Users className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-xl">Smart Study Groups</CardTitle>
                                    <CardDescription>
                                        Join or create study groups for your classes. Connect with classmates and collaborate on assignments.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Auto-match with classmates</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Real-time collaboration</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Study session scheduling</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* AI Flashcards */}
                            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                        <GraduationCap className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-xl">AI-Generated Flashcards</CardTitle>
                                    <CardDescription>
                                        Automatically create study flashcards from your course materials. Perfect for exam preparation.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Smart question generation</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Spaced repetition system</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Progress tracking</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* CourseConnect AI Assistant */}
                            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                        <MessageCircle className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-xl">CourseConnect AI Assistant</CardTitle>
                                    <CardDescription>
                                        Get instant help with homework, explanations, and study tips from our AI tutor.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>24/7 homework help</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Concept explanations</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Study strategy advice</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Progress Tracking */}
                            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                        <TrendingUp className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-xl">Progress Tracking</CardTitle>
                                    <CardDescription>
                                        Monitor your academic progress across all classes with detailed analytics and insights.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Grade predictions</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Study time analytics</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Performance insights</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Mobile App */}
                            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                        <Smartphone className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-xl">Study Anywhere</CardTitle>
                                    <CardDescription>
                                        Access all features on mobile. Study on the go with our responsive web app and mobile-optimized interface.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Mobile flashcards</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Offline study mode</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Push notifications</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                                </div>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="classes">
                            <div className="w-full">
                                <h2 className="text-3xl font-bold tracking-tight mb-6 text-center">Popular Classes</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                    {popularClasses.map((pClass) => (
                                        <Card key={pClass.name} className="flex flex-col items-center text-center p-4 transition-all hover:shadow-xl hover:-translate-y-1 bg-card/80 backdrop-blur-sm">
                                            <div className="mb-3 p-3 rounded-full bg-primary/10">
                                                {pClass.icon}
                                            </div>
                                            <h3 className="font-semibold text-sm mb-1">{pClass.name}</h3>
                                            <p className="text-xs text-muted-foreground mb-2">{pClass.description}</p>
                                            <Badge variant="secondary" className="text-xs">
                                                {pClass.studentCount} students
                                            </Badge>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="demo" className="space-y-8">
                            <div className="w-full">
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-bold tracking-tight mb-4">Try CourseConnect Demo</h2>
                                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                        Experience how CourseConnect works with our interactive demo. Join a sample class chat and see AI assistance in action!
                                    </p>
                                </div>

                                {/* Demo Chat Interface */}
                                <Card className="max-w-4xl mx-auto">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MessageSquare className="h-5 w-5 text-primary" />
                                            CS-101 Study Group - Live Demo
                                        </CardTitle>
                                        <CardDescription>
                                            This is a live demo of CourseConnect's class chat. Try asking questions and see how our AI helps!
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Chat Messages */}
                                        <div className="h-80 overflow-y-auto space-y-4 mb-4 p-4 bg-muted/20 rounded-lg">
                                            {/* Demo Messages */}
                                            <div className="flex gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="bg-blue-500 text-white">JS</AvatarFallback>
                                                </Avatar>
                                                <div className="bg-background border rounded-lg p-3 max-w-[80%]">
                                                    <div className="font-semibold text-sm mb-1">John Smith</div>
                                                    <div className="text-sm">Hey everyone! Can someone help me understand recursion in our assignment?</div>
                                                    <div className="text-xs text-muted-foreground mt-1">2 minutes ago</div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="bg-green-500 text-white">AI</AvatarFallback>
                                                </Avatar>
                                                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 max-w-[80%]">
                                                    <div className="font-semibold text-sm mb-1 flex items-center gap-1">
                                                        <Bot className="h-3 w-3" />
                                                        CourseConnect AI
                                                    </div>
                                                    <div className="text-sm">
                                                        I'd be happy to help with recursion! Here's a simple explanation:
                                                        <br/><br/>
                                                        <strong>Recursion</strong> is when a function calls itself. It has two parts:
                                                        <br/>• <strong>Base case</strong>: The stopping condition
                                                        <br/>• <strong>Recursive case</strong>: The function calls itself
                                                        <br/><br/>
                                                        Example: <code>factorial(n) = n × factorial(n-1)</code>
                                                        <br/><br/>
                                                        <strong>Mathematical Example:</strong>
                                                        <br/>3² = 3 × 3 = 9
                                                        <br/>5 ÷ 2 = 2.5
                                                        <br/><br/>
                                                        Would you like me to walk through a specific example?
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">Just now</div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="bg-purple-500 text-white">SM</AvatarFallback>
                                                </Avatar>
                                                <div className="bg-background border rounded-lg p-3 max-w-[80%]">
                                                    <div className="font-semibold text-sm mb-1">Sarah Miller</div>
                                                    <div className="text-sm">Thanks AI! That really helped. Can you also explain how to implement a binary search recursively?</div>
                                                    <div className="text-xs text-muted-foreground mt-1">1 minute ago</div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="bg-green-500 text-white">AI</AvatarFallback>
                                                </Avatar>
                                                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 max-w-[80%]">
                                                    <div className="font-semibold text-sm mb-1 flex items-center gap-1">
                                                        <Bot className="h-3 w-3" />
                                                        CourseConnect AI
                                                    </div>
                                                    <div className="text-sm">
                                                        Absolutely! Here's how binary search works recursively:
                                                        <br/><br/>
                                                        <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`function binarySearch(arr, target, left = 0, right = arr.length - 1) {
    if (left > right) return -1;  // Base case
    
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) return mid;  // Found it!
    if (arr[mid] > target) return binarySearch(arr, target, left, mid - 1);
    return binarySearch(arr, target, mid + 1, right);
}`}
                                                        </pre>
                                                        <br/>
                                                        <strong>Mathematical Concept:</strong>
                                                        <br/>Time Complexity: O(log₂n) - logarithmic time
                                                        <br/>Space Complexity: O(log₂n) - recursive calls
                                                        <br/><br/>
                                                        The key is dividing the search space in half each time!
                                                        <br/>Example: Searching 1000 items takes only ~10 comparisons!
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">Just now</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Chat Input */}
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Ask a question or share something..."
                                                className="flex-1"
                                            />
                                            <Button disabled>
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="text-xs text-muted-foreground text-center mt-2">
                                            💡 <strong>Demo Mode:</strong> This is a preview of CourseConnect's class chat. 
                                            <Link href="/dashboard/chat" className="text-primary hover:underline ml-1">
                                                Try the real thing →
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Demo Features */}
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
                                    <Card className="text-center p-6">
                                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                                            <MessageSquare className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="font-semibold mb-2">Real-time Chat</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Instant messaging with classmates and AI assistance
                                        </p>
                                    </Card>

                                    <Card className="text-center p-6">
                                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                                            <Bot className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="font-semibold mb-2">AI Homework Help</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Get instant explanations and step-by-step solutions
                                        </p>
                                    </Card>

                                    <Card className="text-center p-6">
                                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                                            <Users className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="font-semibold mb-2">Study Groups</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Collaborate with classmates on assignments and projects
                                        </p>
                                    </Card>
                                </div>

                                {/* CTA */}
                                <div className="text-center mt-8">
                                    <Button size="lg" asChild>
                                        <Link href="/dashboard/upload">
                                            Start Your Free Trial <ArrowRight className="ml-2" />
                                        </Link>
                                    </Button>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        No credit card required • Join thousands of students
                                    </p>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
                
                {/* Scholar Features Section */}
                <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                    <div className="container max-w-6xl mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                                Scholar Features
                            </h2>
                            <p className="text-lg text-purple-700 dark:text-purple-300 max-w-3xl mx-auto">
                                Advanced tools designed for serious students who want to excel academically
                            </p>
                        </div>
                        
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {/* Advanced AI Tutor */}
                            <Card className="bg-white/80 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center mb-4">
                                        <Brain className="h-6 w-6 text-white" />
                                    </div>
                                    <CardTitle className="text-xl text-purple-800 dark:text-purple-200">Advanced AI Tutor</CardTitle>
                                    <CardDescription className="text-purple-600 dark:text-purple-400">
                                        Specialized AI tutors for Math, Science, Programming, and more subjects
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-purple-700 dark:text-purple-300">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-purple-500" />
                                            Subject-specific expertise
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-purple-500" />
                                            Step-by-step problem solving
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-purple-500" />
                                            Advanced concept explanations
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Voice & Image Analysis */}
                            <Card className="bg-white/80 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center mb-4">
                                        <Mic className="h-6 w-6 text-white" />
                                    </div>
                                    <CardTitle className="text-xl text-purple-800 dark:text-purple-200">Multi-Modal AI</CardTitle>
                                    <CardDescription className="text-purple-600 dark:text-purple-400">
                                        Voice input and image analysis for comprehensive learning support
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-purple-700 dark:text-purple-300">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-purple-500" />
                                            Voice-to-text questions
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-purple-500" />
                                            Image and diagram analysis
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-purple-500" />
                                            Handwritten text recognition
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Grade Predictions */}
                            <Card className="bg-white/80 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center mb-4">
                                        <TrendingUp className="h-6 w-6 text-white" />
                                    </div>
                                    <CardTitle className="text-xl text-purple-800 dark:text-purple-200">Grade Predictions</CardTitle>
                                    <CardDescription className="text-purple-600 dark:text-purple-400">
                                        AI-powered grade predictions with personalized recommendations
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-purple-700 dark:text-purple-300">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-purple-500" />
                                            Performance analytics
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-purple-500" />
                                            Study time optimization
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-purple-500" />
                                            Improvement suggestions
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Calendar Integration */}
                            <Card className="bg-white/80 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center mb-4">
                                        <Calendar className="h-6 w-6 text-white" />
                                    </div>
                                    <CardTitle className="text-xl text-purple-800 dark:text-purple-200">Smart Scheduling</CardTitle>
                                    <CardDescription className="text-purple-600 dark:text-purple-400">
                                        Google Calendar integration for better time management
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-purple-700 dark:text-purple-300">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-purple-500" />
                                            Automatic study reminders
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-purple-500" />
                                            Assignment deadlines
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-purple-500" />
                                            Exam preparation scheduling
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Focus Music */}
                            <Card className="bg-white/80 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center mb-4">
                                        <Music className="h-6 w-6 text-white" />
                                    </div>
                                    <CardTitle className="text-xl text-purple-800 dark:text-purple-200">Focus Music</CardTitle>
                                    <CardDescription className="text-purple-600 dark:text-purple-400">
                                        Curated study playlists and ambient sounds for concentration
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-purple-700 dark:text-purple-300">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-purple-500" />
                                            Spotify integration
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-purple-500" />
                                            Study-focused playlists
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-purple-500" />
                                            Ambient background sounds
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Advanced Analytics */}
                            <Card className="bg-white/80 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center mb-4">
                                        <BarChart3 className="h-6 w-6 text-white" />
                                    </div>
                                    <CardTitle className="text-xl text-purple-800 dark:text-purple-200">Advanced Analytics</CardTitle>
                                    <CardDescription className="text-purple-600 dark:text-purple-400">
                                        Detailed insights into your learning patterns and progress
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-purple-700 dark:text-purple-300">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-purple-500" />
                                            Learning pattern analysis
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-purple-500" />
                                            Progress tracking
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-purple-500" />
                                            Performance insights
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        {/* CTA for Scholar Features */}
                        <div className="text-center mt-12">
                            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white" asChild>
                                <Link href="/dashboard/advanced">
                                    Unlock Scholar Features <ArrowRight className="ml-2" />
                                </Link>
                            </Button>
                            <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                                Try Scholar features free for 14 days • No credit card required
                            </p>
                        </div>
                    </div>
                </div>

                {/* Statistics Section */}
                <div className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                    <div className="container max-w-6xl mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Trusted by Students Worldwide
                            </h2>
                            <p className="text-lg text-blue-700 dark:text-blue-300 max-w-3xl mx-auto">
                                Join thousands of students who are already succeeding with CourseConnect
                            </p>
                        </div>
                        
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {/* Active Students */}
                            <div className="text-center">
                                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">50,000+</div>
                                <div className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-1">Active Students</div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">Growing daily</div>
                            </div>

                            {/* Universities */}
                            <div className="text-center">
                                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">500+</div>
                                <div className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-1">Universities</div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">Worldwide coverage</div>
                            </div>

                            {/* Study Hours */}
                            <div className="text-center">
                                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">2M+</div>
                                <div className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-1">Study Hours</div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">Saved monthly</div>
                            </div>

                            {/* Success Rate */}
                            <div className="text-center">
                                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">94%</div>
                                <div className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-1">Success Rate</div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">Grade improvement</div>
                            </div>
                        </div>

                        {/* Testimonials */}
                        <div className="mt-16">
                            <h3 className="text-2xl font-bold text-center mb-8 text-blue-800 dark:text-blue-200">What Students Say</h3>
                            <div className="grid gap-6 md:grid-cols-3">
                                <Card className="bg-white/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-1 mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            ))}
                                        </div>
                                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                                            "CourseConnect helped me improve my grades by 15% this semester. The AI tutor is incredible!"
                                        </p>
                                        <div className="font-semibold text-blue-800 dark:text-blue-200">Sarah M.</div>
                                        <div className="text-xs text-blue-600 dark:text-blue-400">Computer Science Student</div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-1 mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            ))}
                                        </div>
                                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                                            "The study groups feature connected me with amazing classmates. We aced our finals together!"
                                        </p>
                                        <div className="font-semibold text-blue-800 dark:text-blue-200">Alex K.</div>
                                        <div className="text-xs text-blue-600 dark:text-blue-400">Biology Major</div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-1 mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            ))}
                                        </div>
                                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                                            "The flashcards feature is a game-changer. I went from C+ to A- in organic chemistry!"
                                        </p>
                                        <div className="font-semibold text-blue-800 dark:text-blue-200">Maria R.</div>
                                        <div className="text-xs text-blue-600 dark:text-blue-400">Chemistry Student</div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            {/* Comprehensive Footer with Links and Logs */}
            <SiteFooter />


            <Toaster />
        </div>
    );
}
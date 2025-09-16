"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CourseConnectLogo } from "@/components/icons/courseconnect-logo";
import { ArrowRight, BookOpen, Bot, Mail, MessageSquare, Users, Upload, GraduationCap, Send, User, CheckCircle, Sparkles, FileText, Clock, Loader2, X, MessageCircle, TrendingUp, Smartphone } from "lucide-react";
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
                <div className="container flex h-20 max-w-6xl mx-auto px-6 items-center justify-between">
                    <Link href="/home" className="flex items-center gap-3">
                        <CourseConnectLogo className="h-9 w-9 text-primary" />
                        <h1 className="text-3xl font-bold text-primary tracking-tight">CourseConnect 🚀</h1>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="lg" asChild>
                            <Link href="/about">About</Link>
                        </Button>
                        <Button variant="ghost" size="lg" asChild>
                            <Link href="/pricing">Pricing</Link>
                        </Button>
                        <Button variant="ghost" size="lg" asChild>
                            <Link href="/login">Sign In</Link>
                        </Button>
                        <Button size="lg" asChild>
                            <Link href="/dashboard">Get Started <ArrowRight className="ml-2" /></Link>
                        </Button>
                    </div>
                </div>
            </header>
            <main className="flex-1">
                <Hero />
                <Tabs defaultValue="features" className="w-full">
                    <div className="container max-w-6xl mx-auto px-6">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="features">Features</TabsTrigger>
                            <TabsTrigger value="classes">Popular Classes</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="features" className="space-y-16">
                            {/* Features Section */}
                            <div className="w-full">
                                <div className="text-center mb-16">
                                    <h2 className="text-4xl font-bold tracking-tight mb-6">Everything You Need to Succeed</h2>
                                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                                        CourseConnect combines AI-powered analysis with collaborative study tools to help you ace every class.
                                    </p>
                                </div>

                                {/* Feature Cards Grid */}
                                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
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
                    </div>
                </Tabs>
            </main>
            <footer className="py-8 border-t bg-background/95 z-10">
                <div className="container max-w-6xl mx-auto px-6 text-center text-muted-foreground">
                    © {new Date().getFullYear()} CourseConnect. All rights reserved.
                </div>
            </footer>

            <Toaster />
        </div>
    );
}
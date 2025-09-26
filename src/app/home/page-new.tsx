"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle, Brain, Mic, TrendingUp, Star, Crown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useChatStore } from "@/hooks/use-chat-store";
import { SiteFooter } from "@/components/site-footer";
import { useState, useEffect } from "react";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

// Typing Effect Component
function TypingEffect() {
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [textIndex, setTextIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    
    const words = ["homework", "tests", "quizzes", "projects", "labs", "classes"];

    useEffect(() => {
        const typewriterInterval = setInterval(() => {
            const currentWord = words[textIndex];
            
            if (!isDeleting && charIndex < currentWord.length) {
                // Typing
                setCurrentText(currentWord.substring(0, charIndex + 1));
                setCharIndex(charIndex + 1);
            } else if (isDeleting && charIndex > 0) {
                // Deleting
                setCurrentText(currentWord.substring(0, charIndex - 1));
                setCharIndex(charIndex - 1);
            } else if (!isDeleting && charIndex === currentWord.length) {
                // Finished typing, wait then start deleting
                setTimeout(() => setIsDeleting(true), 2000);
            } else if (isDeleting && charIndex === 0) {
                // Finished deleting, wait a moment then move to next word
                setTimeout(() => {
                    setIsDeleting(false);
                    setTextIndex((textIndex + 1) % words.length);
                }, 500);
            }
        }, isDeleting ? 50 : 100); // Faster deleting, slower typing

        return () => clearInterval(typewriterInterval);
    }, [charIndex, isDeleting, textIndex, words]);

    return (
        <>
            {currentText}
            <span className="animate-pulse text-purple-600">|</span>
        </>
    );
}

export default function LandingPage() {
    const { toast } = useToast();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsScrolled(scrollTop > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
            {/* Modern Header */}
            <header className={cn(
                "sticky top-0 z-50 border-b border-white/20 transition-all duration-300 backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-xl",
                isScrolled 
                    ? "bg-white/95 dark:bg-slate-900/95 supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-900/80 shadow-lg" 
                    : "bg-white/80 dark:bg-slate-900/80 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60"
            )}>
                <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
                    <Link href="/home" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Crown className="h-4 w-4 text-white" />
                        </div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                            CourseConnect
                        </h1>
                    </Link>
                    
                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-3">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-0 shadow-none hover:shadow-md transition-all duration-300"
                            asChild
                        >
                            <Link href="/about">About</Link>
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-0 shadow-none hover:shadow-md transition-all duration-300"
                            asChild
                        >
                            <Link href="/pricing">Pricing</Link>
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-0 shadow-none hover:shadow-md transition-all duration-300"
                            asChild
                        >
                            <Link href="/login">Sign In</Link>
                        </Button>
                        <ThemeToggle 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-0 shadow-none hover:shadow-md transition-all duration-300"
                        />
                        <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                            asChild
                        >
                            <Link href="/dashboard">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </div>
                    
                    {/* Mobile Navigation */}
                    <div className="flex lg:hidden items-center gap-2">
                        <ThemeToggle 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-0 shadow-none hover:shadow-md transition-all duration-300"
                        />
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-0 shadow-none hover:shadow-md transition-all duration-300"
                            asChild
                        >
                            <Link href="/login">Sign In</Link>
                        </Button>
                        <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                            asChild
                        >
                            <Link href="/dashboard">Start</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section with Typing Effect */}
                <section className="relative py-20 lg:py-32">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="text-center space-y-8">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 shadow-lg">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                Trusted by students across the U.S.
                            </div>

                            {/* Main Heading with Typing Effect */}
                            <div className="space-y-4">
                                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
                                    <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 bg-clip-text text-transparent">
                                        Ace your{" "}
                                    </span>
                                    <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                        <TypingEffect />
                                    </span>
                                    <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 bg-clip-text text-transparent">
                                        , together.
                                    </span>
                                </h1>
                                <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                                    Join AI-powered study groups for your classes. Just upload your syllabus to get started.
                                </p>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button 
                                    size="lg" 
                                    className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] px-8 py-4 text-lg"
                                    asChild
                                >
                                    <Link href="/dashboard/upload">
                                        Upload Your Syllabus <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button 
                                    size="lg" 
                                    variant="outline"
                                    className="border-2 border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-50/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 shadow-none hover:shadow-md transition-all duration-300 hover:scale-[1.02] px-8 py-4 text-lg"
                                    asChild
                                >
                                    <Link href="/pricing">View Pricing</Link>
                                </Button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-8 pt-8">
                                <div className="text-center">
                                    <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">AI-Powered</div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">Study Tools</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">U.S.</div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">Universities</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Free</div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">To Start</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Scholar Features Section */}
                <section className="py-20">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-purple-900 to-blue-900 dark:from-slate-100 dark:via-purple-100 dark:to-blue-100 bg-clip-text text-transparent">
                                Scholar Features
                            </h2>
                            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                                Advanced tools designed for serious students who want to excel academically
                            </p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Advanced AI Tutor */}
                            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]">
                                <CardHeader>
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                        <Brain className="h-8 w-8 text-white" />
                                    </div>
                                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">Advanced AI Tutor</CardTitle>
                                    <CardDescription className="text-slate-600 dark:text-slate-400">
                                        Specialized AI tutors for Math, Science, Programming, and more subjects
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {["Subject-specific expertise", "Step-by-step problem solving", "Advanced concept explanations"].map((feature, index) => (
                                            <div key={index} className="flex items-center gap-3">
                                                <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle className="h-3 w-3 text-white" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Voice & Image Analysis */}
                            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]">
                                <CardHeader>
                                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                        <Mic className="h-8 w-8 text-white" />
                                    </div>
                                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">Multi-Modal AI</CardTitle>
                                    <CardDescription className="text-slate-600 dark:text-slate-400">
                                        Voice input and image analysis for comprehensive learning support
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {["Voice-to-text questions", "Image and diagram analysis", "Handwritten text recognition"].map((feature, index) => (
                                            <div key={index} className="flex items-center gap-3">
                                                <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle className="h-3 w-3 text-white" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Grade Predictions */}
                            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]">
                                <CardHeader>
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                        <TrendingUp className="h-8 w-8 text-white" />
                                    </div>
                                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">Grade Predictions</CardTitle>
                                    <CardDescription className="text-slate-600 dark:text-slate-400">
                                        AI-powered grade predictions with personalized recommendations
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {["Performance analytics", "Study time optimization", "Improvement suggestions"].map((feature, index) => (
                                            <div key={index} className="flex items-center gap-3">
                                                <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle className="h-3 w-3 text-white" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* CTA for Scholar Features */}
                        <div className="text-center mt-16">
                            <Button 
                                size="lg" 
                                className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] px-8 py-4 text-lg"
                                onClick={() => {
                                    // Activate trial and redirect to advanced dashboard
                                    const { activateTrial } = useChatStore.getState();
                                    activateTrial();
                                    toast({
                                        title: "Trial Activated! 🎉",
                                        description: "Your 14-day Scholar Features trial has started. Enjoy unlimited access!",
                                    });
                                    // Small delay to show toast, then redirect
                                    setTimeout(() => {
                                        window.location.href = '/dashboard/advanced';
                                    }, 1000);
                                }}
                            >
                                Unlock Scholar Features <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
                                Try Scholar features free for 14 days • No credit card required
                            </p>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-purple-900 to-blue-900 dark:from-slate-100 dark:via-purple-100 dark:to-blue-100 bg-clip-text text-transparent">
                                What Students Say
                            </h2>
                            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                                Join students who are already succeeding with CourseConnect's AI-powered study tools
                            </p>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-8">
                            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                                        "CourseConnect helped me improve my grades by 15% this semester. The AI tutor is incredible!"
                                    </p>
                                    <div className="font-semibold text-slate-900 dark:text-slate-100">Sarah M.</div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">Computer Science Student</div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                                        "The study groups feature connected me with amazing classmates. We aced our finals together!"
                                    </p>
                                    <div className="font-semibold text-slate-900 dark:text-slate-100">Alex K.</div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">Biology Major</div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                                        "The flashcards feature is a game-changer. I went from C+ to A- in organic chemistry!"
                                    </p>
                                    <div className="font-semibold text-slate-900 dark:text-slate-100">Maria R.</div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">Chemistry Student</div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
            </main>
            
            {/* Footer */}
            <SiteFooter />

            <Toaster />

            {/* Floating Scroll-to-Top Arrow */}
            <button
                onClick={scrollToTop}
                className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
                aria-label="Scroll to top"
            >
                <ChevronUp className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
            </button>

            {/* PWA Install Prompt */}
            <PWAInstallPrompt />
        </div>
    );
}



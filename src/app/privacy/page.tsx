"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Shield, Eye, Lock, Database, UserCheck, Mail, Phone, CheckCircle, Sparkles, FileText, Clock, Users, Brain, Zap, Globe, Menu, Sun, Moon } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { CourseConnectLogo } from "@/components/icons/courseconnect-logo";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/theme-context";
import { HideAISupport } from "@/components/hide-ai-support";

const privacySections = [
  {
    icon: <Database className="h-6 w-6 text-blue-500" />,
    title: "Information We Collect",
    content: [
      "Account information (name, email, university, major)",
      "Academic data (syllabi, assignments, grades)",
      "Usage data (features used, time spent, interactions)",
      "Communication data (messages, study group interactions)",
      "Device information (browser type, IP address, operating system)"
    ]
  },
  {
    icon: <Eye className="h-6 w-6 text-green-500" />,
    title: "How We Use Your Information",
    content: [
      "Provide and improve our educational services",
      "Personalize your learning experience with AI",
      "Connect you with relevant study groups and classmates",
      "Send important updates about your courses and assignments",
      "Analyze usage patterns to enhance platform features"
    ]
  },
  {
    icon: <Shield className="h-6 w-6 text-blue-500" />,
    title: "Data Protection",
    content: [
      "All data is encrypted in transit and at rest",
      "We comply with FERPA (Family Educational Rights and Privacy Act)",
      "Regular security audits and penetration testing",
      "Access controls and authentication measures",
      "Data backup and disaster recovery procedures"
    ]
  },
  {
    icon: <Lock className="h-6 w-6 text-red-500" />,
    title: "Your Rights",
    content: [
      "Access your personal data at any time",
      "Request correction of inaccurate information",
      "Delete your account and associated data",
      "Opt-out of marketing communications",
      "Export your data in a portable format"
    ]
  }
];

const dataSharing = [
  {
    category: "Never Shared",
    items: [
      "Personal academic records",
      "Private study group conversations",
      "Individual grade information",
      "Personal identification details"
    ]
  },
  {
    category: "Shared with Consent",
    items: [
      "Study group participation (with group members)",
      "Public course discussions (anonymized)",
      "Aggregate usage statistics (no personal data)",
      "Research participation (with explicit consent)"
    ]
  }
];

export default function PrivacyPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-transparent overflow-hidden relative">
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
      
      {/* Dynamic Header */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={cn("flex items-center", isScrolled ? 'justify-center pt-6' : 'h-16 justify-between')}>
            {isScrolled ? (
              /* Scrolled state - Floating capsule header */
              <div className="flex items-center bg-transparent backdrop-blur-md rounded-full px-8 py-4 gap-12">
                {/* Logo */}
                <Link href="/home" className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200">
                  <CourseConnectLogo className="w-6 h-6" />
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    CourseConnect AI
                  </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                  <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium">
                    About
                  </Link>
                  <Link href="/pricing" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium">
                    Pricing
                  </Link>
                  <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium">
                    Sign In
                  </Link>
                </div>

                {/* Desktop CTA */}
                <div className="hidden md:flex items-center gap-4">
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                    <Link href="/dashboard">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Menu className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : (
              /* Normal state - Full width layout */
              <>
                {/* Logo */}
                <Link href="/home" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200">
                  <CourseConnectLogo className="w-8 h-8" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    CourseConnect AI
                  </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8 ml-auto mr-8">
                  <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium">
                    About
                  </Link>
                  <Link href="/pricing" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium">
                    Pricing
                  </Link>
                  <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium">
                    Sign In
                  </Link>
                </div>

                {/* Desktop CTA */}
                <div className="hidden md:flex items-center gap-4">
                  <Button
                    variant="ghost"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm px-3 py-2 h-8"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm px-4 py-2 h-8"
                    asChild
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm px-6 py-2 h-8"
                    asChild
                  >
                    <Link href="/dashboard">Get Started</Link>
                  </Button>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Menu className="h-5 w-5" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

             <main className="flex-1 pt-24 bg-transparent">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-transparent py-16 sm:py-24 lg:py-32">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
          
          <div className="container max-w-6xl mx-auto px-4 sm:px-6 relative">
            <div className="text-center">
              {/* Animated Shield Icon */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl group hover:scale-110 transition-all duration-500">
                    <Shield className="h-12 w-12 text-white group-hover:rotate-12 transition-transform duration-500" />
                  </div>
                  {/* Floating sparkles */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
                </div>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Privacy <span className="bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">Policy</span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
                Your privacy is our priority. Learn how we protect and handle your personal information with enterprise-grade security.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Badge variant="outline" className="text-sm px-4 py-2 bg-transparent backdrop-blur-sm border-blue-200 dark:border-blue-800">
                  <Clock className="h-4 w-4 mr-2" />
                  Last updated: January 16, 2025
                </Badge>
                <Badge variant="outline" className="text-sm px-4 py-2 bg-transparent backdrop-blur-sm border-green-200 dark:border-green-800">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  FERPA Compliant
                </Badge>
                <Badge variant="outline" className="text-sm px-4 py-2 bg-transparent backdrop-blur-sm border-blue-200 dark:border-blue-800">
                  <Lock className="h-4 w-4 mr-2" />
                  End-to-End Encrypted
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <Card className="group relative overflow-hidden bg-transparent border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="relative z-10 p-8 sm:p-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Our Commitment to Privacy
                  </h2>
                  <p className="text-muted-foreground">Trust is the foundation of education</p>
                </div>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                At CourseConnect, we understand that your academic data is sensitive and personal. We are committed to protecting your privacy 
                and ensuring that your information is handled with the utmost care and security. This Privacy Policy explains how we collect, 
                use, and protect your information when you use our platform.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Privacy Sections */}
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              How We <span className="bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">Protect Your Data</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Comprehensive privacy measures designed to keep your academic information secure and private.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
            {privacySections.map((section, index) => (
                     <Card key={index} className="group relative overflow-hidden bg-transparent border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      {section.icon}
                    </div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {section.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ul className="space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-muted-foreground leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Data Sharing */}
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-16">
                 <Card className="group relative overflow-hidden bg-transparent border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Data Sharing and Disclosure
                  </CardTitle>
                  <CardDescription className="text-lg">
                    We are transparent about when and how we share your information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 space-y-8">
              {dataSharing.map((category, index) => (
                <div key={index} className="p-6 bg-transparent rounded-xl backdrop-blur-sm border border-green-200/20 dark:border-green-800/20">
                  <h3 className="font-bold mb-4 text-xl flex items-center gap-2">
                    {category.category === "Never Shared" ? (
                      <Lock className="h-5 w-5 text-red-500" />
                    ) : (
                      <UserCheck className="h-5 w-5 text-green-500" />
                    )}
                    {category.category}
                  </h3>
                  <ul className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-muted-foreground leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Security Measures */}
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Enterprise-Grade <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 bg-clip-text text-transparent">Security</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Multi-layered security measures to protect your academic data with military-grade encryption.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2">
                   <Card className="group relative overflow-hidden bg-transparent border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Technical Safeguards
                  </h4>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-muted-foreground">End-to-end encryption for all data transmission</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-muted-foreground">AES-256 encryption for data at rest</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-muted-foreground">Multi-factor authentication for staff access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-muted-foreground">Regular security audits and penetration testing</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
                   <Card className="group relative overflow-hidden bg-transparent border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Administrative Safeguards
                  </h4>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-muted-foreground">Employee training on data protection</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-muted-foreground">Strict access controls and monitoring</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-muted-foreground">Incident response procedures</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-muted-foreground">Regular privacy impact assessments</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Compliance */}
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Regulatory <span className="bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">Compliance</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We adhere to the highest standards of privacy regulations to protect your educational data.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
                   <Card className="group relative overflow-hidden bg-transparent border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    FERPA Compliance
                  </h4>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground leading-relaxed">
                  We comply with the Family Educational Rights and Privacy Act (FERPA), ensuring that student educational records 
                  are protected and only shared with appropriate parties.
                </p>
              </CardContent>
            </Card>
            
                   <Card className="group relative overflow-hidden bg-transparent border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    GDPR Compliance
                  </h4>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground leading-relaxed">
                  For international users, we comply with the General Data Protection Regulation (GDPR), providing enhanced 
                  privacy rights and data protection measures.
                </p>
              </CardContent>
            </Card>
            
                   <Card className="group relative overflow-hidden bg-transparent border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    COPPA Compliance
                  </h4>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground leading-relaxed">
                  We do not knowingly collect personal information from children under 13 without parental consent, 
                  in compliance with the Children's Online Privacy Protection Act (COPPA).
                </p>
              </CardContent>
            </Card>
          </div>
        </div>


        {/* Updates */}
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-16">
                 <Card className="group relative overflow-hidden bg-transparent border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Policy Updates
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Stay informed about changes to our privacy practices.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-lg text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
                Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy 
                Policy periodically for any changes.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-600 rounded-3xl p-8 sm:p-12 lg:p-16 text-center">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
            
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-transparent rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Mail className="h-8 w-8 text-white" />
                </div>
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Questions About Privacy?
              </h2>
              
              <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
                We're here to help clarify any questions you may have about how we protect your data. 
                Our privacy team is always available to assist you.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg" className="bg-transparent text-white hover:bg-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white">
                    Contact Us <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
      <HideAISupport />
    </div>
  );
}

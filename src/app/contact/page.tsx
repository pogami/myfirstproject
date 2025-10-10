"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ArrowRight, Mail, MessageSquare, Phone, MapPin, Clock, Send, CheckCircle, Sun, Moon, Menu, Loader2 } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { CourseConnectLogo } from "@/components/icons/courseconnect-logo";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/theme-context";
import { AISupportWidget } from "@/components/ai-support-widget";

const contactMethods = [
  {
    icon: <Mail className="h-6 w-6 text-primary" />,
    title: "Email Support",
    description: "Get help via email",
    contact: "courseconnect.noreply@gmail.com",
    response: "Within 24 hours"
  },
  {
    icon: <MessageSquare className="h-6 w-6 text-primary" />,
    title: "Live Chat",
    description: "Chat with our support team",
    contact: "Available 24/7",
    response: "Instant response"
  }
];

const faqs = [
  {
    question: "How do I get started with CourseConnect?",
    answer: "Simply sign up for a free account, upload your syllabus, and start exploring our AI-powered features. No credit card required!"
  },
  {
    question: "Is CourseConnect free to use?",
    answer: "Yes! We offer a free tier with basic features. Premium features are available with our affordable subscription plans."
  },
  {
    question: "How does the AI homework help work?",
    answer: "Our AI analyzes your questions and provides step-by-step explanations, similar to having a personal tutor available 24/7."
  },
  {
    question: "Can I use CourseConnect on my phone?",
    answer: "Absolutely! CourseConnect is fully responsive and works great on all devices - desktop, tablet, and mobile."
  },
  {
    question: "How do study groups work?",
    answer: "You can join existing study groups for your classes or create new ones. Our AI helps match you with classmates and facilitates collaboration."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we take data security seriously. All data is encrypted and we comply with FERPA and other educational privacy regulations."
  }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "",
        message: ""
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
              <div className="flex items-center bg-transparent backdrop-blur-md shadow-lg rounded-full px-8 py-4 gap-12">
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

      <main className="flex-1 pt-24">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
            Contact <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Us</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Have questions? Need help? We're here to support you every step of the way. Get in touch with our team.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Send us a Message
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="What's this about?"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="billing">Billing Question</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="bug">Bug Report</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      className="min-h-[120px]"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
                <CardDescription>
                  Choose the method that works best for you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactMethods.map((method, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg border">
                    <div className="flex-shrink-0">
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{method.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                      <p className="text-sm font-medium text-primary">{method.contact}</p>
                      <p className="text-xs text-muted-foreground mt-1">{method.response}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Support Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">Email Support Available</p>
                  <p className="text-sm text-muted-foreground">
                    We provide email support for all users.<br />
                    Our team responds to inquiries within 24 hours.
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Response time: Within 24 hours
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Frequently Asked Questions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Still Have Questions?</h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/dashboard">
                    Try CourseConnect Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </main>

      <SiteFooter />
      <AISupportWidget />
    </div>
  );
}

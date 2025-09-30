"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowRight, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Upload, 
  GraduationCap,
  Mail,
  ExternalLink,
  Calendar,
  Clock,
  CheckCircle,
  Sparkles,
  Heart,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  History,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { CourseConnectLogo } from "@/components/icons/courseconnect-logo";
import { SafeCompactThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import confetti from 'canvas-confetti';


const quickLinks = [
  { name: "Dashboard", href: "/dashboard", icon: <GraduationCap className="h-4 w-4" /> },
  { name: "Upload Syllabus", href: "/dashboard/upload", icon: <Upload className="h-4 w-4" /> },
  { name: "Study Groups", href: "/dashboard/chat", icon: <Users className="h-4 w-4" /> },
  { name: "Flashcards", href: "/dashboard/flashcards", icon: <BookOpen className="h-4 w-4" /> },
  { name: "Advanced Features", href: "/dashboard/advanced", icon: <Sparkles className="h-4 w-4" /> }
];

const companyLinks = [
  { name: "About Us", href: "/about" },
  { name: "Pricing", href: "/pricing" },
  { name: "Features", href: "/features" },
  { name: "Contact", href: "/contact" },
  { name: "Status", href: "/status" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
  { name: "Site Updates & Changelog", href: "/changelog", icon: <History className="h-4 w-4" /> }
];

const socialLinks = [
  { name: "GitHub", href: "https://github.com/courseconnect", icon: <Github className="h-4 w-4" /> },
  { name: "Twitter", href: "https://twitter.com/courseconnect", icon: <Twitter className="h-4 w-4" /> },
  { name: "LinkedIn", href: "https://linkedin.com/company/courseconnect", icon: <Linkedin className="h-4 w-4" /> },
  { name: "Instagram", href: "https://instagram.com/courseconnect", icon: <Instagram className="h-4 w-4" /> }
];

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmittingEmail(true);
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Subscription successful, triggering confetti!');
        toast({
          title: "Successfully Subscribed!",
          description: data.emailSent 
            ? "Check your email for a welcome message!" 
            : "You're now subscribed! Welcome email sent.",
        });
        setEmail('');
        
        // Enhanced confetti animation
        const duration = 4500; // Longer duration
        const animationEnd = Date.now() + duration;
        const defaults = { 
          startVelocity: 35, // Slightly higher velocity
          spread: 360, 
          ticks: 90, // Longer particle life
          zIndex: 0,
          gravity: 0.75, // More noticeable gravity
          drift: 0.05, // Slight horizontal drift
          scalar: 1.2, // Slightly larger particles
          shapes: ['circle', 'square', 'star'], // Add different shapes
          colors: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#8B5A2B', '#FFD700', '#C0C0C0'] // More colors
        };

        function randomInRange(min: number, max: number) {
          return Math.random() * (max - min) + min;
        }

        const interval: NodeJS.Timeout = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 75 * (timeLeft / duration); // Start with more particles

          // Launch from left
          confetti(Object.assign({}, defaults, {
            particleCount: particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
          }));
          // Launch from right
          confetti(Object.assign({}, defaults, {
            particleCount: particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
          }));
          // Optional: Add a central burst occasionally
          if (Math.random() > 0.7) {
            confetti(Object.assign({}, defaults, {
              particleCount: particleCount / 2,
              angle: randomInRange(60, 120),
              spread: randomInRange(40, 70),
              origin: { x: 0.5, y: 0.5 }
            }));
          }
        }, 200); // Slightly faster interval for more continuous flow
      } else {
        toast({
          variant: "destructive",
          title: "Subscription Failed",
          description: data.error || "Please try again later.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to subscribe. Please try again.",
      });
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  return (
    <footer className="bg-transparent border-t border-border/40">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 lg:gap-12">
            
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <CourseConnectLogo className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-bold text-primary">CourseConnect</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                The ultimate platform for college students to connect, collaborate, and succeed academically with AI-powered tools.
              </p>
              <div className="flex gap-2 sm:gap-3">
                {socialLinks.map((social) => (
                  <Button
                    key={social.name}
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 sm:h-9 sm:w-9 p-0 min-h-[44px] min-w-[44px]"
                    asChild
                  >
                    <Link href={social.href} target="_blank" rel="noopener noreferrer">
                      {social.icon}
                      <span className="sr-only">{social.name}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Access</h4>
              <ul className="space-y-2 sm:space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-1 min-h-[44px]"
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 sm:space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-1 min-h-[44px]"
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter Signup */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Stay Updated</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Get the latest updates on new features and improvements. You can also use this email to create your CourseConnect account.
              </p>
              <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-2">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 min-h-[44px]" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  className="px-4 min-h-[44px] min-w-[44px] sm:w-auto"
                  disabled={isSubmittingEmail}
                >
                  {isSubmittingEmail ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} CourseConnect.</span>
              <span className="hidden sm:inline">•</span>
              <span>All rights reserved.</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Made with</span>
                <Heart className="h-4 w-4 text-red-500" />
                <span>for students worldwide</span>
              </div>
              <div className="flex items-center gap-2">
                <SafeCompactThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}

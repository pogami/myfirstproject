
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MessageSquare, Upload, BookOpen, Users, TrendingUp, Clock, Star, ArrowRight, Sparkles, Target, Zap } from "lucide-react";
import Notifications from "@/components/notifications";
import { StatCards } from "@/components/stat-cards";
import { useChatStore } from "@/hooks/use-chat-store";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/client";

const quickActionCards = [
    {
        title: "Upload Syllabus",
        description: "Add a new class syllabus to join study groups and unlock AI-powered features",
        icon: <Upload className="size-8 text-primary" />,
        href: "/dashboard/upload",
        buttonText: "Upload Now",
        variant: "default" as const,
        gradient: "from-blue-500 to-purple-600",
        stats: "AI Analysis",
        features: ["Smart parsing", "Auto-class detection", "Study group matching"]
    },
    {
        title: "Join Class Chats",
        description: "Connect with classmates in real-time with AI-powered study assistance",
        icon: <MessageSquare className="size-8 text-green-500" />,
        href: "/dashboard/chat",
        buttonText: "Start Chatting",
        variant: "default" as const,
        gradient: "from-green-500 to-emerald-600",
        stats: "Live Support",
        features: ["Real-time chat", "AI tutoring", "Group collaboration"]
    },
    {
        title: "Browse Classes",
        description: "Discover all available classes and see student engagement metrics",
        icon: <BookOpen className="size-8 text-amber-500" />,
        href: "/dashboard/overview",
        buttonText: "Explore",
        variant: "default" as const,
        gradient: "from-amber-500 to-orange-600",
        stats: "Active Classes",
        features: ["Class discovery", "Student counts", "Activity tracking"]
    }
]

const featureHighlights = [
    {
        icon: <Sparkles className="size-6 text-purple-500" />,
        title: "AI-Powered Learning",
        description: "Get instant help with homework and study questions"
    },
    {
        icon: <Target className="size-6 text-blue-500" />,
        title: "Smart Flashcards",
        description: "Auto-generated flashcards from your syllabus content"
    },
    {
        icon: <Zap className="size-6 text-yellow-500" />,
        title: "Instant Notifications",
        description: "Stay updated with class announcements and deadlines"
    }
]

export default function DashboardPage() {
  const { chats } = useChatStore();
  const [user] = useAuthState(auth);
  const classCount = Object.keys(chats).filter(key => key !== 'general-chat').length;
  const totalMessages = Object.values(chats).reduce((sum, chat) => sum + chat.messages.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="animate-in fade-in-50 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 border border-primary/20">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-primary/10">
                <Sparkles className="size-6 text-primary" />
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Welcome Back!
              </Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Welcome to CourseConnect
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Your unified platform for college success. Connect with classmates, manage assignments, and stay organized with AI-powered tools.
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <BookOpen className="size-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{classCount}</p>
                  <p className="text-sm text-muted-foreground">Active Classes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <MessageSquare className="size-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{totalMessages}</p>
                  <p className="text-sm text-muted-foreground">Messages Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <TrendingUp className="size-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">98%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Clock className="size-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">24/7</p>
                  <p className="text-sm text-muted-foreground">AI Support</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>
            <Badge variant="outline" className="text-xs">Get Started</Badge>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quickActionCards.map((card, index) => (
              <Card key={card.title} className="group relative overflow-hidden border-0 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:bg-card/80">
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                <CardContent className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-lg`}>
                      {card.icon}
                    </div>
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                      {card.stats}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                    {card.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    {card.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-primary"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button asChild className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0" variant="default">
                    <Link href={card.href} className="flex items-center justify-center gap-2 font-medium">
                      {card.buttonText}
                      <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Feature Highlights */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Why CourseConnect?</h2>
            <Badge variant="outline" className="text-xs">Features</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featureHighlights.map((feature, index) => (
              <Card key={feature.title} className="border-0 bg-gradient-to-br from-background to-muted/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-xl bg-muted/50">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="border-0 bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5 text-primary" />
                  Your Study Groups
                </CardTitle>
                <CardDescription>Connect with classmates and join study sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {classCount > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <BookOpen className="size-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">You have {classCount} active class{classCount !== 1 ? 'es' : ''}</p>
                        <p className="text-sm text-muted-foreground">Click to view and join study groups</p>
                      </div>
                      <Button asChild size="sm" className="bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 text-primary border-primary/20 hover:border-primary/30 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md">
                        <Link href="/dashboard/overview">View Classes</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="p-4 rounded-full bg-muted/30 w-fit mx-auto mb-4">
                      <BookOpen className="size-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">No study groups yet</h3>
                    <p className="text-muted-foreground mb-4">Upload a syllabus to find and join study groups</p>
                    <Button asChild className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 font-medium">
                      <Link href="/dashboard/upload">
                        <Upload className="mr-2 h-5 w-5" />
                        Upload Syllabus
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div>
            <Notifications />
          </div>
        </div>
      </div>
    </div>
  );
}

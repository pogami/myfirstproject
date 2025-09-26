"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, Calendar, Users, Sparkles, CheckCircle, AlertCircle, BookOpen, TrendingUp, Clock, ArrowRight } from "lucide-react";
import Notifications from "@/components/notifications";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function NotificationsPage() {
  const { toast } = useToast();

  const classNotifications = [
    {
      id: "bio101",
      class: "BIO-101",
      title: "New Study Group Activity",
      description: "Sarah shared a study guide for Chapter 5",
      time: "2 minutes ago",
      type: "study_group",
      icon: <Users className="size-5 text-blue-500" />
    },
    {
      id: "cs202",
      class: "CS-202",
      title: "Assignment Reminder",
      description: "Data Structures Project due in 3 days",
      time: "1 hour ago",
      type: "assignment",
      icon: <Calendar className="size-5 text-green-500" />
    },
    {
      id: "eng210",
      class: "ENG-210",
      title: "New Message",
      description: "Professor Johnson posted class notes",
      time: "2 hours ago",
      type: "message",
      icon: <MessageSquare className="size-5 text-purple-500" />
    }
  ];

  const quickActions = [
    {
      title: "Mark All as Read",
      icon: <CheckCircle className="size-4" />,
      action: "read",
      color: "text-green-500"
    },
    {
      title: "Clear All",
      icon: <AlertCircle className="size-4" />,
      action: "clear",
      color: "text-red-500"
    },
    {
      title: "View All Classes",
      icon: <BookOpen className="size-4" />,
      action: "classes",
      color: "text-blue-500"
    },
    {
      title: "Study Progress",
      icon: <TrendingUp className="size-4" />,
      action: "progress",
      color: "text-purple-500"
    }
  ];

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "read":
        toast({
          title: "Notifications Marked as Read",
          description: "All notifications have been marked as read.",
        });
        break;
      case "clear":
        toast({
          title: "Notifications Cleared",
          description: "All notifications have been cleared.",
        });
        break;
      case "classes":
        window.location.href = "/dashboard/overview";
        break;
      case "progress":
        window.location.href = "/dashboard/flashcards";
        break;
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 border border-primary/20">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-primary/10">
                <Bell className="size-6 text-primary" />
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Class Updates
              </Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Notifications
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Stay connected with your classes and study groups. Never miss important updates, 
              assignment deadlines, or study group activities.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 bg-gradient-to-br from-card/50 to-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Manage your notifications and navigate quickly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action, index) => (
                <Button
                  key={action.title}
                  variant="ghost"
                  onClick={() => handleQuickAction(action.action)}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/20 hover:from-primary/10 hover:to-primary/5 transition-all duration-300 hover:scale-105 hover:shadow-md border border-transparent hover:border-primary/20 h-auto justify-start hover:bg-transparent"
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 ${action.color}`}>
                    {action.icon}
                  </div>
                  <span className="font-medium text-sm">{action.title}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Class Notifications */}
        <Card className="border-0 bg-gradient-to-br from-card/50 to-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-5 text-primary" />
              Class Notifications
            </CardTitle>
            <CardDescription>
              Updates from your enrolled classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {classNotifications.map((notification, index) => (
                <div 
                  key={notification.id}
                  className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 hover:from-primary/5 hover:to-primary/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-sm border border-transparent hover:border-primary/20"
                >
                  <div className="p-3 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30">
                    {notification.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {notification.class}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{notification.time}</span>
                    </div>
                    <h3 className="font-semibold text-base">{notification.title}</h3>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-transparent">
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Notifications */}
        <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-xl hover:shadow-2xl transition-all duration-500">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <Bell className="size-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Recent Activity
            </CardTitle>
            <CardDescription className="text-lg">
              Your latest updates and messages
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Notifications />
          </CardContent>
        </Card>

        {/* Study Progress Quick View */}
        <Card className="border-0 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <TrendingUp className="size-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Track Your Progress</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Monitor your study progress across all classes. See how you're doing with flashcards, 
              assignments, and study group participation.
            </p>
            <Button asChild className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0">
              <Link href="/dashboard/flashcards">
                <TrendingUp className="mr-2 h-5 w-5" />
                View Progress
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
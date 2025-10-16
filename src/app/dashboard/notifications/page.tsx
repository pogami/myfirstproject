"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, Calendar, Users, Sparkles, CheckCircle, AlertCircle, BookOpen, TrendingUp, Clock, ArrowRight, GraduationCap } from "lucide-react";
import Notifications from "@/components/notifications";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/use-notifications";
import { useChatStore } from "@/hooks/use-chat-store";
import Link from "next/link";
import { auth } from "@/lib/firebase/client-simple";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const { toast } = useToast();
  const [user, setUser] = useState(auth.currentUser);
  const { chats } = useChatStore();
  const { notifications, markAsRead, markAllAsRead, clearAllNotifications } = useNotifications(user);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  // Convert real notifications to display format
  const classNotifications = notifications.slice(0, 10).map((notification) => {
    // Get class information from chatId
    const chat = chats[notification.classId || ''];
    const courseCode = chat?.courseData?.courseCode || chat?.title || 'Unknown Class';
    
    // Determine icon based on notification type
    let icon;
    switch (notification.type) {
      case 'assignment':
        icon = <GraduationCap className="size-5 text-green-500" />;
        break;
      case 'exam':
        icon = <Calendar className="size-5 text-red-500" />;
        break;
      case 'message':
        icon = <MessageSquare className="size-5 text-purple-500" />;
        break;
      case 'study_group':
        icon = <Users className="size-5 text-blue-500" />;
        break;
      case 'reminder':
        icon = <Clock className="size-5 text-yellow-500" />;
        break;
      case 'system':
        icon = <AlertCircle className="size-5 text-gray-500" />;
        break;
      default:
        icon = <Bell className="size-5 text-primary" />;
    }

    return {
      id: notification.id,
      class: courseCode,
      title: notification.title,
      description: notification.description,
      time: formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true }),
      type: notification.type,
      icon,
      isRead: notification.isRead,
      priority: notification.priority
    };
  });

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
        markAllAsRead();
        toast({
          title: "Notifications Marked as Read",
          description: "All notifications have been marked as read.",
        });
        break;
      case "clear":
        clearAllNotifications();
        toast({
          title: "Notifications Cleared",
          description: "All notifications have been cleared.",
        });
        break;
      case "classes":
        window.location.href = "/dashboard";
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
              {classNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="size-12 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">No notifications yet</h3>
                  <p className="text-sm text-muted-foreground">You'll see updates from your classes here when they're available.</p>
                </div>
              ) : (
                classNotifications.map((notification, index) => (
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
                ))
              )}
            </div>
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
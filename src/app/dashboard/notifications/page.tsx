
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, Calendar, Users, Settings, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import Notifications from "@/components/notifications";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function NotificationsPage() {
  const { toast } = useToast();
  const [notificationSettings, setNotificationSettings] = useState([
    {
      id: "chat",
      icon: <MessageSquare className="size-5 text-blue-500" />,
      title: "Chat Notifications",
      description: "New messages and mentions in study groups",
      enabled: true
    },
    {
      id: "assignments",
      icon: <Calendar className="size-5 text-green-500" />,
      title: "Assignment Reminders",
      description: "Deadlines and important dates",
      enabled: true
    },
    {
      id: "groups",
      icon: <Users className="size-5 text-purple-500" />,
      title: "Study Group Updates",
      description: "New members and group activities",
      enabled: false
    }
  ]);

  const quickActions = [
    {
      title: "Mark All as Read",
      icon: <CheckCircle className="size-4" />,
      action: "read"
    },
    {
      title: "Clear All",
      icon: <AlertCircle className="size-4" />,
      action: "clear"
    },
    {
      title: "Settings",
      icon: <Settings className="size-4" />,
      action: "settings"
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
      case "settings":
        toast({
          title: "Settings",
          description: "Notification settings opened.",
        });
        break;
    }
  };

  const toggleNotificationSetting = (id: string) => {
    setNotificationSettings(prev => 
      prev.map(setting => 
        setting.id === id 
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
    
    const setting = notificationSettings.find(s => s.id === id);
    toast({
      title: `${setting?.title} ${setting?.enabled ? 'Disabled' : 'Enabled'}`,
      description: `You will ${setting?.enabled ? 'no longer' : 'now'} receive ${setting?.title.toLowerCase()}.`,
    });
  };
    return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
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
                Stay Updated
              </Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Notifications
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Stay connected with your study groups and never miss important updates. 
              Manage your notification preferences and stay on top of your academic life.
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
              Manage your notifications efficiently
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {quickActions.map((action, index) => (
                <Button
                  key={action.title}
                  variant="ghost"
                  onClick={() => handleQuickAction(action.action)}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/20 hover:from-primary/10 hover:to-primary/5 transition-all duration-300 hover:scale-105 hover:shadow-md border border-transparent hover:border-primary/20 h-auto justify-start"
                >
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                    {action.icon}
                  </div>
                  <span className="font-medium text-sm">{action.title}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card className="border-0 bg-gradient-to-br from-card/50 to-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="size-5 text-primary" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Customize what notifications you receive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notificationSettings.map((type, index) => (
                <div 
                  key={type.id} 
                  onClick={() => toggleNotificationSetting(type.id)}
                  className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 hover:from-primary/5 hover:to-primary/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-sm border border-transparent hover:border-primary/20 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30">
                      {type.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">{type.title}</h3>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                  <Badge variant={type.enabled ? "default" : "secondary"} className="px-3 py-1 text-xs font-medium">
                    {type.enabled ? "Enabled" : "Disabled"}
                  </Badge>
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
              Recent Notifications
            </CardTitle>
            <CardDescription className="text-lg">
              Your latest updates and messages
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Notifications />
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="border-0 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Bell className="size-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Pro Tip</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Enable push notifications to stay updated even when you're not actively using the app. 
              You'll never miss important study group messages or assignment deadlines.
            </p>
            <Badge variant="outline" className="text-xs">
              <Settings className="size-3 mr-1" />
              Adjust in settings
            </Badge>
          </CardContent>
        </Card>
      </div>
        </div>
  );
}

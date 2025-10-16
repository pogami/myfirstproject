'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NotificationService } from '@/lib/notification-service';
import { useToast } from '@/hooks/use-toast';
import { Bell, CheckCircle, AlertTriangle, Clock, MessageSquare, Users, Settings } from 'lucide-react';

export default function TestNotificationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [testUserId] = useState('test-user-123'); // Fixed test user ID
  const { toast } = useToast();

  const testNotifications = [
    {
      title: "🎉 Assignment Completed!",
      description: "Great job! You've completed 'Math Homework 5'. Keep up the excellent work!",
      type: "assignment" as const,
      priority: "high" as const,
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "⚠️ Assignment Overdue",
      description: "'Physics Lab Report' is now overdue. Consider prioritizing this assignment.",
      type: "assignment" as const,
      priority: "high" as const,
      icon: AlertTriangle,
      color: "text-red-600"
    },
    {
      title: "⏰ Assignment Due Soon",
      description: "'English Essay' is due soon. Don't forget to complete it!",
      type: "assignment" as const,
      priority: "medium" as const,
      icon: Clock,
      color: "text-orange-600"
    },
    {
      title: "📝 Assignment Started",
      description: "You've started working on 'Chemistry Lab'. Keep going!",
      type: "assignment" as const,
      priority: "low" as const,
      icon: CheckCircle,
      color: "text-blue-600"
    },
    {
      title: "📊 Upcoming Exam: Calculus Final",
      description: "Your Calculus exam is scheduled for December 15th at 2:00 PM.",
      type: "exam" as const,
      priority: "high" as const,
      icon: AlertTriangle,
      color: "text-red-600"
    },
    {
      title: "💬 Message from Professor",
      description: "Professor Johnson posted new class notes and updated the syllabus.",
      type: "message" as const,
      priority: "medium" as const,
      icon: MessageSquare,
      color: "text-blue-600"
    },
    {
      title: "👥 New Study Group Message",
      description: "Sarah shared a study guide for Chapter 5 in the Biology study group.",
      type: "study_group" as const,
      priority: "low" as const,
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "⏰ FAFSA Deadline Reminder",
      description: "The deadline for FAFSA applications is approaching. Complete your application soon.",
      type: "reminder" as const,
      priority: "high" as const,
      icon: Clock,
      color: "text-orange-600"
    },
    {
      title: "🔧 System Maintenance",
      description: "CourseConnect will undergo maintenance this Sunday from 2:00 AM to 4:00 AM EST.",
      type: "system" as const,
      priority: "low" as const,
      icon: Settings,
      color: "text-gray-600"
    }
  ];

  const createSingleNotification = async (notification: typeof testNotifications[0]) => {
    setIsLoading(true);
    try {
      console.log('🔔 Creating test notification:', notification);
      
      const notificationId = await NotificationService.createNotification({
        title: notification.title,
        description: notification.description,
        type: notification.type,
        priority: notification.priority,
        classId: 'test-class-123',
        actionUrl: '/dashboard/chat'
      }, testUserId);

      console.log('🔔 Notification created with ID:', notificationId);
      
      toast({
        title: "Notification Created!",
        description: `${notification.title} has been created successfully. Check the bell icon!`,
      });
    } catch (error) {
      console.error('🔔 Error creating notification:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not create notification: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createAllSampleNotifications = async () => {
    setIsLoading(true);
    try {
      console.log('🔔 Creating all sample notifications for test user:', testUserId);
      
      const notificationIds = await NotificationService.createSampleNotifications(testUserId);
      
      console.log('🔔 Created sample notifications:', notificationIds);
      
      toast({
        title: "All Sample Notifications Created!",
        description: `Created ${notificationIds.length} sample notifications. Check the bell icon!`,
      });
    } catch (error) {
      console.error('🔔 Error creating sample notifications:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create sample notifications. Check console for details.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createWelcomeNotifications = async () => {
    setIsLoading(true);
    try {
      console.log('🔔 Creating welcome notifications for test user:', testUserId);
      
      // Create welcome notifications
      await NotificationService.createNotification({
        title: "🎉 Welcome to CourseConnect!",
        description: "You're all set up! Start by uploading your course syllabi to get personalized assignments and study reminders.",
        type: "system",
        priority: "high"
      }, testUserId);
      
      await NotificationService.createNotification({
        title: "📚 Upload Your Syllabi",
        description: "Upload your course syllabi to automatically track assignments, exams, and important dates.",
        type: "reminder",
        priority: "medium",
        actionUrl: "/dashboard/chat"
      }, testUserId);
      
      await NotificationService.createNotification({
        title: "💡 Pro Tip",
        description: "Use the AI chat to ask questions about your courses and get personalized study help!",
        type: "system",
        priority: "low",
        actionUrl: "/dashboard/chat"
      }, testUserId);
      
      toast({
        title: "Welcome Notifications Created!",
        description: "Created 3 welcome notifications for new users.",
      });
    } catch (error) {
      console.error('🔔 Error creating welcome notifications:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create welcome notifications. Check console for details.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🔔 Notification Testing Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test all notification types and features without needing to log in
          </p>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Test User ID:</strong> {testUserId}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              All notifications will be created for this test user. Check the bell icon in the dashboard to see them!
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                Sample Notifications
              </CardTitle>
              <CardDescription>
                Create all 6 sample notification types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={createAllSampleNotifications}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Creating..." : "Create All Sample Notifications"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Welcome Notifications
              </CardTitle>
              <CardDescription>
                Create welcome notifications for new users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={createWelcomeNotifications}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? "Creating..." : "Create Welcome Notifications"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                Test Complete
              </CardTitle>
              <CardDescription>
                Go to dashboard to see notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                variant="secondary"
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Individual Notification Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Individual Notification Tests</CardTitle>
            <CardDescription>
              Test each notification type individually
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testNotifications.map((notification, index) => {
                const IconComponent = notification.icon;
                return (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <IconComponent className={`h-5 w-5 ${notification.color} mt-0.5`} />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                          {notification.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {notification.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant={
                        notification.priority === 'high' ? 'destructive' :
                        notification.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {notification.priority}
                      </Badge>
                      <Badge variant="outline">
                        {notification.type}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => createSingleNotification(notification)}
                      disabled={isLoading}
                      size="sm"
                      className="w-full mt-3"
                    >
                      Create This Notification
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">1. Create Notifications</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Click "Create All Sample Notifications" for quick test</li>
                  <li>• Or test individual notifications one by one</li>
                  <li>• Check console logs for debugging info</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">2. View Notifications</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Go to dashboard (click "Go to Dashboard")</li>
                  <li>• Look for bell icon in top-right corner</li>
                  <li>• Click bell to see all notifications</li>
                </ul>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> You don't need to log in to test notifications! The test page creates notifications for a test user ID that the notification system can display.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

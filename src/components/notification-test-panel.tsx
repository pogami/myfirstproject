'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Plus, Trash2, Loader2 } from 'lucide-react';
import { NotificationService } from '@/lib/notification-service';
import { auth } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';

export function NotificationTestPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const user = auth.currentUser;

  const handleCreateSampleNotifications = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create notifications.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const notificationIds = await NotificationService.createSampleNotifications(user.uid);
      toast({
        title: "Sample Notifications Created",
        description: `Created ${notificationIds.length} sample notifications.`,
      });
    } catch (error) {
      console.error('Error creating sample notifications:', error);
      toast({
        title: "Error",
        description: "Failed to create sample notifications.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAssignmentReminder = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create notifications.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await NotificationService.createAssignmentReminder(
        user.uid,
        "Final Project",
        "in 3 days",
        "CS-202",
        "cs-202"
      );
      toast({
        title: "Assignment Reminder Created",
        description: "A new assignment reminder has been added.",
      });
    } catch (error) {
      console.error('Error creating assignment reminder:', error);
      toast({
        title: "Error",
        description: "Failed to create assignment reminder.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateExamReminder = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create notifications.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await NotificationService.createExamReminder(
        user.uid,
        "Mid-term Exam",
        "next Tuesday at 2:00 PM",
        "MATH-101",
        "math-101"
      );
      toast({
        title: "Exam Reminder Created",
        description: "A new exam reminder has been added.",
      });
    } catch (error) {
      console.error('Error creating exam reminder:', error);
      toast({
        title: "Error",
        description: "Failed to create exam reminder.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStudyGroupNotification = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create notifications.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await NotificationService.createStudyGroupNotification(
        user.uid,
        "Biology Study Group",
        "New study materials have been shared for Chapter 6.",
        "bio-101"
      );
      toast({
        title: "Study Group Notification Created",
        description: "A new study group notification has been added.",
      });
    } catch (error) {
      console.error('Error creating study group notification:', error);
      toast({
        title: "Error",
        description: "Failed to create study group notification.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Test Notifications
          <Badge variant="secondary" className="ml-auto">Dev</Badge>
        </CardTitle>
        <CardDescription>
          Create sample notifications to test the real-time notification system.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={handleCreateSampleNotifications}
          disabled={isLoading}
          className="w-full"
          variant="outline"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Create Sample Notifications
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleCreateAssignmentReminder}
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            Assignment
          </Button>
          <Button
            onClick={handleCreateExamReminder}
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            Exam
          </Button>
        </div>

        <Button
          onClick={handleCreateStudyGroupNotification}
          disabled={isLoading}
          size="sm"
          variant="outline"
          className="w-full"
        >
          Study Group
        </Button>
      </CardContent>
    </Card>
  );
}

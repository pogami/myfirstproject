'use client';

import { useEffect, useState, useRef } from "react";
import { auth } from "@/lib/firebase/client-simple";
import { useNotifications } from "@/hooks/use-notifications";
import { toast } from "sonner";
import { 
  Bell,
  CalendarClock, 
  GraduationCap, 
  MessageSquare, 
  Users, 
  AlertCircle 
} from "lucide-react";
import type { Notification } from "@/hooks/use-notifications";

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'assignment':
      return <GraduationCap className="h-4 w-4" />;
    case 'exam':
      return <CalendarClock className="h-4 w-4" />;
    case 'message':
      return <MessageSquare className="h-4 w-4" />;
    case 'reminder':
      return <Bell className="h-4 w-4" />;
    case 'study_group':
      return <Users className="h-4 w-4" />;
    case 'system':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

export function NotificationToastListener() {
  const [user, setUser] = useState(auth.currentUser);
  const { notifications } = useNotifications(user);
  const previousNotificationIds = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  // Show toast for new notifications
  useEffect(() => {
    if (notifications.length === 0) return;

    // On initial load, just store the IDs without showing toasts
    if (isInitialLoad.current) {
      notifications.forEach(notification => {
        previousNotificationIds.current.add(notification.id);
      });
      isInitialLoad.current = false;
      return;
    }

    // Check for new notifications
    notifications.forEach(notification => {
      if (!previousNotificationIds.current.has(notification.id)) {
        // This is a new notification - show toast
        previousNotificationIds.current.add(notification.id);
        
        const icon = getNotificationIcon(notification.type);
        
        toast(notification.title, {
          description: notification.description,
          icon: icon,
          duration: 5000,
          action: notification.priority === 'high' ? {
            label: 'View',
            onClick: () => window.location.href = '/dashboard/notifications'
          } : undefined,
        });
      }
    });

    // Clean up old IDs that are no longer in the notifications list
    const currentIds = new Set(notifications.map(n => n.id));
    previousNotificationIds.current = new Set(
      Array.from(previousNotificationIds.current).filter(id => currentIds.has(id))
    );
  }, [notifications]);

  // This component doesn't render anything
  return null;
}


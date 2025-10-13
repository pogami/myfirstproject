'use client';

import { useState, useEffect } from "react";
import { Bell, CheckCircle, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, Notification } from "@/hooks/use-notifications";
import { auth } from "@/lib/firebase/client-simple";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import { 
  CalendarClock, 
  GraduationCap, 
  MessageSquare, 
  Users, 
  AlertCircle 
} from "lucide-react";

const getNotificationIcon = (type: Notification['type'], priority: Notification['priority']) => {
  const iconClass = `h-4 w-4 ${
    priority === 'high' ? 'text-red-500' : 
    priority === 'medium' ? 'text-blue-500' : 
    'text-gray-500'
  }`;

  switch (type) {
    case 'assignment':
      return <GraduationCap className={iconClass} />;
    case 'exam':
      return <CalendarClock className={iconClass} />;
    case 'message':
      return <MessageSquare className={iconClass} />;
    case 'reminder':
      return <Bell className={iconClass} />;
    case 'study_group':
      return <Users className={iconClass} />;
    case 'system':
      return <AlertCircle className={iconClass} />;
    default:
      return <Bell className={iconClass} />;
  }
};

export function NotificationBell() {
  const [user, setUser] = useState(auth.currentUser);
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications(user);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
    toast.success("Marked as read");
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    toast.success("All notifications marked as read");
  };

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId);
    toast.success("Notification deleted");
  };

  const handleClearAll = async () => {
    await clearAllNotifications();
    toast.success("All notifications cleared");
  };

  const displayedNotifications = notifications.slice(0, 5);
  const hasMore = notifications.length > 5;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full hover:bg-muted"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-[10px] font-bold border-2 border-background"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50"
              >
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
              >
                Clear all
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Bell className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground/60 mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {displayedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group relative flex items-start gap-3 p-4 transition-colors hover:bg-muted/50 ${
                    !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                  }`}
                >
                  <div className="mt-0.5 h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-full bg-muted">
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>
                  
                  <div className="flex-grow min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium leading-tight ${
                        !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {notification.title}
                      </p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!notification.isRead && (
                            <DropdownMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as read
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDelete(notification.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.description}
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      {notification.createdAt 
                        ? formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true })
                        : 'Just now'}
                    </p>
                  </div>

                  {!notification.isRead && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {(hasMore || notifications.length > 0) && (
          <div className="p-3 border-t bg-muted/30">
            <Link href="/dashboard/notifications" onClick={() => setOpen(false)}>
              <Button 
                variant="ghost" 
                className="w-full justify-center text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50"
              >
                {hasMore ? `View all ${notifications.length} notifications` : 'View all notifications'}
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}


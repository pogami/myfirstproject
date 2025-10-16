'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase/client-simple';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { User } from 'firebase/auth';

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'assignment' | 'exam' | 'message' | 'reminder' | 'system' | 'study_group';
  isRead: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
  classId?: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  icon?: string;
}

export function useNotifications(user: User | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Normalize guest notifications stored in localStorage to match Timestamp API
  const toGuestTimestamp = (ms: number) => ({ toDate: () => new Date(ms) } as unknown as Timestamp);
  const normalizeGuestNotification = (n: any): Notification => ({
    id: n.id,
    title: n.title,
    description: n.description,
    type: n.type,
    isRead: Boolean(n.isRead),
    createdAt: toGuestTimestamp(typeof n.createdAtMs === 'number' ? n.createdAtMs : Date.now()),
    updatedAt: toGuestTimestamp(typeof n.updatedAtMs === 'number' ? n.updatedAtMs : Date.now()),
    userId: 'guest',
    actionUrl: n.actionUrl,
    priority: n.priority || 'low',
    icon: n.icon,
  });

  // Listen to real-time notifications (only for authenticated users)
  useEffect(() => {
    // Special case: Show test user notifications even when not logged in
    const isTestMode = window.location.pathname === '/test-notifications' || window.location.pathname.includes('test-notifications');
    
    if (!user && !isTestMode) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    // Handle test page: prefer local guest notifications if present; otherwise use Firestore test user
    if (isTestMode) {
      try {
        const guestRaw = localStorage.getItem('guest-notifications');
        if (guestRaw) {
          const parsed = JSON.parse(guestRaw);
          const list = parsed.map((n: any) => ({
            id: n.id,
            title: n.title,
            description: n.description,
            type: n.type,
            isRead: Boolean(n.isRead),
            createdAt: { toDate: () => new Date(n.createdAtMs || Date.now()) } as any,
            updatedAt: { toDate: () => new Date(n.updatedAtMs || Date.now()) } as any,
            userId: 'guest',
            actionUrl: n.actionUrl,
            priority: n.priority || 'low',
            icon: n.icon,
          })) as Notification[];
          const unread = list.filter(n => !n.isRead).length;
          setNotifications(list);
          setUnreadCount(unread);
          setIsLoading(false);
          // Poll localStorage for changes while on test page
          const interval = setInterval(() => {
            try {
              const updated = localStorage.getItem('guest-notifications');
              if (updated) {
                const arr = JSON.parse(updated).map((n: any) => ({
                  id: n.id,
                  title: n.title,
                  description: n.description,
                  type: n.type,
                  isRead: Boolean(n.isRead),
                  createdAt: { toDate: () => new Date(n.createdAtMs || Date.now()) } as any,
                  updatedAt: { toDate: () => new Date(n.updatedAtMs || Date.now()) } as any,
                  userId: 'guest',
                  actionUrl: n.actionUrl,
                  priority: n.priority || 'low',
                  icon: n.icon,
                })) as Notification[];
                setNotifications(arr);
                setUnreadCount(arr.filter(n => !n.isRead).length);
              }
            } catch {}
          }, 2000);
          return () => clearInterval(interval);
        }
      } catch {}

      const testUserId = 'test-user-123';
      const unsubscribe = onSnapshot(
        query(
          collection(db, 'notifications'),
          where('userId', '==', testUserId),
          orderBy('createdAt', 'desc')
        ),
        (snapshot) => {
          const testNotifications: Notification[] = [];
          let unread = 0;
          snapshot.forEach((doc) => {
            const data = doc.data();
            testNotifications.push({ id: doc.id, ...data } as Notification);
            if (!data.isRead) unread++;
          });
          setNotifications(testNotifications);
          setUnreadCount(unread);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error loading test notifications:', error);
          setError(error.message);
          setIsLoading(false);
        }
      );
      return unsubscribe;
    }

    // Handle guest users - read from localStorage
    if ((user as any)?.isGuest) {
      console.log('🔔 Loading guest notifications from localStorage');
      try {
        const guestNotifications = localStorage.getItem('guest-notifications');
        console.log('🔔 Raw guest notifications from localStorage:', guestNotifications);
        let notificationsList: Notification[] = [];
        let unread = 0;
        
        if (guestNotifications) {
          try {
            const parsed = JSON.parse(guestNotifications);
            notificationsList = parsed.map((n: any) => normalizeGuestNotification(n));
            unread = notificationsList.filter((n: any) => !n.isRead).length;
            console.log('🔔 Parsed guest notifications:', notificationsList.length, 'total,', unread, 'unread');
          } catch (error) {
            console.warn('Error parsing guest notifications:', error);
          }
        } else {
          console.log('🔔 No guest notifications found in localStorage');
        }
        
        setNotifications(notificationsList);
        setUnreadCount(unread);
        setIsLoading(false);
        
        // Set up interval to check for new notifications
        const interval = setInterval(() => {
          const updatedNotifications = localStorage.getItem('guest-notifications');
          if (updatedNotifications) {
            try {
              const parsed = JSON.parse(updatedNotifications).map((n: any) => normalizeGuestNotification(n));
              const newUnread = parsed.filter((n: any) => !n.isRead).length;
              setNotifications(parsed as any);
              setUnreadCount(newUnread);
            } catch (error) {
              console.warn('Error parsing updated guest notifications:', error);
            }
          }
        }, 2000); // Check every 2 seconds
        
        return () => clearInterval(interval);
      } catch (error) {
        console.error('Error loading guest notifications:', error);
        setNotifications([]);
        setUnreadCount(0);
        setIsLoading(false);
        return;
      }
    }

    // Handle authenticated users - read from Firebase
    const userId = user.uid;

    setIsLoading(true);
    setError(null);

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notificationsData: Notification[] = [];
        let unread = 0;

        snapshot.forEach((doc) => {
          const data = doc.data() as Omit<Notification, 'id'>;
          notificationsData.push({
            id: doc.id,
            ...data,
          });
          if (!data.isRead) unread++;
        });

        setNotifications(notificationsData);
        setUnreadCount(unread);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching notifications:', error);
        setError('Failed to load notifications');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    // Handle guest users - update localStorage
    if ((user as any)?.isGuest) {
      try {
        const guestNotifications = localStorage.getItem('guest-notifications');
        if (guestNotifications) {
          const arr = JSON.parse(guestNotifications);
          const updatedNotifications = arr.map((n: any) => 
            n.id === notificationId ? { ...n, isRead: true, updatedAtMs: Date.now() } : n
          );
          localStorage.setItem('guest-notifications', JSON.stringify(updatedNotifications));
          
          // Update local state
          const normalized = updatedNotifications.map((n: any) => normalizeGuestNotification(n));
          setNotifications(normalized);
          setUnreadCount(normalized.filter((n: any) => !n.isRead).length);
        }
      } catch (error) {
        console.error('Error marking guest notification as read:', error);
      }
      return;
    }

    // Handle authenticated users - update Firebase
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;

    // Handle guest users - update localStorage
    if ((user as any)?.isGuest) {
      try {
        const guestNotifications = localStorage.getItem('guest-notifications');
        if (guestNotifications) {
          const arr = JSON.parse(guestNotifications);
          const updatedNotifications = arr.map((n: any) => ({ ...n, isRead: true, updatedAtMs: Date.now() }));
          localStorage.setItem('guest-notifications', JSON.stringify(updatedNotifications));
          
          // Update local state
          const normalized = updatedNotifications.map((n: any) => normalizeGuestNotification(n));
          setNotifications(normalized);
          setUnreadCount(0);
        }
      } catch (error) {
        console.error('Error marking all guest notifications as read:', error);
      }
      return;
    }

    // Handle authenticated users - update Firebase
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      const updatePromises = unreadNotifications.map(notification => 
        updateDoc(doc(db, 'notifications', notification.id), {
          isRead: true,
          updatedAt: serverTimestamp(),
        })
      );
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    if (!user) return;

    // Guest: remove from localStorage
    if ((user as any)?.isGuest) {
      try {
        const guestNotifications = localStorage.getItem('guest-notifications');
        if (guestNotifications) {
          const arr = JSON.parse(guestNotifications);
          const updated = arr.filter((n: any) => n.id !== notificationId);
          localStorage.setItem('guest-notifications', JSON.stringify(updated));
          const normalized = updated.map((n: any) => normalizeGuestNotification(n));
          setNotifications(normalized);
          setUnreadCount(normalized.filter((n: any) => !n.isRead).length);
        }
      } catch (error) {
        console.error('Error deleting guest notification:', error);
      }
      return;
    }

    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!user) return;

    // Guest: clear localStorage key
    if ((user as any)?.isGuest) {
      try {
        localStorage.removeItem('guest-notifications');
        setNotifications([]);
        setUnreadCount(0);
      } catch (error) {
        console.error('Error clearing guest notifications:', error);
      }
      return;
    }

    try {
      const deletePromises = notifications.map(notification => 
        deleteDoc(doc(db, 'notifications', notification.id))
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  // Create a new notification (for testing or admin use)
  const createNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'isRead' | 'userId'>) => {
    if (!user) return;

    // Guest: append to localStorage
    if ((user as any)?.isGuest) {
      try {
        const now = Date.now();
        const guestNotifications = localStorage.getItem('guest-notifications');
        const arr = guestNotifications ? JSON.parse(guestNotifications) : [];
        const newItem = {
          id: `g_${now}_${Math.random().toString(36).slice(2, 8)}`,
          title: notificationData.title,
          description: notificationData.description,
          type: notificationData.type,
          priority: notificationData.priority || 'low',
          actionUrl: notificationData.actionUrl,
          isRead: false,
          createdAtMs: now,
          updatedAtMs: now,
        };
        const updated = [newItem, ...arr];
        localStorage.setItem('guest-notifications', JSON.stringify(updated));
        const normalized = updated.map((n: any) => normalizeGuestNotification(n));
        setNotifications(normalized);
        setUnreadCount(normalized.filter((n: any) => !n.isRead).length);
      } catch (error) {
        console.error('Error creating guest notification:', error);
      }
      return;
    }

    try {
      await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        userId: (user as User).uid,
        isRead: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  // Create study encouragement notification
  const createStudyEncouragementNotification = async (classNames: string[]) => {
    if (!user) return;

    const encouragements = [
      "Time to review your course materials!",
      "Your classes are waiting for you to dive deeper.",
      "Ready to tackle some assignments?",
      "Let's make progress on your studies today!",
      "Your learning journey continues - let's keep going!",
      "Study time! Your courses are calling.",
      "Ready to explore new concepts?",
      "Let's strengthen your understanding today!"
    ];
    
    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    const classList = classNames.length > 0 ? ` (${classNames.join(', ')})` : '';
    
    await createNotification({
      title: 'Study Reminder',
      description: `${randomEncouragement}${classList}`,
      type: 'reminder',
      priority: 'medium'
    });
  };

  // Create assignment reminder notification
  const createAssignmentReminderNotification = async (classNames: string[]) => {
    if (!user) return;

    const reminders = [
      "Don't forget about upcoming assignments!",
      "Check your assignments - deadlines are approaching.",
      "Time to review assignment requirements.",
      "Your assignments need attention soon."
    ];
    
    const randomReminder = reminders[Math.floor(Math.random() * reminders.length)];
    const classList = classNames.length > 0 ? ` in ${classNames.join(', ')}` : '';
    
    await createNotification({
      title: 'Assignment Reminder',
      description: `${randomReminder}${classList}`,
      type: 'assignment',
      priority: 'high'
    });
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    createNotification,
    createStudyEncouragementNotification,
    createAssignmentReminderNotification,
  };
}

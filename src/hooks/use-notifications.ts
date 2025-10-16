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

    // Handle test user notifications
    if (isTestMode) {
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
            testNotifications.push({
              id: doc.id,
              ...data,
            } as Notification);
            
            if (!data.isRead) {
              unread++;
            }
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
    if (user.isGuest) {
      console.log('🔔 Loading guest notifications from localStorage');
      try {
        const guestNotifications = localStorage.getItem('guest-notifications');
        console.log('🔔 Raw guest notifications from localStorage:', guestNotifications);
        let notifications = [];
        let unread = 0;
        
        if (guestNotifications) {
          try {
            notifications = JSON.parse(guestNotifications);
            unread = notifications.filter((n: any) => !n.isRead).length;
            console.log('🔔 Parsed guest notifications:', notifications.length, 'total,', unread, 'unread');
          } catch (error) {
            console.warn('Error parsing guest notifications:', error);
          }
        } else {
          console.log('🔔 No guest notifications found in localStorage');
        }
        
        setNotifications(notifications);
        setUnreadCount(unread);
        setIsLoading(false);
        
        // Set up interval to check for new notifications
        const interval = setInterval(() => {
          const updatedNotifications = localStorage.getItem('guest-notifications');
          if (updatedNotifications) {
            try {
              const parsed = JSON.parse(updatedNotifications);
              const newUnread = parsed.filter((n: any) => !n.isRead).length;
              setNotifications(parsed);
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
    if (user.isGuest) {
      try {
        const guestNotifications = localStorage.getItem('guest-notifications');
        if (guestNotifications) {
          const notifications = JSON.parse(guestNotifications);
          const updatedNotifications = notifications.map((n: any) => 
            n.id === notificationId ? { ...n, isRead: true } : n
          );
          localStorage.setItem('guest-notifications', JSON.stringify(updatedNotifications));
          
          // Update local state
          setNotifications(updatedNotifications);
          setUnreadCount(updatedNotifications.filter((n: any) => !n.isRead).length);
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
    if (user.isGuest) {
      try {
        const guestNotifications = localStorage.getItem('guest-notifications');
        if (guestNotifications) {
          const notifications = JSON.parse(guestNotifications);
          const updatedNotifications = notifications.map((n: any) => ({ ...n, isRead: true }));
          localStorage.setItem('guest-notifications', JSON.stringify(updatedNotifications));
          
          // Update local state
          setNotifications(updatedNotifications);
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

    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!user) return;

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
  const createNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        userId: user.uid,
        isRead: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
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
  };
}

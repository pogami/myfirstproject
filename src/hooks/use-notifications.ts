'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase/client';
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
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

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

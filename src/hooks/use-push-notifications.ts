"use client";

import { useState, useEffect, useCallback } from 'react';

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  subscription: PushSubscription | null;
  isLoading: boolean;
  error: string | null;
}

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{action: string; title: string; icon?: string}>;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
    subscription: null,
    isLoading: false,
    error: null
  });

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
      const permission = Notification.permission;
      
      setState(prev => ({
        ...prev,
        isSupported,
        permission
      }));
    };

    checkSupport();
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Push notifications are not supported' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission, isLoading: false }));
      
      if (permission === 'granted') {
        return true;
      } else {
        setState(prev => ({ 
          ...prev, 
          error: `Permission ${permission}. Please enable notifications in your browser settings.` 
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to request notification permission' 
      }));
      return false;
    }
  }, [state.isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported || state.permission !== 'granted') {
      const hasPermission = await requestPermission();
      if (!hasPermission) return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('Starting push notification subscription...');
      
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('Service Worker is ready');

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'YOUR_VAPID_PUBLIC_KEY'
        )
      });

      console.log('Push subscription created:', subscription);

      // Send subscription to server
      const response = await fetch('/api/push-notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });

      console.log('Server response:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('Subscription saved successfully:', result);
        
        setState(prev => ({
          ...prev,
          isSubscribed: true,
          subscription,
          isLoading: false
        }));
        return true;
      } else {
        const errorData = await response.json();
        console.error('Failed to save subscription:', errorData);
        throw new Error(`Server error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Push subscription error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Failed to subscribe: ${error.message}`
      }));
      return false;
    }
  }, [state.isSupported, state.permission, requestPermission]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!state.subscription) {
      setState(prev => ({ ...prev, error: 'No active subscription found' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Unsubscribe from push manager
      await state.subscription.unsubscribe();

      // Remove from server
      const response = await fetch('/api/push-notifications/subscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint: state.subscription.endpoint })
      });

      if (response.ok) {
        setState(prev => ({
          ...prev,
          isSubscribed: false,
          subscription: null,
          isLoading: false
        }));
        return true;
      } else {
        throw new Error('Failed to remove subscription from server');
      }
    } catch (error) {
      console.error('Push unsubscription error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to unsubscribe from push notifications'
      }));
      return false;
    }
  }, [state.subscription]);

  // Send a test notification
  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    if (!state.isSubscribed) {
      setState(prev => ({ ...prev, error: 'Not subscribed to push notifications' }));
      return false;
    }

    try {
      console.log('Sending test notification...');
      
      const response = await fetch('/api/push-notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'CourseConnect Test',
          body: 'This is a test notification! 🎉',
          icon: '/favicon.ico',
          tag: 'test-notification'
        })
      });

      console.log('Test notification response:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('Test notification sent successfully:', result);
        return true;
      } else {
        const errorData = await response.json();
        console.error('Failed to send test notification:', errorData);
        throw new Error(`Server error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Test notification error:', error);
      setState(prev => ({ ...prev, error: `Failed to send test notification: ${error.message}` }));
      return false;
    }
  }, [state.isSubscribed]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    clearError
  };
}

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

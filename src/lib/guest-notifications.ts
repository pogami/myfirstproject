// Guest notification helpers
export interface GuestNotificationData {
  title: string;
  description: string;
  type: 'assignment' | 'exam' | 'message' | 'reminder' | 'system' | 'study_group';
  priority?: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export function createGuestNotification(data: GuestNotificationData): void {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('localStorage not available, skipping guest notification');
      return;
    }

    const now = Date.now();
    const guestNotifications = localStorage.getItem('guest-notifications');
    const arr = guestNotifications ? JSON.parse(guestNotifications) : [];
    
    const newItem = {
      id: `g_${now}_${Math.random().toString(36).slice(2, 8)}`,
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority || 'low',
      actionUrl: data.actionUrl,
      isRead: false,
      createdAtMs: now,
      updatedAtMs: now,
    };
    
    const updated = [newItem, ...arr];
    localStorage.setItem('guest-notifications', JSON.stringify(updated));
    
    // Trigger a custom event to notify components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('guest-notification-added', { 
        detail: { notification: newItem } 
      }));
    }
    
    console.log('🔔 Guest notification created:', newItem.title);
  } catch (error) {
    console.error('Error creating guest notification:', error);
  }
}

export function createWelcomeNotification(): void {
  createGuestNotification({
    title: 'Welcome to your dashboard',
    description: 'Take a quick tour to get started with CourseConnect AI.',
    type: 'system',
    priority: 'medium',
    actionUrl: '/dashboard/onboarding'
  });
}

export function createAIResponseNotification(): void {
  createGuestNotification({
    title: 'New message from AI',
    description: 'Your AI assistant has replied while you were away.',
    type: 'message',
    priority: 'low'
  });
}

export function createAssignmentDueNotification(): void {
  createGuestNotification({
    title: 'Assignment due soon',
    description: 'Math HW 2 is due tomorrow at 11:59 PM.',
    type: 'assignment',
    priority: 'high'
  });
}

// Check if this is the first visit for a guest
export function isFirstGuestVisit(): boolean {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return true;
    }
    const hasVisited = localStorage.getItem('guest-has-visited');
    return !hasVisited;
  } catch {
    return true;
  }
}

// Mark guest as having visited
export function markGuestAsVisited(): void {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('localStorage not available, cannot mark guest as visited');
      return;
    }
    localStorage.setItem('guest-has-visited', 'true');
  } catch (error) {
    console.error('Error marking guest as visited:', error);
  }
}

export function createStudyEncouragementNotification(classNames: string[]): void {
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
  
  createGuestNotification({
    title: 'Study Reminder',
    description: `${randomEncouragement}${classList}`,
    type: 'reminder',
    priority: 'medium'
  });
}

export function createAssignmentReminderNotification(classNames: string[]): void {
  const reminders = [
    "Don't forget about upcoming assignments!",
    "Check your assignments - deadlines are approaching.",
    "Time to review assignment requirements.",
    "Your assignments need attention soon."
  ];
  
  const randomReminder = reminders[Math.floor(Math.random() * reminders.length)];
  const classList = classNames.length > 0 ? ` in ${classNames.join(', ')}` : '';
  
  createGuestNotification({
    title: 'Assignment Reminder',
    description: `${randomReminder}${classList}`,
    type: 'assignment',
    priority: 'high'
  });
}

// Utility function to send changelog emails to all subscribers
export async function sendChangelogEmails(changelogData: {
  date: string;
  version: string;
  changes: string[];
  type: string;
  author: string;
  impact: string;
}) {
  try {
    const response = await fetch('/api/changelog-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ changelogData }),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('Changelog emails sent successfully:', result);
      
      // Also send push notifications
      await sendChangelogPushNotifications(changelogData);
      
      return { success: true, ...result };
    } else {
      console.error('Failed to send changelog emails:', result);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Error sending changelog emails:', error);
    return { success: false, error: 'Network error' };
  }
}

// Function to send push notifications for changelog updates
async function sendChangelogPushNotifications(changelogData: {
  date: string;
  version: string;
  changes: string[];
  type: string;
  author: string;
  impact: string;
}) {
  try {
    const notificationData = {
      title: `CourseConnect Update - ${changelogData.version}`,
      body: `${changelogData.changes[0]}${changelogData.changes.length > 1 ? ` (+${changelogData.changes.length - 1} more)` : ''}`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `changelog-${changelogData.version}`,
      data: {
        url: '/changelog',
        version: changelogData.version,
        type: changelogData.type,
        impact: changelogData.impact
      },
      actions: [
        {
          action: 'view',
          title: 'View Update',
          icon: '/favicon.ico'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/favicon.ico'
        }
      ]
    };

    const response = await fetch('/api/push-notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('Changelog push notifications sent successfully:', result);
      return { success: true, ...result };
    } else {
      console.error('Failed to send changelog push notifications:', result);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Error sending changelog push notifications:', error);
    return { success: false, error: 'Network error' };
  }
}

// Function to automatically send emails when new changelog entries are added
export async function notifySubscribersOfNewUpdate(changelogEntry: {
  date: string;
  version: string;
  changes: string[];
  type: string;
  author: string;
  impact: string;
}) {
  // Only send emails for user-facing changes
  const userFacingTypes = ['launch', 'feature', 'enhancement', 'bug-fix', 'security', 'performance'];
  
  if (!userFacingTypes.includes(changelogEntry.type)) {
    console.log('Skipping email notification for internal change:', changelogEntry.type);
    return { success: true, message: 'Skipped - internal change' };
  }

  // Filter out internal/development-only changes
  const internalKeywords = [
    'localhost', 'vercel', 'deployment', 'development', 'internal', 
    'backend', 'database', 'api', 'server', 'environment', 'config',
    'typescript', 'build', 'compilation', 'error handling', 'logging',
    'console', 'debug', 'testing', 'workflow', 'tooling', 'setup',
    'architecture', 'schema', 'migration', 'sync', 'process'
  ];

  const hasInternalContent = changelogEntry.changes.some(change =>
    internalKeywords.some(keyword => 
      change.toLowerCase().includes(keyword.toLowerCase())
    )
  );

  if (hasInternalContent) {
    console.log('Skipping email notification for internal content');
    return { success: true, message: 'Skipped - contains internal content' };
  }

  return await sendChangelogEmails(changelogEntry);
}

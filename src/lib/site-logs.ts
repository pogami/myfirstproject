/**
 * Site Logs Management System
 * 
 * This utility helps track and manage all updates to the CourseConnect platform.
 * Each change should be logged here with proper categorization and details.
 * 
 * Last updated: 2025-09-16 - Comprehensive changelog with all features
 */

export interface SiteLog {
  date: string;
  version: string;
  changes: string[];
  type: 'launch' | 'feature' | 'enhancement' | 'bug-fix' | 'security' | 'performance';
  author?: string;
  impact?: 'low' | 'medium' | 'high' | 'critical';
}

export class SiteLogManager {
  private static logs: SiteLog[] = [
    {
      date: "2025-09-25",
      version: "v2.11.5",
      changes: [
        "Added dark/light theme toggle across the platform",
        "Fixed critical profile picture display issues",
        "Redesigned footer with better user experience"
      ],
      type: "enhancement",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2025-09-20",
      version: "v2.11.3",
      changes: [
        "Enhanced mobile responsiveness and touch interactions",
        "Improved authentication flow and user session management",
        "Added comprehensive error handling and fallback systems"
      ],
      type: "enhancement",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2025-09-18",
      version: "v2.11.2",
      changes: [
        "Fixed critical React rendering errors causing app crashes",
        "Implemented daily usage limits for AI features",
        "Enhanced chat interface stability and performance"
      ],
      type: "bug-fix",
      author: "Development Team",
      impact: "critical"
    },
    {
      date: "2025-09-16",
      version: "v2.11.0",
      changes: [
        "Launched Progressive Web App (PWA) with offline capabilities",
        "Added native app-like experience for mobile and desktop",
        "Implemented app installation prompts and shortcuts"
      ],
      type: "launch",
      author: "Development Team",
      impact: "critical"
    },
    {
      date: "2025-09-16",
      version: "v2.10.1",
      changes: [
        "Implemented comprehensive push notification system",
        "Added mobile-optimized notification management",
        "Created notification permission handling and user prompts",
        "Enhanced mobile user engagement with real-time notifications"
      ],
      type: "feature",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2025-09-16",
      version: "v2.10.0",
      changes: [
        "Enhanced security with admin access control",
        "Implemented secure user permission validation",
        "Improved data protection for chat messages",
        "Added secure session management for all users"
      ],
      type: "security",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2025-09-16",
      version: "v2.9.1",
      changes: [
        "Complete mobile optimization overhaul",
        "Created touch-optimized interfaces for all devices",
        "Implemented mobile-first design principles",
        "Enhanced responsive design for all screen sizes"
      ],
      type: "enhancement",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2025-09-16",
      version: "v2.9.2",
      changes: [
        "Launched advanced AI chat system for academic support",
        "Implemented reliable AI responses for student questions",
        "Added AI assistance for common academic subjects",
        "Created academic-focused AI tutoring capabilities"
      ],
      type: "feature",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2025-09-16",
      version: "v2.9.3",
      changes: [
        "Launched newsletter and email notification system",
        "Created professional email templates with branding",
        "Implemented automated email notifications for updates",
        "Added email subscriber management and tracking"
      ],
      type: "feature",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2025-09-16",
      version: "v2.9.4",
      changes: [
        "Launched comprehensive changelog and versioning system",
        "Created advanced changelog page with search and filtering",
        "Implemented changelog categorization and impact tracking",
        "Added automated changelog email notifications"
      ],
      type: "feature",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2025-09-16",
      version: "v2.9.5",
      changes: [
        "Implemented Firebase authentication and user management",
        "Added secure user session handling",
        "Created user profile management and data persistence",
        "Enhanced authentication error handling and fallbacks"
      ],
      type: "security",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2025-09-16",
      version: "v2.9.6",
      changes: [
        "Major performance optimizations and caching improvements",
        "Implemented Next.js performance optimizations",
        "Enhanced build performance with Turbopack",
        "Added efficient component loading and code splitting"
      ],
      type: "performance",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2025-09-16",
      version: "v2.9.0",
      changes: [
        "Class Chat temporarily under construction for quality improvements",
        "Added beautiful construction page with feature previews",
        "Implemented admin-only access for testing",
        "Enhanced mobile responsiveness with dedicated construction UI"
      ],
      type: "enhancement",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2025-09-16",
      version: "v2.8.0",
      changes: [
        "Improved chat input clearing and user experience",
        "Fixed chat scrolling and message display issues",
        "Optimized AI response handling in class chat",
        "Added comprehensive changelog email notification system"
      ],
      type: "enhancement",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2025-09-16",
      version: "v2.7.0",
      changes: [
        "Fixed email subscription system with dedicated Gmail account",
        "Updated email templates with professional CourseConnect branding",
        "Fixed 'Get Started' button redirects and navigation issues",
        "Resolved favicon and social media preview issues"
      ],
      type: "enhancement",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2025-09-16",
      version: "v2.6.0",
      changes: [
        "Fixed critical React errors causing application crashes",
        "Implemented daily usage limits for in-depth analysis (10 per day)",
        "Added usage tracking system with automatic daily reset",
        "Enhanced user experience with better error handling"
      ],
      type: "bug-fix",
      author: "Development Team",
      impact: "critical"
    },
    {
      date: "2025-09-16",
      version: "v2.5.0",
      changes: [
        "Fixed React child errors in chat interface",
        "Added leave class functionality with confirmation",
        "Updated class tabs to display actual syllabus names",
        "Implemented welcome notifications for new chat members"
      ],
      type: "bug-fix",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2025-09-16",
      version: "v2.4.0",
      changes: [
        "Created dedicated changelog page at /changelog route",
        "Enhanced changelog system with advanced search and filtering",
        "Added comprehensive changelog statistics and categorization",
        "Updated footer navigation to link directly to changelog"
      ],
      type: "feature",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2025-09-15",
      version: "v2.3.0",
      changes: [
        "Converted site logs to clickable button in footer",
        "Created modal-based changelog display for better UX",
        "Enhanced logs system to show complete development history",
        "Improved logs categorization with security and performance types"
      ],
      type: "enhancement",
      author: "Development Team",
      impact: "medium"
    },
    {
      date: "2025-09-14",
      version: "v2.2.0",
      changes: [
        "Added comprehensive site footer with navigation links",
        "Implemented site logs management system",
        "Created automated changelog system with version tracking",
        "Added newsletter signup functionality in footer"
      ],
      type: "feature",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2025-09-13",
      version: "v2.1.0",
      changes: [
        "Fixed email sign-in authentication flow issues",
        "Improved guest data migration with better error handling",
        "Enhanced Firebase configuration for all environments",
        "Added comprehensive footer with site logs and navigation"
      ],
      type: "bug-fix",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2025-09-12",
      version: "v2.0.5",
      changes: [
        "Enhanced Google OAuth authentication with better error messages",
        "Improved dashboard loading performance",
        "Added environment-specific Firebase configuration",
        "Updated authentication error handling for better UX"
      ],
      type: "enhancement",
      author: "Development Team",
      impact: "medium"
    },
    {
      date: "2025-09-11",
      version: "v2.0.4",
      changes: [
        "Added Scholar Features section with advanced AI capabilities",
        "Implemented multi-modal AI support (voice and image analysis)",
        "Enhanced grade prediction system",
        "Added Google Calendar and Spotify focus music integration"
      ],
      type: "feature",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2025-09-10",
      version: "v2.0.3",
      changes: [
        "Improved mobile responsiveness across all pages",
        "Enhanced AI chat interface with better message formatting",
        "Added real-time study group collaboration features",
        "Implemented smart flashcard generation from syllabus content"
      ],
      type: "enhancement",
      author: "Development Team",
      impact: "medium"
    },
    {
      date: "2025-09-09",
      version: "v2.0.2",
      changes: [
        "Launched CourseConnect platform with core features",
        "Implemented AI-powered syllabus analysis",
        "Added study group creation and management",
        "Created comprehensive dashboard with analytics"
      ],
      type: "launch",
      author: "Development Team",
      impact: "critical"
    },
    {
      date: "2025-09-08",
      version: "v2.0.1",
      changes: [
        "Finalized core platform architecture",
        "Completed Firebase integration setup",
        "Implemented user authentication system",
        "Created initial database schema"
      ],
      type: "enhancement",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2025-09-07",
      version: "v2.0.0",
      changes: [
        "Completed initial platform development",
        "Implemented Next.js 15 with App Router",
        "Set up Tailwind CSS and component library",
        "Integrated Firebase for backend services"
      ],
      type: "launch",
      author: "Development Team",
      impact: "critical"
    }
  ];

  /**
   * Get all site logs
   */
  static getAllLogs(): SiteLog[] {
    return this.logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Get logs by type
   */
  static getLogsByType(type: SiteLog['type']): SiteLog[] {
    return this.logs.filter(log => log.type === type);
  }

  /**
   * Get recent logs (last N entries)
   */
  static getRecentLogs(count: number = 5): SiteLog[] {
    return this.getAllLogs().slice(0, count);
  }

  /**
   * Add a new log entry
   */
  static addLog(log: Omit<SiteLog, 'date'>): void {
    const newLog: SiteLog = {
      ...log,
      date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    };
    
    this.logs.unshift(newLog);
    
    // Log to console for development
    console.log(`📝 Site Log Added: ${newLog.version} - ${newLog.type}`);
    console.log(`Changes: ${newLog.changes.join(', ')}`);
  }

  /**
   * Add a new log entry and optionally send email notifications
   */
  static async addLog(log: SiteLog, sendEmailNotification: boolean = true): Promise<void> {
    this.logs.unshift(log); // Add to beginning of array
    
    // Send email notification if requested and it's a user-facing change
    if (sendEmailNotification) {
      try {
        const { notifySubscribersOfNewUpdate } = await import('./changelog-email-service');
        await notifySubscribersOfNewUpdate(log);
      } catch (error) {
        console.error('Failed to send changelog email notification:', error);
      }
    }
  }

  /**
   * Get logs formatted for display (user-facing only)
   */
  static getFormattedLogs(): SiteLog[] {
    return this.getAllLogs()
      .filter(log => {
        // Only show user-facing changes
        const userFacingTypes = ['launch', 'feature', 'enhancement', 'bug-fix', 'security', 'performance'];
        return userFacingTypes.includes(log.type);
      })
      .filter(log => {
        // Emphasize high-impact items only
        return (log.impact === 'high' || log.impact === 'critical' || log.type === 'launch');
      })
      .filter(log => {
        // Filter out internal/development-only changes
        const internalKeywords = [
          'localhost', 'vercel', 'deployment', 'internal', 
          'backend', 'database', 'api', 'server', 'config',
          'typescript', 'build', 'compilation', 'logging',
          'console', 'debug', 'testing', 'workflow', 'tooling', 'setup',
          'schema', 'migration', 'sync', 'process'
        ];
        
        return !log.changes.some(change => 
          internalKeywords.some(keyword => 
            change.toLowerCase().includes(keyword)
          )
        );
      })
      .map(log => ({
        ...log,
        // Keep only the most important bullets per entry (max 4)
        changes: log.changes
          .map(change => change.charAt(0).toUpperCase() + change.slice(1))
          .slice(0, 4)
      }));
  }

  /**
   * Get version history
   */
  static getVersionHistory(): { version: string; date: string; type: string }[] {
    return this.logs.map(log => ({
      version: log.version,
      date: log.date,
      type: log.type
    }));
  }

  /**
   * Get statistics
   */
  static getStats(): {
    totalLogs: number;
    byType: Record<string, number>;
    byImpact: Record<string, number>;
    latestVersion: string;
  } {
    const byType = this.logs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byImpact = this.logs.reduce((acc, log) => {
      acc[log.impact || 'medium'] = (acc[log.impact || 'medium'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLogs: this.logs.length,
      byType,
      byImpact,
      latestVersion: this.logs[0]?.version || 'v1.0.0'
    };
  }
}

/**
 * Helper function to add a new log entry
 * Usage: addSiteLog('v2.1.1', 'feature', ['New feature added'], 'high')
 */
export function addSiteLog(
  version: string,
  type: SiteLog['type'],
  changes: string[],
  impact: SiteLog['impact'] = 'medium',
  author: string = 'Development Team'
): void {
  SiteLogManager.addLog({
    version,
    type,
    changes,
    impact,
    author
  });
}

/**
 * Helper function to get logs for display in components
 */
export function getSiteLogsForDisplay(): SiteLog[] {
  return SiteLogManager.getFormattedLogs();
}

/**
 * Deployment logging system
 */
export class DeploymentLogger {
  private static deploymentLogs: Array<{
    timestamp: string;
    environment: 'localhost' | 'vercel' | 'production';
    version: string;
    changes: string[];
    author: string;
  }> = [];

  /**
   * Log a deployment
   */
  static logDeployment(
    environment: 'localhost' | 'vercel' | 'production',
    version: string,
    changes: string[],
    author: string = 'Development Team'
  ): void {
    const deployment = {
      timestamp: new Date().toISOString(),
      environment,
      version,
      changes,
      author
    };

    this.deploymentLogs.unshift(deployment);
    
    // Also add to main site logs
    addSiteLog(
      version,
      'enhancement',
      [`Deployed to ${environment}: ${changes.join(', ')}`],
      'medium',
      author
    );

    console.log(`🚀 Deployment Logged: ${version} to ${environment}`);
  }

  /**
   * Get deployment history
   */
  static getDeploymentHistory(): typeof this.deploymentLogs {
    return this.deploymentLogs;
  }

  /**
   * Get deployments by environment
   */
  static getDeploymentsByEnvironment(environment: 'localhost' | 'vercel' | 'production'): typeof this.deploymentLogs {
    return this.deploymentLogs.filter(log => log.environment === environment);
  }

  /**
   * Get latest deployment
   */
  static getLatestDeployment(): typeof this.deploymentLogs[0] | null {
    return this.deploymentLogs[0] || null;
  }
}

/**
 * Helper function to log localhost deployment
 */
export function logLocalhostDeployment(version: string, changes: string[], author?: string): void {
  DeploymentLogger.logDeployment('localhost', version, changes, author);
}

/**
 * Helper function to log Vercel deployment
 */
export function logVercelDeployment(version: string, changes: string[], author?: string): void {
  DeploymentLogger.logDeployment('vercel', version, changes, author);
}

/**
 * Helper function to log production deployment
 */
export function logProductionDeployment(version: string, changes: string[], author?: string): void {
  DeploymentLogger.logDeployment('production', version, changes, author);
}

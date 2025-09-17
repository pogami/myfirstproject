/**
 * Site Logs Management System
 * 
 * This utility helps track and manage all updates to the CourseConnect platform.
 * Each change should be logged here with proper categorization and details.
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
      date: "2024-12-19",
      version: "v2.8.0",
      changes: [
        "Improved chat input clearing behavior for better user experience",
        "Fixed chat scrolling to keep messages within the chat area",
        "Optimized AI response handling in class chat",
        "Added comprehensive changelog email notification system"
      ],
      type: "enhancement",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2024-09-16",
      version: "v2.7.0",
      changes: [
        "Fixed email subscription system with dedicated Gmail account (courseconnect.noreply@gmail.com)",
        "Updated email template with CourseConnect branding and professional HTML design",
        "Fixed 'Get Started' button to redirect to correct Vercel URL (courseconnect-sooty.vercel.app)",
        "Resolved favicon issues - now shows CourseConnect logo instead of Firebase logo",
        "Added comprehensive Open Graph and Twitter Card meta tags for social media previews",
        "Updated site title to 'CourseConnect - AI College Platform' for mobile tabs",
        "Removed AI bot from homepage for cleaner, more focused design",
        "Added browserconfig.xml for Windows tile configuration",
        "Enhanced email system with beautiful welcome emails and proper branding",
        "Fixed social media link previews to show CourseConnect logo and description"
      ],
      type: "enhancement",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2024-09-16",
      version: "v2.6.0",
      changes: [
        "Fixed critical React child error in chat interface - resolved object rendering issues",
        "Implemented daily usage limits for in-depth analysis (10 per day)",
        "Added usage tracking system with automatic daily reset",
        "Enhanced in-depth analysis button with usage counter display",
        "Added upgrade prompt when daily limit is reached with pricing page redirect",
        "Improved error handling for AI response objects",
        "Fixed chat interface stability issues causing application crashes",
        "Enhanced user experience with better error messages and fallbacks"
      ],
      type: "bug-fix",
      author: "Development Team",
      impact: "critical"
    },
    {
      date: "2024-09-16",
      version: "v2.5.0",
      changes: [
        "Fixed React child error in chat interface - resolved object rendering issues",
        "Added leave class functionality to class overview tab with confirmation toasts",
        "Updated class tabs to display syllabus names instead of generic book icons",
        "Implemented welcome notifications when users join class chats",
        "Enhanced user experience with better button layouts and responsive design",
        "Fixed localhost access issues and improved development workflow",
        "Updated changelog system to show real-time data instead of hardcoded dates"
      ],
      type: "bug-fix",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2024-09-16",
      version: "v2.4.0",
      changes: [
        "Created dedicated changelog page at /changelog route",
        "Enhanced changelog system with advanced search and filtering",
        "Added comprehensive changelog page with statistics and categorization",
        "Implemented automatic deployment logging for localhost and Vercel",
        "Updated footer navigation to link directly to changelog page",
        "Added deployment tracking system for better change management",
        "Enhanced changelog UI with better visual design and user experience"
      ],
      type: "feature",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2024-09-15",
      version: "v2.3.0",
      changes: [
        "Converted site logs to clickable button in footer navigation",
        "Created modal-based changelog display for better user experience",
        "Enhanced logs system to show complete development history",
        "Added interactive logs modal with scrollable content",
        "Improved logs categorization with security and performance types",
        "Updated footer navigation to include logs as company link"
      ],
      type: "enhancement",
      author: "Development Team",
      impact: "medium"
    },
    {
      date: "2024-09-14",
      version: "v2.2.0",
      changes: [
        "Added comprehensive site footer with navigation links and company information",
        "Implemented site logs management system for tracking all updates",
        "Created automated changelog system with version tracking",
        "Enhanced home page with detailed footer including social links",
        "Added newsletter signup functionality in footer",
        "Implemented structured logging for all future site changes",
        "Updated localhost and Vercel synchronization process"
      ],
      type: "feature",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2024-09-13",
      version: "v2.1.0",
      changes: [
        "Fixed email sign-in authentication flow - resolved infinite loading issue",
        "Improved guest data migration with better error handling",
        "Enhanced Firebase configuration for localhost and production",
        "Added comprehensive footer with site logs and navigation links",
        "Updated Vercel deployment configuration",
        "Fixed Next.js configuration warnings"
      ],
      type: "bug-fix",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2024-09-12",
      version: "v2.0.5",
      changes: [
        "Enhanced Google OAuth authentication with better error messages",
        "Improved dashboard loading performance",
        "Added environment-specific Firebase configuration",
        "Updated authentication error handling for better user experience"
      ],
      type: "enhancement",
      author: "Development Team",
      impact: "medium"
    },
    {
      date: "2024-09-11",
      version: "v2.0.4",
      changes: [
        "Added Scholar Features section with advanced AI capabilities",
        "Implemented multi-modal AI support (voice and image analysis)",
        "Enhanced grade prediction system",
        "Added Google Calendar integration",
        "Implemented Spotify focus music integration"
      ],
      type: "feature",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2024-09-10",
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
      date: "2024-09-09",
      version: "v2.0.2",
      changes: [
        "Launched CourseConnect platform with core features",
        "Implemented AI-powered syllabus analysis",
        "Added study group creation and management",
        "Created comprehensive dashboard with analytics",
        "Built responsive web application with modern UI/UX"
      ],
      type: "launch",
      author: "Development Team",
      impact: "critical"
    },
    {
      date: "2024-09-08",
      version: "v2.0.1",
      changes: [
        "Finalized core platform architecture",
        "Completed Firebase integration setup",
        "Implemented user authentication system",
        "Created initial database schema",
        "Set up development and production environments"
      ],
      type: "enhancement",
      author: "Development Team",
      impact: "high"
    },
    {
      date: "2024-09-07",
      version: "v2.0.0",
      changes: [
        "Completed initial platform development",
        "Implemented Next.js 15 with App Router",
        "Set up Tailwind CSS and component library",
        "Created responsive design system",
        "Integrated Firebase for backend services",
        "Built authentication and user management"
      ],
      type: "launch",
      author: "Development Team",
      impact: "critical"
    },
    {
      date: "2024-09-06",
      version: "v1.5.0",
      changes: [
        "Completed UI/UX design phase",
        "Finalized component architecture",
        "Created design system and style guide",
        "Implemented responsive breakpoints",
        "Set up development workflow and tooling"
      ],
      type: "enhancement",
      author: "Development Team",
      impact: "medium"
    },
    {
      date: "2024-09-05",
      version: "v1.4.0",
      changes: [
        "Completed project planning and architecture design",
        "Selected technology stack (Next.js, Firebase, Tailwind)",
        "Created initial project structure",
        "Set up development environment",
        "Implemented basic routing and navigation"
      ],
      type: "enhancement",
      author: "Development Team",
      impact: "medium"
    },
    {
      date: "2024-09-04",
      version: "v1.3.0",
      changes: [
        "Conducted market research and user interviews",
        "Defined core features and user personas",
        "Created wireframes and user flow diagrams",
        "Established project requirements and scope",
        "Set up version control and project management"
      ],
      type: "enhancement",
      author: "Development Team",
      impact: "medium"
    },
    {
      date: "2024-09-03",
      version: "v1.2.0",
      changes: [
        "Completed competitive analysis",
        "Identified unique value propositions",
        "Defined target market and user segments",
        "Created initial business model",
        "Established development timeline and milestones"
      ],
      type: "enhancement",
      author: "Development Team",
      impact: "medium"
    },
    {
      date: "2024-09-02",
      version: "v1.1.0",
      changes: [
        "Conducted initial market research",
        "Identified pain points in student collaboration",
        "Researched AI integration opportunities",
        "Analyzed existing educational platforms",
        "Defined initial feature set and requirements"
      ],
      type: "enhancement",
      author: "Development Team",
      impact: "medium"
    },
    {
      date: "2024-09-01",
      version: "v1.0.0",
      changes: [
        "CourseConnect project conception and ideation",
        "Initial brainstorming and concept development",
        "Market opportunity identification",
        "Team formation and role assignment",
        "Project kickoff and initial planning"
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
        // Filter out internal/development-only changes
        const internalKeywords = [
          'localhost', 'vercel', 'deployment', 'development', 'internal', 
          'backend', 'database', 'api', 'server', 'environment', 'config',
          'typescript', 'build', 'compilation', 'error handling', 'logging',
          'console', 'debug', 'testing', 'workflow', 'tooling', 'setup',
          'architecture', 'schema', 'migration', 'sync', 'process'
        ];
        
        return !log.changes.some(change => 
          internalKeywords.some(keyword => 
            change.toLowerCase().includes(keyword)
          )
        );
      })
      .map(log => ({
        ...log,
        changes: log.changes.map(change => 
          change.charAt(0).toUpperCase() + change.slice(1)
        )
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

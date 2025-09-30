/**
 * Auto Changelog System
 * 
 * Automatically detects and logs important changes made during development
 * by analyzing code changes, file modifications, and user interactions.
 */

import { addRealtimeChangelogEntry } from './realtime-changelog';

export interface ChangeDetection {
  type: 'feature' | 'enhancement' | 'bug-fix' | 'security' | 'performance';
  impact: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  files?: string[];
  keywords?: string[];
}

export class AutoChangelogDetector {
  private static readonly KEYWORD_MAPPINGS = {
    // Feature keywords
    feature: {
      keywords: ['add', 'create', 'implement', 'new feature', 'launch', 'introduce'],
      impact: 'high' as const,
      type: 'feature' as const
    },
    // Enhancement keywords
    enhancement: {
      keywords: ['improve', 'enhance', 'optimize', 'update', 'refactor', 'better', 'upgrade'],
      impact: 'medium' as const,
      type: 'enhancement' as const
    },
    // Bug fix keywords
    'bug-fix': {
      keywords: ['fix', 'resolve', 'correct', 'repair', 'patch', 'bug', 'error', 'issue'],
      impact: 'high' as const,
      type: 'bug-fix' as const
    },
    // Security keywords
    security: {
      keywords: ['security', 'secure', 'auth', 'permission', 'access', 'vulnerability', 'encrypt'],
      impact: 'critical' as const,
      type: 'security' as const
    },
    // Performance keywords
    performance: {
      keywords: ['performance', 'speed', 'fast', 'optimize', 'cache', 'load', 'render'],
      impact: 'medium' as const,
      type: 'performance' as const
    }
  };

  private static readonly FILE_PATTERNS = {
    // Critical files that indicate major changes
    critical: [
      'src/app/layout.tsx',
      'src/app/page.tsx',
      'src/app/dashboard',
      'src/components/hero.tsx',
      'src/components/navigation.tsx',
      'src/lib/firebase',
      'src/lib/auth'
    ],
    // Feature files
    feature: [
      'src/components/',
      'src/app/features/',
      'src/hooks/',
      'src/lib/'
    ],
    // UI/UX files
    enhancement: [
      'src/app/globals.css',
      'tailwind.config.ts',
      'src/components/ui/',
      'src/styles/'
    ]
  };

  /**
   * Analyze a change description and automatically categorize it
   */
  static analyzeChange(description: string, files?: string[]): ChangeDetection | null {
    const lowerDesc = description.toLowerCase();
    
    // Check for keyword matches
    for (const [category, config] of Object.entries(this.KEYWORD_MAPPINGS)) {
      for (const keyword of config.keywords) {
        if (lowerDesc.includes(keyword)) {
          return {
            type: config.type,
            impact: config.impact,
            description,
            files,
            keywords: [keyword]
          };
        }
      }
    }

    // Check file patterns for additional context
    if (files) {
      for (const file of files) {
        // Critical files indicate high impact
        if (this.FILE_PATTERNS.critical.some(pattern => file.includes(pattern))) {
          return {
            type: 'enhancement',
            impact: 'high',
            description,
            files,
            keywords: ['critical file change']
          };
        }
        
        // Feature files
        if (this.FILE_PATTERNS.feature.some(pattern => file.includes(pattern))) {
          return {
            type: 'feature',
            impact: 'medium',
            description,
            files,
            keywords: ['feature file change']
          };
        }
      }
    }

    // Default categorization
    return {
      type: 'enhancement',
      impact: 'medium',
      description,
      files,
      keywords: ['general change']
    };
  }

  /**
   * Auto-log a change based on description and context
   */
  static async autoLogChange(
    description: string,
    version?: string,
    files?: string[],
    author?: string
  ): Promise<string | null> {
    try {
      const detection = this.analyzeChange(description, files);
      
      if (!detection) {
        console.log('No significant change detected, skipping auto-log');
        return null;
      }

      // Generate version if not provided
      const changeVersion = version || this.generateVersion();
      
      // Create changelog entry
      const entryId = await addRealtimeChangelogEntry(
        changeVersion,
        detection.type,
        [detection.description],
        detection.impact,
        author || 'Auto-Detector'
      );

      console.log(`🤖 Auto-logged change: ${detection.type} - ${detection.impact} impact`);
      return entryId;
    } catch (error) {
      console.error('Failed to auto-log change:', error);
      return null;
    }
  }

  /**
   * Generate a version number based on current date
   */
  private static generateVersion(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    
    return `v${year}.${month}.${day}.${hour}`;
  }

  /**
   * Log multiple changes in a batch
   */
  static async autoLogBatch(
    changes: Array<{
      description: string;
      files?: string[];
      type?: ChangeDetection['type'];
      impact?: ChangeDetection['impact'];
    }>,
    version?: string,
    author?: string
  ): Promise<string[]> {
    const results: string[] = [];
    
    for (const change of changes) {
      try {
        let detection: ChangeDetection;
        
        if (change.type && change.impact) {
          // Use provided type and impact
          detection = {
            type: change.type,
            impact: change.impact,
            description: change.description,
            files: change.files
          };
        } else {
          // Auto-detect
          detection = this.analyzeChange(change.description, change.files) || {
            type: 'enhancement',
            impact: 'medium',
            description: change.description,
            files: change.files
          };
        }

        const entryId = await addRealtimeChangelogEntry(
          version || this.generateVersion(),
          detection.type,
          [detection.description],
          detection.impact,
          author || 'Auto-Detector'
        );
        
        results.push(entryId);
      } catch (error) {
        console.error('Failed to auto-log batch change:', error);
      }
    }
    
    return results;
  }
}

/**
 * Helper function to quickly log a change
 */
export async function logChange(
  description: string,
  version?: string,
  files?: string[],
  author?: string
): Promise<string | null> {
  return AutoChangelogDetector.autoLogChange(description, version, files, author);
}

/**
 * Helper function to log multiple changes
 */
export async function logChanges(
  changes: Array<{
    description: string;
    files?: string[];
    type?: ChangeDetection['type'];
    impact?: ChangeDetection['impact'];
  }>,
  version?: string,
  author?: string
): Promise<string[]> {
  return AutoChangelogDetector.autoLogBatch(changes, version, author);
}

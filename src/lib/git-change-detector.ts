/**
 * Git Change Detector
 * 
 * Automatically detects important changes by monitoring git commits
 * and file modifications to auto-log changelog entries.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { addRealtimeChangelogEntry } from './realtime-changelog';
import { AutoChangelogDetector } from './auto-changelog';

const execAsync = promisify(exec);

export interface GitChange {
  hash: string;
  message: string;
  author: string;
  date: string;
  files: string[];
  type: 'feature' | 'enhancement' | 'bug-fix' | 'security' | 'performance';
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export class GitChangeDetector {
  private static readonly IMPORTANT_PATTERNS = [
    // Critical files
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'src/app/dashboard',
    'src/components/hero.tsx',
    'src/components/navigation.tsx',
    'src/lib/firebase',
    'src/lib/auth',
    'src/contexts/theme-context.tsx',
    
    // Feature files
    'src/components/',
    'src/app/features/',
    'src/hooks/',
    'src/lib/',
    
    // UI/UX files
    'src/app/globals.css',
    'tailwind.config.ts',
    'src/components/ui/',
    'src/styles/',
    
    // API files
    'src/app/api/',
    
    // Configuration files
    'package.json',
    'next.config.ts',
    'firebase.json'
  ];

  private static readonly IGNORE_PATTERNS = [
    'node_modules/',
    '.git/',
    '.next/',
    'dist/',
    'build/',
    '.env',
    '*.log',
    '*.tmp',
    '*.cache'
  ];

  /**
   * Get recent git commits
   */
  static async getRecentCommits(limit: number = 10): Promise<GitChange[]> {
    try {
      const { stdout } = await execAsync(
        `git log --oneline --pretty=format:"%h|%s|%an|%ad" --date=short -${limit}`
      );

      const commits: GitChange[] = [];
      const lines = stdout.trim().split('\n');

      for (const line of lines) {
        if (!line.trim()) continue;

        const [hash, message, author, date] = line.split('|');
        
        // Get changed files for this commit
        const files = await this.getChangedFiles(hash);
        
        // Analyze the change
        const analysis = this.analyzeCommit(message, files);
        
        if (analysis.isImportant) {
          commits.push({
            hash,
            message,
            author,
            date,
            files,
            type: analysis.type,
            impact: analysis.impact
          });
        }
      }

      return commits;
    } catch (error) {
      console.error('Failed to get git commits:', error);
      return [];
    }
  }

  /**
   * Get changed files for a specific commit
   */
  static async getChangedFiles(hash: string): Promise<string[]> {
    try {
      const { stdout } = await execAsync(`git show --name-only --pretty=format: ${hash}`);
      return stdout.trim().split('\n').filter(file => file.trim());
    } catch (error) {
      console.error(`Failed to get changed files for commit ${hash}:`, error);
      return [];
    }
  }

  /**
   * Analyze a commit to determine if it's important
   */
  static analyzeCommit(message: string, files: string[]): {
    isImportant: boolean;
    type: GitChange['type'];
    impact: GitChange['impact'];
  } {
    const lowerMessage = message.toLowerCase();
    
    // Check if any important files were changed
    const hasImportantFiles = files.some(file => 
      this.IMPORTANT_PATTERNS.some(pattern => file.includes(pattern))
    );

    // Check if any ignored files were changed
    const hasIgnoredFiles = files.some(file =>
      this.IGNORE_PATTERNS.some(pattern => file.includes(pattern))
    );

    // Skip if only ignored files were changed
    if (hasIgnoredFiles && !hasImportantFiles) {
      return { isImportant: false, type: 'enhancement', impact: 'low' };
    }

    // Analyze message for type and impact
    const detection = AutoChangelogDetector.analyzeChange(message, files);
    
    if (!detection) {
      return { isImportant: false, type: 'enhancement', impact: 'low' };
    }

    // Determine if it's important based on impact and files
    const isImportant = 
      detection.impact === 'high' || 
      detection.impact === 'critical' ||
      hasImportantFiles ||
      detection.type === 'feature' ||
      detection.type === 'bug-fix';

    return {
      isImportant,
      type: detection.type,
      impact: detection.impact
    };
  }

  /**
   * Auto-log important commits to changelog
   */
  static async autoLogImportantCommits(limit: number = 5): Promise<string[]> {
    try {
      const commits = await this.getRecentCommits(limit);
      const loggedEntries: string[] = [];

      for (const commit of commits) {
        try {
          const entryId = await addRealtimeChangelogEntry(
            this.generateVersion(commit.date),
            commit.type,
            [commit.message],
            commit.impact,
            commit.author
          );
          
          loggedEntries.push(entryId);
          console.log(`🤖 Auto-logged git commit: ${commit.hash} - ${commit.type}`);
        } catch (error) {
          console.error(`Failed to log commit ${commit.hash}:`, error);
        }
      }

      return loggedEntries;
    } catch (error) {
      console.error('Failed to auto-log git commits:', error);
      return [];
    }
  }

  /**
   * Monitor git changes in real-time
   */
  static startMonitoring(intervalMs: number = 30000): () => void {
    let isRunning = true;
    let lastCheckedHash = '';

    const checkForChanges = async () => {
      if (!isRunning) return;

      try {
        // Get the latest commit hash
        const { stdout } = await execAsync('git log -1 --pretty=format:"%h"');
        const currentHash = stdout.trim();

        // If we have a new commit, check if it's important
        if (currentHash && currentHash !== lastCheckedHash) {
          const commits = await this.getRecentCommits(1);
          
          if (commits.length > 0) {
            const commit = commits[0];
            if (commit.hash === currentHash) {
              // Auto-log the new commit
              await addRealtimeChangelogEntry(
                this.generateVersion(commit.date),
                commit.type,
                [commit.message],
                commit.impact,
                commit.author
              );
              
              console.log(`🤖 Auto-logged new commit: ${commit.hash} - ${commit.message}`);
            }
          }
          
          lastCheckedHash = currentHash;
        }
      } catch (error) {
        console.error('Error monitoring git changes:', error);
      }
    };

    // Initial check
    checkForChanges();

    // Set up interval
    const interval = setInterval(checkForChanges, intervalMs);

    // Return cleanup function
    return () => {
      isRunning = false;
      clearInterval(interval);
    };
  }

  /**
   * Generate version from date
   */
  private static generateVersion(date: string): string {
    const [year, month, day] = date.split('-');
    return `v${year}.${month}.${day}`;
  }

  /**
   * Get git status for current changes
   */
  static async getCurrentChanges(): Promise<{
    modified: string[];
    added: string[];
    deleted: string[];
  }> {
    try {
      const { stdout } = await execAsync('git status --porcelain');
      const lines = stdout.trim().split('\n');
      
      const modified: string[] = [];
      const added: string[] = [];
      const deleted: string[] = [];

      for (const line of lines) {
        if (!line.trim()) continue;
        
        const status = line.substring(0, 2);
        const file = line.substring(3);
        
        if (status.includes('M')) modified.push(file);
        if (status.includes('A')) added.push(file);
        if (status.includes('D')) deleted.push(file);
      }

      return { modified, added, deleted };
    } catch (error) {
      console.error('Failed to get git status:', error);
      return { modified: [], added: [], deleted: [] };
    }
  }
}

/**
 * Helper function to start auto-monitoring
 */
export function startGitMonitoring(intervalMs: number = 30000): () => void {
  return GitChangeDetector.startMonitoring(intervalMs);
}

/**
 * Helper function to auto-log recent commits
 */
export async function autoLogRecentCommits(limit: number = 5): Promise<string[]> {
  return GitChangeDetector.autoLogImportantCommits(limit);
}


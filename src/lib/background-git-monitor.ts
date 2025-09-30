/**
 * Background Git Monitor
 * 
 * Runs in the background to automatically detect and log important git changes
 * without any user intervention.
 */

import { GitChangeDetector } from './git-change-detector';

class BackgroundGitMonitor {
  private static instance: BackgroundGitMonitor;
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private lastCheckedHash = '';
  private readonly CHECK_INTERVAL = 30000; // 30 seconds

  private constructor() {}

  static getInstance(): BackgroundGitMonitor {
    if (!BackgroundGitMonitor.instance) {
      BackgroundGitMonitor.instance = new BackgroundGitMonitor();
    }
    return BackgroundGitMonitor.instance;
  }

  /**
   * Start monitoring git changes
   */
  start(): void {
    if (this.isRunning) {
      console.log('Git monitor is already running');
      return;
    }

    this.isRunning = true;
    console.log('🤖 Starting background git monitor...');

    // Initial check
    this.checkForChanges();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.checkForChanges();
    }, this.CHECK_INTERVAL);
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('🛑 Background git monitor stopped');
  }

  /**
   * Check for new git changes
   */
  private async checkForChanges(): Promise<void> {
    if (!this.isRunning) return;

    try {
      // Get the latest commit hash
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      const { stdout } = await execAsync('git log -1 --pretty=format:"%h"');
      const currentHash = stdout.trim();

      // If we have a new commit, check if it's important
      if (currentHash && currentHash !== this.lastCheckedHash) {
        console.log(`🔍 New commit detected: ${currentHash}`);
        
        const commits = await GitChangeDetector.getRecentCommits(1);
        
        if (commits.length > 0) {
          const commit = commits[0];
          if (commit.hash === currentHash) {
            // Auto-log the new commit
            const { addRealtimeChangelogEntry } = await import('./realtime-changelog');
            
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
        
        this.lastCheckedHash = currentHash;
      }
    } catch (error) {
      console.error('Error in background git monitor:', error);
    }
  }

  /**
   * Generate version from date
   */
  private generateVersion(date: string): string {
    const [year, month, day] = date.split('-');
    return `v${year}.${month}.${day}`;
  }

  /**
   * Get monitoring status
   */
  getStatus(): { isRunning: boolean; lastChecked: string } {
    return {
      isRunning: this.isRunning,
      lastChecked: this.lastCheckedHash
    };
  }
}

// Export singleton instance
export const backgroundGitMonitor = BackgroundGitMonitor.getInstance();

/**
 * Start background monitoring (call this in your app initialization)
 */
export function startBackgroundGitMonitoring(): void {
  backgroundGitMonitor.start();
}

/**
 * Stop background monitoring
 */
export function stopBackgroundGitMonitoring(): void {
  backgroundGitMonitor.stop();
}

/**
 * Get monitoring status
 */
export function getGitMonitoringStatus(): { isRunning: boolean; lastChecked: string } {
  return backgroundGitMonitor.getStatus();
}


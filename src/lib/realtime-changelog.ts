/**
 * Real-time Changelog Management System
 * 
 * This utility manages changelog entries in Firebase Realtime Database
 * for real-time updates across all connected clients.
 */

import { ref, push, set, onValue, off, query, orderByChild, limitToLast } from 'firebase/database';
import { rtdb } from './firebase/client-simple';

export interface RealtimeChangelogEntry {
  id?: string;
  date: string;
  version: string;
  changes: string[];
  type: 'launch' | 'feature' | 'enhancement' | 'bug-fix' | 'security' | 'performance';
  author: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  isUserFacing: boolean;
}

export class RealtimeChangelogManager {
  private static readonly CHANGELOG_REF = 'changelog';
  private static readonly MAX_ENTRIES = 100; // Keep last 100 entries

  /**
   * Add a new changelog entry to Firebase Realtime Database
   */
  static async addEntry(entry: Omit<RealtimeChangelogEntry, 'id' | 'timestamp' | 'isUserFacing'>): Promise<string> {
    try {
      const changelogRef = ref(rtdb, this.CHANGELOG_REF);
      const newEntryRef = push(changelogRef);
      
      const fullEntry: RealtimeChangelogEntry = {
        ...entry,
        id: newEntryRef.key!,
        timestamp: Date.now(),
        isUserFacing: this.isUserFacingEntry(entry)
      };

      await set(newEntryRef, fullEntry);
      
      // Clean up old entries to maintain performance
      await this.cleanupOldEntries();
      
      console.log(`📝 Real-time changelog entry added: ${entry.version} - ${entry.type}`);
      return newEntryRef.key!;
    } catch (error) {
      console.error('Failed to add real-time changelog entry:', error);
      throw error;
    }
  }

  /**
   * Get all changelog entries from Firebase Realtime Database
   */
  static async getAllEntries(): Promise<RealtimeChangelogEntry[]> {
    try {
      const changelogRef = ref(rtdb, this.CHANGELOG_REF);
      const orderedQuery = query(changelogRef, orderByChild('timestamp'));
      
      return new Promise((resolve, reject) => {
        onValue(orderedQuery, (snapshot) => {
          const entries: RealtimeChangelogEntry[] = [];
          snapshot.forEach((childSnapshot) => {
            entries.push(childSnapshot.val() as RealtimeChangelogEntry);
          });
          
          // Sort by timestamp descending (newest first)
          entries.sort((a, b) => b.timestamp - a.timestamp);
          resolve(entries);
        }, (error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error('Failed to get real-time changelog entries:', error);
      throw error;
    }
  }

  /**
   * Get user-facing changelog entries only
   */
  static async getUserFacingEntries(): Promise<RealtimeChangelogEntry[]> {
    try {
      const allEntries = await this.getAllEntries();
      return allEntries.filter(entry => entry.isUserFacing);
    } catch (error) {
      console.error('Failed to get user-facing changelog entries:', error);
      throw error;
    }
  }

  /**
   * Set up real-time listener for changelog updates
   */
  static setupRealtimeListener(
    callback: (entries: RealtimeChangelogEntry[]) => void,
    userFacingOnly: boolean = true
  ): () => void {
    try {
      const changelogRef = ref(rtdb, this.CHANGELOG_REF);
      const orderedQuery = query(changelogRef, orderByChild('timestamp'));
      
      const unsubscribe = onValue(orderedQuery, (snapshot) => {
        const entries: RealtimeChangelogEntry[] = [];
        snapshot.forEach((childSnapshot) => {
          const entry = childSnapshot.val() as RealtimeChangelogEntry;
          if (!userFacingOnly || entry.isUserFacing) {
            entries.push(entry);
          }
        });
        
        // Sort by timestamp descending (newest first)
        entries.sort((a, b) => b.timestamp - a.timestamp);
        callback(entries);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Failed to setup real-time changelog listener:', error);
      return () => {}; // Return empty cleanup function
    }
  }

  /**
   * Get recent changelog entries (last N entries)
   */
  static async getRecentEntries(count: number = 10): Promise<RealtimeChangelogEntry[]> {
    try {
      const changelogRef = ref(rtdb, this.CHANGELOG_REF);
      const recentQuery = query(changelogRef, orderByChild('timestamp'), limitToLast(count));
      
      return new Promise((resolve, reject) => {
        onValue(recentQuery, (snapshot) => {
          const entries: RealtimeChangelogEntry[] = [];
          snapshot.forEach((childSnapshot) => {
            entries.push(childSnapshot.val() as RealtimeChangelogEntry);
          });
          
          // Sort by timestamp descending (newest first)
          entries.sort((a, b) => b.timestamp - a.timestamp);
          resolve(entries);
        }, (error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error('Failed to get recent changelog entries:', error);
      throw error;
    }
  }

  /**
   * Update an existing changelog entry
   */
  static async updateEntry(entryId: string, updates: Partial<RealtimeChangelogEntry>): Promise<void> {
    try {
      const entryRef = ref(rtdb, `${this.CHANGELOG_REF}/${entryId}`);
      await set(entryRef, updates);
      console.log(`📝 Real-time changelog entry updated: ${entryId}`);
    } catch (error) {
      console.error('Failed to update real-time changelog entry:', error);
      throw error;
    }
  }

  /**
   * Delete a changelog entry
   */
  static async deleteEntry(entryId: string): Promise<void> {
    try {
      const entryRef = ref(rtdb, `${this.CHANGELOG_REF}/${entryId}`);
      await set(entryRef, null);
      console.log(`📝 Real-time changelog entry deleted: ${entryId}`);
    } catch (error) {
      console.error('Failed to delete real-time changelog entry:', error);
      throw error;
    }
  }

  /**
   * Check if an entry is user-facing
   */
  private static isUserFacingEntry(entry: Omit<RealtimeChangelogEntry, 'id' | 'timestamp' | 'isUserFacing'>): boolean {
    // Only show user-facing changes
    const userFacingTypes = ['launch', 'feature', 'enhancement', 'bug-fix', 'security', 'performance'];
    if (!userFacingTypes.includes(entry.type)) {
      return false;
    }

    // Filter out internal/development-only changes
    const internalKeywords = [
      'localhost', 'vercel', 'deployment', 'internal', 
      'backend', 'database', 'api', 'server', 'config',
      'typescript', 'build', 'compilation', 'logging',
      'console', 'debug', 'testing', 'workflow', 'tooling', 'setup',
      'schema', 'migration', 'sync', 'process'
    ];
    
    return !entry.changes.some(change => 
      internalKeywords.some(keyword => 
        change.toLowerCase().includes(keyword)
      )
    );
  }

  /**
   * Clean up old entries to maintain performance
   */
  private static async cleanupOldEntries(): Promise<void> {
    try {
      const allEntries = await this.getAllEntries();
      if (allEntries.length > this.MAX_ENTRIES) {
        const entriesToDelete = allEntries.slice(this.MAX_ENTRIES);
        for (const entry of entriesToDelete) {
          if (entry.id) {
            await this.deleteEntry(entry.id);
          }
        }
        console.log(`🧹 Cleaned up ${entriesToDelete.length} old changelog entries`);
      }
    } catch (error) {
      console.error('Failed to cleanup old changelog entries:', error);
    }
  }

  /**
   * Get changelog statistics
   */
  static async getStats(): Promise<{
    totalEntries: number;
    userFacingEntries: number;
    byType: Record<string, number>;
    byImpact: Record<string, number>;
    latestVersion: string;
  }> {
    try {
      const allEntries = await this.getAllEntries();
      const userFacingEntries = allEntries.filter(entry => entry.isUserFacing);
      
      const byType = userFacingEntries.reduce((acc, entry) => {
        acc[entry.type] = (acc[entry.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byImpact = userFacingEntries.reduce((acc, entry) => {
        acc[entry.impact] = (acc[entry.impact] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalEntries: allEntries.length,
        userFacingEntries: userFacingEntries.length,
        byType,
        byImpact,
        latestVersion: userFacingEntries[0]?.version || 'v1.0.0'
      };
    } catch (error) {
      console.error('Failed to get changelog statistics:', error);
      throw error;
    }
  }
}

/**
 * Helper function to add a new real-time changelog entry
 */
export async function addRealtimeChangelogEntry(
  version: string,
  type: RealtimeChangelogEntry['type'],
  changes: string[],
  impact: RealtimeChangelogEntry['impact'] = 'medium',
  author: string = 'Development Team'
): Promise<string> {
  return RealtimeChangelogManager.addEntry({
    date: new Date().toISOString().split('T')[0],
    version,
    type,
    changes,
    impact,
    author
  });
}

/**
 * Helper function to get real-time changelog entries for display
 */
export async function getRealtimeChangelogEntries(): Promise<RealtimeChangelogEntry[]> {
  return RealtimeChangelogManager.getUserFacingEntries();
}


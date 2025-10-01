/**
 * React hook for real-time changelog management
 */

import { useState, useEffect, useCallback } from 'react';
import { RealtimeChangelogManager, RealtimeChangelogEntry } from '@/lib/realtime-changelog';

interface UseRealtimeChangelogOptions {
  userFacingOnly?: boolean;
  limit?: number;
  autoConnect?: boolean;
}

interface UseRealtimeChangelogReturn {
  entries: RealtimeChangelogEntry[];
  loading: boolean;
  error: string | null;
  stats: {
    totalEntries: number;
    userFacingEntries: number;
    byType: Record<string, number>;
    byImpact: Record<string, number>;
    latestVersion: string;
  } | null;
  addEntry: (entry: Omit<RealtimeChangelogEntry, 'id' | 'timestamp' | 'isUserFacing'>) => Promise<string>;
  updateEntry: (entryId: string, updates: Partial<RealtimeChangelogEntry>) => Promise<void>;
  deleteEntry: (entryId: string) => Promise<void>;
  refresh: () => Promise<void>;
  isConnected: boolean;
}

export function useRealtimeChangelog(options: UseRealtimeChangelogOptions = {}): UseRealtimeChangelogReturn {
  const {
    userFacingOnly = true,
    limit = 50,
    autoConnect = true
  } = options;

  const [entries, setEntries] = useState<RealtimeChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UseRealtimeChangelogReturn['stats']>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [entriesData, statsData] = await Promise.all([
        userFacingOnly 
          ? RealtimeChangelogManager.getUserFacingEntries()
          : RealtimeChangelogManager.getAllEntries(),
        RealtimeChangelogManager.getStats()
      ]);

      setEntries(entriesData.slice(0, limit));
      setStats(statsData);
      setIsConnected(true);
    } catch (err) {
      console.error('Failed to load initial changelog data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load changelog data');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [userFacingOnly, limit]);

  // Set up real-time listener
  useEffect(() => {
    if (!autoConnect) return;

    let unsubscribe: (() => void) | null = null;

    const setupListener = () => {
      try {
        unsubscribe = RealtimeChangelogManager.setupRealtimeListener(
          (newEntries) => {
            setEntries(newEntries.slice(0, limit));
            setIsConnected(true);
            setError(null);
          },
          userFacingOnly
        );
      } catch (err) {
        console.error('Failed to setup real-time listener:', err);
        setError(err instanceof Error ? err.message : 'Failed to setup real-time connection');
        setIsConnected(false);
      }
    };

    // Load initial data first
    loadInitialData().then(() => {
      // Then setup real-time listener
      setupListener();
    });

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [autoConnect, userFacingOnly, limit, loadInitialData]);

  // Add entry function
  const addEntry = useCallback(async (entry: Omit<RealtimeChangelogEntry, 'id' | 'timestamp' | 'isUserFacing'>) => {
    try {
      setError(null);
      const entryId = await RealtimeChangelogManager.addEntry(entry);
      return entryId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add changelog entry';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Update entry function
  const updateEntry = useCallback(async (entryId: string, updates: Partial<RealtimeChangelogEntry>) => {
    try {
      setError(null);
      await RealtimeChangelogManager.updateEntry(entryId, updates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update changelog entry';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Delete entry function
  const deleteEntry = useCallback(async (entryId: string) => {
    try {
      setError(null);
      await RealtimeChangelogManager.deleteEntry(entryId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete changelog entry';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Refresh function
  const refresh = useCallback(async () => {
    await loadInitialData();
  }, [loadInitialData]);

  return {
    entries,
    loading,
    error,
    stats,
    addEntry,
    updateEntry,
    deleteEntry,
    refresh,
    isConnected
  };
}

/**
 * Hook for real-time changelog statistics only
 */
export function useRealtimeChangelogStats() {
  const [stats, setStats] = useState<UseRealtimeChangelogReturn['stats']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const statsData = await RealtimeChangelogManager.getStats();
        setStats(statsData);
      } catch (err) {
        console.error('Failed to load changelog stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load changelog statistics');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return { stats, loading, error };
}


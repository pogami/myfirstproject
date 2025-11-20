import { useState, useEffect } from 'react';

export interface FeatureFlags {
  interactiveQuizzes: boolean;
  fullExams: boolean;
  flashcards: boolean;
  communityChat: boolean;
  fileUploads: boolean;
  aiChat: boolean;
  syllabusParser: boolean;
  darkMode: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  interactiveQuizzes: true,
  fullExams: true,
  flashcards: true,
  communityChat: true,
  fileUploads: true,
  aiChat: true,
  syllabusParser: true,
  darkMode: true,
};

// We occasionally need to force-enable AI chat in production regardless of any
// stale localStorage flag state. This is controlled via an env override but
// defaults to "on" so that users can always reach the assistant unless we
// explicitly set NEXT_PUBLIC_FORCE_ENABLE_AI_CHAT="false".
const FORCE_ENABLE_AI_CHAT =
  process.env.NEXT_PUBLIC_FORCE_ENABLE_AI_CHAT !== 'false';

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load feature flags from localStorage
    const loadFlags = () => {
      try {
        const stored = localStorage.getItem('admin-feature-flags');
        if (stored) {
          const parsed = JSON.parse(stored);
          setFlags({ ...DEFAULT_FLAGS, ...parsed });
        }
      } catch (e) {
        console.error('Failed to load feature flags:', e);
      } finally {
        setLoading(false);
      }
    };

    loadFlags();

    // Listen for changes to feature flags
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin-feature-flags') {
        loadFlags();
      }
    };

    // Listen for custom events (for same-tab updates)
    const handleFlagUpdate = () => {
      loadFlags();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('featureFlagsUpdated', handleFlagUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('featureFlagsUpdated', handleFlagUpdate);
    };
  }, []);

  const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
    if (feature === 'aiChat' && FORCE_ENABLE_AI_CHAT) {
      return true;
    }
    return flags[feature] !== false; // Default to true if not set
  };

  return {
    flags,
    loading,
    isFeatureEnabled,
  };
}


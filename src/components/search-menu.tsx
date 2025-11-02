"use client";

import React, { useState, useEffect } from 'react';
import { Search, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchMenuProps {
  onSearchSelect: (searchType: string, query: string) => void;
  disabled?: boolean;
  className?: string;
}

export function SearchMenu({ onSearchSelect, disabled = false, className = "" }: SearchMenuProps) {
  // Initialize search mode from localStorage or body attribute
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  useEffect(() => {
    // Sync state from localStorage and body attribute on mount
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const storageFlag = localStorage.getItem('web-search-enabled');
      const bodyAttr = document.body.getAttribute('data-search-mode');
      const isEnabled = storageFlag === 'true' || bodyAttr === 'true';
      setIsSearchMode(isEnabled);
      // Ensure both are set if one is set
      if (isEnabled) {
        document.body.setAttribute('data-search-mode', 'true');
        localStorage.setItem('web-search-enabled', 'true');
      }
    }
  }, []);

  const handleSearchToggle = () => {
    if (disabled) return;
    
    // Toggle search mode
    setIsSearchMode(!isSearchMode);
    
    // Set data attribute on document body AND localStorage to indicate search mode
    if (!isSearchMode) {
      document.body.setAttribute('data-search-mode', 'true');
      if (typeof window !== 'undefined') {
        localStorage.setItem('web-search-enabled', 'true');
      }
    } else {
      document.body.removeAttribute('data-search-mode');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('web-search-enabled');
      }
    }
    
    // Just toggle the mode - don't auto-send the message
  };

  return (
        <button
          onClick={handleSearchToggle}
          disabled={disabled}
          className={cn(
            "h-8 w-8 flex items-center justify-center cursor-pointer rounded-lg transition-all duration-200",
            isSearchMode 
              ? "bg-blue-500 text-white" 
              : "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          title={isSearchMode ? "Web search: ON (stays on until you click again)" : "Click to turn Web search ON"}
        >
          <Globe className="h-5 w-5" />
        </button>
  );
}

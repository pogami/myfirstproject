"use client";

import { useState, useEffect } from 'react';
import { ExternalLink, Globe, X } from 'lucide-react';

interface Source {
  title: string;
  url: string;
  snippet: string;
}

interface SourceIconProps {
  sources: Source[];
  className?: string;
}

export function SourceIcon({ sources, className = "" }: SourceIconProps) {
  const [isClicked, setIsClicked] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

  // Close popup when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (isClicked) {
        setIsClicked(false);
      }
    };

    if (isClicked) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isClicked]);

  if (!sources || sources.length === 0) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Globe icon clicked!', { isClicked, sources: sources.length });
    
    if (!isClicked) {
      // Get the position of the clicked element relative to viewport
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setPopupPosition({
        top: rect.top - 10, // Position it right above the globe
        left: rect.left + rect.width / 2
      });
    }
    
    setIsClicked(!isClicked);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Source Icon */}
      <button
        className={`inline-flex items-center justify-center w-6 h-6 rounded-md cursor-pointer transition-colors duration-200 border shadow-sm ${
          isClicked 
            ? 'bg-blue-100 dark:bg-blue-800/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600' 
            : 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 border-blue-200 dark:border-blue-700'
        }`}
        onClick={handleClick}
        title={`Click to ${isClicked ? 'hide' : 'show'} ${sources.length} source${sources.length > 1 ? 's' : ''}`}
      >
        <Globe className="w-4 h-4" />
      </button>

      {/* Simple URL Popup - Fixed Above Globe */}
      {isClicked && (
        <div 
          className="fixed z-[9999] w-72 max-w-sm"
          style={{
            top: `${popupPosition.top}px`,
            left: `${popupPosition.left}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sources ({sources.length})
              </div>
              <button
                onClick={() => setIsClicked(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sources.map((source, index) => (
                <div key={index} className="text-xs">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline break-all"
                  >
                    {source.url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from 'react';
import { ExternalLink, Globe } from 'lucide-react';

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
  const [isHovered, setIsHovered] = useState(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Source Icon */}
      <div
        className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors duration-200 border border-blue-200 dark:border-blue-700 shadow-sm"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={`${sources.length} source${sources.length > 1 ? 's' : ''} available`}
      >
        <Globe className="w-4 h-4" />
      </div>

      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 max-w-sm z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sources ({sources.length})
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {sources.map((source, index) => (
                <div key={index} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 pb-2 last:pb-0">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-2 -m-2 transition-colors duration-150"
                  >
                    <div className="flex items-start gap-2">
                      <ExternalLink className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-blue-600 dark:text-blue-400 truncate">
                          {source.title}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {source.snippet}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">
                          {new URL(source.url).hostname}
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200 dark:border-t-gray-700"></div>
        </div>
      )}
    </div>
  );
}

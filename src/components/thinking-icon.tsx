import React, { useState, useEffect } from 'react';
import { Lightbulb, Sparkles, X, Brain } from 'lucide-react';

interface ThinkingIconProps {
  isThinking: boolean;
  thinking: string;
  className?: string;
}

export function ThinkingIcon({ isThinking, thinking, className = "" }: ThinkingIconProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Cleanup timeout on unmount - moved before early return
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  if (!isThinking && !thinking) {
    return null;
  }

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    // Add a small delay before hiding to allow moving to popup
    const timeout = setTimeout(() => {
      setShowTooltip(false);
    }, 150);
    setHoverTimeout(timeout);
  };

  const handlePopupMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handlePopupMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div 
        className="h-4 w-4 p-0 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-all duration-200 ease-in-out rounded cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {isThinking ? (
          <div className="relative">
            <Brain className="h-3 w-3 text-blue-500" />
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse"></div>
          </div>
        ) : (
          <div className="relative group">
            <Brain className="h-3 w-3 text-indigo-500 hover:text-indigo-600 transition-all duration-200 group-hover:scale-110" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </div>
        )}
      </div>

      {/* Enhanced Tooltip - Same style as SourcesButton */}
      {showTooltip && thinking && (
        <div 
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-[9999] pointer-events-none"
          onMouseEnter={handlePopupMouseEnter}
          onMouseLeave={handlePopupMouseLeave}
        >
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 max-w-sm pointer-events-auto min-w-[280px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Brain className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    CourseConnect AI
                  </span>
                </div>
                <div className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-full">
                  Thinking Process
                </div>
              </div>
              <button 
                onClick={() => setShowTooltip(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            
            {/* Thinking Content */}
            <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-h-56 overflow-y-auto">
              <div className="whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                {thinking}
              </div>
            </div>
            
            {/* Footer */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                <span>This shows how CourseConnect AI analyzed your question</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simple tooltip for when thinking */}
      {showTooltip && isThinking && !thinking && (
        <div 
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-[9999] pointer-events-none"
          onMouseEnter={handlePopupMouseEnter}
          onMouseLeave={handlePopupMouseLeave}
        >
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl px-3 py-2 text-xs pointer-events-auto">
            <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Brain className="h-3 w-3 text-blue-500" />
              <span>CourseConnect AI is thinking...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

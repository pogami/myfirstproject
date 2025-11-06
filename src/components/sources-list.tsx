"use client";

import React, { useState } from "react";

export type SourceItem = {
  title: string;
  url: string;
  snippet?: string;
};

interface SourcesListProps {
  sources: SourceItem[];
  className?: string;
}

export default function SourcesList({ sources, className = "" }: SourcesListProps) {
  const [activeSource, setActiveSource] = useState<SourceItem | null>(null);

  return (
    <div className={`flex gap-4 ${className}`}>
      {/* Main list */}
      <div className="flex-1 p-4 border rounded-xl bg-white dark:bg-gray-900">
        <h2 className="text-lg font-semibold mb-2">Sources</h2>
        <ul className="space-y-3">
          {sources.map((src, i) => (
            <li key={`${src.url}-${i}`} className="group">
              <button
                onClick={() => setActiveSource(src)}
                className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:no-underline"
                title={src.url}
              >
                {src.title}
              </button>
              {src.snippet && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{src.snippet}</p>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Sidebar preview */}
      {activeSource && (
        <div className="w-1/2 min-w-[320px] border rounded-xl p-3 bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-sm line-clamp-1" title={activeSource.title}>{activeSource.title}</h3>
            <div className="flex items-center gap-2">
              <a
                href={activeSource.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs px-2 py-1 rounded border hover:bg-white dark:hover:bg-gray-800"
              >
                Open ↗
              </a>
              <button
                onClick={() => setActiveSource(null)}
                className="text-xs px-2 py-1 rounded border hover:bg-white dark:hover:bg-gray-800"
                aria-label="Close preview"
              >
                ✖
              </button>
            </div>
          </div>
          <iframe
            src={activeSource.url}
            className="w-full h-[70vh] mt-2 rounded"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      )}
    </div>
  );
}






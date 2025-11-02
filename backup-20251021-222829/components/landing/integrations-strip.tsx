"use client";

import React from 'react';

function GoogleDriveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path fill="#0F9D58" d="M7.5 3L1 14l3.5 6L11 9z"/>
      <path fill="#4285F4" d="M22.5 20H4.5L1 14h18z"/>
      <path fill="#F4B400" d="M16.5 3H7.5L11 9h9z"/>
    </svg>
  );
}

function CanvasIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <circle cx="12" cy="12" r="3" fill="#E11D48"/>
      <g fill="#E11D48">
        <circle cx="12" cy="2.8" r="2"/>
        <circle cx="12" cy="21.2" r="2"/>
        <circle cx="2.8" cy="12" r="2"/>
        <circle cx="21.2" cy="12" r="2"/>
        <circle cx="5.1" cy="5.1" r="2"/>
        <circle cx="18.9" cy="5.1" r="2"/>
        <circle cx="5.1" cy="18.9" r="2"/>
        <circle cx="18.9" cy="18.9" r="2"/>
      </g>
    </svg>
  );
}

function SlackIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path fill="#36C5F0" d="M5 14a2 2 0 112 2H5z"/>
      <path fill="#2EB67D" d="M10 5a2 2 0 112 2V5z"/>
      <path fill="#ECB22E" d="M19 10a2 2 0 11-2 2v-2z"/>
      <path fill="#E01E5A" d="M10 19a2 2 0 11-2-2h2z"/>
      <path fill="#2EB67D" d="M7 10h6a2 2 0 110 4H7a2 2 0 110-4z"/>
      <path fill="#36C5F0" d="M10 7v6a2 2 0 104 0V7a2 2 0 10-4 0z"/>
    </svg>
  );
}

function NotionIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" fill="white"/>
      <rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="#111827"/>
      <path d="M8 18V6h2l4 6V6h2v12h-2l-4-6v6H8z" fill="#111827"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path fill="#111827" d="M12 .5a11.5 11.5 0 00-3.64 22.41c.58.11.79-.25.79-.56v-2.1c-3.2.7-3.87-1.37-3.87-1.37-.53-1.35-1.3-1.7-1.3-1.7-1.06-.73.08-.72.08-.72 1.17.08 1.79 1.21 1.79 1.21 1.04 1.78 2.73 1.26 3.4.96.11-.77.4-1.26.72-1.55-2.56-.29-5.25-1.28-5.25-5.71 0-1.26.45-2.28 1.2-3.08-.12-.29-.52-1.47.11-3.06 0 0 .98-.31 3.2 1.18a11.1 11.1 0 015.82 0c2.22-1.49 3.2-1.18 3.2-1.18.63 1.59.23 2.77.11 3.06.75.8 1.2 1.82 1.2 3.08 0 4.44-2.69 5.41-5.26 5.7.41.36.78 1.06.78 2.14v3.17c0 .31.2.67.8.56A11.5 11.5 0 0012 .5z"/>
    </svg>
  );
}

export function IntegrationsStrip() {
  const items = [
    { name: 'Google Drive', icon: <GoogleDriveIcon />, status: 'Available' },
    { name: 'Canvas', icon: <CanvasIcon />, status: 'Coming soon' },
    { name: 'Slack', icon: <SlackIcon />, status: 'Available' },
    { name: 'Notion', icon: <NotionIcon />, status: 'Coming soon' },
    { name: 'GitHub', icon: <GitHubIcon />, status: 'Available' },
  ];

  return (
    <section className="py-14">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-6">
          <h3 className="text-sm font-semibold tracking-wide text-gray-600 dark:text-gray-300 uppercase">Integrations</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Connect your favorite tools to supercharge your study</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 items-center">
          {items.map(item => (
            <div key={item.name} className="flex items-center justify-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              {item.icon}
              <div className="text-left">
                <div className="text-sm text-gray-800 dark:text-gray-200 font-medium">{item.name}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">{item.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



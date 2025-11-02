"use client";

import React from 'react';

export function MobilePreview2026() {
  return (
    <section className="relative py-24 sm:py-32 bg-black overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800" />
      <div className="absolute top-1/3 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-24 w-[28rem] h-[28rem] bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-white/10 bg-white/5 text-white text-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Mobile App 2026 (Slate)
          </span>
          <h2 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
            A SaaS‑grade mobile experience
          </h2>
          <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
            Polished. Performant. Production‑ready visuals for your 2026 launch.
          </p>
        </div>

        {/* Phone mockup */}
        <div className="relative mx-auto w-[340px] h-[720px] rounded-[40px] border border-white/15 shadow-[0_40px_120px_rgba(0,0,0,0.5)] bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200">
          {/* Screen */}
          <div className="absolute inset-4 rounded-[32px] overflow-hidden bg-black shadow-[inset_0_0_60px_rgba(0,0,0,.85)]">
            {/* Dynamic Island */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-40 h-8 bg-black rounded-full shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent" />
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between px-6 pt-16 pb-3 text-white/90 text-sm font-semibold">
              <span>9:41</span>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <span className="w-1 h-2 bg-white rounded-sm" />
                  <span className="w-1 h-2 bg-white rounded-sm" />
                  <span className="w-1 h-2 bg-white rounded-sm" />
                  <span className="w-1 h-2 bg-white rounded-sm" />
                </div>
                <span className="w-6 h-3 bg-white rounded-sm" />
                <span>100%</span>
              </div>
            </div>

            {/* Animated wallpaper */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute -top-20 -left-16 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 blur-3xl" />
              <div className="absolute -bottom-28 -right-10 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-pink-500/25 to-violet-500/25 blur-3xl" />
            </div>

            {/* App content */}
            <div className="relative px-5 pt-3 pb-8 h-full overflow-hidden">
              {/* Top bar */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10" />
                  <div>
                    <div className="text-white text-sm font-semibold">CourseConnect</div>
                    <div className="text-white/60 text-[11px]">AI Learning</div>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10" />
              </div>

              {/* Icon grid */}
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                  { key: 'courseconnect', label: 'CourseConnect', icon: '/courseconnect-favicon.svg' },
                  { key: 'groups', label: 'Groups', emoji: '👥' },
                  { key: 'study', label: 'Study', emoji: '📚' },
                  { key: 'tasks', label: 'Tasks', emoji: '✅' },
                  { key: 'files', label: 'Files', emoji: '🗂️' },
                  { key: 'calendar', label: 'Calendar', emoji: '📆' },
                  { key: 'notes', label: 'Notes', emoji: '📝' },
                  { key: 'settings', label: 'Settings', emoji: '⚙️' },
                ].map(item => (
                  <div key={item.key} className="flex flex-col items-center gap-1">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 grid place-items-center">
                      {item.icon ? (
                        <img src={item.icon} alt={item.label} className="w-7 h-7" />
                      ) : (
                        <span className="text-lg text-white/90">{item.emoji}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-white/80">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Cards */}
              <div className="space-y-2">
                <div className="h-11 rounded-xl bg-white/10 border border-white/10" />
                <div className="h-11 rounded-xl bg-white/10 border border-white/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}




"use client";

import React, { useRef, useState } from 'react';

export function MobileAppSection() {
  const [activeTab, setActiveTab] = useState<'Home' | 'Chat' | 'Schedule' | 'Profile'>('Home');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Array<{ id: number; from: 'user' | 'ai'; text: string }>>([
    { id: 1, from: 'ai', text: "Hi! I'm your AI study buddy. Ask me anything." }
  ]);
  const [wallpaper, setWallpaper] = useState<'aurora' | 'sunset' | 'ocean' | 'mono'>('aurora');

  const screenRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const mouseStartX = useRef<number | null>(null);
  const isMouseDown = useRef<boolean>(false);

  const vibrate = (pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      // @ts-ignore
      navigator.vibrate(pattern);
    }
  };

  const tabs: Array<'Home' | 'Chat' | 'Schedule' | 'Profile'> = ['Home', 'Chat', 'Schedule', 'Profile'];
  const setTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    vibrate(8);
  };

  const send = () => {
    const text = chatInput.trim();
    if (!text) return;
    const id = messages.length + 1;
    setMessages([...messages, { id, from: 'user', text }]);
    setChatInput('');
    setTimeout(() => {
      const rid = id + 1;
      setMessages(prev => [...prev, { id: rid, from: 'ai', text: 'Got it! Let me help with that.' }]);
    }, 600);
    vibrate([5, 20, 5]);
  };

  // Touch / mouse swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const delta = touchEndX.current - touchStartX.current;
    const threshold = 50;
    if (Math.abs(delta) > threshold) {
      const idx = tabs.indexOf(activeTab);
      if (delta < 0 && idx < tabs.length - 1) setTab(tabs[idx + 1]);
      else if (delta > 0 && idx > 0) setTab(tabs[idx - 1]);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDown.current = true;
    mouseStartX.current = e.clientX;
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isMouseDown.current || mouseStartX.current === null) return;
    const delta = e.clientX - mouseStartX.current;
    const threshold = 70;
    const idx = tabs.indexOf(activeTab);
    if (Math.abs(delta) > threshold) {
      if (delta < 0 && idx < tabs.length - 1) setTab(tabs[idx + 1]);
      else if (delta > 0 && idx > 0) setTab(tabs[idx - 1]);
    }
    isMouseDown.current = false;
    mouseStartX.current = null;
  };

  return (
    <div className="py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Mobile App Preview</h2>
          <p className="text-gray-600">Realistic phone UI with light interactions.</p>
        </div>

        {/* Phone frame */}
        <div className="mx-auto w-[320px] h-[680px] rounded-[36px] border border-gray-200 shadow-2xl bg-gray-100 overflow-hidden relative">
          {/* Bezel + screen */}
          <div className="absolute inset-3 rounded-[30px] bg-black overflow-hidden">
            {/* Dynamic island */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-36 h-7 bg-black rounded-full shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-40" />
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between px-5 pt-12 pb-2 text-white text-sm font-semibold">
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

            {/* Wallpaper */}
            <div className="absolute inset-0 -z-10">
              {wallpaper === 'aurora' && (
                <>
                  <div className="absolute -top-16 -left-16 w-80 h-80 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl" />
                  <div className="absolute -bottom-24 -right-12 w-96 h-96 bg-gradient-to-br from-pink-500/20 to-violet-500/20 rounded-full blur-3xl" />
                </>
              )}
              {wallpaper === 'sunset' && (
                <>
                  <div className="absolute -top-20 -left-10 w-96 h-96 bg-gradient-to-br from-orange-500/30 via-pink-500/30 to-red-500/30 rounded-full blur-3xl" />
                  <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-gradient-to-br from-yellow-400/20 to-rose-500/20 rounded-full blur-3xl" />
                </>
              )}
              {wallpaper === 'ocean' && (
                <>
                  <div className="absolute -top-16 -left-24 w-96 h-96 bg-gradient-to-br from-cyan-400/25 via-sky-500/25 to-blue-600/25 rounded-full blur-3xl" />
                  <div className="absolute -bottom-24 -right-10 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-blue-400/20 rounded-full blur-3xl" />
                </>
              )}
              {wallpaper === 'mono' && (
                <>
                  <div className="absolute -top-12 -left-12 w-72 h-72 bg-gradient-to-br from-gray-300/25 to-gray-500/25 rounded-full blur-3xl" />
                  <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-gray-400/20 to-gray-600/20 rounded-full blur-3xl" />
                </>
              )}
            </div>

            {/* App content */}
            <div className="relative px-4 pt-2 pb-6 h-full overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/10" />
                  <div>
                    <div className="text-white text-sm font-semibold">CourseConnect</div>
                    <div className="text-white/70 text-[11px]">AI Learning</div>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-white/10" />
              </div>

              {/* Active Screen */}
              <div className="text-white text-xs opacity-70 mb-2">{activeTab}</div>
              {activeTab === 'Home' && (
                <>
                  <div className="grid grid-cols-4 gap-3 mt-2">
                    {[
                      { key: 'courseconnect', label: 'CourseConnect', type: 'app' as const },
                      { key: 'groups', label: 'Groups', type: 'emoji' as const, emoji: '👥' },
                      { key: 'study', label: 'Study', type: 'emoji' as const, emoji: '📚' },
                      { key: 'tasks', label: 'Tasks', type: 'emoji' as const, emoji: '✅' },
                      { key: 'files', label: 'Files', type: 'emoji' as const, emoji: '🗂️' },
                      { key: 'calendar', label: 'Calendar', type: 'emoji' as const, emoji: '📆' },
                      { key: 'notes', label: 'Notes', type: 'emoji' as const, emoji: '📝' },
                      { key: 'settings', label: 'Settings', type: 'emoji' as const, emoji: '⚙️' }
                    ].map(item => (
                      <div key={item.key} className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => {
                            if (item.key === 'courseconnect') {
                              setTab('Chat');
                            } else if (item.key === 'calendar') {
                              setTab('Schedule');
                            }
                          }}
                          className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center active:scale-[0.98] transition"
                          aria-label={item.label}
                        >
                          {item.type === 'app' ? (
                            <img src="/courseconnect-favicon.svg" alt="CourseConnect" className="w-7 h-7" />
                          ) : (
                            <span className="text-lg">{item.emoji}</span>
                          )}
                        </button>
                        <span className="text-[10px] text-white/80">{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-10 rounded-xl bg-white/10 border border-white/10" />
                    <div className="h-10 rounded-xl bg-white/10 border border-white/10" />
                  </div>
                </>
              )}

              {activeTab === 'Chat' && (
                <div className="flex flex-col h-[480px]">
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {messages.map(m => (
                      <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`${m.from === 'user' ? 'bg-white/20' : 'bg-white/10'} border border-white/10 text-white text-xs rounded-xl px-3 py-2 max-w-[220px]`}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && send()}
                      placeholder="Type a message..."
                      className="flex-1 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/60 px-3 py-2 text-sm focus:outline-none"
                    />
                    <button onClick={send} className="px-3 py-2 rounded-lg bg-white/20 border border-white/10 text-white text-sm">Send</button>
                  </div>
                </div>
              )}

              {activeTab === 'Schedule' && (
                <div className="space-y-2">
                  <div className="h-14 rounded-xl bg-white/10 border border-white/10" />
                  <div className="h-14 rounded-xl bg-white/10 border border-white/10" />
                </div>
              )}

              {activeTab === 'Profile' && (
                <div className="space-y-3">
                  <div className="h-16 rounded-xl bg-white/10 border border-white/10" />
                  <div className="h-10 rounded-xl bg-white/10 border border-white/10" />
                  <div>
                    <div className="text-white text-xs mb-2 opacity-80">Wallpaper</div>
                    <div className="grid grid-cols-4 gap-2">
                      {(['aurora','sunset','ocean','mono'] as const).map(w => (
                        <button key={w} onClick={() => { setWallpaper(w); vibrate(8); }} className={`h-12 rounded-lg border ${wallpaper===w ? 'border-white ring-2 ring-white/50' : 'border-white/20'} bg-white/10`} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex justify-center">
          <div className="rounded-full bg-gray-100 border p-1 flex gap-1">
            {(['Home','Chat','Schedule','Profile'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm ${activeTab===tab ? 'bg-black text-white' : 'text-gray-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



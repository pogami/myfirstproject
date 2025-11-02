"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import SourcesList, { SourceItem } from "@/components/sources-list";

type Source = {
  id: number;
  title: string;
  url: string;
  snippet: string;
  date?: string;
  confidence?: "high" | "medium" | "low";
};

const MOCK_SOURCES: Source[] = [
  {
    id: 1,
    title: "Calculus I – Derivatives overview",
    url: "https://example.edu/calculus/derivatives",
    snippet: "Derivatives measure the instantaneous rate of change and slope of the tangent line.",
    date: "2d",
    confidence: "high",
  },
  {
    id: 2,
    title: "Limits and continuity (Khan Academy)",
    url: "https://www.khanacademy.org/math/calculus-1/limits",
    snippet: "A function is continuous at a point if the limit equals the function's value at that point.",
    date: "5d",
    confidence: "medium",
  },
  {
    id: 3,
    title: "Mean Value Theorem – Notes",
    url: "https://notes.math.org/mvt",
    snippet: "If f is continuous on [a, b] and differentiable on (a, b), then some c exists with f'(c)=\n(f(b)-f(a))/(b-a).",
    date: "1mo",
    confidence: "high",
  },
];

function getDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function Favicon({ url, alt }: { url: string; alt: string }) {
  const domain = useMemo(() => getDomain(url), [url]);
  const src = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  return <img src={src} alt={alt} className="h-4 w-4 rounded-sm" />;
}

export default function TestSourcesPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "s") setIsOpen((v) => !v);
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const aiText = (
    <p className="leading-relaxed text-sm md:text-base">
      For an intuitive view of derivatives, think of slope as the rate of change. The
      limit definition connects average rate to instantaneous rate [1]. Continuity
      ensures the function has no jumps, making limit behavior predictable [2]. For
      many proofs (like the Mean Value Theorem), continuity and differentiability
      assumptions are essential [3].
    </p>
  );

  const sampleList: SourceItem[] = [
    { title: "ARC Raiders review – GamesRadar", url: "https://www.gamesradar.com/arc-raiders-review/", snippet: "The 8th most wishlisted game on Steam..." },
    { title: "IGN – ARC Raiders Hands-on", url: "https://www.ign.com/articles/arc-raiders-preview", snippet: "We spent time with the latest build..." },
    { title: "PC Gamer – ARC Raiders", url: "https://www.pcgamer.com/arc-raiders", snippet: "A promising extraction shooter..." },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold mb-4">Sources UX – Demo</h1>

      <div className="rounded-2xl border bg-white dark:bg-gray-900 p-4 shadow-sm">
        <div className="relative">
          {/* AI message */}
          <div className="prose dark:prose-invert max-w-none">
            {aiText}
          </div>

          {/* Inline citations */}
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
            {MOCK_SOURCES.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setActive(s.id);
                  setIsOpen(true);
                  // scroll into view after panel opens
                  setTimeout(() => {
                    const el = document.getElementById(`src-${s.id}`);
                    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
                  }, 0);
                }}
                className={`px-1.5 py-0.5 rounded border transition-colors ${
                  active === s.id
                    ? "bg-blue-600 text-white border-blue-600"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-700"
                }`}
                title={`Jump to source ${s.id}`}
              >
                [{s.id}]
              </button>
            ))}

            {/* ChatGPT-style pill with favicons and count */}
            <button
              onClick={() => setIsOpen((v) => !v)}
              className="ml-auto inline-flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-expanded={isOpen}
              title="View sources"
            >
              <div className="flex -space-x-1">
                {MOCK_SOURCES.slice(0,3).map((s) => (
                  <span key={`fv-${s.id}`} className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 overflow-hidden">
                    <Favicon url={s.url} alt={s.title} />
                  </span>
                ))}
              </div>
              <span className="text-xs font-medium">Sources</span>
            </button>
          </div>
        </div>
      </div>

      {/* New SourcesList component demo */}
      <SourcesList sources={sampleList} />

      {/* Slide-over panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="fixed bottom-6 right-6 z-50 w-[720px] max-w-[96vw] max-h-[70vh] rounded-xl border bg-white dark:bg-gray-900 shadow-2xl overflow-hidden"
          role="dialog"
          aria-label="Sources"
        >
          <div className="flex h-full">
            {/* Left list (like ChatGPT) */}
            <div className="w-[40%] min-w-[260px] border-r overflow-auto">
              <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur px-3 py-2 border-b flex items-center justify-between">
                <div className="text-sm font-semibold">Citations</div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-xs px-2 py-1 rounded border hover:bg-gray-50 dark:hover:bg-gray-800"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <div className="p-2 space-y-2">
                {MOCK_SOURCES.map((s) => (
                  <button
                    key={`list-${s.id}`}
                    id={`src-${s.id}`}
                    onClick={() => setActive(s.id)}
                    className={`w-full text-left rounded-lg border p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      active === s.id ? "border-blue-500" : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Favicon url={s.url} alt={s.title} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{getDomain(s.url)}</span>
                    </div>
                    <div className="text-sm font-medium line-clamp-1">{s.title}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{s.snippet}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right preview */}
            <div className="flex-1 bg-gray-50 dark:bg-gray-950">
              {active ? (
                <iframe
                  key={`frame-${active}`}
                  src={MOCK_SOURCES.find((s) => s.id === active)!.url}
                  className="w-full h-full"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  Select a source to preview
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



"use client";

import { useState } from "react";
import { RippleText } from "./ripple-text";

export default function AiResponseDemo() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [sources, setSources] = useState<string[]>([]);

  // Simulated fetch from AI
  const getAiResponse = async () => {
    setLoading(true);
    setResponse("");
    setSources([]);

    // fake delay to show animation
    await new Promise((res) => setTimeout(res, 3000));

    // Example data from AI
    setResponse(
      "Here's what I found: Tylenol has been studied in relation to pregnancy and autism. Evidence is mixed, and experts say more research is needed."
    );
    setSources([
      "https://www.reuters.com",
      "https://www.cbsnews.com",
      "https://www.nature.com",
    ]);

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={getAiResponse}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
      >
        Ask AI
      </button>

      <div className="mt-6 min-h-[100px]">
        {loading && <RippleText text="Searching the web..." />}
        {!loading && response && (
          <p className="text-gray-800 text-base leading-relaxed">{response}</p>
        )}
      </div>

      {!loading && sources.length > 0 && (
        <div className="mt-6 p-4 bg-gray-100 rounded-xl">
          <h3 className="font-semibold mb-2">Sources</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-600">
            {sources.map((src, i) => (
              <li key={i}>
                <a href={src} target="_blank" rel="noopener noreferrer">
                  {src}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

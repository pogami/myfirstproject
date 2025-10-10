"use client";

import { useEffect, useRef, useState } from "react";

type Role = "user" | "assistant" | "system";
interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

export default function DemoChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "system",
      content:
        "You are CourseConnect AI, an expert educational assistant. Answer clearly and concisely.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [statusText, setStatusText] = useState("");
  const connectTimer = useRef<NodeJS.Timeout | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentResponse]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setStatusText("Type a message first.");
      return;
    }
    if (isStreaming) {
      setStatusText("Please wait, AI is responding...");
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStatusText("Sending...");
    setIsStreaming(true);
    setIsThinking(true);
    setCurrentResponse("");

    // If no chunks arrive shortly, surface a visible connection status
    if (connectTimer.current) clearTimeout(connectTimer.current);
    connectTimer.current = setTimeout(() => {
      if (!currentResponse) setStatusText("Connecting to AI...");
    }, 1500);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      console.log("[DemoChat] Sending to API:", { question: trimmed, historyLen: history.length });
      const res = await fetch("/api/chat/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, conversationHistory: history }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.trim());
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.type === "content" && data.content) {
              full += data.content;
              setCurrentResponse(full);
              setStatusText("Streaming...");
              if (connectTimer.current) {
                clearTimeout(connectTimer.current);
                connectTimer.current = null;
              }
            } else if (data.type === "done") {
              const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.fullResponse || full,
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, aiMsg]);
              setCurrentResponse("");
              setIsThinking(false);
              setIsStreaming(false);
              setStatusText("");
              if (connectTimer.current) {
                clearTimeout(connectTimer.current);
                connectTimer.current = null;
              }
            } else if (data.type === "error") {
              throw new Error(data.error || "Unknown error");
            }
          } catch (_) {
            // ignore malformed lines
          }
        }
      }
    } catch (err) {
      console.error("[DemoChat] Error:", err);
      const aiMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content:
          err instanceof Error
            ? `Error: ${err.message}`
            : "Sorry, something went wrong.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
      setIsStreaming(false);
      setCurrentResponse("");
      setStatusText(
        err instanceof Error && /Ollama|11434|ECONNREFUSED/i.test(err.message)
          ? 'Ollama is not running. Start it with "ollama serve".'
          : 'Failed to send. Please try again.'
      );
      if (connectTimer.current) {
        clearTimeout(connectTimer.current);
        connectTimer.current = null;
      }
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8 text-center">CourseConnect AI Demo</h1>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Chat Interface</h2>

          <div className="space-y-4">
            <div className="space-y-4 max-h-[55vh] overflow-y-auto p-1">
              {messages
                .filter((m) => m.role !== "system")
                .map((m) => (
                  <div key={m.id} className="flex flex-col">
                    <div
                      className={
                        m.role === "user"
                          ? "self-end bg-blue-500 text-white rounded-2xl px-4 py-2 max-w-[80%] shadow"
                          : "self-start bg-white border border-gray-200 rounded-2xl px-4 py-2 max-w-[80%] shadow-sm"
                      }
                    >
                      {m.content}
                    </div>
                    <div
                      className={
                        m.role === "user"
                          ? "self-end text-[10px] text-white/80 mt-1 pr-2"
                          : "self-start text-[10px] text-gray-400 mt-1 pl-2"
                      }
                    >
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))}

              {isThinking && (
                <div className="self-start bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-2xl px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex gap-1">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay:'0ms'}}></span>
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></span>
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></span>
                    </span>
                    <span>CourseConnect AI is responding…</span>
                  </div>
                </div>
              )}

              {currentResponse && (
                <div className="self-start bg-gray-100 rounded-2xl px-4 py-2 max-w-[80%]">
                  {currentResponse}
                  <span className="ml-2 text-xs text-gray-400">(streaming)</span>
                </div>
              )}

              <div ref={endRef} />
            </div>

            <div className="flex gap-3 items-start">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder={isStreaming ? "AI is responding…" : "Type a message..."}
                className="flex-1 p-3 border rounded-lg"
                disabled={isStreaming}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isStreaming}
                className={`px-6 py-3 rounded-lg text-white ${
                  !input.trim() || isStreaming
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {isStreaming ? "Sending…" : "Send"}
              </button>
            </div>
            {statusText && (
              <div className="text-xs text-gray-600">{statusText}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
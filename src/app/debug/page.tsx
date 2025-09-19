"use client";

import { AITestComponent } from '@/components/ai-test-component';
import { ChatTestComponent } from '@/components/chat-test-component';

export default function DebugPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Debug Tools</h1>
      <AITestComponent />
      <ChatTestComponent />
    </div>
  );
}

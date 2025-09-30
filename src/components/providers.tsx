'use client';

import { ChatProvider } from '@/contexts/chat-context';
import { ThemeProvider } from '@/contexts/theme-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ChatProvider>
        {children}
      </ChatProvider>
    </ThemeProvider>
  );
}

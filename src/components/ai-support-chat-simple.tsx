'use client';

import { MessageCircle } from 'lucide-react';

export function AISupportChatSimple() {
  console.log('AISupportChatSimple is rendering!');
  
  return (
    <button
      className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 z-50 flex items-center justify-center"
      onClick={() => alert('Chat clicked!')}
    >
      <MessageCircle className="h-5 w-5 text-white" />
    </button>
  );
}

"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChatStore } from '@/hooks/use-chat-store';

export function ChatTestComponent() {
  const { addChat, chats, setCurrentTab, currentTab } = useChatStore();
  const [testChatId, setTestChatId] = useState<string>('');

  const createTestChat = async () => {
    const chatId = `test-chat-${Date.now()}`;
    const chatName = `Test Chat ${new Date().toLocaleTimeString()}`;
    
    console.log('Creating test chat:', { chatId, chatName });
    
    await addChat(
      chatName,
      { 
        sender: 'bot', 
        name: 'CourseConnect AI', 
        text: `Welcome to ${chatName}! This is a test chat.`, 
        timestamp: Date.now() 
      },
      chatId
    );
    
    setTestChatId(chatId);
    console.log('Test chat created, current chats:', Object.keys(chats));
  };

  const switchToTestChat = () => {
    if (testChatId) {
      console.log('Switching to test chat:', testChatId);
      setCurrentTab(testChatId);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Chat Test Component</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p><strong>Current Tab:</strong> {currentTab || 'None'}</p>
          <p><strong>Available Chats:</strong> {Object.keys(chats).join(', ') || 'None'}</p>
          <p><strong>Test Chat ID:</strong> {testChatId || 'Not created'}</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={createTestChat}>
            Create Test Chat
          </Button>
          <Button onClick={switchToTestChat} disabled={!testChatId}>
            Switch to Test Chat
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>Check browser console for detailed logs.</p>
        </div>
      </CardContent>
    </Card>
  );
}

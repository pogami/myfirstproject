'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Send, Upload, Mic, AtSign, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/hooks/use-chat-store';
import { auth } from '@/lib/firebase/client-simple';

// Helper function to get guest display name from localStorage
const getGuestDisplayName = (): string => {
  if (typeof window === 'undefined') return 'Guest User';
  try {
    const guestUser = localStorage.getItem('guestUser');
    if (guestUser) {
      const parsed = JSON.parse(guestUser);
      return parsed.displayName || 'Guest User';
    }
  } catch (error) {
    console.warn('Failed to parse guest user from localStorage:', error);
  }
  return 'Guest User';
};

export function FloatingChatButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState('');
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { chats, addMessage, setCurrentTab } = useChatStore();
  const [user, setUser] = useState<any>(null);

  // Get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !(event.target as Element)?.closest('[data-dropdown-trigger]')
      ) {
        setShowCourseDropdown(false);
      }
    };

    if (showCourseDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCourseDropdown]);

  // Don't show on chat page itself
  if (pathname === '/dashboard/chat') {
    return null;
  }

  // Get class chats
  const classChats = Object.values(chats).filter(
    (chat) => chat.chatType === 'class'
  );

  const handleSend = async () => {
    if (!value.trim()) return;

    const messageText = value.trim();

    // If a chat is selected, send to that chat and redirect
    if (selectedChatId) {
      const selectedChat = chats[selectedChatId];
      const isClassChat = selectedChat?.chatType === 'class';

      const isGuest = user?.isGuest || user?.isAnonymous;
      const userName = isGuest ? getGuestDisplayName() : (user?.displayName || 'Anonymous');
      
      const userMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        text: messageText,
        sender: 'user' as const,
        name: userName,
        userId: user?.uid || 'guest',
        timestamp: Date.now(),
      };

      try {
        // Set the current tab before adding message
        setCurrentTab(selectedChatId);
        // Add message to the selected chat
        await addMessage(selectedChatId, userMessage);
        
        // Clear input and selection before redirect
        setValue('');
        setSelectedChatId(null);

        // If it's a class chat, trigger AI response
        if (isClassChat) {
          try {
            const apiEndpoint = '/api/chat/class';
            
            // Get conversation history including the message we just sent
            const recentMessages = selectedChat?.messages?.slice(-10) || [];
            const conversationHistory = recentMessages.map((msg: any) => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)
            }));
            
            // Add the user message we just sent to the history
            conversationHistory.push({
              role: 'user' as const,
              content: messageText
            });
            
            const requestBody = {
              question: messageText,
              context: selectedChat?.title || 'General Chat',
              conversationHistory: conversationHistory,
              shouldCallAI: true,
              userId: user?.uid,
              chatId: selectedChatId,
              chatTitle: selectedChat?.title,
            };

            // Add course data for class chats
            if (selectedChat?.courseData) {
              requestBody.courseData = selectedChat.courseData;
              requestBody.metadata = selectedChat.metadata;
            }

            // Call AI API (don't await - let it run in background after redirect)
            fetch(apiEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            })
              .then(async (response) => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                
                if (data.success && data.answer) {
                  const aiMessage = {
                    id: `ai-${Date.now()}-${Math.random()}`,
                    text: data.answer,
                    sender: 'bot' as const,
                    name: 'CourseConnect AI',
                    timestamp: Date.now(),
                  };
                  // Add AI response to the chat
                  await addMessage(selectedChatId, aiMessage);
                }
              })
              .catch((error) => {
                console.error('Error getting AI response:', error);
              });
          } catch (error) {
            console.error('Error triggering AI response:', error);
          }
        }

        // Redirect to that chat
        router.push(`/dashboard/chat?tab=${encodeURIComponent(selectedChatId)}`);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    } else {
      // Default behavior: redirect to general chat
      sessionStorage.setItem('floating-chat-message', messageText);
      router.push('/dashboard/chat');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicClick = () => {
    // For now, just redirect to chat - voice features can be added later
    router.push('/dashboard/chat');
  };

  const handleAtClick = () => {
    setShowCourseDropdown(!showCourseDropdown);
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setShowCourseDropdown(false);
    // Focus the textarea after selection
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div
        className={cn(
          "relative flex items-center gap-3 px-6 py-3 shadow-lg border-2",
          "bg-white dark:bg-gray-800 backdrop-blur-xl",
          "border-gray-200 dark:border-gray-700",
          "hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl transition-all duration-300"
        )}
        style={{
          borderRadius: '26px',
          minHeight: '52px'
        }}
      >
        {/* Upload Icon */}
        <div
          className={cn(
            "relative z-10 h-8 w-8 flex items-center justify-center cursor-pointer flex-shrink-0 rounded-lg",
            "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200",
            "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          )}
          onClick={() => router.push('/dashboard/chat')}
        >
          <Upload className="h-5 w-5" />
        </div>

        {/* @ Course Selector Button */}
        <div className="relative" ref={dropdownRef}>
          <div
            data-dropdown-trigger
            onClick={handleAtClick}
            className={cn(
              "relative z-10 h-8 w-8 flex items-center justify-center cursor-pointer flex-shrink-0 rounded-lg",
              "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200",
              selectedChatId
                ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            )}
            title={selectedChatId ? `Sending to: ${chats[selectedChatId]?.title || 'Selected course'}` : "Select course to send message"}
          >
            <AtSign className="h-5 w-5" />
          </div>

          {/* Dropdown Menu */}
          {showCourseDropdown && (
            <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
              {classChats.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No courses available. Upload a syllabus to get started.
                </div>
              ) : (
                <div className="p-1">
                  {classChats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => handleSelectChat(chat.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                        "hover:bg-gray-100 dark:hover:bg-gray-700",
                        selectedChatId === chat.id &&
                          "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {chat.courseData?.courseCode || chat.title || 'Untitled Course'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Field */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedChatId
              ? `Message ${chats[selectedChatId]?.courseData?.courseCode || chats[selectedChatId]?.title || 'course'}...`
              : 'Ask anything...'
          }
          className={cn(
            "w-full bg-transparent text-base border-0 outline-none focus:outline-none placeholder:opacity-60 resize-none",
            "text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          )}
          rows={1}
          style={{ 
            fontSize: '14px',
            maxHeight: '120px'
          }}
        />

        {/* Mic Button */}
        <div
          onClick={handleMicClick}
          className={cn(
            "relative z-10 h-8 w-8 flex items-center justify-center cursor-pointer flex-shrink-0 rounded-lg",
            "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200",
            "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          )}
        >
          <Mic className="h-5 w-5" />
        </div>

        {/* Send Button (minimal, no gradient circle) */}
        <div
          onClick={handleSend}
          className={cn(
            "relative z-10 h-8 w-8 flex items-center justify-center cursor-pointer flex-shrink-0 rounded-lg",
            "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200",
            "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100",
            (!value.trim()) && "opacity-50 cursor-not-allowed"
          )}
          aria-label="Send"
        >
          <Send className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}


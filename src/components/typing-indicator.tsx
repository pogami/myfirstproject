'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TypingUser {
  userId: string;
  username: string;
  timestamp: number;
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
  currentUserId?: string;
}

export function TypingIndicator({ typingUsers, currentUserId }: TypingIndicatorProps) {
  const [visibleUsers, setVisibleUsers] = useState<TypingUser[]>([]);

  useEffect(() => {
    // Ensure typingUsers is an array before filtering
    if (!Array.isArray(typingUsers)) {
      setVisibleUsers([]);
      return;
    }

    // Filter out current user and users who stopped typing more than 5 seconds ago
    const now = Date.now();
    const filtered = typingUsers.filter(user => 
      user.userId !== currentUserId && 
      (now - user.timestamp) < 5000
    );
    
    setVisibleUsers(filtered);
  }, [typingUsers, currentUserId]);

  if (visibleUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (visibleUsers.length === 1) {
      return `${visibleUsers[0].username} is typing...`;
    } else if (visibleUsers.length === 2) {
      return `${visibleUsers[0].username} and ${visibleUsers[1].username} are typing...`;
    } else {
      return `${visibleUsers[0].username} and ${visibleUsers.length - 1} others are typing...`;
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground bg-muted/30 rounded-lg mx-4 mb-2">
      <div className="flex -space-x-2">
        {visibleUsers.slice(0, 3).map((user) => (
          <Avatar key={user.userId} className="h-6 w-6 border-2 border-background">
            <AvatarImage src={`/api/avatar/${user.userId}`} />
            <AvatarFallback className="text-xs">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
        {visibleUsers.length > 3 && (
          <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
            <span className="text-xs font-medium">+{visibleUsers.length - 3}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <span>{getTypingText()}</span>
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

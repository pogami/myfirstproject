'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface OnlineUser {
  userId: string;
  username: string;
  avatar?: string;
  joinedAt: number;
}

interface OnlineUsersIndicatorProps {
  onlineUsers: OnlineUser[];
  currentUserId?: string;
  showCount?: boolean;
  maxVisible?: number;
}

export function OnlineUsersIndicator({ 
  onlineUsers, 
  currentUserId, 
  showCount = true, 
  maxVisible = 5 
}: OnlineUsersIndicatorProps) {
  // Filter out current user
  const otherUsers = onlineUsers.filter(user => user.userId !== currentUserId);
  const visibleUsers = otherUsers.slice(0, maxVisible);
  const remainingCount = Math.max(0, otherUsers.length - maxVisible);

  if (otherUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        {showCount && (
          <Badge variant="secondary" className="text-xs">
            {otherUsers.length} online
          </Badge>
        )}
      </div>
      
      <div className="flex -space-x-2">
        {visibleUsers.map((user) => (
          <Avatar 
            key={user.userId} 
            className="h-6 w-6 border-2 border-background hover:scale-110 transition-transform cursor-pointer"
            title={user.username}
          >
            <AvatarImage src={user.avatar || `/api/avatar/${user.userId}`} />
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
        
        {remainingCount > 0 && (
          <div 
            className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
            title={`${remainingCount} more users online`}
          >
            <span className="text-xs font-medium text-muted-foreground">
              +{remainingCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

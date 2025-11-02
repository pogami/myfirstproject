"use client";

import React from 'react';
import { Users, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface OnlineUser {
  userId: string;
  userName: string;
}

interface OnlineUsersIndicatorProps {
  users: OnlineUser[];
  isConnected: boolean;
  className?: string;
  showAvatars?: boolean;
  maxVisible?: number;
}

export function OnlineUsersIndicator({ 
  users, 
  isConnected, 
  className = "",
  showAvatars = true,
  maxVisible = 3
}: OnlineUsersIndicatorProps) {
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = Math.max(0, users.length - maxVisible);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center gap-1">
        {isConnected ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Online Users */}
      {users.length > 0 && (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          
          {showAvatars && (
            <div className="flex -space-x-2">
              <AnimatePresence>
                {visibleUsers.map((user, index) => (
                  <motion.div
                    key={`${user.userId}-${index}-${user.userName}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <Avatar className="w-6 h-6 border-2 border-white dark:border-gray-800">
                      <AvatarImage 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.userId}`}
                        alt={user.userName}
                      />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {user.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white dark:border-gray-800" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {users.length} online
            </span>
            {remainingCount > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                +{remainingCount}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

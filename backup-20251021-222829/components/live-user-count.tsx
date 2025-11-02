"use client";

import React from 'react';
import { Users, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface LiveUserCountProps {
  count: number;
  isConnected: boolean;
  className?: string;
  showConnectionStatus?: boolean;
}

export function LiveUserCount({ 
  count, 
  isConnected, 
  className = "",
  showConnectionStatus = true
}: LiveUserCountProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-2 ${className}`}
    >
      {showConnectionStatus && (
        <div className="flex items-center gap-1">
          {isConnected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
        </div>
      )}
      
      <div className="flex items-center gap-1">
        <Users className="w-4 h-4 text-gray-500" />
        <Badge 
          variant={isConnected ? "default" : "secondary"}
          className="text-xs"
        >
          {count} online
        </Badge>
      </div>
    </motion.div>
  );
}

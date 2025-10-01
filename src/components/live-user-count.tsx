'use client';

import { Users, Wifi } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LiveUserCountProps {
  userCount: number;
}

export function LiveUserCount({ userCount }: LiveUserCountProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
      <div className="flex items-center gap-3">
        {/* Enhanced pulsing indicator with multiple layers */}
        <div className="relative">
          <div className="relative z-10 p-1.5 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
            <Users className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
          </div>
          
          {/* Multi-layer pulsing effect */}
          <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping"></div>
          <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-pulse-slow"></div>
          <div className="absolute -inset-1 rounded-full bg-emerald-400/10 animate-ping-delayed"></div>
        </div>
        
        {/* Professional badge with gradient */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse-fast"></div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Live</span>
          </div>
          
          <Badge 
            variant="outline" 
            className="text-xs font-semibold bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Wifi className="h-3 w-3 mr-1.5 text-emerald-500" />
            {userCount} online
          </Badge>
        </div>
      </div>
    </div>
  );
}

"use client";

interface SwirlingArrowsProps {
  className?: string;
}

export function SwirlingArrows({ className = "" }: SwirlingArrowsProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Doodle-style swirling arrows */}
      <div className="relative">
        {/* Arrow 1 - Top right */}
        <div className="absolute -top-8 -right-12 transform rotate-12 animate-pulse" style={{ animationDuration: '3s' }}>
          <div className="relative">
            {/* Arrow shaft */}
            <div className="w-16 h-1 bg-primary/60 transform rotate-12"></div>
            {/* Arrow head */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-t-2 border-b-2 border-transparent border-l-primary/60"></div>
            {/* Doodle squiggle */}
            <div className="absolute -top-2 -right-2 w-4 h-4 border border-primary/40 rounded-full"></div>
          </div>
        </div>

        {/* Arrow 2 - Top left */}
        <div className="absolute -top-6 -left-16 transform -rotate-12 animate-pulse" style={{ animationDuration: '3s', animationDelay: '0.5s' }}>
          <div className="relative">
            {/* Arrow shaft */}
            <div className="w-14 h-1 bg-purple-500/60 transform -rotate-12"></div>
            {/* Arrow head */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-t-2 border-b-2 border-transparent border-l-purple-500/60"></div>
            {/* Doodle squiggle */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border border-purple-500/40 rounded-full"></div>
          </div>
        </div>

        {/* Arrow 3 - Bottom right */}
        <div className="absolute -bottom-4 -right-8 transform rotate-45 animate-pulse" style={{ animationDuration: '3s', animationDelay: '1s' }}>
          <div className="relative">
            {/* Arrow shaft */}
            <div className="w-12 h-1 bg-green-500/60 transform rotate-45"></div>
            {/* Arrow head */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-t-2 border-b-2 border-transparent border-l-green-500/60"></div>
            {/* Doodle squiggle */}
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border border-green-500/40 rounded-full"></div>
          </div>
        </div>

        {/* Arrow 4 - Bottom left */}
        <div className="absolute -bottom-6 -left-12 transform -rotate-45 animate-pulse" style={{ animationDuration: '3s', animationDelay: '1.5s' }}>
          <div className="relative">
            {/* Arrow shaft */}
            <div className="w-10 h-1 bg-orange-500/60 transform -rotate-45"></div>
            {/* Arrow head */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-t-2 border-b-2 border-transparent border-l-orange-500/60"></div>
            {/* Doodle squiggle */}
            <div className="absolute -bottom-2 -left-1 w-2.5 h-2.5 border border-orange-500/40 rounded-full"></div>
          </div>
        </div>

        {/* Central swirl decoration */}
        <div className="absolute -top-4 -left-4 w-8 h-8 border-2 border-primary/30 rounded-full animate-spin" style={{ animationDuration: '4s' }}></div>
        <div className="absolute -top-2 -left-2 w-4 h-4 border border-primary/20 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>

        {/* Doodle dots */}
        <div className="absolute -top-8 left-4 w-1 h-1 bg-yellow-400 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
        <div className="absolute -bottom-8 right-4 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }}></div>
        <div className="absolute top-4 -left-8 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
        <div className="absolute -top-4 -right-8 w-1 h-1 bg-green-400 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '1.5s' }}></div>
      </div>
    </div>
  );
}

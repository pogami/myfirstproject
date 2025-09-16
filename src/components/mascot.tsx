"use client";

interface MascotProps {
  className?: string;
}

export function Mascot({ className = "" }: MascotProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Doodle-style Mascot */}
      <div className="relative">
        {/* Main body - hand-drawn style */}
        <div className="relative w-24 h-24">
          {/* Body circle */}
          <div className="absolute inset-0 rounded-full border-4 border-primary/60 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20"></div>
          
          {/* Eyes */}
          <div className="absolute top-5 left-4 w-3 h-3 bg-primary rounded-full"></div>
          <div className="absolute top-5 right-4 w-3 h-3 bg-primary rounded-full"></div>
          
          {/* Eye highlights */}
          <div className="absolute top-6 left-5 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-6 right-5 w-1 h-1 bg-white rounded-full"></div>
          
          {/* Smile */}
          <div className="absolute bottom-7 left-1/2 transform -translate-x-1/2 w-8 h-4 border-2 border-primary rounded-full border-t-transparent"></div>
          
          {/* Graduation cap */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
            <div className="w-8 h-6 bg-yellow-400 border-2 border-primary rounded-t-lg"></div>
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-primary"></div>
          </div>
          
          {/* Book */}
          <div className="absolute -bottom-2 -right-2">
            <div className="w-6 h-8 bg-white border-2 border-primary rounded-sm"></div>
            <div className="absolute top-1 left-1 w-4 h-0.5 bg-primary"></div>
            <div className="absolute top-2 left-1 w-3 h-0.5 bg-primary"></div>
            <div className="absolute top-3 left-1 w-4 h-0.5 bg-primary"></div>
          </div>
        </div>

        {/* Speech bubble */}
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
          <div className="bg-white border-2 border-primary rounded-2xl px-3 py-2 shadow-lg">
            <p className="text-sm font-medium text-primary whitespace-nowrap">
              Upload your syllabus! 📚
            </p>
            {/* Speech bubble tail */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-primary"></div>
          </div>
        </div>

        {/* Doodle decorations */}
        <div className="absolute -top-4 -left-4 w-2 h-2 bg-yellow-400 rounded-full border border-primary"></div>
        <div className="absolute -top-2 -right-6 w-1.5 h-1.5 bg-pink-400 rounded-full border border-primary"></div>
        <div className="absolute -bottom-4 -left-6 w-1 h-1 bg-green-400 rounded-full border border-primary"></div>
      </div>
    </div>
  );
}

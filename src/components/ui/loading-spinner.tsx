import { cn } from "@/lib/utils";
import { RippleText } from "@/components/ripple-text";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6", 
  lg: "h-8 w-8",
  xl: "h-12 w-12"
};

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative">
        {/* Outer ring */}
        <div
          className={cn(
            "animate-spin rounded-full border-2 border-purple-200 dark:border-purple-800",
            sizeClasses[size],
            className
          )}
        />
        {/* Inner gradient ring */}
        <div
          className={cn(
            "absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary/50",
            sizeClasses[size]
          )}
          style={{ 
            animation: 'spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite'
          }}
        />
        {/* Center dot */}
        <div
          className={cn(
            "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 animate-pulse",
            size === "sm" ? "h-1 w-1" : size === "md" ? "h-1.5 w-1.5" : size === "lg" ? "h-2 w-2" : "h-3 w-3"
          )}
        />
      </div>
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse font-medium">{text}</p>
      )}
    </div>
  );
}

export function PageLoadingSpinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-purple-50/50 via-blue-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-indigo-950/20">
      <div className="text-center space-y-6">
        {/* Animated CourseConnect Logo */}
        <div className="relative">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-purple-600 to-blue-600 animate-pulse shadow-2xl"></div>
          <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-4 border-transparent border-t-purple-600 border-r-blue-600 animate-spin"></div>
          <div className="absolute inset-2 w-16 h-16 mx-auto rounded-full border-2 border-transparent border-b-blue-600 border-l-purple-600 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
        </div>
        
        {/* Loading Text with Gradient */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
            CourseConnect
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            Preparing your workspace...
          </p>
        </div>
        
        {/* Progress Text */}
        <div className="flex justify-center">
          <RippleText text="Loading..." className="text-sm text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

export function InlineLoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner text={text} />
    </div>
  );
}

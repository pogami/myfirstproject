import { cn } from "@/lib/utils";

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
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-muted border-t-primary",
          sizeClasses[size],
          className
        )}
      />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
}

export function PageLoadingSpinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <h2 className="mt-4 text-lg font-semibold">Loading...</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Please wait while we prepare your content
        </p>
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

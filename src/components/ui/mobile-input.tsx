"use client";

import { Input, InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface MobileInputProps extends InputProps {
  mobileSize?: "sm" | "md" | "lg";
  fullWidthOnMobile?: boolean;
}

export const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  ({ className, mobileSize = "md", fullWidthOnMobile = false, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-10 min-h-[44px] px-3 text-sm",
      md: "h-12 min-h-[48px] px-4 text-base",
      lg: "h-14 min-h-[56px] px-6 text-lg"
    };

    return (
      <Input
        ref={ref}
        className={cn(
          // Mobile-first sizing
          sizeClasses[mobileSize],
          // Touch-friendly
          "touch-manipulation",
          // Full width on mobile if specified
          fullWidthOnMobile && "w-full",
          // Better mobile input handling
          "text-base sm:text-sm", // Prevents zoom on iOS
          className
        )}
        {...props}
      />
    );
  }
);

MobileInput.displayName = "MobileInput";

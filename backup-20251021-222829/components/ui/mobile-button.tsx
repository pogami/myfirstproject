"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface MobileButtonProps extends ButtonProps {
  mobileSize?: "sm" | "md" | "lg";
  fullWidthOnMobile?: boolean;
}

export const MobileButton = forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ className, mobileSize = "md", fullWidthOnMobile = false, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-10 min-h-[44px] px-4 text-sm",
      md: "h-12 min-h-[48px] px-6 text-base",
      lg: "h-14 min-h-[56px] px-8 text-lg"
    };

    return (
      <Button
        ref={ref}
        className={cn(
          // Mobile-first sizing
          sizeClasses[mobileSize],
          // Touch-friendly spacing
          "touch-manipulation",
          // Full width on mobile if specified
          fullWidthOnMobile && "w-full sm:w-auto",
          // Ensure proper touch targets
          "min-w-[44px] min-h-[44px]",
          className
        )}
        {...props}
      />
    );
  }
);

MobileButton.displayName = "MobileButton";

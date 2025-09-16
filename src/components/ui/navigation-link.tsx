"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface NavigationLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  icon?: React.ReactNode;
  showLoading?: boolean;
}

export function NavigationLink({
  href,
  children,
  className,
  activeClassName,
  inactiveClassName,
  icon,
  showLoading = true
}: NavigationLinkProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  const handleClick = () => {
    if (showLoading) {
      setIsLoading(true);
    }
  };

  return (
    <Link 
      href={href}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] group",
        isActive 
          ? activeClassName || "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg"
          : inactiveClassName || "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:shadow-md",
        className
      )}
    >
      {icon && (
        <div className={cn(
          "p-2 rounded-lg transition-all duration-300",
          isActive 
            ? "bg-primary-foreground/20" 
            : "bg-muted/50 group-hover:bg-primary/20"
        )}>
          {isLoading && showLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            icon
          )}
        </div>
      )}
      <span className="font-medium">{children}</span>
    </Link>
  );
}

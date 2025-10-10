"use client";

import React from "react";

interface VerifiedBadgeProps {
  title?: string;
  size?: number; // pixels
  className?: string;
}

export function VerifiedBadge({ title = "Verified", size = 16, className = "" }: VerifiedBadgeProps) {
  const px = `${size}px`;
  return (
    <span
      title={title}
      className={
        "inline-flex items-center justify-center align-middle " +
        "rounded-full bg-gradient-to-br from-sky-500 to-blue-700 text-white " +
        "shadow-[0_0_0_2px_rgba(255,255,255,0.9)_inset,0_4px_10px_rgba(0,0,0,0.15)] " +
        "ring-1 ring-blue-400/60 hover:ring-blue-300 transition-shadow duration-200 " +
        "before:content-[''] before:absolute before:rounded-full before:blur-[8px] before:bg-sky-400/30 before:w-full before:h-full before:scale-110 " +
        "relative " +
        className
      }
      style={{ width: px, height: px, minWidth: px, minHeight: px }}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        width={Math.round(size * 0.72)}
        height={Math.round(size * 0.72)}
        className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
      >
        <path
          fill="currentColor"
          d="M20.285 6.709a1 1 0 0 1 0 1.414l-9.172 9.172a1 1 0 0 1-1.414 0L3.715 10.51a1 1 0 1 1 1.414-1.414l5.158 5.157 8.465-8.465a1 1 0 0 1 1.533-.079z"
        />
      </svg>
      <span className="absolute inset-0 animate-pulse rounded-full bg-sky-300/0"></span>
    </span>
  );
}




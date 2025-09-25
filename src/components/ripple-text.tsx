"use client";

import React from 'react';

interface RippleTextProps {
  text: string;
  className?: string;
}

export function RippleText({ text, className = "" }: RippleTextProps) {
  return (
    <div className={`ripple-text text-lg font-medium ${className}`}>
      {text}
      <style jsx>{`
        .ripple-text {
          display: inline-block;
          background: linear-gradient(
            90deg,
            #3b82f6 25%,
            #1d4ed8 50%,
            #3b82f6 75%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: ripple 1.5s linear infinite;
          font-weight: 600;
        }
        @keyframes ripple {
          0% {
            background-position: 200% center;
          }
          100% {
            background-position: -200% center;
          }
        }
      `}</style>
    </div>
  );
}

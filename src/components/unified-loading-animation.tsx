"use client";

import React, { useState, useEffect } from 'react';
import { RippleText } from './ripple-text';
import { MessageSquare, Users, BookOpen, Sparkles } from 'lucide-react';

type LoadingMode = 'fullscreen' | 'inline' | 'transition';

interface UnifiedLoadingAnimationProps {
  mode?: LoadingMode;
  className?: string;
  title?: string;
  fromPage?: string;
  toPage?: string;
  showProgress?: boolean;
  text?: string;
}

export function UnifiedLoadingAnimation({ 
  mode = 'inline',
  className = "", 
  title = "Class Chat",
  fromPage = "Dashboard",
  toPage = "Class Chat",
  showProgress = true,
  text = "Loading..."
}: UnifiedLoadingAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: MessageSquare, text: "Connecting to chat...", color: "text-blue-500" },
    { icon: Users, text: "Loading classmates...", color: "text-green-500" },
    { icon: BookOpen, text: "Preparing course materials...", color: "text-purple-500" },
    { icon: Sparkles, text: "Initializing AI assistant...", color: "text-yellow-500" }
  ];

  useEffect(() => {
    if (mode === 'fullscreen' || mode === 'transition') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + (mode === 'transition' ? 3 : 2);
        });
      }, mode === 'transition' ? 30 : 50);

      return () => clearInterval(interval);
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'fullscreen') {
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % steps.length);
      }, 800);

      return () => clearInterval(stepInterval);
    }
  }, [mode, steps.length]);

  // Inline mode - simple and compact
  if (mode === 'inline') {
    return (
      <div className={`flex items-center space-x-2 p-4 ${className}`}>
        <div className="flex space-x-1">
          <RippleText
            text={text}
            className="text-sm text-muted-foreground"
          />
        </div>
      </div>
    );
  }

  // Transition mode - page transition animation
  if (mode === 'transition') {
    return (
      <div className={`fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center ${className}`}>
        <div className="text-center space-y-6 max-w-sm mx-auto px-6">
          <div className="relative">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-purple-600 to-blue-600 animate-pulse" />
            <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full border-2 border-transparent border-t-purple-600 border-r-blue-600 animate-spin" />
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Transitioning from</p>
            <p className="text-lg font-semibold text-primary">{fromPage}</p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" />
              <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
            <p className="text-lg font-semibold text-primary">{toPage}</p>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Fullscreen mode - complete loading experience
  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50/50 via-blue-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-indigo-950/20 flex items-center justify-center ${className}`}>
      <div className="text-center space-y-8 max-w-md mx-auto px-6">
        <div className="relative">
          <div className="w-24 h-24 mx-auto rounded-full border-4 border-purple-200 dark:border-purple-800 animate-spin" />
          <div 
            className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-4 border-transparent border-t-purple-600 border-r-blue-600 animate-spin"
            style={{ animationDuration: '1.2s' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-purple-600 animate-pulse" />
          </div>
          
          {/* Animated dots around the spinner */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
            <div className="absolute top-1/2 right-0 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-indigo-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-0 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">
            Preparing your learning environment...
          </p>
        </div>
        
        {showProgress && (
          <div className="space-y-3">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{progress}% complete</p>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${currentStep >= 0 ? "bg-purple-600" : "bg-gray-300"}`} />
            <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${currentStep >= 1 ? "bg-green-600" : "bg-gray-300"}`} />
            <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${currentStep >= 2 ? "bg-purple-600" : "bg-gray-300"}`} />
            <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${currentStep >= 3 ? "bg-yellow-600" : "bg-gray-300"}`} />
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm">
            {steps[currentStep] && (
              <>
                {React.createElement(steps[currentStep].icon, {
                  className: `w-4 h-4 ${steps[currentStep].color}`
                })}
                <span className="text-muted-foreground">{steps[currentStep].text}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex justify-center space-x-1">
          <RippleText
            text="Loading..."
            className="text-sm text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
}

// Convenience exports for backward compatibility
export const ChatLoadingAnimation = (props: Omit<UnifiedLoadingAnimationProps, 'mode'>) => (
  <UnifiedLoadingAnimation {...props} mode="fullscreen" />
);

export const MessageLoadingAnimation = (props: Omit<UnifiedLoadingAnimationProps, 'mode'>) => (
  <UnifiedLoadingAnimation {...props} mode="inline" />
);

export const ChatTransitionLoader = (props: Omit<UnifiedLoadingAnimationProps, 'mode'>) => (
  <UnifiedLoadingAnimation {...props} mode="transition" />
);

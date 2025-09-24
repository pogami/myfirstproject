"use client";

import React, { useState, useRef } from 'react';
import { Send, Upload, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';

interface FuturisticChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFileUpload?: (file: File) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function FuturisticChatInput({
  value,
  onChange,
  onSend,
  onKeyPress,
  onFileUpload,
  placeholder,
  disabled = false,
  className = ""
}: FuturisticChatInputProps) {
  const { theme } = useTheme();
  
  // Debug logging
  console.log('FuturisticChatInput rendering with theme:', theme);
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect mobile on mount
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Set appropriate placeholder
  const displayPlaceholder = placeholder || (isMobile ? "Ask anything" : "Ask CourseConnect AI anything");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    setIsTyping(e.target.value.length > 0);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyPress) {
      onKeyPress(e);
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleSend = () => {
    if (value.trim()) {
      onSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const toggleVoice = async () => {
    if (!isVoiceActive) {
      try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsVoiceActive(true);
        
        // TODO: Implement actual voice recording and speech-to-text functionality
        // For now, we'll just show the active state
        
        // Clean up stream when stopping
        setTimeout(() => {
          stream.getTracks().forEach(track => track.stop());
        }, 100);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        // Handle microphone access denied or other errors
        alert('Microphone access is required for voice input. Please allow microphone access and try again.');
      }
    } else {
      setIsVoiceActive(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={cn("relative w-full h-10", className)}>
      {/* Main Input Container */}
      <div className={cn(
        "chat-input-container relative flex items-center gap-2 p-2 rounded-lg border h-10",
        isDark 
          ? "bg-black border-white/20" 
          : "bg-white border-gray-200"
      )}
      style={{ background: isDark ? '#000000' : '#ffffff' }}>
        
        {/* File Upload Icon (Left) */}
        <div
          onClick={triggerFileInput}
          className={cn(
            "relative z-10 h-7 w-7 flex items-center justify-center cursor-pointer flex-shrink-0 touch-manipulation",
            isDark 
              ? "text-white/60" 
              : "text-gray-600",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <Upload className="h-4 w-4" />
        </div>

        {/* Input Field */}
        <div className="flex-1 relative min-w-0">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={displayPlaceholder}
            disabled={disabled}
            className={cn(
              "w-full h-7 bg-transparent text-sm border-0 outline-none focus:outline-none placeholder:opacity-70 resize-none",
              isDark ? "text-white placeholder-white/70" : "text-gray-900 placeholder-gray-500"
            )}
            style={{ fontSize: '16px' }} // Prevents zoom on iOS
          />
          {/* Cursor Effect */}
          <div className={cn(
            "absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-4",
            isTyping ? "opacity-100" : "opacity-0",
            "bg-gradient-to-b from-orange-400 to-purple-400"
          )} />
        </div>

        {/* Voice Icon (Right side) */}
        <div
          onClick={toggleVoice}
          className={cn(
            "relative z-10 h-7 w-7 flex items-center justify-center cursor-pointer flex-shrink-0 touch-manipulation",
            isVoiceActive
              ? isDark 
                ? "text-red-400" 
                : "text-red-600"
              : isDark 
                ? "text-white/60" 
                : "text-gray-600",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {isVoiceActive ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </div>

        {/* Send Icon */}
        <div
          onClick={handleSend}
          className={cn(
            "relative z-10 h-7 w-7 flex items-center justify-center cursor-pointer flex-shrink-0 touch-manipulation",
            isDark 
              ? "text-purple-400" 
              : "text-purple-600",
            (disabled || !value.trim()) && "opacity-50 cursor-not-allowed"
          )}
        >
          <Send className="h-4 w-4" />
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
          className="hidden"
        />
      </div>

      {/* Floating Particles Effect - Hidden on mobile for performance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg hidden md:block">
        <div className="absolute top-2 left-4 w-0.5 h-0.5 bg-orange-400 rounded-full animate-ping opacity-70" style={{ animationDelay: '0s' }} />
        <div className="absolute top-3 right-16 w-0.5 h-0.5 bg-purple-400 rounded-full animate-ping opacity-70" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-2 left-8 w-0.5 h-0.5 bg-blue-400 rounded-full animate-ping opacity-70" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-3 right-8 w-0.5 h-0.5 bg-pink-400 rounded-full animate-ping opacity-70" style={{ animationDelay: '0.8s' }} />
      </div>
    </div>
  );
}
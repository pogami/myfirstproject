"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, Mic, MicOff, Bot } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';

interface EnhancedChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: (shouldCallAI?: boolean) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFileUpload?: (file: File) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  isPublicChat?: boolean;
  isClassChat?: boolean;
  isSending?: boolean;
}

export function EnhancedChatInput({
  value,
  onChange,
  onSend,
  onKeyPress,
  onFileUpload,
  placeholder,
  disabled = false,
  className = "",
  isPublicChat = false,
  isClassChat = false,
  isSending = false
}: EnhancedChatInputProps) {
  const { theme } = useTheme();
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showAIMention, setShowAIMention] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check for @ mentions
  useEffect(() => {
    const hasAIMention = value.includes('@ai') || value.includes('@AI');
    setShowAIMention(hasAIMention);
  }, [value]);

  // Set appropriate placeholder based on chat type
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    
    if (isClassChat && isPublicChat) {
      return isMobile ? "Type @ai to call AI" : "Message classmates or type @ai to call AI";
    } else if (isPublicChat) {
      return isMobile ? "Type @ai to call AI" : "Chat with others or type @ai to call AI";
    } else {
      return isMobile ? "Ask anything" : "Ask CourseConnect AI anything";
    }
  };

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
      handleSend();
    }
  };

  const handleSend = () => {
    if (value.trim()) {
      // Check if AI should be called
      const shouldCallAI = !isPublicChat || value.includes('@ai') || value.includes('@AI');
      onSend(shouldCallAI);
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
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsVoiceActive(true);
        setTimeout(() => {
          stream.getTracks().forEach(track => track.stop());
        }, 100);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Microphone access is required for voice input. Please allow microphone access and try again.');
      }
    } else {
      setIsVoiceActive(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={cn("relative w-full h-10 chat-input-container", className)}>
      {/* AI Mention Indicator */}
      {showAIMention && isPublicChat && (
        <div className={cn(
          "absolute -top-8 left-2 px-2 py-1 rounded text-xs flex items-center gap-1 z-10",
          isDark ? "bg-purple-900/80 text-purple-200" : "bg-purple-100 text-purple-700"
        )}>
          <Bot className="h-3 w-3" />
          AI will respond
        </div>
      )}

      {/* Main Input Container */}
      <div className={cn(
        "chat-input-container relative flex items-center gap-2 p-3 rounded-full h-12 shadow-lg border border-border/20",
        "bg-card/80 backdrop-blur-sm",
        "hover:shadow-xl transition-all duration-200"
      )}
      style={{ 
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        outline: 'none'
      }}>
        
        {/* File Upload Icon (Left) */}
        <div
          onClick={triggerFileInput}
          className={cn(
            "relative z-10 h-8 w-8 flex items-center justify-center cursor-pointer flex-shrink-0 touch-manipulation rounded-full",
            "hover:bg-accent/20 transition-colors duration-200",
            isDark 
              ? "text-white/70 hover:text-white/90" 
              : "text-gray-600 hover:text-gray-800",
            (disabled || isSending) && "opacity-50 cursor-not-allowed"
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
            placeholder={isSending ? "AI is responding..." : getPlaceholder()}
            disabled={disabled || isSending}
            className={cn(
              "w-full h-8 bg-transparent text-base border-0 outline-none focus:outline-none placeholder:opacity-60 resize-none",
              isDark ? "text-white placeholder-white/60" : "text-gray-900 placeholder-gray-400",
              (disabled || isSending) && "opacity-50 cursor-not-allowed"
            )}
            style={{ fontSize: '16px' }}
          />
          {/* Cursor Effect */}
          <div className={cn(
            "absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-4",
            isTyping ? "opacity-100" : "opacity-0",
            "bg-gradient-to-b from-orange-400 to-purple-400"
          )} />
        </div>

        {/* Voice Icon */}
        <div
          onClick={toggleVoice}
          className={cn(
            "relative z-10 h-8 w-8 flex items-center justify-center cursor-pointer flex-shrink-0 touch-manipulation rounded-full",
            "hover:bg-accent/20 transition-colors duration-200",
            isVoiceActive
              ? isDark 
                ? "text-red-400" 
                : "text-red-600"
              : isDark 
                ? "text-white/70 hover:text-white/90" 
                : "text-gray-600 hover:text-gray-800",
            (disabled || isSending) && "opacity-50 cursor-not-allowed"
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
            "relative z-10 h-8 w-8 flex items-center justify-center cursor-pointer flex-shrink-0 touch-manipulation rounded-full",
            "hover:bg-accent/20 transition-colors duration-200",
            isDark 
              ? "text-purple-400 hover:text-purple-300" 
              : "text-purple-600 hover:text-purple-500",
            (disabled || isSending || !value.trim()) && "opacity-50 cursor-not-allowed"
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

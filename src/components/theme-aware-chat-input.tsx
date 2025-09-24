"use client";

import React, { useState, useRef } from 'react';
import { Send, Upload, Mic, MicOff, Leaf, Brain, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';

interface ThemeAwareChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFileUpload?: (file: File) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ThemeAwareChatInput({
  value,
  onChange,
  onSend,
  onKeyPress,
  onFileUpload,
  placeholder = "Ask anything...",
  disabled = false,
  className = ""
}: ThemeAwareChatInputProps) {
  const { theme } = useTheme();
  const [isTyping, setIsTyping] = useState(false);
  const [chatMode, setChatMode] = useState<'normal' | 'deepthink'>('normal');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    onKeyPress?.(e);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    setIsTyping(e.target.value.length > 0);
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

  const toggleVoice = () => {
    setIsVoiceActive(!isVoiceActive);
    // Add voice input logic here
  };

  const toggleChatMode = () => {
    setChatMode(chatMode === 'normal' ? 'deepthink' : 'normal');
  };

  // Theme-aware styles
  const isDark = theme === 'dark';
  
  const containerStyles = cn(
    "relative flex items-center gap-2 p-2 rounded-2xl backdrop-blur-sm transition-all duration-300",
    isDark 
      ? "bg-black/80 border border-gradient-to-r from-orange-500/50 to-purple-500/50" 
      : "bg-white/90 border border-gradient-to-r from-orange-400/50 to-purple-400/50 shadow-lg"
  );

  const glowEffect = cn(
    "absolute inset-0 rounded-2xl blur-sm transition-all duration-300",
    isDark
      ? "bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-blue-500/20"
      : "bg-gradient-to-r from-orange-400/20 via-purple-400/20 to-blue-400/20"
  );

  const inputStyles = cn(
    "flex-1 bg-transparent text-sm border-0 outline-none focus:outline-none transition-colors duration-200",
    isDark 
      ? "text-white placeholder-white/70" 
      : "text-gray-900 placeholder-gray-500"
  );

  const buttonStyles = cn(
    "h-8 w-8 p-0 rounded-full transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
    isDark
      ? "bg-transparent hover:bg-white/15 text-white border-0"
      : "bg-transparent hover:bg-gray-100 text-gray-700 border-0"
  );

  const modeButtonStyles = cn(
    "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105",
    isDark
      ? "bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border border-gray-700/50"
      : "bg-gray-100/50 hover:bg-gray-200/50 text-gray-600 border border-gray-300/50"
  );

  const activeModeStyles = cn(
    "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
    isDark
      ? "bg-gradient-to-r from-orange-500/20 to-purple-500/20 text-orange-300 border border-orange-500/30"
      : "bg-gradient-to-r from-orange-400/20 to-purple-400/20 text-orange-600 border border-orange-400/30"
  );

  const sendButtonStyles = cn(
    "h-8 w-8 p-0 rounded-full transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg",
    isDark
      ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 hover:shadow-purple-500/30"
      : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 hover:shadow-purple-400/30"
  );

  return (
    <div className={`relative ${className}`}>
      {/* Glowing background effect */}
      <div className={glowEffect} />
      
      {/* Main input container */}
      <div className={containerStyles}>
        {/* File upload button */}
        <Button
          onClick={triggerFileInput}
          disabled={disabled}
          className={buttonStyles}
          aria-label="Upload file"
        >
          <Upload className="h-4 w-4" />
        </Button>

        {/* Chat mode buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleChatMode}
            className={chatMode === 'normal' ? activeModeStyles : modeButtonStyles}
            disabled={disabled}
          >
            <Leaf className="h-3 w-3" />
            Normal
            <ChevronDown className="h-3 w-3" />
          </button>
          
          <button
            onClick={toggleChatMode}
            className={chatMode === 'deepthink' ? activeModeStyles : modeButtonStyles}
            disabled={disabled}
          >
            <Brain className="h-3 w-3" />
            DeepThink
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>

        {/* Voice button */}
        <Button
          onClick={toggleVoice}
          disabled={disabled}
          className={cn(modeButtonStyles, "h-auto w-auto")}
          aria-label="Voice input"
        >
          {isVoiceActive ? (
            <MicOff className="h-3 w-3" />
          ) : (
            <Mic className="h-3 w-3" />
          )}
          Voice
        </Button>

        {/* Input field */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className={inputStyles}
          />
          {/* Enhanced cursor effect */}
          <div className={cn(
            "absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-5 transition-all duration-200",
            isTyping ? 'animate-pulse' : 'animate-pulse',
            isDark 
              ? "bg-gradient-to-b from-purple-400 to-blue-400" 
              : "bg-gradient-to-b from-purple-500 to-blue-500"
          )} />
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className={sendButtonStyles}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
          className="hidden"
        />
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        <div className={cn(
          "absolute top-3 left-6 w-1 h-1 rounded-full animate-ping opacity-70",
          isDark ? "bg-purple-400" : "bg-purple-500"
        )} style={{ animationDelay: '0s' }} />
        <div className={cn(
          "absolute top-4 right-20 w-0.5 h-0.5 rounded-full animate-ping opacity-70",
          isDark ? "bg-blue-400" : "bg-blue-500"
        )} style={{ animationDelay: '1.5s' }} />
        <div className={cn(
          "absolute bottom-3 left-12 w-0.5 h-0.5 rounded-full animate-ping opacity-70",
          isDark ? "bg-indigo-400" : "bg-indigo-500"
        )} style={{ animationDelay: '3s' }} />
        <div className={cn(
          "absolute bottom-4 right-12 w-1 h-1 rounded-full animate-ping opacity-70",
          isDark ? "bg-orange-400" : "bg-orange-500"
        )} style={{ animationDelay: '0.8s' }} />
      </div>
    </div>
  );
}

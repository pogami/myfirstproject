"use client";

import React, { useState, useRef } from 'react';
import { Send, Upload, Mic, MicOff, Leaf, Brain, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SimpleChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFileUpload?: (file: File) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  isSending?: boolean;
}

export function SimpleChatInput({
  value,
  onChange,
  onSend,
  onKeyPress,
  onFileUpload,
  placeholder = "Ask anything...",
  disabled = false,
  className = "",
  isSending = false
}: SimpleChatInputProps) {
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
  };

  const toggleChatMode = () => {
    setChatMode(chatMode === 'normal' ? 'deepthink' : 'normal');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main input container */}
      <div className="relative flex items-center gap-2 p-2 rounded-2xl backdrop-blur-sm bg-white/90 border border-gray-200 shadow-lg">
        {/* File upload button */}
        <Button
          onClick={triggerFileInput}
          disabled={disabled}
          className="h-8 w-8 p-0 rounded-full bg-transparent hover:bg-gray-100 text-gray-700 border-0"
          aria-label="Upload file"
        >
          <Upload className="h-4 w-4" />
        </Button>

        {/* Chat mode buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleChatMode}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105",
              chatMode === 'normal' 
                ? "bg-gradient-to-r from-orange-400/20 to-purple-400/20 text-orange-600 border border-orange-400/30"
                : "bg-gray-100/50 hover:bg-gray-200/50 text-gray-600 border border-gray-300/50"
            )}
            disabled={disabled || isSending}
          >
            <Leaf className="h-3 w-3" />
            Normal
            <ChevronDown className="h-3 w-3" />
          </button>
          
          <button
            onClick={toggleChatMode}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105",
              chatMode === 'deepthink' 
                ? "bg-gradient-to-r from-orange-400/20 to-purple-400/20 text-orange-600 border border-orange-400/30"
                : "bg-gray-100/50 hover:bg-gray-200/50 text-gray-600 border border-gray-300/50"
            )}
            disabled={disabled || isSending}
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
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100/50 hover:bg-gray-200/50 text-gray-600 border border-gray-300/50 h-auto w-auto"
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
            placeholder={isSending ? "AI is responding..." : placeholder}
            disabled={disabled || isSending}
            className="w-full h-8 bg-transparent text-gray-900 placeholder-gray-500 text-sm border-0 outline-none focus:outline-none"
          />
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={disabled || isSending || !value.trim()}
          className="h-8 w-8 p-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-lg hover:shadow-purple-400/30 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
    </div>
  );
}

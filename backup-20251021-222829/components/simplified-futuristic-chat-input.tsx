"use client";

import React, { useState, useRef } from 'react';
import { Send, Brain, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimplifiedFuturisticChatInputProps {
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

export function SimplifiedFuturisticChatInput({
  value,
  onChange,
  onSend,
  onKeyPress,
  onFileUpload,
  placeholder = "Ask anything...",
  disabled = false,
  className = "",
  isSending = false
}: SimplifiedFuturisticChatInputProps) {
  const [isTyping, setIsTyping] = useState(false);
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

  return React.createElement('div', {
    className: `relative ${className}`
  },
    // Glowing background effect
    React.createElement('div', {
      className: "absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-indigo-500/20 blur-sm"
    }),
    
    // Main input container
    React.createElement('div', {
      className: "relative flex items-center gap-3 p-3 rounded-2xl bg-black/80 border border-gradient-to-r from-purple-500/50 to-blue-500/50 backdrop-blur-sm"
    },
      // Gradient border effect
      React.createElement('div', {
        className: "absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-indigo-500/30 opacity-50"
      }),
      React.createElement('div', {
        className: "absolute inset-[1px] rounded-2xl bg-black/90"
      }),
      
      // File upload button
      React.createElement(Button, {
        onClick: triggerFileInput,
        disabled: disabled,
        className: "relative z-10 h-9 w-9 p-0 rounded-full bg-transparent hover:bg-white/15 text-white border-0 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      },
        React.createElement(Upload, {
          className: "h-4 w-4"
        })
      ),

      // AI Analysis indicator
      React.createElement('div', {
        className: "relative z-10 flex items-center gap-2 px-3 py-2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"
      },
        React.createElement(Brain, {
          className: "h-4 w-4"
        }),
        React.createElement('span', {
          className: "text-sm font-medium"
        }, "AI Analysis")
      ),

      // Input field
      React.createElement('div', {
        className: "relative flex-1"
      },
        React.createElement('input', {
          ref: inputRef,
          type: "text",
          value: value,
          onChange: handleInputChange,
          onKeyPress: handleKeyPress,
          placeholder: isSending ? "AI is responding..." : placeholder,
          disabled: disabled || isSending,
          className: "w-full h-9 bg-transparent text-white placeholder-white/70 text-sm border-0 outline-none focus:outline-none"
        }),
        // Enhanced cursor effect
        React.createElement('div', {
          className: `absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-5 bg-gradient-to-b from-purple-400 to-blue-400 ${isTyping ? 'animate-pulse' : 'animate-pulse'}`
        })
      ),

      // Hidden file input
      React.createElement('input', {
        ref: fileInputRef,
        type: "file",
        onChange: handleFileUpload,
        accept: ".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif",
        className: "hidden"
      }),

      // Send button
      React.createElement(Button, {
        onClick: handleSend,
        disabled: disabled || isSending || !value.trim(),
        className: "relative z-10 h-9 w-9 p-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-xl hover:shadow-purple-500/30 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      },
        React.createElement(Send, {
          className: "h-4 w-4"
        })
      )
    ),

    // Floating particles effect
    React.createElement('div', {
      className: "absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
    },
      React.createElement('div', {
        className: "absolute top-3 left-6 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-70",
        style: { animationDelay: '0s' }
      }),
      React.createElement('div', {
        className: "absolute top-4 right-20 w-0.5 h-0.5 bg-blue-400 rounded-full animate-ping opacity-70",
        style: { animationDelay: '1.5s' }
      }),
      React.createElement('div', {
        className: "absolute bottom-3 left-12 w-0.5 h-0.5 bg-indigo-400 rounded-full animate-ping opacity-70",
        style: { animationDelay: '3s' }
      }),
      React.createElement('div', {
        className: "absolute bottom-4 right-12 w-1 h-1 bg-pink-400 rounded-full animate-ping opacity-70",
        style: { animationDelay: '0.8s' }
      })
    )
  );
}

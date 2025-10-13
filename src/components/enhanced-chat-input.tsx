"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, Mic, MicOff, Bot, Brain, FileText, Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';
// Removed Ollama import - now using API routes

interface EnhancedChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: (shouldCallAI?: boolean) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFileUpload?: (file: File) => void;
  onFileProcessed?: (processedFile: any) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  isPublicChat?: boolean;
  isClassChat?: boolean;
  isSending?: boolean;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
}

export function EnhancedChatInput({
  value,
  onChange,
  onSend,
  onKeyPress,
  onFileUpload,
  onFileProcessed,
  placeholder,
  disabled = false,
  className = "",
  isPublicChat = false,
  isClassChat = false,
  isSending = false,
  onTypingStart,
  onTypingStop
}: EnhancedChatInputProps) {
  const { theme } = useTheme();
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showAIMention, setShowAIMention] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [processingFile, setProcessingFile] = useState<File | null>(null);
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
      return isMobile ? "Type @ai to call AI" : "Type @ai to call AI (Classmate chat coming soon)";
    } else if (isPublicChat) {
      return isMobile ? "Type @ai to call AI" : "Type @ai to call AI (Community chat coming soon)";
    } else {
      return isMobile ? "Ask anything" : "Ask CourseConnect AI anything";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    
    // Handle typing indicators
    if (e.target.value.length > 0 && !isTyping) {
      setIsTyping(true);
      onTypingStart?.();
    } else if (e.target.value.length === 0 && isTyping) {
      setIsTyping(false);
      onTypingStop?.();
    }
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
      onTypingStop?.();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Check file type
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Unsupported file type. Please upload PDF, DOCX, TXT, or image files.');
      return;
    }

    setIsProcessingFile(true);
    setProcessingFile(file);

    try {
      // Extract text from file (simple text extraction for now)
      const text = await file.text();
      
      // Process file with Ollama API
      const response = await fetch('/api/ollama/process-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          fileName: file.name,
          analysisType: 'summary'
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          // Create processed file object
          const processedFile = {
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type: file.type,
            size: file.size,
            extractedText: text,
            summary: result.analysis.summary,
            keyPoints: result.analysis.keyPoints,
            contentType: 'text',
            processingTime: Date.now(),
            confidence: result.analysis.confidence
          };

          // Call the original onFileUpload if provided
          if (onFileUpload) {
            onFileUpload(file);
          }
          
          // Call the new onFileProcessed callback
          if (onFileProcessed) {
            onFileProcessed(processedFile);
          }
        } else {
          throw new Error(result.error || 'Failed to process file');
        }
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert(`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessingFile(false);
      setProcessingFile(null);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
          "absolute -top-10 left-2 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 z-10 shadow-lg border backdrop-blur-sm animate-in slide-in-from-bottom-2 duration-200",
          isDark 
            ? "bg-gradient-to-r from-purple-900/90 to-blue-900/90 text-purple-100 border-purple-700/50" 
            : "bg-gradient-to-r from-purple-50 to-blue-50 text-purple-800 border-purple-200/50"
        )}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <Bot className="h-4 w-4" />
            <span>AI will respond</span>
          </div>
          <div className="text-xs opacity-75">
            Press Enter to send
          </div>
        </div>
      )}

      {/* File Processing Indicator */}
      {isProcessingFile && processingFile && (
        <div className={cn(
          "absolute -top-8 left-2 px-2 py-1 rounded text-xs flex items-center gap-1 z-10",
          isDark ? "bg-blue-900/80 text-blue-200" : "bg-blue-100 text-blue-700"
        )}>
          <Brain className="h-3 w-3" />
          Processing {processingFile.name} with AI...
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
            "hover:bg-transparent transition-colors duration-200",
            isDark 
              ? "text-white/70 hover:text-white/90" 
              : "text-gray-600 hover:text-gray-800",
            (disabled || isSending || isProcessingFile) && "opacity-50 cursor-not-allowed"
          )}
        >
          {isProcessingFile ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </div>

        {/* Input Field */}
        <div className="flex-1 relative min-w-0">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={
              isSending ? "AI is responding..." : 
              isProcessingFile ? `Processing ${processingFile?.name}...` : 
              getPlaceholder()
            }
            disabled={disabled || isSending || isProcessingFile}
            className={cn(
              "w-full h-8 bg-transparent text-base border-0 outline-none focus:outline-none placeholder:opacity-60 resize-none",
              isDark ? "text-white placeholder-white/60" : "text-gray-900 placeholder-gray-400",
              (disabled || isSending || isProcessingFile) && "opacity-50 cursor-not-allowed"
            )}
            style={{ fontSize: '16px', color: isDark ? '#ffffff' : '#111827' }}
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
            "hover:bg-transparent transition-colors duration-200",
            isVoiceActive
              ? isDark 
                ? "text-red-400" 
                : "text-red-600"
              : isDark 
                ? "text-white/70 hover:text-white/90" 
                : "text-gray-600 hover:text-gray-800",
            (disabled || isSending || isProcessingFile) && "opacity-50 cursor-not-allowed"
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
            "hover:bg-transparent transition-colors duration-200",
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
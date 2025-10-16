"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, Mic, MicOff, Bot, Brain, FileText, Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';
// Removed Ollama import - now using API routes

interface EnhancedChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSend: (shouldCallAI?: boolean) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ name: string; size: number; type: string; url?: string }[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const inputRef = useRef<HTMLTextAreaElement>(null);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (onKeyPress) {
      onKeyPress(e);
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    // If there are files selected, send them with the text
    if (selectedFiles.length > 0) {
      if (onFileProcessed) {
        // Send as a single payload so UI can render a grid on one message
        onFileProcessed({ files: selectedFiles, text: value.trim() });
      } else {
        // Fallback: send each file individually
        selectedFiles.forEach((file) => {
          setUploadProgress(prev => ({ ...prev, [file.name]: 10 }));
          setTimeout(() => setUploadProgress(prev => ({ ...prev, [file.name]: 60 })), 100);
          setTimeout(() => setUploadProgress(prev => ({ ...prev, [file.name]: 100 })), 200);
          onFileUpload?.(file);
        });
      }
      // Clear selection after dispatch
      setSelectedFiles([]);
      setFilePreviews([]);
      setUploadProgress({});
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
    if (value.trim() && selectedFiles.length === 0) {
      // No file, just text
      const shouldCallAI = !isPublicChat || value.includes('@ai') || value.includes('@AI');
      onSend(shouldCallAI);
      onTypingStop?.();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

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

    // Respect maximum of 3 total chips including already selected
    const remaining = Math.max(0, 3 - selectedFiles.length);
    const limited = files.slice(0, remaining);

    const valid: File[] = [];
    for (const f of limited) { // limit 3 chips total
      if (f.size > 10 * 1024 * 1024) {
        alert(`File "${f.name}" must be less than 10MB`);
        continue;
      }
      if (!allowedTypes.includes(f.type)) {
        alert(`Unsupported type for "${f.name}"`);
        continue;
      }
      valid.push(f);
    }

    if (valid.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const previews = valid.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      url: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined
    }));
    setSelectedFiles(prev => [...prev, ...valid]);
    setFilePreviews(prev => [...prev, ...previews]);
    inputRef.current?.focus();
  };
  
  const removeFile = (name?: string) => {
    if (!name) {
      setSelectedFiles([]);
      setFilePreviews([]);
      setUploadProgress({});
    } else {
      setSelectedFiles(prev => prev.filter(f => f.name !== name));
      setFilePreviews(prev => prev.filter(p => p.name !== name));
      setUploadProgress(prev => { const { [name]: _, ...rest } = prev; return rest; });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  const hasPreviews = filePreviews.length > 0;

  return (
    <div className={cn("relative w-full chat-input-container", className)}>
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

      {/* Main Input Container */}
      <div className={cn(
        "chat-input-container relative flex items-center gap-3 p-2 rounded-full shadow-lg border border-border/20",
        "bg-card/80 backdrop-blur-sm",
        "hover:shadow-xl transition-all duration-200"
      )}
      style={{ 
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        outline: 'none'
      }}>
        {/* When previews exist, increase min height to fit tiles */}
        <style>{`.chat-input-container{${hasPreviews ? 'min-height:88px;' : 'min-height:48px;'}}`}</style>
        
        {/* File Upload Icon (Left) */}
        <div
          onClick={triggerFileInput}
          className={cn(
            "relative z-10 h-8 w-8 flex items-center justify-center cursor-pointer flex-shrink-0 touch-manipulation rounded-full",
            "hover:bg-transparent transition-colors duration-200",
            isDark 
              ? "text-white/70 hover:text-white/90" 
              : "text-gray-600 hover:text-gray-800",
            (disabled || isSending) && "opacity-50 cursor-not-allowed"
          )}
        >
          <Upload className="h-4 w-4" />
        </div>

        {/* Inline Attachment Chips (inside input) */}
        {hasPreviews && (
          <div className="flex items-center gap-3 pr-2">
            {filePreviews.slice(0, 3).map((f) => (
              <div key={f.name} className="relative inline-block rounded-lg overflow-hidden border border-border/60 shadow-md bg-background">
                {f.type.startsWith('image/') ? (
                  <img src={f.url} alt={f.name} className="h-20 w-20 object-cover bg-white" />
                ) : f.type === 'application/pdf' ? (
                  <div className={cn(
                    "h-20 w-20 flex items-center justify-center bg-muted/40",
                    isDark ? "bg-gray-800/60" : "bg-gray-100"
                  )}>
                    <div className="flex flex-col items-center justify-center p-1 text-center">
                      <FileText className="h-7 w-7 text-primary mb-0.5" />
                      <span className="text-[10px] leading-tight line-clamp-2 px-1 max-w-[4.5rem]">{f.name}</span>
                    </div>
                  </div>
                ) : (
                  <div className={cn(
                    "h-20 w-20 flex items-center justify-center bg-muted/40",
                    isDark ? "bg-gray-800/60" : "bg-gray-100"
                  )}>
                    <div className="flex flex-col items-center justify-center p-1 text-center">
                      <FileText className="h-7 w-7 text-primary mb-0.5" />
                      <span className="text-[10px] leading-tight line-clamp-2 px-1 max-w-[4.5rem]">{f.name}</span>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => removeFile(f.name)}
                  className="absolute top-1 right-1 h-5 w-5 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center shadow ring-1 ring-black/20"
                  title="Remove"
                  aria-label={`Remove ${f.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Field */}
        <div className="flex-1 relative min-w-0">
          <textarea
            ref={inputRef}
            value={value}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={
              isSending ? "AI is responding..." : 
              getPlaceholder()
            }
            disabled={disabled || isSending}
            className={cn(
              "w-full bg-transparent text-base border-0 outline-none focus:outline-none placeholder:opacity-60 resize-none pr-14",
              isDark ? "text-white placeholder-white/60" : "text-gray-900 placeholder-gray-400",
              (disabled || isSending) && "opacity-50 cursor-not-allowed"
            )}
            rows={1}
            style={{ fontSize: '16px', color: isDark ? '#ffffff' : '#111827', maxHeight: '120px', overflowY: 'auto' }}
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
          multiple
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
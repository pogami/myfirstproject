"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, Mic, MicOff, Bot, Brain, FileText, Loader2, Maximize2, Minimize2 } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea and auto-expand when needed
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const collapsedMax = 160; // px
    const expandedMax = 240; // px
    // Reset height to compute scrollHeight correctly
    el.style.height = 'auto';
    const desired = Math.min(el.scrollHeight, isExpanded ? expandedMax : collapsedMax);
    el.style.height = desired + 'px';
    // Keep caret/latest text visible
    el.scrollTop = el.scrollHeight;
    // Auto-expand if content exceeds collapsed max
    if (!isExpanded && el.scrollHeight > collapsedMax) {
      setIsExpanded(true);
    }
  }, [value, isExpanded]);

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle pasted files directly
  const handlePastedFile = (file: File) => {
    try {
      console.log('📋 Pasted file:', file.name, file.type, file.size);
      
      if (!file || !file.name) {
        console.error('Invalid file object:', file);
        return;
      }

      // Check file size (50MB limit)
      const maxFileSize = 50 * 1024 * 1024;
      if (file.size > maxFileSize) {
        alert(`File "${file.name}" must be less than 50MB`);
        return;
      }

      // Check if we already have too many files (5 max)
      if (selectedFiles.length >= 5) {
        alert('Maximum 5 files allowed at once');
        return;
      }

      // Add to selected files
      setSelectedFiles(prev => [...prev, file]);
      
      // Create preview
      const preview = {
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      };
      setFilePreviews(prev => [...prev, preview]);
      
      console.log('📋 File added successfully:', file.name);
    } catch (error) {
      console.error('Error handling pasted file:', error);
    }
  };

  // Handle paste events for files
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      try {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.kind === 'file') {
            e.preventDefault();
            const file = item.getAsFile();
            if (file) {
              console.log('📋 Processing pasted file:', file.name, file.type);
              handlePastedFile(file);
            }
          }
        }
      } catch (error) {
        console.error('Error handling paste event:', error);
      }
    };

    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener('paste', handlePaste);
      return () => inputElement.removeEventListener('paste', handlePaste);
    }
  }, []);

  // Check for @ mentions
  useEffect(() => {
    const hasAIMention = value.includes('@ai') || value.includes('@AI');
    setShowAIMention(hasAIMention);
  }, [value]);

  // Load and persist expanded composer state
  useEffect(() => {
    try {
      const saved = localStorage.getItem('chat-composer-expanded');
      if (saved === 'true') setIsExpanded(true);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('chat-composer-expanded', isExpanded ? 'true' : 'false');
    } catch {}
  }, [isExpanded]);

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
    // Adjust height immediately while typing
    const el = inputRef.current;
    if (el) {
      const collapsedMax = 160;
      const expandedMax = 240;
      el.style.height = 'auto';
      const desired = Math.min(el.scrollHeight, isExpanded ? expandedMax : collapsedMax);
      el.style.height = desired + 'px';
      el.scrollTop = el.scrollHeight;
      if (!isExpanded && el.scrollHeight > collapsedMax) {
        setIsExpanded(true);
      }
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
    // If there are files selected, send them (with or without text)
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
    } else if (value.trim()) {
      // No file, just text
      const shouldCallAI = !isPublicChat || value.includes('@ai') || value.includes('@AI');
      onSend(shouldCallAI);
      onTypingStop?.();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 File upload triggered', e.target.files);
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Allow any file type - just check size
    const maxFileSize = 50 * 1024 * 1024; // 50MB limit
    
    // Respect maximum of 5 total files including already selected
    const remaining = Math.max(0, 5 - selectedFiles.length);
    const limited = files.slice(0, remaining);

    const valid: File[] = [];
    for (const f of limited) {
      if (f.size > maxFileSize) {
        alert(`File "${f.name}" must be less than 50MB`);
        continue;
      }
      // Allow any file type
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
    console.log('📁 Upload button clicked');
    if (fileInputRef.current) {
      console.log('📁 File input found, triggering click');
      fileInputRef.current.click();
    } else {
      console.error('📁 File input ref not found');
    }
  };

  const toggleVoice = async () => {
    console.log('🎤 Microphone button clicked, isVoiceActive:', isVoiceActive);
    
    if (!isVoiceActive) {
      try {
        // Check if browser supports speech recognition
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
          console.log('🎤 Speech recognition not supported');
          alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
          return;
        }

        console.log('🎤 Speech recognition supported, creating recognition instance');
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = true; // Enable real-time results
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
          console.log('🎤 Speech recognition started');
          setIsVoiceActive(true);
        };
        
        recognition.onresult = (event: any) => {
          console.log('🎤 Speech recognition result:', event);
          
          let interimTranscript = '';
          let finalTranscript = '';
          
          // Process all results
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Use final transcript if available, otherwise use interim
          const transcriptToUse = finalTranscript || interimTranscript;
          
          if (transcriptToUse) {
            const currentValue = value;
            const newValue = currentValue + (currentValue ? ' ' : '') + transcriptToUse;
            console.log('🎤 Speech recognized:', transcriptToUse);
            console.log('🎤 Current value:', currentValue);
            console.log('🎤 New value:', newValue);
            
            // Try multiple approaches to update the input
            try {
              // Approach 1: Create a proper synthetic event
              const syntheticEvent = {
                target: { value: newValue },
                currentTarget: { value: newValue }
              } as React.ChangeEvent<HTMLTextAreaElement>;
              onChange(syntheticEvent);
              console.log('🎤 Updated via synthetic event');
            } catch (error) {
              console.error('🎤 Error with synthetic event:', error);
            }
          }
        };
        
        recognition.onerror = (event: any) => {
          console.error('🎤 Speech recognition error:', event.error);
          setIsVoiceActive(false);
          if (event.error === 'not-allowed') {
            alert('Microphone access is required for voice input. Please allow microphone access and try again.');
          } else if (event.error === 'no-speech') {
            alert('No speech detected. Please try again.');
          } else {
            alert(`Speech recognition error: ${event.error}`);
          }
        };
        
        recognition.onend = () => {
          console.log('🎤 Speech recognition ended');
          setIsVoiceActive(false);
        };
        
        console.log('🎤 Starting speech recognition...');
        recognition.start();
      } catch (error) {
        console.error('🎤 Error accessing microphone:', error);
        alert('Microphone access is required for voice input. Please allow microphone access and try again.');
      }
    } else {
      console.log('🎤 Stopping speech recognition');
      // Stop recognition if it's running
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
        "hover:shadow-xl transition-all duration-200",
        isExpanded && "p-3"
      )}
      style={{ 
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        outline: 'none'
      }}>
        {/* When previews exist, increase min height to fit tiles */}
        <style>{`.chat-input-container{${hasPreviews || isExpanded ? 'min-height:112px;' : 'min-height:48px;'}}`}</style>
        
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
          <div className={cn("flex items-center gap-3 pr-2", isExpanded && "flex-wrap")}> 
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
              isDark ? "text-white placeholder-white/60" : "text-black placeholder-gray-500",
              (disabled || isSending) && "opacity-50 cursor-not-allowed"
            )}
            rows={1}
            style={{ 
              fontSize: '16px', 
              color: isDark ? '#ffffff' : '#000000', 
              maxHeight: isExpanded ? '240px' : '160px', 
              overflowY: 'auto',
              scrollBehavior: 'smooth'
            }}
          />
          {/* Decorative cursor line removed */}
        </div>

        {/* Expand/Collapse Composer */}
        <div
          onClick={() => setIsExpanded(prev => !prev)}
          className={cn(
            "relative z-10 h-8 w-8 flex items-center justify-center cursor-pointer flex-shrink-0 touch-manipulation rounded-full",
            "hover:bg-transparent transition-colors duration-200",
            isDark 
              ? "text-white/70 hover:text-white/90" 
              : "text-black hover:text-gray-800",
            (disabled || isSending) && "opacity-50 cursor-not-allowed"
          )}
          title={isExpanded ? "Collapse" : "Expand"}
          aria-label={isExpanded ? "Collapse composer" : "Expand composer"}
        >
          {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
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
                : "text-black hover:text-gray-800",
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
            (disabled || isSending || (!value.trim() && selectedFiles.length === 0)) && "opacity-50 cursor-not-allowed"
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
          accept="*/*"
          className="hidden"
        />
      </div>

    </div>
  );
}
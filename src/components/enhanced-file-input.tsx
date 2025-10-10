"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Upload, FileText, X, Loader2, Image, File, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/theme-context';

interface FilePreview {
  file: File;
  id: string;
  preview?: string;
}

interface EnhancedFileInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: (shouldCallAI?: boolean, files?: File[]) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  isPublicChat?: boolean;
  isSending?: boolean;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
}

export function EnhancedFileInput({
  value,
  onChange,
  onSend,
  onKeyPress,
  placeholder,
  disabled = false,
  className = "",
  isPublicChat = false,
  isSending = false,
  onTypingStart,
  onTypingStop
}: EnhancedFileInputProps) {
  const { theme } = useTheme();
  const [isTyping, setIsTyping] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<FilePreview[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';

  // File validation
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size (50MB limit - increased for larger files)
    if (file.size > 50 * 1024 * 1024) {
      return { valid: false, error: 'File size must be less than 50MB' };
    }

    // Allow all file types - let the analysis service handle unsupported formats
    return { valid: true };
  };

  // Get file icon
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-500" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-4 w-4 text-red-500" />;
    } else {
      return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  // Handle file selection
  const handleFiles = (files: File[]) => {
    const validFiles: FilePreview[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        const preview: FilePreview = {
          file,
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        // Create preview for images
        if (file.type.startsWith('image/')) {
          preview.preview = URL.createObjectURL(file);
        }

        validFiles.push(preview);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setAttachedFiles(prev => [...prev, ...validFiles]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove file
  const removeFile = (fileId: string) => {
    setAttachedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  // Handle input change
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

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyPress) {
      onKeyPress(e);
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle send
  const handleSend = () => {
    if (value.trim() || attachedFiles.length > 0) {
      const shouldCallAI = !isPublicChat || value.includes('@ai') || value.includes('@AI');
      const files = attachedFiles.map(f => f.file);
      onSend(shouldCallAI, files);
      onTypingStop?.();
      
      // Clear files after sending
      attachedFiles.forEach(f => {
        if (f.preview) {
          URL.revokeObjectURL(f.preview);
        }
      });
      setAttachedFiles([]);
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      attachedFiles.forEach(f => {
        if (f.preview) {
          URL.revokeObjectURL(f.preview);
        }
      });
    };
  }, [attachedFiles]);

  return (
    <div className={cn("relative w-full", className)}>
      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <Upload className="h-12 w-12 mx-auto text-primary mb-4 animate-bounce" />
            <p className="text-lg font-medium text-primary">Drop files here</p>
            <p className="text-sm text-muted-foreground">PDF, DOCX, TXT, Excel, or images</p>
          </div>
        </div>
      )}

      {/* File Previews */}
      {attachedFiles.length > 0 && (
        <div className="mb-3 p-3 bg-muted/50 rounded-lg border">
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((filePreview) => (
              <div
                key={filePreview.id}
                className="flex items-center gap-2 bg-background rounded-lg p-2 border shadow-sm"
              >
                {filePreview.preview ? (
                  <img
                    src={filePreview.preview}
                    alt={filePreview.file.name}
                    className="h-8 w-8 object-cover rounded"
                  />
                ) : (
                  <div className="h-8 w-8 flex items-center justify-center">
                    {getFileIcon(filePreview.file)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{filePreview.file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(filePreview.file.size)}</p>
                </div>
                <button
                  onClick={() => removeFile(filePreview.id)}
                  className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Container */}
      <div
        ref={dropZoneRef}
        className={cn(
          "relative flex items-center gap-2 p-3 rounded-full h-12 shadow-lg border border-border/20",
          "bg-card/80 backdrop-blur-sm",
          "hover:shadow-xl transition-all duration-200",
          isDragOver && "border-primary/50 bg-primary/5"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          outline: 'none'
        }}
      >
        
        {/* File Upload Icon */}
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
              isProcessingFile ? "Processing file..." : 
              placeholder || (isPublicChat ? "Chat with others or type @ai to call AI" : "Ask CourseConnect AI anything")
            }
            disabled={disabled || isSending || isProcessingFile}
            className={cn(
              "w-full h-8 bg-transparent text-base border-0 outline-none focus:outline-none placeholder:opacity-60 resize-none",
              isDark ? "text-white placeholder-white/60" : "text-gray-900 placeholder-gray-400",
              (disabled || isSending || isProcessingFile) && "opacity-50 cursor-not-allowed"
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

        {/* Send Icon */}
        <div
          onClick={handleSend}
          className={cn(
            "relative z-10 h-8 w-8 flex items-center justify-center cursor-pointer flex-shrink-0 touch-manipulation rounded-full",
            "hover:bg-transparent transition-colors duration-200",
            isDark 
              ? "text-purple-400 hover:text-purple-300" 
              : "text-purple-600 hover:text-purple-500",
            (disabled || isSending || (!value.trim() && attachedFiles.length === 0)) && "opacity-50 cursor-not-allowed"
          )}
        >
          <Send className="h-4 w-4" />
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          accept="*/*"
          multiple
          className="hidden"
        />
      </div>

      {/* Floating Particles Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg hidden md:block">
        <div className="absolute top-2 left-4 w-0.5 h-0.5 bg-orange-400 rounded-full animate-ping opacity-70" style={{ animationDelay: '0s' }} />
        <div className="absolute top-3 right-16 w-0.5 h-0.5 bg-purple-400 rounded-full animate-ping opacity-70" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-2 left-8 w-0.5 h-0.5 bg-blue-400 rounded-full animate-ping opacity-70" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-3 right-8 w-0.5 h-0.5 bg-pink-400 rounded-full animate-ping opacity-70" style={{ animationDelay: '0.8s' }} />
      </div>
    </div>
  );
}

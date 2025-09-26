"use client";

import React, { useState } from 'react';
import { File, Image, FileText, Download, Eye, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FileData {
  name: string;
  size: number;
  type: string;
  url: string;
}

interface EnhancedFileDisplayProps {
  file: FileData;
  className?: string;
  showPreview?: boolean;
  compact?: boolean;
}

export function EnhancedFileDisplay({
  file,
  className = "",
  showPreview = true,
  compact = false
}: EnhancedFileDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const getFileTypeLabel = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'Image';
    if (fileType === 'application/pdf') return 'PDF';
    if (fileType.includes('word')) return 'Word Document';
    if (fileType.includes('text')) return 'Text File';
    return 'Document';
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = () => {
    if (file.type.startsWith('image/')) {
      setShowFullPreview(true);
    } else {
      window.open(file.url, '_blank');
    }
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 p-2 rounded-lg bg-muted/50", className)}>
        <div className="flex-shrink-0">
          {getFileIcon(file.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {getFileTypeLabel(file.type)} • {formatFileSize(file.size)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreview}
            className="h-6 w-6 p-0 hover:bg-transparent"
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-6 w-6 p-0 hover:bg-transparent"
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Card className={cn("w-full", className)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* File Icon/Preview */}
            <div className="flex-shrink-0">
              {file.type.startsWith('image/') && showPreview ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-12 h-12 rounded object-cover border"
                />
              ) : (
                <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                  {getFileIcon(file.type)}
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-medium text-foreground truncate">
                  {file.name}
                </h4>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {getFileTypeLabel(file.type)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {formatFileSize(file.size)}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                  className="h-7 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="h-7 text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
                {file.type.startsWith('image/') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-7 text-xs hover:bg-transparent"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Expanded Image Preview */}
          {isExpanded && file.type.startsWith('image/') && (
            <div className="mt-4 pt-4 border-t">
              <img
                src={file.url}
                alt={file.name}
                className="w-full max-w-md mx-auto rounded border"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Screen Image Preview Modal */}
      {showFullPreview && file.type.startsWith('image/') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={file.url}
              alt={file.name}
              className="max-w-full max-h-full object-contain rounded"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullPreview(false)}
              className="absolute top-4 right-4 bg-black/50 text-white hover:bg-transparent"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

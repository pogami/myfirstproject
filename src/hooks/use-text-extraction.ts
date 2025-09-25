'use client';

import { useState } from 'react';
import { extractFileText, formatExtractedText, TextExtractionResult } from '@/lib/text-extraction-service';
import { useToast } from '@/hooks/use-toast';

export interface UseTextExtractionOptions {
  onExtractionComplete?: (result: TextExtractionResult, fileName: string) => void;
  onExtractionError?: (error: string, fileName: string) => void;
  showToast?: boolean;
}

export interface UseTextExtractionReturn {
  isExtracting: boolean;
  extractText: (file: File) => Promise<TextExtractionResult | null>;
  formatExtractedText: (result: TextExtractionResult, fileName: string) => string;
}

/**
 * Custom hook for text extraction from uploaded files
 * Provides a reusable interface for all upload handlers
 */
export function useTextExtraction(options: UseTextExtractionOptions = {}): UseTextExtractionReturn {
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();
  
  const {
    onExtractionComplete,
    onExtractionError,
    showToast = true
  } = options;

  const extractText = async (file: File): Promise<TextExtractionResult | null> => {
    setIsExtracting(true);
    
    try {
      if (showToast) {
        toast({
          title: "Extracting Text",
          description: `Processing ${file.name}...`,
        });
      }

      const result = await extractFileText({
        file,
        fileName: file.name,
        fileType: file.type
      });

      if (result.success) {
        if (showToast) {
          toast({
            title: "Text Extracted",
            description: `Successfully extracted text from ${file.name}`,
          });
        }
        
        onExtractionComplete?.(result, file.name);
      } else {
        if (showToast) {
          toast({
            variant: "destructive",
            title: "Extraction Failed",
            description: result.error || `Failed to extract text from ${file.name}`,
          });
        }
        
        onExtractionError?.(result.error || 'Unknown error', file.name);
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      
      if (showToast) {
        toast({
          variant: "destructive",
          title: "Extraction Error",
          description: `Failed to process ${file.name}: ${errorMessage}`,
        });
      }
      
      onExtractionError?.(errorMessage, file.name);
      return null;
    } finally {
      setIsExtracting(false);
    }
  };

  return {
    isExtracting,
    extractText,
    formatExtractedText: (result: TextExtractionResult, fileName: string) => 
      formatExtractedText(result, fileName)
  };
}

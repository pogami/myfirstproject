import { useState, useCallback } from 'react';
import { smartDocumentAnalysis, DocumentAnalysisResult } from '@/lib/smart-document-analysis';
import { useToast } from '@/hooks/use-toast';

interface UseSmartDocumentAnalysisOptions {
  onAnalysisComplete?: (result: DocumentAnalysisResult, fileName: string) => Promise<void> | void;
  onAnalysisError?: (error: string, fileName: string) => void;
}

export function useSmartDocumentAnalysis(options?: UseSmartDocumentAnalysisOptions) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeDocument = useCallback(async (
    file: File, 
    userPrompt?: string
  ) => {
    setIsAnalyzing(true);
    
    try {
      const result = await smartDocumentAnalysis.analyzeDocument({
        file,
        userPrompt,
        fileName: file.name,
        fileType: file.type
      });
      
      if (result.success) {
        if (options?.onAnalysisComplete) {
          await options.onAnalysisComplete(result, file.name);
        }
        
        toast({
          title: "Document Analyzed",
          description: `${file.name} has been analyzed successfully.`,
        });
        
        return result;
      } else {
        const errorMessage = result.error || 'Document analysis failed';
        if (options?.onAnalysisError) {
          options.onAnalysisError(errorMessage, file.name);
        }
        
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: `Could not analyze ${file.name}: ${errorMessage}`,
        });
        
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      console.error('Unexpected error during document analysis:', error);
      const errorMessage = `An unexpected error occurred: ${error.message}`;
      
      if (options?.onAnalysisError) {
        options.onAnalysisError(errorMessage, file.name);
      }
      
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: errorMessage,
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setIsAnalyzing(false);
    }
  }, [options, toast]);

  return {
    isAnalyzing,
    analyzeDocument
  };
}

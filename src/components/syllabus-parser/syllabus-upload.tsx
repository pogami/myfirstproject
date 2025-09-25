"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Image, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { DocumentProcessorClient } from '@/lib/syllabus-parser/document-processor-client';
import { AISyllabusParser } from '@/lib/syllabus-parser/ai-parser';
import { ParsingProgress, ParsingResult } from '@/types/syllabus-parsing';

interface SyllabusUploadProps {
  onParsed: (result: ParsingResult) => void;
  onError: (error: string) => void;
}

export function SyllabusUpload({ onParsed, onError }: SyllabusUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ParsingProgress>({
    stage: 'uploading',
    progress: 0,
    message: 'Ready to upload'
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file
    const validation = DocumentProcessorClient.validateFile(file);
    if (!validation.valid) {
      onError(validation.error || 'Invalid file');
      return;
    }

    setUploadedFile(file);
    await processFile(file);
  }, [onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  const processFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      // Stage 1: Upload
      setProgress({
        stage: 'uploading',
        progress: 10,
        message: 'Uploading file...'
      });

      // Stage 2: Extract text
      setProgress({
        stage: 'extracting',
        progress: 30,
        message: 'Extracting text from document...'
      });

      const documentText = await DocumentProcessorClient.extractText(file);
      
      // Stage 3: AI parsing
      setProgress({
        stage: 'parsing',
        progress: 60,
        message: 'Analyzing content with AI...'
      });

      const parsingResult = await AISyllabusParser.parseSyllabus(
        documentText.text,
        file.name,
        documentText.format
      );

      // Stage 4: Structuring
      setProgress({
        stage: 'structuring',
        progress: 80,
        message: 'Structuring extracted data...'
      });

      // Stage 5: Validation
      setProgress({
        stage: 'validating',
        progress: 90,
        message: 'Validating extracted information...'
      });

      // Stage 6: Complete
      setProgress({
        stage: 'complete',
        progress: 100,
        message: 'Syllabus parsing complete!'
      });

      onParsed(parsingResult);

    } catch (error) {
      console.error('Processing error:', error);
      onError(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return <FileText className="w-8 h-8 text-red-500" />;
    if (file.type.startsWith('image/')) return <Image className="w-8 h-8 text-blue-500" />;
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'uploading':
      case 'extracting':
      case 'parsing':
      case 'structuring':
      case 'validating':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Syllabus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
            `}
          >
            <input {...getInputProps()} />
            
            {uploadedFile ? (
              <div className="space-y-2">
                {getFileIcon(uploadedFile)}
                <p className="font-medium">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {uploadedFile.type} • {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-lg font-medium">
                    {isDragActive ? 'Drop the file here' : 'Drag & drop your syllabus here'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse files
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Badge variant="outline">PDF</Badge>
                  <Badge variant="outline">DOCX</Badge>
                  <Badge variant="outline">TXT</Badge>
                  <Badge variant="outline">Images</Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getStageIcon(progress.stage)}
                <span className="font-medium">{progress.message}</span>
                <Badge variant="outline">{progress.progress}%</Badge>
              </div>
              
              <Progress value={progress.progress} className="w-full" />
              
              {progress.details && (
                <p className="text-sm text-muted-foreground">{progress.details}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

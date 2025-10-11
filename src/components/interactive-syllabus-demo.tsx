"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Sparkles, CheckCircle, ArrowRight, Calendar, User, GraduationCap, BookOpen, Clock, Shield, File, AlertCircle, Info, Zap, Users, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/hooks/use-chat-store';

interface ExtractedData {
  courseName?: string;
  courseCode?: string;
  professor?: string;
  university?: string;
  semester?: string;
  year?: string;
  department?: string;
  topics?: string[];
  assignments?: Array<{ name: string; dueDate?: string }>;
  exams?: Array<{ name: string; date?: string; daysUntil?: number }>;
}

interface InteractiveSyllabusDemoProps {
  className?: string;
  redirectToSignup?: boolean; // New prop to control redirect behavior
}

export default function InteractiveSyllabusDemo({ className, redirectToSignup = true }: InteractiveSyllabusDemoProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { addChat, setCurrentTab } = useChatStore();

  // Mock recent activity data
  useEffect(() => {
    const activities = [
      "Sarah from MIT just uploaded her Biology syllabus",
      "Mike from Stanford processed his CS course",
      "Emma from Harvard analyzed her Literature class",
      "Alex from Berkeley uploaded Chemistry syllabus",
      "Jordan from Yale processed Psychology course"
    ];
    setRecentActivity(activities);
  }, []);

  // Helper functions
  const getFileTypeText = (file: File) => {
    if (file.type === 'application/pdf') return 'PDF';
    if (file.type === 'text/plain') return 'TXT';
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'DOCX';
    return 'FILE';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeColor = (file: File) => {
    if (file.type === 'application/pdf') return 'bg-red-100 text-red-700 border-red-200';
    if (file.type === 'text/plain') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Function to validate if the document is actually a syllabus
  const validateSyllabusContent = (text: string): { isValid: boolean; reason?: string } => {
    const syllabusKeywords = [
      'syllabus', 'course', 'instructor', 'professor', 'office hours', 'grading', 'assignment',
      'exam', 'midterm', 'final', 'quiz', 'homework', 'textbook', 'required reading',
      'course objectives', 'learning outcomes', 'prerequisites', 'credit hours',
      'attendance', 'late policy', 'academic integrity', 'course schedule',
      'semester', 'fall', 'spring', 'summer', 'winter', 'academic year',
      'class', 'lecture', 'lab', 'section', 'due date', 'deadline', 'rubric',
      'participation', 'discussion', 'project', 'paper', 'essay', 'research'
    ];

    const textLower = text.toLowerCase();
    const foundKeywords = syllabusKeywords.filter(keyword => textLower.includes(keyword));
    
    // Debug logging
    console.log('Syllabus validation:', {
      textLength: text.trim().length,
      foundKeywords: foundKeywords,
      keywordCount: foundKeywords.length
    });
    
    // More flexible validation - need at least 3 syllabus-related keywords
    if (foundKeywords.length < 3) {
      return {
        isValid: false,
        reason: `This doesn't appear to be a syllabus. Found only ${foundKeywords.length} syllabus-related terms: ${foundKeywords.join(', ')}. Please upload an actual course syllabus.`
      };
    }

    // Check for minimum content length (syllabi are typically substantial documents)
    if (text.trim().length < 200) {
      return {
        isValid: false,
        reason: 'This document is too short to be a syllabus. Please upload a complete course syllabus.'
      };
    }

    return { isValid: true };
  };

  const handleFileSelect = (selectedFile: File) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = ['.pdf', '.txt', '.docx'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(selectedFile.type) && !allowedExtensions.includes(fileExtension)) {
      setError('Please upload a PDF, TXT, or DOCX file. Supported formats: PDF, TXT, DOCX');
      return;
    }

    if (selectedFile.size > maxSize) {
      setError(`File too large. Maximum size is 10MB. Your file is ${(selectedFile.size / 1024 / 1024).toFixed(1)}MB`);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setExtractedData(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = () => {
    setFile(null);
    setExtractedData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processSyllabus = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setProcessingTime(0);
    const startTime = Date.now();

    try {
      // Step 1: Extracting text
      setProcessingStep('Extracting text from file...');
      setProgress(10);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing time

      let text = '';
      
      if (file.type === 'text/plain') {
        text = await file.text();
        } else if (file.type === 'application/pdf') {
          // PDF processing provides helpful guidance instead of text extraction
          console.log('PDF file detected - providing conversion guidance...');
          
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('/api/pdf-extract', {
            method: 'POST',
            body: formData
          });
          
          const result = await response.json();
          
          // PDF processing always returns helpful guidance, not text
          if (result.alternatives) {
            const alternativesText = result.alternatives.map((alt: string, i: number) => `${i + 1}. ${alt}`).join('\n');
            const errorMessage = `${result.error}\n\nAlternatives:\n${alternativesText}${result.note ? `\n\n${result.note}` : ''}`;
            throw new Error(errorMessage);
          } else {
            throw new Error(result.error || 'PDF processing is currently being enhanced. Please try converting to TXT or DOCX format.');
          }
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          try {
            setProcessingStep('Reading DOCX content...');
            setProgress(20);
            
            // Use server-side DOCX processing
            console.log('Processing DOCX via server-side API...');
            
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/docx-extract', {
              method: 'POST',
              body: formData
            });
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.error || `Server error: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
              // Handle DOCX processing limitations gracefully
              if (result.alternatives) {
                const alternativesText = result.alternatives.map((alt: string, i: number) => `${i + 1}. ${alt}`).join('\n');
                const errorMessage = `${result.error}\n\nAlternatives:\n${alternativesText}${result.note ? `\n\n${result.note}` : ''}`;
                throw new Error(errorMessage);
              } else {
                throw new Error(result.error || 'DOCX processing failed');
              }
            }
            
            text = result.text;
            console.log('DOCX extraction successful via server-side API:', {
              textLength: text.length,
              fileName: result.metadata?.fileName
            });
            setProgress(50);
            
          } catch (docxError: any) {
            console.error('DOCX extraction error:', docxError);
            throw new Error(`Failed to extract text from DOCX: ${docxError.message}. Please try a TXT or PDF file instead.`);
          }
      } else {
        throw new Error('Unsupported file format');
      }

      // Only validate text content for TXT and DOCX files (PDF will throw errors with guidance)
      if ((file.type === 'text/plain' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') && (!text || text.trim().length === 0)) {
        throw new Error('No text content found in the file. Please try a different file.');
      }

      // Process TXT and DOCX files with AI (PDF will have already thrown errors with guidance)
      if (file.type === 'text/plain' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Step 2: Validate syllabus content (with bypass option for testing)
      setProcessingStep('Validating syllabus content...');
      setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const syllabusValidation = validateSyllabusContent(text);
      if (!syllabusValidation.isValid) {
        // For now, allow bypass with a warning but still process
        console.warn('Syllabus validation failed:', syllabusValidation.reason);
        // Uncomment the line below to enforce strict validation:
        // throw new Error(syllabusValidation.reason || 'This document does not appear to be a syllabus.');
      }

      // Step 3: Analyzing content
      setProcessingStep('Analyzing syllabus content...');
      setProgress(70);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 4: Finding topics
      setProcessingStep('Finding course topics...');
      setProgress(80);
      await new Promise(resolve => setTimeout(resolve, 600));

      // Step 5: Identifying assignments
      setProcessingStep('Identifying assignments and exams...');
      setProgress(85);
      await new Promise(resolve => setTimeout(resolve, 400));

      // Call AI extraction API
      const response = await fetch('/api/extract-syllabus-context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          syllabusText: text
        })
      });

      setProcessingStep('Finalizing results...');
      setProgress(90);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'AI extraction failed');
      }

      const extractedData = result.extractedData;
      setExtractedData(extractedData);
      setProgress(100);
      setProcessingStep('Complete!');
      
      // Update processing time
      const endTime = Date.now();
      setProcessingTime(Math.round((endTime - startTime) / 1000));
        
        // Save to sessionStorage for demo flow
        sessionStorage.setItem('demoSyllabusData', JSON.stringify(extractedData));
        sessionStorage.setItem('demoSyllabusText', text);
      
      // Dispatch real activity event for live pill
      const activityEvent = new CustomEvent('syllabus-uploaded', {
        detail: {
          courseName: extractedData.courseName,
          university: extractedData.university,
          professor: extractedData.professor,
          courseCode: extractedData.courseCode
        }
      });
      window.dispatchEvent(activityEvent);
        
        console.log('TXT syllabus processing completed:', extractedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process syllabus. Please try again.');
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignUp = async () => {
    // Save extracted data to session storage for signup flow
    if (extractedData) {
      sessionStorage.setItem('cc-course-context-card', JSON.stringify({
        courseCode: extractedData.courseCode || 'UNKNOWN',
        courseName: extractedData.courseName || 'Unknown Course',
        professor: extractedData.professor || null,
        topics: extractedData.topics || [],
        nextExamDaysUntil: extractedData.exams?.[0]?.daysUntil ?? null
      }));
    }
    
    // Only navigate to signup if redirectToSignup is true (homepage users)
    if (redirectToSignup) {
    router.push('/signup');
    } else {
      // For authenticated users on upload page, create a course-specific chat
      if (extractedData) {
        const courseName = extractedData.courseName || 'Unknown Course';
        const courseCode = extractedData.courseCode || 'UNKNOWN';
        const chatTitle = `${courseCode} - ${courseName}`;
        
        // Create course data for the chat
        const courseData = {
          courseName: extractedData.courseName || 'Unknown Course',
          courseCode: extractedData.courseCode || 'UNKNOWN',
          professor: extractedData.professor || 'Unknown Professor',
          university: extractedData.university || 'Unknown University',
          semester: extractedData.semester || 'Unknown Semester',
          year: extractedData.year || 'Unknown Year',
          department: extractedData.department || 'Unknown Department',
          topics: extractedData.topics || [],
          assignments: extractedData.assignments || [],
          exams: extractedData.exams || []
        };
        
        // Create welcome message for the course chat
        const welcomeMessage = {
          id: `welcome-${Date.now()}`,
          sender: 'bot' as const,
          name: 'CourseConnect AI',
          text: `Welcome to your ${courseName} course chat! I'm your AI tutor with full context about your syllabus. I can help you with:\n\n• Course topics and concepts\n• Assignment deadlines and requirements\n• Exam preparation\n• Study strategies\n• Any questions about the course material\n\nWhat would you like to know about ${courseName}?`,
          timestamp: Date.now()
        };
        
        try {
          // Create a unique chat ID for each syllabus upload
          const uniqueChatId = `${courseCode}-${courseName}-${Date.now()}`;
          
          console.log('Creating course chat with ID:', uniqueChatId);
          
          // Create the course chat with unique ID and wait for it to complete
          const chatCreated = await addChat(chatTitle, welcomeMessage, uniqueChatId, 'class', courseData);
          
          console.log('Chat creation result:', chatCreated);
          
          // Wait a moment to ensure the chat is properly added to the store
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Navigate to the chat page with the new chat
          console.log('Navigating to chat:', uniqueChatId);
          router.push(`/dashboard/chat?chatId=${encodeURIComponent(uniqueChatId)}`);
        } catch (error) {
          console.error('Failed to create course chat:', error);
          // Fallback to dashboard if chat creation fails
          router.push('/dashboard');
        }
      } else {
        // Fallback to dashboard if no extracted data
        router.push('/dashboard');
      }
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <FileText className="size-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Try CourseConnect AI Right Now
          </CardTitle>
          <p className="text-muted-foreground">
            Upload your syllabus to see how AI extracts key information and creates study groups
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">

          {!file && !extractedData && (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragOver 
                  ? 'border-purple-500 dark:border-purple-400 bg-purple-100/80 dark:bg-purple-900/30 shadow-lg scale-[1.02]' 
                  : 'border-purple-300 dark:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-950/20'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".pdf,.doc,.docx,.txt" 
              />
              
              <div className='flex justify-center mb-4'>
                <div className={`p-4 rounded-xl transition-all duration-300 ${
                  isDragOver 
                    ? 'bg-gradient-to-br from-purple-200 to-purple-100 dark:from-purple-800/40 dark:to-purple-700/20 scale-110' 
                    : 'bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-800/10'
                }`}>
                  <Upload className={`size-12 transition-all duration-300 ${
                    isDragOver 
                      ? 'text-purple-700 dark:text-purple-300 scale-110' 
                      : 'text-purple-600 dark:text-purple-400'
                  }`} />
                </div>
              </div>
              
              <h3 className={`text-xl font-semibold mb-2 transition-all duration-300 ${
                isDragOver 
                  ? 'text-purple-700 dark:text-purple-300 scale-105' 
                  : 'text-foreground'
              }`}>
                {isDragOver ? 'Perfect! Release to upload' : 'Drop your course syllabus here or click to upload'}
              </h3>
              <p className="text-muted-foreground mb-4">
                Upload your course syllabus (PDF, DOCX, TXT). AI will extract professor info, topics, exam dates, and assignments.
              </p>
              
                  <div className="flex flex-wrap justify-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">PDF Syllabus</span>
                      <span className="text-xs text-green-600 dark:text-green-500">(fully supported)</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">DOCX Syllabus</span>
                      <span className="text-xs text-green-600 dark:text-green-500">(fully supported)</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">TXT Syllabus</span>
                      <span className="text-xs text-green-600 dark:text-green-500">(fully supported)</span>
                    </div>
                  </div>
              
              <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                  <Info className="size-4" />
                  <span className="font-medium">Max file size: 10MB</span>
                </div>
              </div>
              
        <div className="mt-3 p-3 bg-green-50/50 dark:bg-green-900/10 rounded-lg border border-green-200/50 dark:border-green-800/50">
          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                      <Info className="size-4" />
            <span className="font-medium">TXT and DOCX files work perfectly! PDF processing provides helpful conversion guidance.</span>
                    </div>
                  </div>
            </div>
          )}

          {file && !extractedData && (
            <div className="space-y-4">
              {/* Enhanced File Preview */}
              <div className="p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold text-primary">{getFileTypeText(file)}</div>
                    <div>
                      <p className="font-medium text-foreground">{file.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${getFileTypeColor(file)}`}>
                          {file.type.split('/')[1].toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={removeFile} className="!bg-transparent !border-gray-300 !text-gray-700 hover:!bg-gray-50 hover:!text-gray-900 hover:!border-gray-300 dark:!border-gray-600 dark:!text-gray-300 dark:hover:!bg-gray-800 dark:hover:!text-gray-100 dark:hover:!border-gray-600">
                    Remove
                  </Button>
                </div>
                
                {/* Processing Time Estimate */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-4" />
                  <span>This usually takes 10-15 seconds</span>
                </div>
              </div>

              {/* Processing Steps */}
              {isProcessing && (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Sparkles className="size-5 text-primary animate-pulse" />
                      <span className="font-medium text-primary">{processingStep}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>{progress}% complete</span>
                      <span>{processingTime}s elapsed</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="size-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800 dark:text-red-200">Processing Error</p>
                      <p className="text-red-700 dark:text-red-400 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Button 
                onClick={processSyllabus} 
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="size-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="size-4 mr-2" />
                    Analyze Syllabus with AI
                  </>
                )}
              </Button>
            </div>
          )}

          {extractedData && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-800/10">
                    <CheckCircle className="size-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Syllabus Analysis Complete!</h3>
                <p className="text-muted-foreground">
                  Here's what our AI extracted from your syllabus:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Course Information */}
                <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-800/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="size-5 text-blue-600" />
                      Course Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Course Name</p>
                      <p className="font-medium">{extractedData.courseName || 'Not found'}</p>
                      {!extractedData.courseName && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          This syllabus may not contain a clear course name
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Course Code</p>
                      <p className={`font-medium ${redirectToSignup ? 'blur-sm select-none pointer-events-none' : ''}`}>
                        {extractedData.courseCode || 'Not found'}
                      </p>
                      {!extractedData.courseCode && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          This syllabus may not contain a course code
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Professor</p>
                      <p className={`font-medium ${redirectToSignup ? 'blur-sm select-none pointer-events-none' : ''}`}>
                        {extractedData.professor || 'Not found'}
                      </p>
                      {!extractedData.professor && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          This syllabus may not contain professor information
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">University</p>
                      <p className={`font-medium ${redirectToSignup ? 'blur-sm select-none pointer-events-none' : ''}`}>
                        {extractedData.university || 'Not found'}
                      </p>
                      {!extractedData.university && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          This syllabus may not contain university information
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Semester & Year</p>
                      <p className="font-medium">
                        {extractedData.semester && extractedData.year 
                          ? `${extractedData.semester} ${extractedData.year}`
                          : 'Not found'
                        }
                      </p>
                      {(!extractedData.semester || !extractedData.year) && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          This syllabus may not contain semester/year details
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Academic Details */}
                <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/10 dark:to-purple-800/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="size-5 text-purple-600" />
                      Academic Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Topics Found</p>
                      <p className="font-medium">{extractedData.topics?.length || 0} topics</p>
                      {extractedData.topics && extractedData.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {extractedData.topics.slice(0, 3).map((topic, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                          {extractedData.topics.length > 3 && (
                            <div className="relative group">
                              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                                +{extractedData.topics.length - 3} more
                              </Badge>
                              <div className="absolute bottom-full left-0 mb-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[400px] max-w-[90vw] sm:max-w-[500px]"
                                   role="tooltip" aria-label="All topics">
                                <div className="text-sm font-semibold mb-3 text-center text-gray-900 dark:text-gray-100">All Topics</div>
                                <div className="grid grid-cols-2 gap-2">
                                  {extractedData.topics.map((topic, index) => (
                                    <div key={index} className="text-xs p-2 bg-gray-50 dark:bg-gray-700 rounded-md text-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                      {topic}
                                    </div>
                                  ))}
                                </div>
                                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-200 dark:border-t-gray-700"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Assignments</p>
                      <p className="font-medium">{extractedData.assignments?.length || 0} assignments</p>
                      {extractedData.assignments && extractedData.assignments.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {extractedData.assignments.slice(0, 3).map((assignment, index) => (
                            <Badge key={index} variant="outline" className={`text-xs ${redirectToSignup ? 'blur-sm select-none pointer-events-none' : ''}`}>
                              {assignment.name}
                            </Badge>
                          ))}
                          {extractedData.assignments.length > 3 && (
                            <div className="relative group">
                              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                                +{extractedData.assignments.length - 3} more
                              </Badge>
                              <div className="absolute bottom-full left-0 mb-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[400px] max-w-[90vw] sm:max-w-[500px]"
                                   role="tooltip" aria-label="All assignments">
                                <div className="text-sm font-semibold mb-3 text-center text-gray-900 dark:text-gray-100">All Assignments</div>
                                <div className="grid grid-cols-1 gap-2">
                                  {extractedData.assignments.map((assignment, index) => (
                                    <div key={index} className="text-xs p-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                      <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">{assignment.name}</div>
                                      {assignment.dueDate && (
                                        <div className="text-gray-600 dark:text-gray-400 text-xs">
                                          Due: {formatDate(assignment.dueDate)}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-200 dark:border-t-gray-700"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Exams</p>
                      <p className="font-medium">{extractedData.exams?.length || 0} exams</p>
                      {extractedData.exams && extractedData.exams.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {extractedData.exams.slice(0, 2).map((exam, index) => (
                            <div key={index} className={`text-xs ${redirectToSignup ? 'blur-sm select-none pointer-events-none' : ''}`}>
                              <span className="font-medium">{exam.name}</span>
                              {exam.date && (
                                <span className="text-muted-foreground ml-2">
                                  - {formatDate(exam.date)}
                                </span>
                              )}
                            </div>
                          ))}
                          {extractedData.exams.length > 2 && (
                            <div className="relative group">
                              <div className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                +{extractedData.exams.length - 2} more exams
                              </div>
                              <div className="absolute bottom-full left-0 mb-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[400px] max-w-[90vw] sm:max-w-[500px]"
                                   role="tooltip" aria-label="All exams">
                                <div className="text-sm font-semibold mb-3 text-center text-gray-900 dark:text-gray-100">All Exams</div>
                                <div className="grid grid-cols-1 gap-2">
                                  {extractedData.exams.map((exam, index) => (
                                    <div key={index} className="text-xs p-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                      <div className="font-medium text-gray-900 dark:text-gray-100">{exam.name}</div>
                                      {exam.date && (
                                        <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                                          {formatDate(exam.date)}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-200 dark:border-t-gray-700"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Call to Action */}
              {redirectToSignup ? (
                // HOMEPAGE - Conversion-optimized design
                <div className="space-y-4">
                  <Card className="border-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 relative overflow-hidden shadow-2xl">
                    {/* Animated Background Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
                    
                    <CardContent className="p-10 text-center relative">
                      {/* Icon */}
                      <div className="flex justify-center mb-5">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-2xl opacity-60 rounded-full" />
                          <div className="relative p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-xl">
                            <Sparkles className="size-10 text-white animate-pulse" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Headline */}
                      <h3 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                          Analysis Complete!
                        </span>
                        <br />
                        <span className="text-gray-900 dark:text-white text-3xl md:text-4xl">
                          Ready to Ace Your Course?
                        </span>
                      </h3>
                      
                      {/* Value Proposition */}
                      <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg max-w-2xl mx-auto leading-relaxed">
                        Sign up now to unlock your <span className="font-bold text-purple-600 dark:text-purple-400">personalized AI tutor</span> for <span className="font-bold text-blue-600 dark:text-blue-400">{extractedData.courseName || 'your course'}</span>
                      </p>
                      
                      {/* Benefits */}
                      <div className="flex flex-wrap justify-center gap-3 mb-6">
                        <span className="inline-flex items-center gap-1.5 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full text-sm font-medium shadow-md">
                          <span className="text-green-500">✓</span>
                          Instant AI Answers
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full text-sm font-medium shadow-md">
                          <span className="text-blue-500">✓</span>
                          Study Plans
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full text-sm font-medium shadow-md">
                          <span className="text-purple-500">✓</span>
                          Exam Prep
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full text-sm font-medium shadow-md">
                          <span className="text-pink-500">✓</span>
                          24/7 Support
                        </span>
                      </div>
                      
                      {/* CTA Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
                        <Button 
                          onClick={handleSignUp} 
                          size="lg" 
                          className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-black text-xl px-10 py-7 shadow-2xl transform hover:scale-105 transition-all border-0 relative overflow-hidden group rounded-2xl"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="relative z-10 flex items-center gap-3">
                            <Sparkles className="size-6" />
                            Get Started Free
                            <ArrowRight className="size-6" />
                          </span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          onClick={removeFile} 
                          size="lg" 
                          className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold px-8 py-7 text-lg rounded-2xl"
                        >
                          Try Another Syllabus
                        </Button>
                      </div>
                      
                      
                      {/* Divider */}
                      <div className="flex items-center gap-3 max-w-md mx-auto mt-6">
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent flex-1" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">or upload another</span>
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent flex-1" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                // UPLOAD PAGE - Clean and professional
                <Card className="border-0 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <CheckCircle className="size-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Looks Good?</h3>
                    <p className="text-muted-foreground mb-6">
                      Confirm this syllabus to save it to your dashboard, or choose to upload another if something looks off.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button 
                        onClick={handleSignUp} 
                        size="lg" 
                        className="bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
                      >
                        <CheckCircle className="size-4 mr-2" />
                        <span>Confirm & Save</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={removeFile} 
                        size="lg" 
                        className="!bg-transparent !border-gray-300 !text-gray-700 hover:!bg-gray-50 hover:!text-gray-900 hover:!border-gray-300 dark:!border-gray-600 dark:!text-gray-300 dark:hover:!bg-gray-800 dark:hover:!text-gray-100 dark:hover:!border-gray-600"
                      >
                        Re-upload Syllabus
                      </Button>
                    </div>
                    <div className="mt-3 flex items-center gap-3 max-w-md mx-auto">
                      <div className="h-px bg-muted-foreground/30 flex-1" />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">Upload another syllabus</span>
                      <div className="h-px bg-muted-foreground/30 flex-1" />
                    </div>
                  </CardContent>
                </Card>
              )}
              
              
              {/* Security Message for Upload Page */}
              {!redirectToSignup && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
                    <Shield className="size-4" />
                    <p className="text-sm font-medium">
                      Your syllabus is secured safely and is only used to better match you with other students.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

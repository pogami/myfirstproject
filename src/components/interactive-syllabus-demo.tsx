"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Sparkles, CheckCircle, ArrowRight, Calendar, User, GraduationCap, BookOpen, Clock, Shield, File, AlertCircle, Info, Zap, Users, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/hooks/use-chat-store';
import { toast } from 'sonner';
import { AnalyzingIcon } from '@/components/icons/analyzing-icon';

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

interface UploadedSyllabus {
  id: string;
  fileName: string;
  courseName: string;
  courseCode: string;
  uploadDate: string;
  chatId: string;
}

interface InteractiveSyllabusDemoProps {
  className?: string;
  redirectToSignup?: boolean; // New prop to control redirect behavior
}

export default function InteractiveSyllabusDemo({ className, redirectToSignup = true }: InteractiveSyllabusDemoProps) {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);
  const [uploadedSyllabi, setUploadedSyllabi] = useState<UploadedSyllabus[]>([]);
  const [isClient, setIsClient] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { addChat, setCurrentTab, chats } = useChatStore();

  // Function to check for duplicate courses
  const checkForDuplicateCourse = (courseCode: string, courseName: string) => {
    const existingChats = Object.values(chats).filter(chat => 
      chat.chatType === 'class' && chat.courseData
    );
    
    // Check for exact course code match
    const exactMatch = existingChats.find(chat => 
      chat.courseData?.courseCode?.toLowerCase() === courseCode.toLowerCase()
    );
    
    if (exactMatch) {
      return exactMatch;
    }
    
    // Check for similar course name (fuzzy matching)
    const similarMatch = existingChats.find(chat => {
      const existingName = chat.courseData?.courseName?.toLowerCase() || '';
      const newName = courseName.toLowerCase();
      
      // Check if names are very similar (80% similarity)
      const similarity = calculateSimilarity(existingName, newName);
      return similarity > 0.8;
    });
    
    return similarMatch || null;
  };

  // Helper function to calculate string similarity
  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  // Helper function to calculate Levenshtein distance
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  // Set client flag after mount to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load uploaded syllabi from localStorage
  useEffect(() => {
    if (!isClient) return; // Wait for client-side hydration
    
    console.log('🔍 Attempting to load uploaded syllabi...');
    try {
      const saved = localStorage.getItem('uploaded-syllabi');
      console.log('📦 Raw localStorage data:', saved);
      
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('✅ Parsed syllabi count:', parsed.length);
        console.log('📋 Syllabi data:', parsed);
        setUploadedSyllabi(parsed);
      } else {
        console.log('⚠️ No syllabi found in localStorage');
      }
    } catch (error) {
      console.error('❌ Failed to load uploaded syllabi:', error);
    }
  }, [isClient]);

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
    if (file.type.startsWith('image/')) return 'IMAGE';
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
    if (file.type.startsWith('image/')) return 'bg-purple-100 text-purple-700 border-purple-200';
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
    const allowedTypes = [
      'text/plain', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf'
      // Image support temporarily disabled - OCR is slow and unreliable
      // 'image/jpeg',
      // 'image/jpg',
      // 'image/png',
      // 'image/gif',
      // 'image/webp'
    ];
    const allowedExtensions = ['.txt', '.docx', '.pdf'];
    // '.jpg', '.jpeg', '.png', '.gif', '.webp'
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(selectedFile.type) && !allowedExtensions.includes(fileExtension)) {
      setError('Please upload a TXT, DOCX, or PDF file.');
      return;
    }

    if (selectedFile.size > maxSize) {
      setError(`File too large. Maximum size is 10MB. Your file is ${(selectedFile.size / 1024 / 1024).toFixed(1)}MB`);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setExtractedData(null);
    setImagePreview(null); // Image support disabled
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only reset drag state if we're actually leaving the drop zone
    // (not just moving over a child element)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    // Check if mouse is still within the drop zone bounds
    if (
      x < rect.left ||
      x > rect.right ||
      y < rect.top ||
      y > rect.bottom
    ) {
      setIsDragOver(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setImagePreview(null);
    setExtractedData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteSyllabus = (syllabusId: string) => {
    if (typeof window === 'undefined') return;
    
    // Remove from state
    setUploadedSyllabi(prev => prev.filter(s => s.id !== syllabusId));
    
    // Update localStorage
    const updated = uploadedSyllabi.filter(s => s.id !== syllabusId);
    try {
      localStorage.setItem('uploaded-syllabi', JSON.stringify(updated));
      console.log('Syllabus removed:', syllabusId);
    } catch (error) {
      console.error('Error removing syllabus from localStorage:', error);
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
      
      // Log file type for debugging
      console.log('📄 File type detection:', {
        fileType: file.type,
        fileName: file.name,
        fileExtension: file.name.split('.').pop()?.toLowerCase()
      });
      
      if (file.type === 'text/plain') {
        console.log('✅ Detected as TXT file');
        text = await file.text();
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.toLowerCase().endsWith('.docx')) {
        console.log('✅ Detected as DOCX file');
          try {
            setProcessingStep('Reading DOCX content...');
            setProgress(20);
            
            // Use server-side DOCX processing
            console.log('Processing DOCX via server-side API...', { fileName: file.name, fileSize: file.size });
            
            const formData = new FormData();
            formData.append('file', file);
            
            // Add timeout to prevent hanging (30 seconds for DOCX)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
              controller.abort();
            }, 30000); // 30 seconds timeout
            
            try {
              const response = await fetch('/api/docx-extract', {
                method: 'POST',
                body: formData,
                signal: controller.signal
              });
              
              clearTimeout(timeoutId);
              
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
              console.log('✅ DOCX extraction successful via server-side API:', {
                textLength: text.length,
                fileName: result.metadata?.fileName
              });
              setProgress(50);
              
            } catch (fetchError: any) {
              clearTimeout(timeoutId);
              if (fetchError.name === 'AbortError') {
                throw new Error('DOCX processing timed out. The file may be too large or corrupted. Please try converting to TXT format.');
              }
              throw fetchError;
            }
            
          } catch (docxError: any) {
            console.error('❌ DOCX extraction error:', docxError);
            setError(docxError.message || 'Failed to extract text from DOCX');
            throw new Error(`Failed to extract text from DOCX: ${docxError.message}. Please try a TXT file instead.`);
          }
      } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          try {
            setProcessingStep('Preparing PDF for parsing...');
            setProgress(20);
            
            // Send PDF to server-side API route (pdf parsing runs on server only)
            console.log('Sending PDF to server for parsing...', { fileName: file.name, fileSize: file.size });
            
            const formData = new FormData();
            formData.append('file', file);
            
            setProgress(30);
            setProcessingStep('Course Connect is parsing PDF...');
            
            const response = await fetch('/api/test-pdf-upload', {
              method: 'POST',
              body: formData,
            });
            
            if (!response.ok) {
              // Try to get error details from response
              let errorData: any = {};
              const contentType = response.headers.get('content-type');
              
              if (contentType && contentType.includes('application/json')) {
                try {
                  errorData = await response.json();
                } catch (e) {
                  console.error('Failed to parse error JSON:', e);
                }
              } else {
                // If not JSON, try to get text
                try {
                  const text = await response.text();
                  console.error('Server returned non-JSON error:', text);
                  errorData = { error: text };
                } catch (e) {
                  console.error('Failed to read error response:', e);
                }
              }
              
              console.error('❌ Server Error Response:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData.error,
                details: errorData.details,
                stack: errorData.stack,
                fullError: errorData
              });
              
              const errorMessage = errorData.details || errorData.error || `Server error: ${response.status}`;
              throw new Error(errorMessage);
            }
            
            const result = await response.json();
            
            if (!result.text) {
              throw new Error('No text extracted from PDF');
            }
            
            text = result.text;
            
            console.log('PDF extraction successful (server-side parser):', {
              textLength: text.length,
              fileName: file.name
            });
            setProgress(50);
            
          } catch (pdfError: any) {
            console.error('PDF extraction error:', pdfError);
            setError(pdfError.message || 'Failed to extract text from PDF');
            throw new Error(`Failed to extract text from PDF: ${pdfError.message}. Please try a TXT or DOCX file instead.`);
          }
      } else if (false && (file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/i.test(file.name))) {
        // Image support temporarily disabled - OCR is slow and unreliable
          // Handle images with OCR
          let timeoutId: NodeJS.Timeout | null = null;
          try {
            console.log('✅ Detected as image file, using OCR');
            setProcessingStep('Extracting text from image with OCR...');
            setProgress(20);
            
            // Use dedicated OCR endpoint for faster, more reliable text extraction
            const ocrFormData = new FormData();
            ocrFormData.append('file', file);
            
            setProgress(30);
            setProcessingStep('Extracting text with OCR... (this may take 1-2 minutes, especially on first use)');
            
            // Create abort controller with longer timeout for OCR (120 seconds - OCR can be slow)
            const controller = new AbortController();
            timeoutId = setTimeout(() => {
              controller.abort();
            }, 120000); // 120 seconds timeout for OCR (2 minutes)
            
            // Step 1: Extract text using dedicated OCR endpoint
            const ocrResponse = await fetch('/api/ocr/extract-text', {
              method: 'POST',
              body: ocrFormData,
              signal: controller.signal,
            });
            
            if (timeoutId) clearTimeout(timeoutId);
            
            if (!ocrResponse.ok) {
              let errorData: any = {};
              try {
                errorData = await ocrResponse.json();
              } catch (e) {
                errorData = { error: `Server error: ${ocrResponse.status}` };
              }
              throw new Error(errorData.error || 'Failed to extract text from image');
            }
            
            const ocrResult = await ocrResponse.json();
            
            if (!ocrResult.success || !ocrResult.text || ocrResult.text.trim().length === 0) {
              throw new Error(ocrResult.error || 'No text extracted from image. Please try a clearer image.');
            }
            
            text = ocrResult.text;
            
            console.log('✅ Image OCR extraction successful:', {
              textLength: text.length,
              fileName: file.name,
              confidence: ocrResult.confidence,
              preview: text.substring(0, 100) + '...'
            });
            setProgress(50);
            
          } catch (imageError: any) {
            if (timeoutId) clearTimeout(timeoutId);
            console.error('❌ Image OCR extraction error:', imageError);
            
            let errorMessage = 'Failed to extract text from image';
            if (imageError.name === 'AbortError') {
              errorMessage = 'OCR processing timed out. The image might be too large or complex. Please try a smaller or simpler image.';
            } else if (imageError.message.includes('Failed to fetch')) {
              errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
            } else {
              errorMessage = imageError.message || 'Failed to extract text from image';
            }
            
            setError(errorMessage);
            throw new Error(`${errorMessage} Please try a clearer image, smaller file size, or a PDF/DOCX file.`);
          }
      } else {
        throw new Error('Unsupported file format. Please upload a TXT, DOCX, or PDF file.');
      }

      // Validate text content for all file types
      if (!text || text.trim().length === 0) {
        throw new Error('No text content found in the file. Please try a different file.');
      }

      // Process all supported file types with AI
      const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
      if (file.type === 'text/plain' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf') || isImage) {
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

      // Call AI extraction API with timeout
      console.log('🤖 Calling AI extraction API...', { textLength: text.length });
      setProcessingStep('Extracting course information with AI...');
      setProgress(85);
      
      const aiController = new AbortController();
      const aiTimeoutId = setTimeout(() => {
        aiController.abort();
      }, 30000); // 30 seconds timeout for AI extraction
      
      let response: Response;
      try {
        response = await fetch('/api/extract-syllabus-context', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            syllabusText: text
          }),
          signal: aiController.signal
        });
        clearTimeout(aiTimeoutId);
      } catch (fetchError: any) {
        clearTimeout(aiTimeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('AI extraction timed out. Please try again with a shorter syllabus or contact support.');
        }
        throw fetchError;
      }

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
      const errorMessage = err instanceof Error ? err.message : 'Failed to process syllabus. Please try again.';
      console.error('❌ Processing error:', err);
      console.error('❌ Error details:', {
        message: errorMessage,
        stack: err instanceof Error ? err.stack : undefined
      });
      setError(errorMessage);
      setProcessingStep('Error occurred');
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignUp = async () => {
    console.log('🚀 handleSignUp called!');
    console.log('🔍 redirectToSignup:', redirectToSignup);
    console.log('📋 extractedData:', extractedData);
    
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
      console.log('📤 Redirecting to signup...');
      // Mark this as a new signup from homepage
      localStorage.setItem('cc-new-signup', 'true');
      router.push('/signup');
    } else {
      console.log('✅ Authenticated user - creating chat...');
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
          // Check for duplicate courses before creating chat
          const existingChat = checkForDuplicateCourse(courseCode, courseName);
          
          if (existingChat) {
            // Show Sonar notification warning for duplicate
            toast.warning('Course Already Exists!', {
              description: `You already have a chat for ${courseCode} - ${courseName}. Would you like to go to the existing chat?`,
              duration: 8000,
              action: {
                label: 'Go to Chat',
                onClick: () => {
                  setCurrentTab(existingChat.id);
                  router.push(`/dashboard/chat?tab=${existingChat.id}`);
                }
              }
            });
            return;
          }
          
          // Create a unique chat ID for each syllabus upload
          const uniqueChatId = `${courseCode}-${courseName}-${Date.now()}`;
          
          console.log('Creating course chat with ID:', uniqueChatId);
          
          // Create the course chat with unique ID and wait for it to complete
          const chatCreated = await addChat(chatTitle, welcomeMessage, uniqueChatId, 'class', courseData);
          
          console.log('Chat creation result:', chatCreated);
          
          // Save to uploaded syllabi list
          console.log('💾 Saving syllabus to localStorage...');
          console.log('📁 File name:', file?.name);
          console.log('📚 Course name:', extractedData.courseName);
          console.log('🆔 Chat ID:', uniqueChatId);
          
          const uploadedSyllabus: UploadedSyllabus = {
            id: uniqueChatId,
            fileName: file?.name || 'Syllabus',
            courseName: extractedData.courseName || 'Unknown Course',
            courseCode: extractedData.courseCode || 'UNKNOWN',
            uploadDate: new Date().toISOString(),
            chatId: uniqueChatId
          };
          
          console.log('📝 Syllabus object:', uploadedSyllabus);
          console.log('📚 Current syllabi in state:', uploadedSyllabi);
          
          const updatedList = [...uploadedSyllabi, uploadedSyllabus];
          console.log('📦 Updated list:', updatedList);
          
          setUploadedSyllabi(updatedList);
          localStorage.setItem('uploaded-syllabi', JSON.stringify(updatedList));
          
          // Verify it was saved
          const verification = localStorage.getItem('uploaded-syllabi');
          console.log('✅ Verified localStorage content:', verification);
          console.log('✅ Successfully saved syllabus!');
          
          // Show success toast
          toast.success('Your syllabus has been uploaded successfully!', {
            description: `${courseName} is now ready for AI tutoring`,
            duration: 5000,
          });
          
          // Check for upcoming exams and assignments
          if (courseData.exams && courseData.exams.length > 0) {
            courseData.exams.forEach((exam: any) => {
              if (exam.date) {
                const examDate = new Date(exam.date);
                const today = new Date();
                const daysUntil = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                if (daysUntil === 1) {
                  toast.error(`Exam Alert!`, {
                    description: `Your ${courseCode} ${exam.name} is tomorrow at 2:00 PM. Don't forget to bring your calculator!`,
                    duration: 7000,
                  });
                } else if (daysUntil >= 0 && daysUntil <= 3) {
                  toast.warning(`Exam in ${daysUntil} days!`, {
                    description: `${courseCode} ${exam.name} on ${exam.date}`,
                    duration: 6000,
                  });
                }
              }
            });
          }
          
          if (courseData.assignments && courseData.assignments.length > 0) {
            courseData.assignments.forEach((assignment: any) => {
              if (assignment.dueDate) {
                const dueDate = new Date(assignment.dueDate);
                const today = new Date();
                const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                if (daysUntil === 2) {
                  toast.warning('Assignment Due Soon', {
                    description: `Your ${courseCode} ${assignment.name} is due in 2 days (${assignment.dueDate}).`,
                    duration: 6000,
                  });
                } else if (daysUntil >= 0 && daysUntil <= 3) {
                  toast.warning(`Assignment due in ${daysUntil} days`, {
                    description: `${courseCode} ${assignment.name} - ${assignment.dueDate}`,
                    duration: 5000,
                  });
                }
              }
            });
          }
          
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 
        Uploaded Syllabi List - ONLY SHOWS ON /dashboard/upload PAGE
        - NOT on home page (where redirectToSignup=true by default)
        - Only if user has previously uploaded syllabi and refreshed
      */}
      {!redirectToSignup && isClient && uploadedSyllabi.length > 0 && (
        <Card className="border-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              Your Uploaded Syllabi
            </CardTitle>
            <p className="text-sm text-muted-foreground">Click to view or remove uploaded courses</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {uploadedSyllabi.map((syllabus) => (
                <div 
                  key={syllabus.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors bg-card"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{syllabus.courseName}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span>{syllabus.courseCode}</span>
                        <span>•</span>
                        <span>{new Date(syllabus.uploadDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/dashboard/chat?chatId=${encodeURIComponent(syllabus.chatId)}`)}
                    >
                      View Chat
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
                      onClick={() => handleDeleteSyllabus(syllabus.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-xl">
        {redirectToSignup ? (
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
        ) : (
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-semibold">Upload Syllabus</CardTitle>
          </CardHeader>
        )}
        
        <CardContent className="space-y-6 pb-8">

          {!file && !extractedData && (
            <div
              className={`border-2 border-dashed rounded-xl py-16 px-8 text-center cursor-pointer transition-all duration-300 ${
                isDragOver 
                  ? 'border-purple-500 dark:border-purple-400 bg-purple-100/80 dark:bg-purple-900/30 shadow-lg scale-[1.02]' 
                  : 'border-purple-300 dark:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-950/20'
              }`}
              onDragEnter={handleDragEnter}
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
                accept=".docx,.txt,.pdf" 
              />
              
              <div className='flex justify-center mb-6'>
                <div className={`p-6 rounded-2xl transition-all duration-300 ${
                  isDragOver 
                    ? 'bg-gradient-to-br from-purple-200 to-purple-100 dark:from-purple-800/40 dark:to-purple-700/20 scale-110' 
                    : 'bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-800/10'
                }`}>
                  <Upload className={`size-16 transition-all duration-300 ${
                    isDragOver 
                      ? 'text-purple-700 dark:text-purple-300 scale-110' 
                      : 'text-purple-600 dark:text-purple-400'
                  }`} />
                </div>
              </div>
              
              <h3 className={`text-xl font-semibold mb-3 transition-all duration-300 ${
                isDragOver 
                  ? 'text-purple-700 dark:text-purple-300 scale-105' 
                  : 'text-foreground'
              }`}>
                {isDragOver ? 'Drop to upload' : 'Drop syllabus or click to browse'}
              </h3>
              <p className="text-base text-muted-foreground">
                PDF, DOCX, or TXT • Max 10MB
              </p>
            </div>
          )}

          {file && !extractedData && (
            <div className="space-y-4">
              {/* Enhanced File Preview */}
              <div className="p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {imagePreview ? (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-border/50 flex-shrink-0">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="text-sm font-semibold text-primary">{getFileTypeText(file)}</div>
                    )}
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
                
                {/* Full Image Preview for images */}
                {imagePreview && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-border/50 bg-muted/20">
                    <img 
                      src={imagePreview} 
                      alt="Syllabus preview" 
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                )}
                
                {/* Processing Time Estimate */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-4" />
                  <span>This usually takes 10-15 seconds</span>
                </div>
              </div>

              {/* Processing Steps */}
              {isProcessing && (
                <div className="space-y-6">
                  {/* Analyzing Animation */}
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      <AnalyzingIcon className="w-32 h-32 md:w-40 md:h-40 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-lg font-semibold text-primary">Analyzing...</p>
                      <p className="text-muted-foreground text-sm">{processingStep}</p>
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
                    Processing...
                  </>
                ) : (
                  <>
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
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                                <div className="text-sm font-semibold mb-3 text-center text-gray-900 dark:text-gray-100">Additional Topics</div>
                                <div className="grid grid-cols-2 gap-2">
                                  {extractedData.topics.slice(3).map((topic, index) => (
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
                                <div className="text-sm font-semibold mb-3 text-center text-gray-900 dark:text-gray-100">Additional Assignments</div>
                                <div className="grid grid-cols-1 gap-2">
                                  {extractedData.assignments.slice(3).map((assignment, index) => (
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
                            <div className={`relative ${redirectToSignup ? '' : 'group'}`}>
                              <div className={`text-xs text-muted-foreground ${redirectToSignup ? 'blur-sm select-none cursor-not-allowed' : 'cursor-pointer hover:text-foreground'}`}>
                                +{extractedData.exams.length - 2} more exams
                              </div>
                              {!redirectToSignup && (
                                <div className="absolute bottom-full left-0 mb-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[400px] max-w-[90vw] sm:max-w-[500px]"
                                     role="tooltip" aria-label="All exams">
                                <div className="text-sm font-semibold mb-3 text-center text-gray-900 dark:text-gray-100">Additional Exams</div>
                                <div className="grid grid-cols-1 gap-2">
                                  {extractedData.exams.slice(2).map((exam, index) => (
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
                              )}
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
                          <div className="relative p-5 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-xl">
                            <CheckCircle className="size-10 text-white" />
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
                          Upload Another
                        </Button>
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
                    {/* Removed helper text per request */}
                  </CardContent>
                </Card>
              )}
              
              
              {/* Privacy/processing disclaimer */}
              <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-900 dark:text-blue-100">
                  <Shield className="h-5 w-5" />
                  <span>Syllabus files are processed on our server to extract text; only the extracted text is sent for AI parsing. We never store original syllabus files, and all parsed course data saved to your account can be deleted.</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

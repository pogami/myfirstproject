"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Upload, CheckCircle, XCircle, AlertCircle, Shield, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createWorker } from 'tesseract.js';

interface StudentVerificationProps {
  onVerificationComplete?: (isVerified: boolean, verificationData?: any) => void;
  isSignup?: boolean;
}

interface VerificationResult {
  isVerified: boolean;
  extractedText?: string;
  confidence?: number;
  error?: string;
}

export function StudentIdVerification({ onVerificationComplete, isSignup = false }: StudentVerificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt' | 'unavailable'>('prompt');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = useCallback(async () => {
    try {
      console.log('Requesting camera access...');
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      });
      
      console.log('Camera access granted, setting up stream...');
      setStream(mediaStream);
      setCameraPermission('granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Wait for video to load
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          if (videoRef.current) {
            videoRef.current.play().catch(console.error);
          }
        };
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraPermission('denied');
      
      let errorMessage = "Please allow camera access to verify your student ID, or upload a photo instead.";
      
      if (error.name === 'NotAllowedError') {
        errorMessage = "Camera access was denied. Please allow camera access in your browser settings and try again.";
      } else if (error.name === 'NotFoundError') {
        errorMessage = "No camera found on this device. Please use the upload option instead.";
      } else if (error.name === 'NotSupportedError') {
        errorMessage = "Camera not supported on this device. Please use the upload option instead.";
      }
      
      toast({
        variant: "destructive",
        title: "Camera Access Failed",
        description: errorMessage,
      });
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
    
    // Stop camera after capture
    stopCamera();
  }, [stopCamera]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload an image file (JPG, PNG, etc.).",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCapturedImage(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const preprocessImage = useCallback((imageDataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(imageDataUrl);
          return;
        }

        // Set canvas size
        canvas.width = img.width;
        canvas.height = img.height;

        // Apply image preprocessing
        ctx.drawImage(img, 0, 0);
        
        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply contrast and brightness adjustments
        for (let i = 0; i < data.length; i += 4) {
          // Increase contrast
          data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.2 + 128));     // Red
          data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.2 + 128)); // Green
          data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.2 + 128)); // Blue
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = imageDataUrl;
    });
  }, []);

  const extractTextFromImage = useCallback(async (imageDataUrl: string): Promise<VerificationResult> => {
    let worker;
    try {
      console.log('Starting real OCR processing...');
      
      // Preprocess the image
      const processedImage = await preprocessImage(imageDataUrl);
      
      // Create Tesseract worker
      worker = await createWorker('eng');
      
      // Perform OCR on the processed image
      const { data: { text, confidence } } = await worker.recognize(processedImage);
      
      console.log('OCR Results:', { text, confidence });
      
      // Clean up the extracted text
      const cleanedText = text.trim().replace(/\s+/g, ' ');
      
      // Enhanced student ID detection logic
      const upperText = cleanedText.toUpperCase();
      
      // 1. Check for explicit student ID keywords
      const studentIdKeywords = [
        'STUDENT ID', 'STUDENT CARD', 'STUDENT', 'ID CARD', 'STUDENT NUMBER',
        'STUDENT IDENTIFICATION', 'CAMPUS ID', 'UNIVERSITY ID'
      ];
      
      const hasExplicitStudentId = studentIdKeywords.some(keyword => 
        upperText.includes(keyword)
      );
      
      // 2. Check for university/college names (strong indicator)
      const universityNames = [
        'UNIVERSITY', 'COLLEGE', 'INSTITUTE', 'ACADEMY', 'SCHOOL',
        'STATE', 'COMMUNITY', 'TECHNICAL', 'MEDICAL', 'LAW', 'POLYTECHNIC'
      ];
      
      const hasUniversityName = universityNames.some(name => 
        upperText.includes(name)
      );
      
      // 3. Check for common student ID number patterns
      const studentIdPatterns = [
        /\b\d{6,12}\b/, // 6-12 digit ID
        /\b[A-Z]{2,4}\d{6,10}\b/, // Letter prefix + digits (e.g., UC123456)
        /\b\d{2,4}[A-Z]\d{6,8}\b/, // Digits + letter + digits
        /\b[A-Z]\d{7,10}\b/, // Single letter + digits
        /\bSTUDENT\s*ID\s*#?\s*\d+/i, // "Student ID: 123456"
        /\bID\s*#?\s*\d+/i, // "ID: 123456"
        /\bCARD\s*#?\s*\d+/i // "Card: 123456"
      ];
      
      const hasStudentIdPattern = studentIdPatterns.some(pattern => 
        pattern.test(cleanedText)
      );
      
      // 4. Check for academic year/graduation patterns
      const academicPatterns = [
        /\b(20\d{2}|19\d{2})\b/, // Years like 2024, 2025
        /\b(FRESHMAN|SOPHOMORE|JUNIOR|SENIOR|GRADUATE|UNDERGRAD)/i,
        /\b(CLASS\s*OF\s*\d{4})/i,
        /\b(EXPIRES?|VALID\s*THRU|EXPIRY)\s*\d{1,2}[\/\-]\d{1,2}[\/\-]?\d{2,4}/i
      ];
      
      const hasAcademicPattern = academicPatterns.some(pattern => 
        pattern.test(cleanedText)
      );
      
      // 5. Check for common student ID card elements
      const cardElements = [
        'PHOTO', 'SIGNATURE', 'BARCODE', 'QR CODE', 'MAGNETIC STRIP',
        'ISSUED', 'ISSUE DATE', 'VALID', 'EXPIRES', 'EXPIRY'
      ];
      
      const hasCardElements = cardElements.some(element => 
        upperText.includes(element)
      );
      
      // 6. Scoring system for validation
      let score = 0;
      
      if (hasExplicitStudentId) score += 40; // Strong indicator
      if (hasUniversityName) score += 30; // Strong indicator
      if (hasStudentIdPattern) score += 25; // Medium indicator
      if (hasAcademicPattern) score += 15; // Medium indicator
      if (hasCardElements) score += 10; // Weak indicator
      
      // Adjust score based on OCR confidence
      const confidenceMultiplier = Math.min(confidence / 50, 1); // Normalize confidence
      const finalScore = score * confidenceMultiplier;
      
      // Determine if this looks like a valid student ID
      const isValidStudentId = finalScore >= 25; // Lower threshold for real OCR
      
      console.log('Student ID Validation:', {
        hasExplicitStudentId,
        hasUniversityName,
        hasStudentIdPattern,
        hasAcademicPattern,
        hasCardElements,
        score,
        confidence,
        finalScore,
        isValidStudentId
      });
      
      return {
        isVerified: isValidStudentId,
        extractedText: cleanedText,
        confidence: confidence / 100 // Convert to 0-1 scale
      };
      
    } catch (error) {
      console.error('OCR processing error:', error);
      return {
        isVerified: false,
        error: 'Failed to process image. Please try again with a clearer image.'
      };
    } finally {
      // Clean up worker
      if (worker) {
        await worker.terminate();
      }
    }
  }, [preprocessImage]);

  const handleVerification = useCallback(async () => {
    if (!capturedImage) return;

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const result = await extractTextFromImage(capturedImage);
      setVerificationResult(result);
      
      if (result.isVerified) {
        toast({
          title: "Verification Successful!",
          description: "Your student status has been verified.",
        });
        onVerificationComplete?.(true, result);
      } else {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: result.error || "Could not verify student ID. Please try again with a clearer image.",
        });
        onVerificationComplete?.(false, result);
      }
    } catch (error) {
      console.error('Verification error:', error);
      const errorResult: VerificationResult = {
        isVerified: false,
        error: 'An unexpected error occurred during verification.'
      };
      setVerificationResult(errorResult);
      onVerificationComplete?.(false, errorResult);
    } finally {
      setIsVerifying(false);
    }
  }, [capturedImage, extractTextFromImage, onVerificationComplete]);

  const resetVerification = useCallback(() => {
    setCapturedImage(null);
    setVerificationResult(null);
    setIsVerifying(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    resetVerification();
    stopCamera();
  }, [resetVerification, stopCamera]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-14 text-lg font-semibold border-2 border-gray-200/50 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-blue-100/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 dark:border-gray-700/50 dark:hover:border-blue-400">
          <Shield className="w-4 h-4 mr-2" />
          {isSignup ? "Verify Student Status" : "Verify Student ID"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-3">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Student ID Verification
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground max-w-md mx-auto">
            Verify your student status to access exclusive features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Simplified Privacy Information */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              🔒 Your ID is processed locally and never stored
            </p>
          </div>

          {/* Verification Steps */}
          {!capturedImage && !verificationResult && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Choose Method</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Take a photo or upload your student ID
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Camera Option */}
                <Card className="group cursor-pointer hover:shadow-md transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-600 bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10" onClick={startCamera}>
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Take Photo</h4>
                    <p className="text-xs text-muted-foreground">
                      Use your camera
                    </p>
                  </CardContent>
                </Card>

                {/* Upload Option */}
                <Card 
                  className="group cursor-pointer hover:shadow-md transition-all duration-300 border-2 hover:border-green-300 dark:hover:border-green-600 bg-gradient-to-br from-green-50/50 to-green-100/30 dark:from-green-950/20 dark:to-green-900/10" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Upload Image</h4>
                    <p className="text-xs text-muted-foreground">
                      Choose from files
                    </p>
                  </CardContent>
                </Card>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Camera View */}
          {stream && !capturedImage && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Position Your Student ID</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Make sure the text is clear and readable
                </p>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 text-left">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    📋 Looking for: University name, "Student ID" text, ID number, expiration date
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg"
                />
                <div className="absolute inset-0 border-4 border-dashed border-blue-400 rounded-xl pointer-events-none">
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg">
                    📱 Position ID here
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    Good lighting
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 justify-center">
                <Button onClick={captureImage} size="sm" className="flex-1 max-w-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Camera className="w-4 h-4 mr-2" />
                  Capture
                </Button>
                <Button variant="outline" size="sm" onClick={stopCamera} className="px-4">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Captured Image Preview */}
          {capturedImage && !verificationResult && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Review Your Image</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Make sure your student ID is clearly visible
                </p>
              </div>
              
              <div className="relative bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
                <img
                  src={capturedImage}
                  alt="Captured student ID"
                  className="w-full h-64 object-contain rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-sm"
                />
                <div className="absolute top-2 right-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-full">
                  ✓ Captured
                </div>
              </div>
              
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={handleVerification} 
                  disabled={isVerifying}
                  size="sm"
                  className="flex-1 max-w-xs bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify ID
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={resetVerification} className="px-4">
                  Retake
                </Button>
              </div>
            </div>
          )}

          {/* Verification Result */}
          {verificationResult && (
            <div className="space-y-4">
              <div className="text-center">
                {verificationResult.isVerified ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-600 mb-1">Verification Successful!</h3>
                      <p className="text-sm text-muted-foreground">
                        Student status verified and saved
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                      <XCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-red-600 mb-1">Verification Failed</h3>
                      <p className="text-sm text-muted-foreground">
                        {verificationResult.error || "Could not verify student ID"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {verificationResult.extractedText && (
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Extracted Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border">
                      <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                        {verificationResult.extractedText}
                      </pre>
                    </div>
                    {verificationResult.confidence && (
                      <div className="mt-3 flex items-center gap-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          Confidence: {Math.round(verificationResult.confidence * 100)}%
                        </Badge>
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${verificationResult.confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={closeDialog} 
                  size="sm"
                  className="flex-1 max-w-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {verificationResult.isVerified ? "Continue" : "Try Again"}
                </Button>
                {!verificationResult.isVerified && (
                  <Button variant="outline" size="sm" onClick={resetVerification} className="px-4">
                    Retake
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bot, Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { processSyllabusWithAI, ExtractedSyllabusData, SemanticMatch } from '@/lib/ai-syllabus-matcher';
import { SyllabusSignature } from '@/lib/syllabus-processor';

interface UploadResult {
  extractedData: ExtractedSyllabusData;
  signature: SyllabusSignature;
  matches: {
    fuzzyMatches: any[];
    semanticMatches: SemanticMatch[];
    bestMatch: SemanticMatch | null;
    recommendation: 'join' | 'create' | 'confirm';
  };
  embedding: any;
}

export default function SyllabusUploadAdvanced() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userConfirmation, setUserConfirmation] = useState<'join' | 'create' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Process the syllabus
      const result = await processSyllabusWithAI(file, 'current-user-id');
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadResult(result);

      // Auto-confirm if confidence is high and recommendation is clear
      if (result.extractedData.confidence >= 0.8 && result.matches.recommendation !== 'confirm') {
        setUserConfirmation(result.matches.recommendation);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process syllabus');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmation = (decision: 'join' | 'create') => {
    setUserConfirmation(decision);
    // Here you would implement the actual chat creation/joining logic
    console.log(`User chose to ${decision} chat`);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return <Badge className="bg-green-100 text-green-800">High</Badge>;
    if (confidence >= 0.6) return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    return <Badge className="bg-red-100 text-red-800">Low</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Advanced Syllabus Upload
          </CardTitle>
          <CardDescription>
            Upload your syllabus in any format. We'll extract course information and find matching study groups.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* File Input */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.pptx,.txt,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="mb-4"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isUploading ? 'Processing...' : 'Choose Syllabus File'}
              </Button>
              <p className="text-sm text-gray-600">
                Supports PDF, DOCX, PPTX, TXT, JPG, PNG files
              </p>
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing syllabus...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {uploadResult && (
        <div className="space-y-6">
          {/* Extracted Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Extracted Information
                {getConfidenceBadge(uploadResult.extractedData.confidence)}
              </CardTitle>
              <CardDescription>
                Confidence: <span className={getConfidenceColor(uploadResult.extractedData.confidence)}>
                  {Math.round(uploadResult.extractedData.confidence * 100)}%
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Course Code</label>
                  <p className="text-lg font-semibold">
                    {uploadResult.extractedData.courseCode || 'Not detected'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Course Title</label>
                  <p className="text-lg font-semibold">
                    {uploadResult.extractedData.courseTitle || 'Not detected'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Instructor</label>
                  <p className="text-lg font-semibold">
                    {uploadResult.extractedData.instructor || 'Not detected'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">University</label>
                  <p className="text-lg font-semibold">
                    {uploadResult.extractedData.university || 'Not detected'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Semester</label>
                  <p className="text-lg font-semibold">
                    {uploadResult.extractedData.semester || 'Not detected'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Year</label>
                  <p className="text-lg font-semibold">
                    {uploadResult.extractedData.year || 'Not detected'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Matching Results */}
          {uploadResult.matches.bestMatch && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Found Matching Study Group
                </CardTitle>
                <CardDescription>
                  Similarity: {Math.round(uploadResult.matches.bestMatch.similarity * 100)}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900">Match Details</h4>
                    <p className="text-blue-700 text-sm mt-1">
                      {uploadResult.matches.bestMatch.reason}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Course Code</label>
                      <p className="font-semibold">{uploadResult.matches.bestMatch.signature.courseCode}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Course Title</label>
                      <p className="font-semibold">{uploadResult.matches.bestMatch.signature.courseTitle}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">University</label>
                      <p className="font-semibold">{uploadResult.matches.bestMatch.signature.university}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Semester/Year</label>
                      <p className="font-semibold">
                        {uploadResult.matches.bestMatch.signature.semester} {uploadResult.matches.bestMatch.signature.year}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Confirmation */}
          {uploadResult.matches.recommendation === 'confirm' && !userConfirmation && (
            <Card>
              <CardHeader>
                <CardTitle>Confirm Course Match</CardTitle>
                <CardDescription>
                  We found a similar course, but need your confirmation to proceed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    onClick={() => handleConfirmation('join')}
                    className="flex-1"
                    variant="default"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Join Existing Group
                  </Button>
                  <Button
                    onClick={() => handleConfirmation('create')}
                    className="flex-1"
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Create New Group
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Final Action */}
          {userConfirmation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  {userConfirmation === 'join' ? 'Joining Study Group' : 'Creating New Study Group'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-lg font-semibold text-green-600">
                    {userConfirmation === 'join' 
                      ? 'You will be added to the existing study group.' 
                      : 'A new study group will be created for this course.'
                    }
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    You can start chatting with your classmates now!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Match Found */}
          {!uploadResult.matches.bestMatch && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  No Matching Groups Found
                </CardTitle>
                <CardDescription>
                  We'll create a new study group for this course.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-lg font-semibold">
                    You'll be the first to join this course's study group!
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Other students taking the same course will be able to find and join your group.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

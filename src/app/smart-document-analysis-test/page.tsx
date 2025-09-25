'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSmartDocumentAnalysis } from '@/hooks/use-smart-document-analysis';
import { Loader2, FileText, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface AnalysisResult {
  id: string;
  fileName: string;
  fileType: string;
  status: 'pending' | 'analyzing' | 'success' | 'error';
  extractedText: string;
  summary?: string;
  metadata?: {
    wordCount?: number;
    pageCount?: number;
    language?: string;
  };
  confidence?: number;
  error?: string;
  userPrompt?: string;
}

export default function SmartDocumentAnalysisTestPage() {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [userPrompt, setUserPrompt] = useState('');

  const onAnalysisComplete = async (result, fileName) => {
    setResults(prev => prev.map(res => 
      res.fileName === fileName 
        ? { 
            ...res, 
            status: result.success ? 'success' : 'error', 
            extractedText: result.extractedText,
            summary: result.summary,
            metadata: result.metadata,
            confidence: result.confidence,
            error: result.error 
          } 
        : res
    ));
    setCurrentFile(null);
    setUserPrompt('');
  };

  const onAnalysisError = (error, fileName) => {
    setResults(prev => prev.map(res => 
      res.fileName === fileName 
        ? { ...res, status: 'error', error: error } 
        : res
    ));
    setCurrentFile(null);
    setUserPrompt('');
  };

  const { analyzeDocument, isAnalyzing } = useSmartDocumentAnalysis({
    onAnalysisComplete,
    onAnalysisError
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCurrentFile(file);

    const newResult: AnalysisResult = {
      id: `${file.name}-${Date.now()}`,
      fileName: file.name,
      fileType: file.type,
      status: 'analyzing',
      extractedText: 'Analyzing document...',
      userPrompt: userPrompt || undefined
    };
    setResults(prev => [newResult, ...prev]);

    await analyzeDocument(file, userPrompt || undefined);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <FileText className="h-5 w-5 text-blue-500" />;
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="h-5 w-5 text-indigo-500" />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <FileText className="h-5 w-5 text-green-500" />;
    if (fileType.includes('text')) return <FileText className="h-5 w-5 text-gray-500" />;
    return <FileText className="h-5 w-5 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <Card className="w-full max-w-6xl mx-auto bg-gray-800 border-gray-700 shadow-lg">
        <CardHeader className="border-b border-gray-700">
          <CardTitle className="text-2xl font-bold text-white flex items-center">
            <FileText className="mr-2 h-6 w-6 text-purple-400" /> Smart Document Analysis Demo
          </CardTitle>
          <p className="text-gray-400 mt-2">
            Upload documents and get AI-powered analysis. You can also ask specific questions about your documents.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6 space-y-4">
            {/* Optional User Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Optional: Ask a specific question about your document
              </label>
              <Textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="e.g., 'What are the main points?' or 'Summarize the key findings'"
                className="w-full bg-gray-900 border-gray-700 text-gray-200 resize-y"
                rows={2}
              />
            </div>

            {/* File Upload */}
            <div>
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOCX, XLSX, Images (JPG, PNG), TXT</p>
                </div>
                <Input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                  accept=".pdf,.doc,.docx,.xlsx,.xls,image/png,image/jpeg,image/jpg,image/gif,image/webp,text/plain"
                  disabled={isAnalyzing}
                />
              </label>
              {isAnalyzing && (
                <div className="mt-4 flex items-center space-x-2 text-purple-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Analyzing {currentFile?.name || 'file'}...</span>
                </div>
              )}
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-4 text-white">Analysis Results:</h3>
          <ScrollArea className="h-[600px] w-full rounded-md border border-gray-700 p-4 bg-gray-900">
            {results.length === 0 ? (
              <p className="text-gray-500 text-center py-10">Upload a document to see analysis results here.</p>
            ) : (
              <div className="space-y-6">
                {results.map((res) => (
                  <Card key={res.id} className={cn(
                    "bg-gray-800 border",
                    res.status === 'success' && "border-green-500",
                    res.status === 'error' && "border-red-500",
                    res.status === 'analyzing' && "border-purple-500"
                  )}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex items-center space-x-2">
                        {getFileIcon(res.fileType)}
                        <CardTitle className="text-lg font-medium text-white">{res.fileName}</CardTitle>
                        {res.userPrompt && (
                          <Badge variant="outline" className="text-xs">
                            Q: {res.userPrompt}
                          </Badge>
                        )}
                      </div>
                      <Badge className={cn(
                        res.status === 'success' && "bg-green-500 hover:bg-green-600",
                        res.status === 'error' && "bg-red-500 hover:bg-red-600",
                        res.status === 'analyzing' && "bg-purple-500 hover:bg-purple-600"
                      )}>
                        {res.status === 'analyzing' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {res.status === 'success' && <CheckCircle className="mr-2 h-4 w-4" />}
                        {res.status === 'error' && <AlertTriangle className="mr-2 h-4 w-4" />}
                        {res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      {res.status === 'error' ? (
                        <div className="bg-red-900/30 border border-red-700 text-red-300 p-3 rounded-md text-sm">
                          <strong className="font-semibold">Error:</strong> {res.error}
                        </div>
                      ) : (
                        <>
                          <div className="text-sm text-gray-300 mb-4">
                            {res.metadata?.wordCount && <span className="mr-4">📊 Word Count: {res.metadata.wordCount}</span>}
                            {res.metadata?.pageCount && <span className="mr-4">📄 Pages: {res.metadata.pageCount}</span>}
                            {res.confidence && <span className="mr-4">🎯 OCR Confidence: {res.confidence}%</span>}
                            <span>📁 File Type: {res.fileType.toUpperCase()}</span>
                          </div>
                          
                          {res.summary && (
                            <div className="mb-4">
                              <h4 className="text-lg font-semibold text-white mb-2">🤖 AI Analysis:</h4>
                              <div className="bg-gray-900 border border-gray-700 text-gray-200 p-4 rounded-md whitespace-pre-wrap">
                                {res.summary}
                              </div>
                            </div>
                          )}
                          
                          <div>
                            <h4 className="text-lg font-semibold text-white mb-2">📄 Extracted Text:</h4>
                            <Textarea
                              value={res.extractedText}
                              readOnly
                              className="w-full h-48 bg-gray-900 border-gray-700 text-gray-200 resize-y font-mono text-sm"
                            />
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
          <div className="mt-6 text-center">
            <Button onClick={() => setResults([])} variant="outline" className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600">
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

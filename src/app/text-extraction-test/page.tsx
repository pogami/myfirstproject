'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTextExtraction } from '@/hooks/use-text-extraction';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Image, FileSpreadsheet, File } from 'lucide-react';

export default function TextExtractionTestPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [extractionResults, setExtractionResults] = useState<Record<string, any>>({});
  const { toast } = useToast();

  const { extractText, isExtracting } = useTextExtraction({
    onExtractionComplete: (result, fileName) => {
      console.log('Extraction completed for:', fileName, result);
      setExtractionResults(prev => ({
        ...prev,
        [fileName]: result
      }));
    },
    onExtractionError: (error, fileName) => {
      console.error('Extraction failed for:', fileName, error);
      setExtractionResults(prev => ({
        ...prev,
        [fileName]: { success: false, error }
      }));
    },
    showToast: false // Disable toasts for cleaner testing
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadedFiles(prev => [...prev, file]);

    try {
      console.log('Testing text extraction for:', file.name);
      const result = await extractText(file);
      console.log('Extraction result:', result);
      
      setExtractionResults(prev => ({
        ...prev,
        [file.name]: result
      }));
    } catch (error) {
      console.error('Test extraction error:', error);
      setExtractionResults(prev => ({
        ...prev,
        [file.name]: { success: false, error: error.message }
      }));
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="h-8 w-8 text-green-500" />;
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <FileSpreadsheet className="h-8 w-8 text-orange-500" />;
    if (fileType === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const clearResults = () => {
    setUploadedFiles([]);
    setExtractionResults({});
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Text Extraction Test Demo</h1>
        <p className="text-gray-600 mb-4">
          Upload files to test the text extraction functionality. This demo will show you exactly what text is extracted from your files.
        </p>
        
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <input
              type="file"
              id="file-upload"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp"
              className="hidden"
            />
            <Button
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isExtracting}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isExtracting ? 'Extracting...' : 'Upload File'}
            </Button>
          </div>
          <Button variant="outline" onClick={clearResults}>
            Clear Results
          </Button>
        </div>

        {isExtracting && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-blue-800">Extracting text from file...</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {uploadedFiles.map((file, index) => {
          const result = extractionResults[file.name];
          
          return (
            <Card key={index} className="w-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {getFileIcon(file.type)}
                  <div>
                    <CardTitle className="text-lg">{file.name}</CardTitle>
                    <p className="text-sm text-gray-500">
                      {file.type} • {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`font-medium ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                        {result.success ? 'Extraction Successful' : 'Extraction Failed'}
                      </span>
                    </div>

                    {result.success ? (
                      <div className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold mb-2">Extracted Text:</h4>
                          <div className="bg-white border rounded p-3 max-h-64 overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-sm">{result.text}</pre>
                          </div>
                        </div>

                        {result.metadata && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="bg-blue-50 p-3 rounded">
                              <div className="font-medium text-blue-800">File Type</div>
                              <div className="text-blue-600">{result.fileType?.toUpperCase()}</div>
                            </div>
                            {result.metadata.wordCount && (
                              <div className="bg-green-50 p-3 rounded">
                                <div className="font-medium text-green-800">Word Count</div>
                                <div className="text-green-600">{result.metadata.wordCount}</div>
                              </div>
                            )}
                            {result.metadata.pageCount && (
                              <div className="bg-purple-50 p-3 rounded">
                                <div className="font-medium text-purple-800">Pages</div>
                                <div className="text-purple-600">{result.metadata.pageCount}</div>
                              </div>
                            )}
                            {result.confidence && (
                              <div className="bg-orange-50 p-3 rounded">
                                <div className="font-medium text-orange-800">Confidence</div>
                                <div className="text-orange-600">{result.confidence}%</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-800 mb-2">Error:</h4>
                        <p className="text-red-700">{result.error}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">Waiting for extraction...</div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {uploadedFiles.length === 0 && (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No files uploaded yet</h3>
              <p className="text-gray-500 text-center">
                Upload a file to test the text extraction functionality. Supported formats include:
                <br />
                PDF, Word documents (.doc, .docx), Excel files (.xls, .xlsx), images, and text files.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Debug Information</h3>
        <p className="text-yellow-700 text-sm">
          Check the browser console (F12) to see detailed extraction logs and any errors that occur during processing.
        </p>
      </div>
    </div>
  );
}

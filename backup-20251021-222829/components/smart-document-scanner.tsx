"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Camera, 
  Upload, 
  FileText, 
  Search, 
  BookOpen, 
  Tag, 
  Download, 
  Share, 
  Edit, 
  Trash2, 
  Eye, 
  Brain, 
  Zap,
  Image as ImageIcon,
  File,
  CheckCircle,
  AlertCircle,
  Clock,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase/client';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { storage } from '@/lib/firebase/client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ScannedDocument {
  id: string;
  title: string;
  course: string;
  topic: string;
  type: 'handwritten' | 'textbook' | 'assignment' | 'notes';
  originalImage: string;
  extractedText: string;
  confidence: number;
  tags: string[];
  createdAt: string;
  processedAt: string;
  aiAnalysis?: {
    summary: string;
    keyPoints: string[];
    questions: string[];
    relatedTopics: string[];
  };
}

interface ScanSession {
  id: string;
  name: string;
  documents: ScannedDocument[];
  createdAt: string;
  course?: string;
}

export function SmartDocumentScanner() {
  const [scannedDocuments, setScannedDocuments] = useState<ScannedDocument[]>([]);
  const [scanSessions, setScanSessions] = useState<ScanSession[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ScannedDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentSession, setCurrentSession] = useState<ScanSession | null>(null);
  const [newDocument, setNewDocument] = useState({
    title: '',
    course: '',
    topic: '',
    type: 'handwritten' as const
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Sample data for demonstration
  React.useEffect(() => {
    const sampleDocuments: ScannedDocument[] = [
      {
        id: '1',
        title: 'Calculus Derivative Rules',
        course: 'Calculus I',
        topic: 'Derivatives',
        type: 'handwritten',
        originalImage: '/api/placeholder/400/300',
        extractedText: 'Derivative Rules:\n\n1. Power Rule: d/dx[x^n] = nx^(n-1)\n2. Product Rule: d/dx[f(x)g(x)] = f\'(x)g(x) + f(x)g\'(x)\n3. Chain Rule: d/dx[f(g(x))] = f\'(g(x)) * g\'(x)\n\nExamples:\n- d/dx[x^3] = 3x^2\n- d/dx[sin(x)] = cos(x)',
        confidence: 0.95,
        tags: ['derivatives', 'rules', 'calculus'],
        createdAt: '2024-01-10T10:00:00Z',
        processedAt: '2024-01-10T10:05:00Z',
        aiAnalysis: {
          summary: 'Handwritten notes covering fundamental derivative rules including power rule, product rule, and chain rule with examples.',
          keyPoints: [
            'Power Rule: d/dx[x^n] = nx^(n-1)',
            'Product Rule: d/dx[f(x)g(x)] = f\'(x)g(x) + f(x)g\'(x)',
            'Chain Rule: d/dx[f(g(x))] = f\'(g(x)) * g\'(x)'
          ],
          questions: [
            'What is the derivative of x^5?',
            'How do you apply the product rule?',
            'When should you use the chain rule?'
          ],
          relatedTopics: ['limits', 'integration', 'applications']
        }
      },
      {
        id: '2',
        title: 'Python Functions Lab',
        course: 'Computer Science Fundamentals',
        topic: 'Functions',
        type: 'assignment',
        originalImage: '/api/placeholder/400/300',
        extractedText: 'Lab Assignment: Python Functions\n\nWrite a function that calculates the factorial of a number.\n\nRequirements:\n- Use recursion\n- Handle edge cases\n- Include docstring\n\nExample:\nfactorial(5) should return 120',
        confidence: 0.88,
        tags: ['python', 'functions', 'recursion', 'lab'],
        createdAt: '2024-01-12T14:30:00Z',
        processedAt: '2024-01-12T14:35:00Z',
        aiAnalysis: {
          summary: 'Lab assignment requiring implementation of a recursive factorial function in Python with proper documentation.',
          keyPoints: [
            'Implement factorial function using recursion',
            'Handle edge cases (0, negative numbers)',
            'Include proper docstring documentation'
          ],
          questions: [
            'How do you implement factorial recursively?',
            'What edge cases should be handled?',
            'How to write a proper docstring?'
          ],
          relatedTopics: ['recursion', 'python basics', 'documentation']
        }
      }
    ];
    setScannedDocuments(sampleDocuments);
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsScanning(true);
    
    try {
      const file = files[0];
      
      // Upload image to Firebase Storage
      const storageRef = ref(storage, `scanned-documents/${Date.now()}-${file.name}`);
      const uploadResult = await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(uploadResult.uploadTask.snapshot.ref);
      
      // Process with OCR API
      const ocrResponse = await fetch('/api/ocr/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          language: 'en',
          documentType: newDocument.type
        })
      });

      if (!ocrResponse.ok) {
        throw new Error('OCR processing failed');
      }

      const { extractedText, confidence, aiAnalysis } = await ocrResponse.json();
      
      // Save document to Firebase
      const documentsRef = collection(db, 'scannedDocuments');
      const docRef = await addDoc(documentsRef, {
        title: newDocument.title || `Scanned Document ${scannedDocuments.length + 1}`,
        course: newDocument.course || 'General',
        topic: newDocument.topic || 'Notes',
        type: newDocument.type,
        originalImage: imageUrl,
        extractedText,
        confidence,
        tags: ['scanned', 'ocr'],
        createdAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        aiAnalysis,
        userId: 'current-user' // This would be the actual user ID
      });

      const newDocumentData: ScannedDocument = {
        id: docRef.id,
        title: newDocument.title || `Scanned Document ${scannedDocuments.length + 1}`,
        course: newDocument.course || 'General',
        topic: newDocument.topic || 'Notes',
        type: newDocument.type,
        originalImage: imageUrl,
        extractedText,
        confidence,
        tags: ['scanned', 'ocr'],
        createdAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        aiAnalysis
      };

      setScannedDocuments([newDocumentData, ...scannedDocuments]);
      
      toast({
        title: "Document Scanned!",
        description: "Your document has been processed and is ready for review.",
      });
    } catch (error) {
      console.error('Error processing document:', error);
      toast({
        title: "Error",
        description: "Failed to process document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const startScanningSession = () => {
    const session: ScanSession = {
      id: `session-${Date.now()}`,
      name: `Scan Session ${scanSessions.length + 1}`,
      documents: [],
      createdAt: new Date().toISOString()
    };
    setCurrentSession(session);
    setScanSessions([session, ...scanSessions]);
  };

  const processWithAI = async (document: ScannedDocument) => {
    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const updatedDocument = {
      ...document,
      aiAnalysis: {
        summary: 'Enhanced AI analysis of the document content with detailed insights and recommendations.',
        keyPoints: [
          'Enhanced key point 1 with more detail',
          'Enhanced key point 2 with context',
          'Enhanced key point 3 with examples'
        ],
        questions: [
          'Enhanced question 1 for deeper understanding',
          'Enhanced question 2 for practical application',
          'Enhanced question 3 for critical thinking'
        ],
        relatedTopics: ['Advanced topic 1', 'Advanced topic 2', 'Advanced topic 3']
      }
    };

    setScannedDocuments(scannedDocuments.map(doc => 
      doc.id === document.id ? updatedDocument : doc
    ));
    
    if (selectedDocument?.id === document.id) {
      setSelectedDocument(updatedDocument);
    }
    
    setIsProcessing(false);
    
    toast({
      title: "AI Analysis Complete!",
      description: "Enhanced analysis has been generated for this document.",
    });
  };

  const filteredDocuments = scannedDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.extractedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCourse = !filterCourse || doc.course === filterCourse;
    const matchesType = !filterType || doc.type === filterType;
    
    return matchesSearch && matchesCourse && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'handwritten': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'textbook': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'assignment': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'notes': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Camera className="h-6 w-6 text-primary" />
            Smart Document Scanner
          </h2>
          <p className="text-muted-foreground">
            Scan handwritten notes, textbooks, and assignments with AI-powered OCR and analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={startScanningSession} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            New Session
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} disabled={isScanning}>
            <Upload className="h-4 w-4 mr-2" />
            {isScanning ? 'Scanning...' : 'Scan Document'}
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        multiple
      />

      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="scanner">Scanner</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">All Courses</option>
                <option value="Calculus I">Calculus I</option>
                <option value="Computer Science Fundamentals">CS Fundamentals</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">All Types</option>
                <option value="handwritten">Handwritten</option>
                <option value="textbook">Textbook</option>
                <option value="assignment">Assignment</option>
                <option value="notes">Notes</option>
              </select>
            </div>
          </div>

          {/* Document Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{document.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{document.course}</p>
                    </div>
                    <Badge className={getTypeColor(document.type)}>
                      {document.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">OCR Confidence</span>
                      <span className={`text-sm font-medium ${getConfidenceColor(document.confidence)}`}>
                        {Math.round(document.confidence * 100)}%
                      </span>
                    </div>
                    <Progress value={document.confidence * 100} className="h-1" />
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {document.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {document.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{document.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setSelectedDocument(document)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => processWithAI(document)}
                      disabled={isProcessing}
                    >
                      <Brain className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Scanner Tab */}
        <TabsContent value="scanner" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Document Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Document Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="docTitle">Document Title</Label>
                  <Input
                    id="docTitle"
                    value={newDocument.title}
                    onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                    placeholder="Enter document title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docCourse">Course</Label>
                  <Input
                    id="docCourse"
                    value={newDocument.course}
                    onChange={(e) => setNewDocument({ ...newDocument, course: e.target.value })}
                    placeholder="Enter course name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docTopic">Topic</Label>
                  <Input
                    id="docTopic"
                    value={newDocument.topic}
                    onChange={(e) => setNewDocument({ ...newDocument, topic: e.target.value })}
                    placeholder="Enter topic"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docType">Document Type</Label>
                  <select
                    id="docType"
                    value={newDocument.type}
                    onChange={(e) => setNewDocument({ ...newDocument, type: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="handwritten">Handwritten Notes</option>
                    <option value="textbook">Textbook Page</option>
                    <option value="assignment">Assignment</option>
                    <option value="notes">Digital Notes</option>
                  </select>
                </div>
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Document</h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop images or click to browse
                </p>
                <Button onClick={() => fileInputRef.current?.click()} disabled={isScanning}>
                  <Upload className="h-4 w-4 mr-2" />
                  {isScanning ? 'Processing...' : 'Choose Files'}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports JPG, PNG, PDF formats
                </p>
              </div>

              {/* OCR Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold">OCR Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <select className="w-full px-3 py-2 border rounded-md">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quality</Label>
                    <select className="w-full px-3 py-2 border rounded-md">
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="fast">Fast</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Smart Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Search across all scanned documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                {searchQuery && (
                  <div className="space-y-3">
                    <h3 className="font-semibold">Search Results</h3>
                    {filteredDocuments.map((document) => (
                      <div key={document.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{document.title}</h4>
                          <Badge className={getTypeColor(document.type)}>
                            {document.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{document.course} • {document.topic}</p>
                        <p className="text-sm">{document.extractedText.substring(0, 200)}...</p>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" onClick={() => setSelectedDocument(document)}>
                            View Full Document
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Scan Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scanSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{session.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {session.documents.length} documents • {new Date(session.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{selectedDocument.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedDocument.course} • {selectedDocument.topic}
                </p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedDocument(null)} className="hover:bg-transparent">
                ×
              </Button>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[70vh]">
              <Tabs defaultValue="text" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="text">Extracted Text</TabsTrigger>
                  <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                  <TabsTrigger value="image">Original Image</TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">{selectedDocument.extractedText}</pre>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => navigator.clipboard.writeText(selectedDocument.extractedText)}>
                      <Download className="h-4 w-4 mr-2" />
                      Copy Text
                    </Button>
                    <Button variant="outline">
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="analysis" className="space-y-4">
                  {selectedDocument.aiAnalysis ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Summary</h3>
                        <p className="text-sm">{selectedDocument.aiAnalysis.summary}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Key Points</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {selectedDocument.aiAnalysis.keyPoints.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Study Questions</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {selectedDocument.aiAnalysis.questions.map((question, index) => (
                            <li key={index}>{question}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Related Topics</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedDocument.aiAnalysis.relatedTopics.map((topic, index) => (
                            <Badge key={index} variant="outline">{topic}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No AI analysis available</p>
                      <Button onClick={() => processWithAI(selectedDocument)} disabled={isProcessing}>
                        <Zap className="h-4 w-4 mr-2" />
                        Generate AI Analysis
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="image" className="space-y-4">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

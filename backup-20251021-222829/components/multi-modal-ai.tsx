'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Mic, 
  FileText, 
  Image, 
  Video, 
  Upload, 
  Brain, 
  Zap,
  Eye,
  Ear,
  Type,
  Code,
  Calculator,
  Globe,
  Palette,
  Music,
  Loader2,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProcessingResult {
  id: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'document';
  input: string;
  output: string;
  confidence: number;
  processingTime: number;
  timestamp: Date;
  analysis?: {
    sentiment?: 'positive' | 'negative' | 'neutral';
    language?: string;
    topics?: string[];
    entities?: string[];
    summary?: string;
  };
}

interface MultiModalAIProps {
  onResult?: (result: ProcessingResult) => void;
}

export function MultiModalAI({ onResult }: MultiModalAIProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'text' | 'image' | 'audio' | 'video' | 'document'>('text');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const modes = [
    {
      id: 'text',
      name: 'Text Analysis',
      icon: <Type className="h-5 w-5" />,
      description: 'Analyze and process text content',
      color: 'bg-blue-500',
      capabilities: ['Sentiment Analysis', 'Language Detection', 'Topic Extraction', 'Summarization']
    },
    {
      id: 'image',
      name: 'Image Processing',
      icon: <Image className="h-5 w-5" />,
      description: 'Analyze images and visual content',
      color: 'bg-green-500',
      capabilities: ['Object Detection', 'Text Extraction', 'Scene Analysis', 'Color Analysis']
    },
    {
      id: 'audio',
      name: 'Audio Processing',
      icon: <Mic className="h-5 w-5" />,
      description: 'Process and analyze audio content',
      color: 'bg-purple-500',
      capabilities: ['Speech Recognition', 'Audio Classification', 'Transcription', 'Sentiment Analysis']
    },
    {
      id: 'video',
      name: 'Video Analysis',
      icon: <Video className="h-5 w-5" />,
      description: 'Analyze video content and motion',
      color: 'bg-red-500',
      capabilities: ['Motion Detection', 'Object Tracking', 'Scene Recognition', 'Audio Extraction']
    },
    {
      id: 'document',
      name: 'Document Processing',
      icon: <FileText className="h-5 w-5" />,
      description: 'Process and analyze documents',
      color: 'bg-orange-500',
      capabilities: ['Text Extraction', 'Layout Analysis', 'Content Summarization', 'Metadata Extraction']
    }
  ];

  const processContent = async (content: string, type: ProcessingResult['type']) => {
    setIsProcessing(true);
    
    try {
      // Simulate AI processing based on content type
      const processingTime = Math.random() * 2000 + 1000;
      await new Promise(resolve => setTimeout(resolve, processingTime));

      let output = '';
      let confidence = 0;
      let analysis: ProcessingResult['analysis'] = {};

      switch (type) {
        case 'text':
          output = generateTextAnalysis(content);
          confidence = 92;
          analysis = {
            sentiment: getSentiment(content),
            language: 'English',
            topics: extractTopics(content),
            entities: extractEntities(content),
            summary: generateSummary(content)
          };
          break;
        
        case 'image':
          output = generateImageAnalysis(content);
          confidence = 88;
          analysis = {
            topics: ['Objects', 'Scenes', 'Text'],
            summary: 'Image contains multiple objects and text elements'
          };
          break;
        
        case 'audio':
          output = generateAudioAnalysis(content);
          confidence = 85;
          analysis = {
            sentiment: 'neutral',
            language: 'English',
            summary: 'Audio contains clear speech with background noise'
          };
          break;
        
        case 'video':
          output = generateVideoAnalysis(content);
          confidence = 90;
          analysis = {
            topics: ['Motion', 'Objects', 'Scenes'],
            summary: 'Video shows dynamic content with multiple moving objects'
          };
          break;
        
        case 'document':
          output = generateDocumentAnalysis(content);
          confidence = 94;
          analysis = {
            topics: ['Academic Content', 'Structured Text'],
            summary: 'Document contains well-structured academic content'
          };
          break;
      }

      const result: ProcessingResult = {
        id: Date.now().toString(),
        type,
        input: content,
        output,
        confidence,
        processingTime,
        timestamp: new Date(),
        analysis
      };

      setResults(prev => [result, ...prev]);
      onResult?.(result);

      toast({
        title: "Processing Complete!",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} analysis finished successfully.`,
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Processing Failed",
        description: "Failed to process content. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateTextAnalysis = (text: string): string => {
    const wordCount = text.split(' ').length;
    const charCount = text.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    
    return `Text Analysis Results:
• Word Count: ${wordCount}
• Character Count: ${charCount}
• Sentences: ${sentences}
• Reading Level: ${wordCount > 100 ? 'Advanced' : 'Intermediate'}
• Key Topics: Programming, Education, Technology
• Sentiment: Positive
• Language: English (99% confidence)`;
  };

  const generateImageAnalysis = (image: string): string => {
    return `Image Analysis Results:
• Objects Detected: 5 (person, laptop, book, pen, notebook)
• Text Extracted: "Study Session", "CS-101", "Chapter 3"
• Scene Type: Indoor Study Environment
• Dominant Colors: Blue (40%), White (35%), Gray (25%)
• Quality: High resolution, good lighting
• Confidence: 88%`;
  };

  const generateAudioAnalysis = (audio: string): string => {
    return `Audio Analysis Results:
• Speech Detected: Yes (95% confidence)
• Language: English
• Speaker: Single speaker, clear voice
• Background Noise: Minimal
• Transcription: "Let's review the data structures chapter..."
• Sentiment: Neutral/Educational
• Duration: 2 minutes 34 seconds`;
  };

  const generateVideoAnalysis = (video: string): string => {
    return `Video Analysis Results:
• Motion Detected: Yes (multiple moving objects)
• Objects Tracked: Person, laptop screen, hand gestures
• Scene Changes: 3 transitions detected
• Audio Track: Present (speech and ambient sound)
• Quality: HD (1080p)
• Duration: 5 minutes 12 seconds
• Key Moments: 2 highlighted sections`;
  };

  const generateDocumentAnalysis = (document: string): string => {
    return `Document Analysis Results:
• Document Type: Academic Paper/Study Material
• Pages: 12
• Sections: 5 (Introduction, Methods, Results, Discussion, Conclusion)
• Images: 3 diagrams, 2 charts
• Tables: 2 data tables
• References: 15 citations
• Reading Time: ~25 minutes
• Complexity: Intermediate to Advanced`;
  };

  const getSentiment = (text: string): 'positive' | 'negative' | 'neutral' => {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disappointing'];
    
    const words = text.toLowerCase().split(' ');
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  };

  const extractTopics = (text: string): string[] => {
    const topics = ['programming', 'education', 'technology', 'study', 'learning', 'computer science'];
    return topics.filter(topic => text.toLowerCase().includes(topic));
  };

  const extractEntities = (text: string): string[] => {
    const entities = ['Python', 'JavaScript', 'React', 'Node.js', 'Database', 'Algorithm'];
    return entities.filter(entity => text.includes(entity));
  };

  const generateSummary = (text: string): string => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.slice(0, 2).join('. ') + '.';
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileName = file.name;
      const fileType = file.type.split('/')[0] as ProcessingResult['type'];
      
      processContent(fileName, fileType);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      const fileType = file.type.split('/')[0] as ProcessingResult['type'];
      processContent(file.name, fileType);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'text': return <Type className="h-4 w-4" />;
      case 'image': return <Eye className="h-4 w-4" />;
      case 'audio': return <Ear className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-blue-600';
    if (confidence >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Multi-Modal AI Processing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modes.map((mode) => (
              <div
                key={mode.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedMode === mode.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedMode(mode.id as any)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-full ${mode.color} flex items-center justify-center text-white`}>
                    {mode.icon}
                  </div>
                  <div>
                    <h4 className="font-medium">{mode.name}</h4>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{mode.description}</p>
                <div className="space-y-1">
                  {mode.capabilities.slice(0, 2).map((capability) => (
                    <Badge key={capability} variant="outline" className="text-xs">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Processing Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getModeIcon(selectedMode)}
            {modes.find(m => m.id === selectedMode)?.name} Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Content for Analysis</h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop files or click to browse
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </>
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              accept={
                selectedMode === 'image' ? 'image/*' :
                selectedMode === 'audio' ? 'audio/*' :
                selectedMode === 'video' ? 'video/*' :
                selectedMode === 'document' ? '.pdf,.doc,.docx,.txt' :
                '*/*'
              }
              className="hidden"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid gap-2 md:grid-cols-2">
            <Button
              variant="outline"
              onClick={() => processContent('Sample text content for analysis', 'text')}
              disabled={isProcessing}
            >
              <Type className="h-4 w-4 mr-2" />
              Analyze Sample Text
            </Button>
            <Button
              variant="outline"
              onClick={() => processContent('sample-image.jpg', 'image')}
              disabled={isProcessing}
            >
              <Image className="h-4 w-4 mr-2" />
              Analyze Sample Image
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Processing Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((result) => (
              <div key={result.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getModeIcon(result.type)}
                    <span className="font-medium capitalize">{result.type} Analysis</span>
                    <Badge variant="outline">
                      {result.confidence}% confidence
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {result.timestamp.toLocaleTimeString()}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-sm mb-1">Input:</h5>
                    <p className="text-sm text-muted-foreground">{result.input}</p>
                  </div>

                  <div>
                    <h5 className="font-medium text-sm mb-1">Analysis:</h5>
                    <div className="bg-muted/50 rounded p-3">
                      <pre className="text-sm whitespace-pre-wrap">{result.output}</pre>
                    </div>
                  </div>

                  {result.analysis && (
                    <div className="grid gap-2 md:grid-cols-2">
                      {result.analysis.sentiment && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Sentiment:</span>
                          <Badge variant={
                            result.analysis.sentiment === 'positive' ? 'default' :
                            result.analysis.sentiment === 'negative' ? 'destructive' : 'secondary'
                          }>
                            {result.analysis.sentiment}
                          </Badge>
                        </div>
                      )}
                      {result.analysis.language && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Language:</span>
                          <Badge variant="outline">{result.analysis.language}</Badge>
                        </div>
                      )}
                      {result.analysis.topics && result.analysis.topics.length > 0 && (
                        <div className="md:col-span-2">
                          <span className="text-sm font-medium">Topics:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {result.analysis.topics.map((topic) => (
                              <Badge key={topic} variant="secondary" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

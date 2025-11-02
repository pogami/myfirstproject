'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Shield, AlertTriangle, CheckCircle, ExternalLink, Copy, FileText, Search, Bot, User, Brain, Target, Lightbulb, BarChart3 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PlagiarismResult {
  isPlagiarized: boolean;
  similarityScore: number;
  matchedSources: Array<{
    url: string;
    title: string;
    similarity: number;
    matchedText: string;
    snippet: string;
  }>;
  suggestions: string[];
  aiDetection?: {
    isLikelyAI: boolean;
    confidence: number;
    reasoning: string[];
  };
  detailedAnalysis?: {
    writingStyle: string;
    vocabularyComplexity: number;
    coherenceScore: number;
    patterns: string[];
  };
}

export default function PlagiarismChecker() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [minLength, setMinLength] = useState(50);
  const [activeTab, setActiveTab] = useState('overview');

  const checkPlagiarism = async () => {
    if (!text.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter text to check',
        variant: 'destructive'
      });
      return;
    }

    if (text.length < 20) {
      toast({
        title: 'Error',
        description: 'Text must be at least 20 characters long',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Starting plagiarism check with text:', text.substring(0, 100) + '...');
      const response = await fetch('/api/plagiarism/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, minLength })
      });

      const data = await response.json();
      console.log('Plagiarism check response:', data);

      if (data.success) {
        setResult(data.result);
        console.log('Plagiarism result set:', data.result);
        toast({
          title: 'Analysis Complete',
          description: 'Plagiarism check completed successfully!'
        });
      } else {
        throw new Error(data.error || 'Failed to check plagiarism');
      }
    } catch (error) {
      console.error('Plagiarism check error:', error);
      toast({
        title: 'Error',
        description: 'Failed to check plagiarism. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const generateEnhancedReport = (result: PlagiarismResult) => {
    let report = `=== COMPREHENSIVE TEXT ANALYSIS REPORT ===\n\n`;
    
    // Plagiarism ANALYSIS
    report += `PLAGIARISM ANALYSIS:\n`;
    report += `Similarity Score: ${result.similarityScore}%\n`;
    report += `Status: ${getStatusText(result.isPlagiarized, result.similarityScore)}\n\n`;
    
    // AI Detection
    if (result.aiDetection) {
      report += `AI DETECTION ANALYSIS:\n`;
      report += `Detection Confidence: ${result.aiDetection.confidence}%\n`;
      report += `Likely AI-Generated: ${result.aiDetection.isLikelyAI ? 'Yes' : 'No'}\n`;
      if (result.aiDetection.reasoning.length > 0) {
        report += `Evidence:\n${result.aiDetection.reasoning.map((r, i) => `  • ${r}`).join('\n')}\n`;
      }
      report += `\n`;
    }
    
    // Writing Analysis
    if (result.detailedAnalysis) {
      report += `WRITING STYLE ANALYSIS:\n`;
      report += `Style: ${result.detailedAnalysis.writingStyle}\n`;
      report += `Vocabulary Complexity: ${result.detailedAnalysis.vocabularyComplexity}%\n`;
      report += `Coherence Score: ${result.detailedAnalysis.coherenceScore}%\n`;
      report += `Patterns:\n${result.detailedAnalysis.patterns.map((p, i) => `  • ${p}`).join('\n')}\n\n`;
    }
    
    // Sources
    if (result.matchedSources.length > 0) {
      report += `MATCHED SOURCES:\n`;
      result.matchedSources.forEach((source, i) => {
        report += `${i + 1}. ${source.title} (${Math.round(source.similarity)}% similarity)\n`;
        report += `   URL: ${source.url}\n`;
        report += `   Snippet: ${source.snippet}\n\n`;
      });
    }
    
    // Recommendations
    report += `RECOMMENDATIONS:\n`;
    result.suggestions.forEach((suggestion, i) => {
      report += `${i + 1}. ${suggestion}\n`;
    });
    
    report += `\n=== End of Report ===`;
    return report;
  };

  const getSimilarityBadgeColor = (score: number) => {
    if (score >= 70) return 'bg-red-100 text-red-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusIcon = (isPlagiarized: boolean, score: number) => {
    if (isPlagiarized || score >= 70) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    } else if (score >= 40) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    } else {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getStatusText = (isPlagiarized: boolean, score: number) => {
    if (isPlagiarized || score >= 70) {
      return 'High Risk - Plagiarism Detected';
    } else if (score >= 40) {
      return 'Medium Risk - Similar Content Found';
    } else {
      return 'Low Risk - Original Content';
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Plagiarism Checker
          </CardTitle>
          <CardDescription>
            Check your text for plagiarism by searching the internet for similar content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Text to Check</label>
              <Textarea
                placeholder="Paste your text here to check for plagiarism..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="mt-1 min-h-[200px]"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {text.length} characters
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">Min length:</label>
                  <select
                    value={minLength}
                    onChange={(e) => setMinLength(Number(e.target.value))}
                    className="text-xs border rounded px-2 py-1"
                  >
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                  </select>
                </div>
              </div>
            </div>

            <Button 
              onClick={checkPlagiarism} 
              disabled={loading || text.length < 20}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking for Plagiarism...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Check for Plagiarism
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Results Section */}
      {result && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(result.isPlagiarized, result.similarityScore)}
                Analysis Results
            </CardTitle>
              <Badge variant="outline" className="text-xs">
                Analysis Complete
              </Badge>
            </div>
            <CardDescription>
              {getStatusText(result.isPlagiarized, result.similarityScore)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="sources" className="flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  Sources
                </TabsTrigger>
                <TabsTrigger value="ai-analysis" className="flex items-center gap-1">
                  <Bot className="h-3 w-3" />
                  AI Analysis
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" />
                  Tips
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Similarity Score */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Plagiarism Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                          <Progress value={result.similarityScore} className="h-2" />
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Similarity</span>
                <Badge className={getSimilarityBadgeColor(result.similarityScore)}>
                  {result.similarityScore}%
                </Badge>
              </div>
                        </div>
                    </CardContent>
                  </Card>

                  {/* AI Detection Score */}
                  {result.aiDetection && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Bot className="h-4 w-4" />
                          AI Detection
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
              <Progress 
                            value={result.aiDetection.confidence} 
                            className={`h-2 ${result.aiDetection.isLikelyAI ? 'text-red-500' : 'text-green-500'}`}
                          />
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Confidence</span>
                            <Badge variant={result.aiDetection.isLikelyAI ? "destructive" : "default"}>
                              {result.aiDetection.confidence}%
                            </Badge>
                          </div>
            </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Writing Analysis */}
                  {result.detailedAnalysis && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          Writing Style
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">
                            Style: {result.detailedAnalysis.writingStyle}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Complexity</span>
                            <Badge variant="outline">
                              {result.detailedAnalysis.vocabularyComplexity}%
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Plagiarism Status */}
                  <Card className={result.isPlagiarized ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        {result.isPlagiarized ? (
                          <>
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <div>
                              <div className="text-sm font-medium text-red-700">High Risk</div>
                              <div className="text-xs text-red-600">Plagiarized Content</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                              <div className="text-sm font-medium text-green-700">Low Risk</div>
                              <div className="text-xs text-green-600">Original Content</div>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Detection Status */}
                  {result.aiDetection && (
                    <Card className={result.aiDetection.isLikelyAI ? "border-orange-200 bg-orange-50" : "border-blue-200 bg-blue-50"}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          {result.aiDetection.isLikelyAI ? (
                            <>
                              <Bot className="h-5 w-5 text-orange-500" />
                              <div>
                                <div className="text-sm font-medium text-orange-700">AI-Generated</div>
                                <div className="text-xs text-orange-600">Likely AI Content</div>
                              </div>
                            </>
                          ) : (
                            <>
                              <User className="h-5 w-5 text-blue-500" />
                              <div>
                                <div className="text-sm font-medium text-blue-700">Human-Written</div>
                                <div className="text-xs text-blue-600">Likely Original</div>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Sources Tab */}
              <TabsContent value="sources" className="space-y-4 mt-6">
                {result.matchedSources.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Matching Sources ({result.matchedSources.length})
                    </h3>
                    <div className="space-y-3">
                      {result.matchedSources.map((source, index) => (
                        <Card key={index} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <a 
                                href={source.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-primary hover:underline flex items-center gap-2"
                              >
                                {source.title}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                              <Badge variant="secondary">
                                {source.similarity}% match
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <Progress value={source.similarity} className="h-1" />
                              <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                        {source.snippet}
                      </p>
                      </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Matching Sources Found</h3>
                    <p className="text-muted-foreground">Your text appears to be original content.</p>
              </div>
            )}
              </TabsContent>

              {/* AI Analysis Tab */}
              <TabsContent value="ai-analysis" className="space-y-4 mt-6">
                {result.aiDetection || result.detailedAnalysis ? (
                  <div className="space-y-4">
                    {result.aiDetection && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Bot className="h-5 w-5" />
                            AI Generation Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Detection Confidence</span>
                            <Badge variant={result.aiDetection.isLikelyAI ? "destructive" : "default"}>
                              {result.aiDetection.confidence}%
                            </Badge>
                          </div>
                          <Progress value={result.aiDetection.confidence} className="h-2" />
                          
                          {result.aiDetection.reasoning.length > 0 && (
              <div className="space-y-2">
                              <h4 className="text-sm font-medium">Detection Reasoning:</h4>
                              <ul className="space-y-1">
                                {result.aiDetection.reasoning.map((reason, index) => (
                                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <Target className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {result.detailedAnalysis && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5" />
                            Writing Style Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Writing Style</div>
                              <Badge variant="outline">{result.detailedAnalysis.writingStyle}</Badge>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Vocabulary Complexity</div>
                              <div className="flex items-center gap-2">
                                <Progress value={result.detailedAnalysis.vocabularyComplexity} className="flex-1 h-1" />
                                <span className="text-xs">{result.detailedAnalysis.vocabularyComplexity}%</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Coherence Score</div>
                              <div className="flex items-center gap-2">
                                <Progress value={result.detailedAnalysis.coherenceScore} className="flex-1 h-1" />
                                <span className="text-xs">{result.detailedAnalysis.coherenceScore}%</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-2">Writing Patterns:</h4>
                            <div className="space-y-1">
                              {result.detailedAnalysis.patterns.map((pattern, index) => (
                                <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  {pattern}
                  </div>
                ))}
              </div>
            </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Analysis Not Available</h3>
                    <p className="text-muted-foreground">Advanced analysis features require additional processing.</p>
                  </div>
                )}
              </TabsContent>

              {/* Suggestions Tab */}
              <TabsContent value="suggestions" className="space-y-4 mt-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Recommendations & Tips
                  </h3>
                  <div className="space-y-3">
                    {result.suggestions.map((suggestion, index) => (
                      <Card key={index} className="border-l-4 border-l-yellow-500">
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{suggestion}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
             <div className="flex gap-3 pt-6 mt-6 border-t">
              <Button
                variant="outline"
                onClick={() => {
                   const report = generateEnhancedReport(result);
                  navigator.clipboard.writeText(report);
                  toast({
                     title: 'Report Copied',
                     description: 'Complete analysis report copied to clipboard'
                  });
                }}
                 className="flex-1"
              >
                 <Copy className="mr-2 h-4 w-4" />
                 Copy Full Report
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setText('');
                  setResult(null);
                }}
                 className="flex-1"
              >
                 Analyze New Text
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

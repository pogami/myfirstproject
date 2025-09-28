'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Shield, AlertTriangle, CheckCircle, ExternalLink, Copy, FileText, Search } from 'lucide-react';
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
}

export default function PlagiarismChecker() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [minLength, setMinLength] = useState(50);

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
      const response = await fetch('/api/plagiarism/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, minLength })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.result);
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

      {/* Results Section */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(result.isPlagiarized, result.similarityScore)}
              Plagiarism Analysis Results
            </CardTitle>
            <CardDescription>
              {getStatusText(result.isPlagiarized, result.similarityScore)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Score */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Similarity Score</span>
                <Badge className={getSimilarityBadgeColor(result.similarityScore)}>
                  {result.similarityScore}%
                </Badge>
              </div>
              <Progress 
                value={result.similarityScore} 
                className="h-2"
              />
              <p className={`text-sm ${getSimilarityColor(result.similarityScore)}`}>
                {result.similarityScore >= 70 
                  ? 'High similarity detected - review required'
                  : result.similarityScore >= 40
                  ? 'Medium similarity - consider reviewing'
                  : 'Low similarity - content appears original'
                }
              </p>
            </div>

            {/* Matched Sources */}
            {result.matchedSources.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Matched Sources ({result.matchedSources.length})</h4>
                <div className="space-y-3">
                  {result.matchedSources.map((source, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="text-sm font-medium line-clamp-1">{source.title}</h5>
                          <p className="text-xs text-gray-500 truncate">{source.url}</p>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {Math.round(source.similarity)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {source.snippet}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(source.url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Source
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(source.matchedText);
                            toast({
                              title: 'Copied',
                              description: 'Matched text copied to clipboard'
                            });
                          }}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy Text
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Suggestions</h4>
              <div className="space-y-2">
                {result.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                    <FileText className="h-4 w-4 mt-0.5 text-gray-500" />
                    <p className="text-sm text-gray-700">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  const report = `Plagiarism Check Report\n\nSimilarity Score: ${result.similarityScore}%\nStatus: ${getStatusText(result.isPlagiarized, result.similarityScore)}\n\nMatched Sources:\n${result.matchedSources.map((s, i) => `${i + 1}. ${s.title} (${Math.round(s.similarity)}%)\n   ${s.url}`).join('\n')}\n\nSuggestions:\n${result.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
                  navigator.clipboard.writeText(report);
                  toast({
                    title: 'Copied',
                    description: 'Report copied to clipboard'
                  });
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Report
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setText('');
                  setResult(null);
                }}
              >
                Check Another Text
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Bot, ExternalLink } from "lucide-react";

interface Source {
  title: string;
  url: string;
  snippet: string;
}

interface TestResult {
  question: string;
  answer: string;
  sources: Source[];
  model: string;
  timestamp: string;
  lucyWebSearch: boolean;
}

export default function TestLucyDemo() {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/lucy-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          context: 'Test Demo',
          conversationHistory: [],
          shouldCallAI: true,
          isPublicChat: false,
          hasAIMention: undefined,
          timestamp: undefined
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setResult({
        question: question.trim(),
        answer: data.answer || 'No answer provided',
        sources: data.sources || [],
        model: data.provider || 'Unknown',
        timestamp: new Date().toISOString(),
        lucyWebSearch: true // This demo uses Lucy web search
      });

    } catch (err: any) {
      console.error('Test error:', err);
      setError(err.message || 'An error occurred during testing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleTest();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Bot className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Google Gemini AI Demo</h1>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Test Google Gemini 1.5 Flash AI - direct AI responses powered by Google's latest language model.
          </p>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            Model: Google Gemini 1.5 Flash
          </Badge>
        </div>

        {/* Test Input */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-400" />
              Test Question
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about current information (e.g., 'What is Elon Musk's current net worth?')"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                disabled={isLoading}
              />
              <Button 
                onClick={handleTest} 
                disabled={isLoading || !question.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {/* Quick Test Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuestion("What is Elon Musk's current net worth?")}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Elon Musk Net Worth
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuestion("What are the latest AI developments in 2024?")}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Latest AI News
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuestion("What is the current price of Bitcoin?")}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Bitcoin Price
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="bg-red-900 border-red-700">
            <CardContent className="pt-6">
              <p className="text-red-200">Error: {error}</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* AI Response */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-400" />
                  Gemini's Response
                </CardTitle>
                <div className="flex gap-2 text-sm text-gray-400">
                  <Badge variant="outline" className="border-purple-600 text-purple-400">
                    {result.model}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                    Temperature: 0.7
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                    Max Tokens: 2000
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800">
                    Top-P: 0.9
                  </Badge>
                  <Badge variant="outline" className="border-green-600 text-green-400">
                    Pure Gemini AI
                  </Badge>
                  <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-200 whitespace-pre-wrap">{result.answer}</p>
                </div>
              </CardContent>
            </Card>

            {/* Sources */}
            {result.sources.length > 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-blue-400" />
                    Web Search Sources ({result.sources.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.sources.map((source, index) => (
                    <div key={index} className="p-3 bg-gray-700 rounded-lg border border-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white mb-1 line-clamp-2">
                            {source.title}
                          </h4>
                          {source.url && (
                            <a 
                              href={source.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-sm break-all"
                            >
                              {source.url}
                            </a>
                          )}
                          {source.snippet && (
                            <p className="text-gray-300 text-sm mt-2 line-clamp-3">
                              {source.snippet}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Debug Info */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Debug Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>Question: {result.question}</div>
                  <div>Model: {result.model}</div>
                  <div>Sources Count: {result.sources.length}</div>
                  <div>Multi-Strategy Search: Yes</div>
                  <div>Timestamp: {result.timestamp}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">How This Demo Works</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-2">
            <p>1. <strong>DuckDuckGo Search:</strong> Searches for current information from real websites</p>
            <p>2. <strong>Source Extraction:</strong> Real URLs and snippets are extracted from DuckDuckGo results</p>
            <p>3. <strong>Lucy Response:</strong> Lucy uses the DuckDuckGo sources to generate accurate responses</p>
            <p>4. <strong>No Bing:</strong> Only uses DuckDuckGo and Google News - no Bing fallback</p>
            <p className="text-purple-400 font-medium">DuckDuckGo sources + Lucy AI = Accurate, current responses!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

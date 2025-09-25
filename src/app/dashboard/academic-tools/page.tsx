"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, FileText, Search, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CitationData {
  url: string;
  title?: string;
  author?: string;
  publisher?: string;
  publicationDate?: string;
  pageNumbers?: string;
}

interface GeneratedCitations {
  apaCitation: string;
  mlaCitation: string;
}

interface PlagiarismResult {
  similarity: number;
  sources: Array<{
    url: string;
    title: string;
    similarity: number;
  }>;
}

export default function AcademicToolsPage() {
  const [citationData, setCitationData] = useState<CitationData>({
    url: '',
    title: '',
    author: '',
    publisher: '',
    publicationDate: '',
    pageNumbers: ''
  });
  
  const [generatedCitations, setGeneratedCitations] = useState<GeneratedCitations | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [copiedType, setCopiedType] = useState<'apa' | 'mla' | null>(null);
  const [isGeneratingCitation, setIsGeneratingCitation] = useState(false);
  const [textToCheck, setTextToCheck] = useState('');
  const [plagiarismResult, setPlagiarismResult] = useState<PlagiarismResult | null>(null);
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
  const { toast } = useToast();

  // Helper function to extract domain name
  const extractDomainName = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'Unknown Site';
    }
  };

  // Helper function for APA title capitalization
  const capitalizeTitleForAPA = (title: string): string => {
    // APA title capitalization: first word, first word after colon, and proper nouns only
    const words = title.split(' ');
    const capitalizedWords = words.map((word, index) => {
      // Always capitalize first word
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      
      // Check if previous word ended with colon (indicates subtitle)
      const prevWord = words[index - 1];
      if (prevWord.endsWith(':')) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      
      // For other words, only capitalize if they're proper nouns or common exceptions
      const properNouns = ['AI', 'API', 'CEO', 'CTO', 'USA', 'UK', 'NASA', 'FBI', 'CIA', 'UN', 'WHO'];
      const lowercaseWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'nor', 'of', 'on', 'or', 'per', 'so', 'the', 'to', 'up', 'via', 'yet'];
      
      if (properNouns.includes(word.toUpperCase())) {
        return word.toUpperCase();
      } else if (lowercaseWords.includes(word.toLowerCase())) {
        return word.toLowerCase();
      } else {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
    });
    
    return capitalizedWords.join(' ');
  };

  const generateMLACitation = async () => {
    const { url } = citationData;
    
    if (!url.trim()) {
      toast({
        title: "Missing URL",
        description: "Please enter a URL to generate the citation.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingCitation(true);
    
    try {
      // Call our web scraping service to extract real data
      const response = await fetch('/api/scrape-citation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to scrape URL');
      }

      const scrapedData = await response.json();
      
      // Update citation data with real extracted information
      setCitationData(prev => ({
        ...prev,
        title: scrapedData.title || 'Untitled',
        author: scrapedData.author || 'Unknown Author',
        publisher: scrapedData.publisher || scrapedData.siteName || 'Unknown Publisher',
        publicationDate: scrapedData.publicationDate || scrapedData.lastModified || new Date().toISOString().split('T')[0]
      }));
      
      // Format author name (Last, First Middle)
      const author = scrapedData.author || 'Unknown Author';
      const authorParts = author.trim().split(' ');
      const lastName = authorParts[authorParts.length - 1];
      const firstName = authorParts.slice(0, -1).join(' ');
      const formattedAuthor = `${lastName}, ${firstName}`;

      // Format publication date - use actual publication date, not current date
      const dateString = scrapedData.publicationDate || scrapedData.lastModified;
      if (!dateString) {
        throw new Error('No publication date found');
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid publication date');
      }

      const title = scrapedData.title || 'Untitled';
      const publisher = scrapedData.publisher || scrapedData.siteName || 'Unknown Publisher';
      const siteName = scrapedData.siteNameForAPA || extractDomainName(url);

      // Generate APA Citation with proper formatting
      const apaDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      
      // APA title capitalization: first word, first word after colon, proper nouns only
      const apaTitle = capitalizeTitleForAPA(title);
      
      let apaCitation = author !== 'Unknown Author' 
        ? `${author}. (${apaDate}). ${apaTitle}. ${siteName}. ${url}`
        : `${apaTitle}. (${apaDate}). ${siteName}. ${url}`;

      // Generate MLA Citation
      const mlaDate = date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      let mlaCitation = author !== 'Unknown Author'
        ? `${formattedAuthor}. "${title}." ${publisher}, ${mlaDate}, ${url}.`
        : `"${title}." ${publisher}, ${mlaDate}, ${url}.`;
      
      if (citationData.pageNumbers) {
        mlaCitation = mlaCitation.replace(url, `pp. ${citationData.pageNumbers}, ${url}`);
      }
      
      setGeneratedCitations({ apaCitation, mlaCitation });
      
      toast({
        title: "Citations Generated",
        description: "APA and MLA citations have been generated from the URL!",
      });
    } catch (error) {
      console.error('Citation generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate citation from URL. Please check the URL and try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingCitation(false);
    }
  };

  const copyCitation = async (type: 'apa' | 'mla') => {
    if (!generatedCitations) return;
    
    try {
      const citationToCopy = type === 'apa' ? generatedCitations.apaCitation : generatedCitations.mlaCitation;
      await navigator.clipboard.writeText(citationToCopy);
      setIsCopied(true);
      setCopiedType(type);
      toast({
        title: "Copied!",
        description: `${type.toUpperCase()} citation copied to clipboard.`,
      });
      setTimeout(() => {
        setIsCopied(false);
        setCopiedType(null);
      }, 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy citation.",
        variant: "destructive"
      });
    }
  };

  const checkPlagiarism = async () => {
    if (!textToCheck.trim()) {
      toast({
        title: "No Text",
        description: "Please enter text to check for plagiarism.",
        variant: "destructive"
      });
      return;
    }

    setIsCheckingPlagiarism(true);
    
    try {
      // Simulate plagiarism check (in real implementation, this would call an API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock result
      const mockResult: PlagiarismResult = {
        similarity: Math.random() * 30, // 0-30% similarity
        sources: [
          {
            url: "https://example.com/source1",
            title: "Sample Academic Source 1",
            similarity: Math.random() * 15
          },
          {
            url: "https://example.com/source2", 
            title: "Sample Academic Source 2",
            similarity: Math.random() * 10
          }
        ]
      };
      
      setPlagiarismResult(mockResult);
      
      toast({
        title: "Plagiarism Check Complete",
        description: `Similarity: ${mockResult.similarity.toFixed(1)}%`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check plagiarism. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCheckingPlagiarism(false);
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity < 10) return "text-green-600";
    if (similarity < 20) return "text-yellow-600";
    return "text-red-600";
  };

  const getSimilarityIcon = (similarity: number) => {
    if (similarity < 10) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (similarity < 20) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Academic Tools</h1>
        <p className="text-muted-foreground">
          MLA Citation Generator and Plagiarism Checker for CourseConnect
        </p>
      </div>

      <Tabs defaultValue="citation" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="citation" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            MLA Citation Generator
          </TabsTrigger>
          <TabsTrigger value="plagiarism" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Plagiarism Checker
          </TabsTrigger>
        </TabsList>

        <TabsContent value="citation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Citation Generator</CardTitle>
              <CardDescription>
                Generate APA and MLA citations automatically from any website URL
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Website URL *</Label>
                  <Input
                    id="url"
                    placeholder="https://example.com/article"
                    value={citationData.url}
                    onChange={(e) => setCitationData({...citationData, url: e.target.value})}
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the URL of the webpage you want to cite
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pageNumbers">Page Numbers (optional)</Label>
                  <Input
                    id="pageNumbers"
                    placeholder="123-145"
                    value={citationData.pageNumbers}
                    onChange={(e) => setCitationData({...citationData, pageNumbers: e.target.value})}
                  />
                </div>
              </div>
              
              <Button 
                onClick={generateMLACitation} 
                className="w-full"
                disabled={isGeneratingCitation}
              >
                {isGeneratingCitation ? (
                  <>
                    <Search className="h-4 w-4 mr-2 animate-spin" />
                    Generating Citation...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Citations
                  </>
                )}
              </Button>
              
              {generatedCitations && (
                <div className="space-y-4">
                  <Label>Generated Citations:</Label>
                  
                  {/* APA Citation */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-blue-600">APA Format:</Label>
                      <Button 
                        onClick={() => copyCitation('apa')} 
                        variant="outline" 
                        size="sm"
                        disabled={isCopied && copiedType === 'apa'}
                      >
                        {isCopied && copiedType === 'apa' ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy APA
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-mono text-blue-900 dark:text-blue-100">{generatedCitations.apaCitation}</p>
                    </div>
                  </div>

                  {/* MLA Citation */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-green-600">MLA Format:</Label>
                      <Button 
                        onClick={() => copyCitation('mla')} 
                        variant="outline" 
                        size="sm"
                        disabled={isCopied && copiedType === 'mla'}
                      >
                        {isCopied && copiedType === 'mla' ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy MLA
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm font-mono text-green-900 dark:text-green-100">{generatedCitations.mlaCitation}</p>
                    </div>
                  </div>
                  
                  {/* Show extracted data for reference */}
                  {(citationData.title || citationData.author || citationData.publisher) && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Extracted Information:</h4>
                      <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        {citationData.title && <p><strong>Title:</strong> {citationData.title}</p>}
                        {citationData.author && <p><strong>Author:</strong> {citationData.author}</p>}
                        {citationData.publisher && <p><strong>Publisher:</strong> {citationData.publisher}</p>}
                        {citationData.publicationDate && <p><strong>Date:</strong> {new Date(citationData.publicationDate).toLocaleDateString()}</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plagiarism" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Plagiarism Checker</CardTitle>
              <CardDescription>
                Check your text for potential plagiarism and similarity to existing sources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="textToCheck">Text to Check</Label>
                <Textarea
                  id="textToCheck"
                  placeholder="Paste your text here to check for plagiarism..."
                  value={textToCheck}
                  onChange={(e) => setTextToCheck(e.target.value)}
                  rows={8}
                />
              </div>
              
              <Button 
                onClick={checkPlagiarism} 
                className="w-full"
                disabled={isCheckingPlagiarism}
              >
                {isCheckingPlagiarism ? (
                  <>
                    <Search className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Check for Plagiarism
                  </>
                )}
              </Button>
              
              {plagiarismResult && (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      {getSimilarityIcon(plagiarismResult.similarity)}
                      <span className="font-semibold">Overall Similarity</span>
                    </div>
                    <p className={`text-2xl font-bold ${getSimilarityColor(plagiarismResult.similarity)}`}>
                      {plagiarismResult.similarity.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {plagiarismResult.similarity < 10 
                        ? "Low similarity - Your text appears to be original"
                        : plagiarismResult.similarity < 20
                        ? "Moderate similarity - Review highlighted sections"
                        : "High similarity - Significant revision recommended"
                      }
                    </p>
                  </div>
                  
                  {plagiarismResult.sources.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Similar Sources Found:</h4>
                      {plagiarismResult.sources.map((source, index) => (
                        <div key={index} className="p-3 bg-muted rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{source.title}</span>
                            <span className={`text-sm font-semibold ${getSimilarityColor(source.similarity)}`}>
                              {source.similarity.toFixed(1)}%
                            </span>
                          </div>
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {source.url}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
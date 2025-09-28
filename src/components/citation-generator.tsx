'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, Check, ExternalLink, BookOpen, Globe, FileText, Video, Image, Newspaper } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MLACitation {
  inText: string;
  worksCited: string;
  sourceType: string;
  confidence: number;
}

interface CitationRequest {
  text: string;
  url?: string;
  sourceType?: 'website' | 'book' | 'journal' | 'newspaper' | 'video' | 'image' | 'auto';
  manualData?: {
    title?: string;
    author?: string;
    publisher?: string;
    publicationDate?: string;
    url?: string;
  };
}

const sourceTypeIcons = {
  website: Globe,
  book: BookOpen,
  journal: FileText,
  newspaper: Newspaper,
  video: Video,
  image: Image,
  auto: FileText
};

export default function CitationGenerator() {
  const [mode, setMode] = useState<'url' | 'manual'>('url');
  const [loading, setLoading] = useState(false);
  const [citation, setCitation] = useState<MLACitation | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  
  // URL mode state
  const [url, setUrl] = useState('');
  const [sourceType, setSourceType] = useState<string>('auto');
  
  // Manual mode state
  const [manualData, setManualData] = useState({
    title: '',
    author: '',
    publisher: '',
    publicationDate: '',
    url: ''
  });

  const generateCitation = async () => {
    if (mode === 'url' && !url.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a URL',
        variant: 'destructive'
      });
      return;
    }

    if (mode === 'manual' && !manualData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a title',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const request: CitationRequest = {
        text: mode === 'url' ? url : manualData.title,
        sourceType: sourceType as any,
        ...(mode === 'url' ? { url } : { manualData })
      };

      const response = await fetch('/api/citation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      const data = await response.json();

      if (data.success) {
        setCitation(data.citation);
        toast({
          title: 'Success',
          description: 'Citation generated successfully!'
        });
      } else {
        throw new Error(data.error || 'Failed to generate citation');
      }
    } catch (error) {
      console.error('Citation generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate citation. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
      toast({
        title: 'Copied',
        description: `${type} copied to clipboard!`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive'
      });
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const SourceIcon = citation ? sourceTypeIcons[citation.sourceType as keyof typeof sourceTypeIcons] || FileText : FileText;

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            MLA Citation Generator
          </CardTitle>
          <CardDescription>
            Generate accurate MLA citations for your sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              variant={mode === 'url' ? 'default' : 'outline'}
              onClick={() => setMode('url')}
              className="flex-1"
            >
              <Globe className="h-4 w-4 mr-2" />
              From URL
            </Button>
            <Button
              variant={mode === 'manual' ? 'default' : 'outline'}
              onClick={() => setMode('manual')}
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-2" />
              Manual Entry
            </Button>
          </div>

          {mode === 'url' ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Website URL</label>
                <Input
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Source Type</label>
                <Select value={sourceType} onValueChange={setSourceType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-detect</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="journal">Journal Article</SelectItem>
                    <SelectItem value="newspaper">Newspaper</SelectItem>
                    <SelectItem value="book">Book</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  placeholder="Article or book title"
                  value={manualData.title}
                  onChange={(e) => setManualData({ ...manualData, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Author</label>
                  <Input
                    placeholder="Author name"
                    value={manualData.author}
                    onChange={(e) => setManualData({ ...manualData, author: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Publisher</label>
                  <Input
                    placeholder="Publisher or website name"
                    value={manualData.publisher}
                    onChange={(e) => setManualData({ ...manualData, publisher: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Publication Date</label>
                  <Input
                    placeholder="YYYY-MM-DD or YYYY"
                    value={manualData.publicationDate}
                    onChange={(e) => setManualData({ ...manualData, publicationDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">URL (optional)</label>
                  <Input
                    placeholder="https://example.com"
                    value={manualData.url}
                    onChange={(e) => setManualData({ ...manualData, url: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          <Button 
            onClick={generateCitation} 
            disabled={loading}
            className="w-full mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Citation...
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                Generate MLA Citation
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Citation Results */}
      {citation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SourceIcon className="h-5 w-5" />
              Generated Citation
              <Badge className={getConfidenceColor(citation.confidence)}>
                {citation.confidence}% confidence
              </Badge>
            </CardTitle>
            <CardDescription>
              Source type: {citation.sourceType}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* In-text Citation */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">In-text Citation</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(citation.inText, 'In-text citation')}
                >
                  {copied === 'intext' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="p-3 bg-gray-50 rounded-md border">
                <code className="text-sm">{citation.inText}</code>
              </div>
            </div>

            {/* Works Cited */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Works Cited Entry</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(citation.worksCited, 'Works cited entry')}
                >
                  {copied === 'workscited' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="p-3 bg-gray-50 rounded-md border">
                <code className="text-sm">{citation.worksCited}</code>
              </div>
            </div>

            {/* Copy Both */}
            <Button
              variant="outline"
              onClick={() => copyToClipboard(
                `In-text: ${citation.inText}\n\nWorks Cited: ${citation.worksCited}`,
                'Both citations'
              )}
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Both Citations
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

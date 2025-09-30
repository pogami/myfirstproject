"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useRealtimeChangelog } from "@/hooks/use-realtime-changelog";
import { 
  Bot, 
  Send, 
  Sparkles, 
  AlertCircle, 
  CheckCircle,
  RefreshCw,
  Zap
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AutoChangelogWidgetProps {
  className?: string;
}

export function AutoChangelogWidget({ className }: AutoChangelogWidgetProps) {
  const { refresh } = useRealtimeChangelog();
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("");
  const [files, setFiles] = useState("");
  const [author, setAuthor] = useState("Development Team");
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleAutoLog = async () => {
    if (!description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please describe the change you made",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      setLastResult(null);

      const response = await fetch('/api/changelog/auto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description.trim(),
          version: version.trim() || undefined,
          files: files.trim() ? files.split('\n').filter(f => f.trim()) : undefined,
          author: author.trim() || undefined
        }),
      });

      const result = await response.json();
      setLastResult(result);

      if (result.success) {
        toast({
          title: "Success!",
          description: "Change automatically logged and visible to all users",
        });
        
        // Clear form
        setDescription("");
        setVersion("");
        setFiles("");
        
        // Refresh changelog
        refresh();
      } else {
        toast({
          title: "Auto-log Failed",
          description: result.error || "Could not automatically log this change",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Auto-log error:', error);
      toast({
        title: "Error",
        description: "Failed to auto-log change",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDetectionPreview = () => {
    if (!description.trim()) return null;

    const lowerDesc = description.toLowerCase();
    
    // Simple keyword detection for preview
    const keywords = {
      feature: ['add', 'create', 'implement', 'new feature', 'launch'],
      enhancement: ['improve', 'enhance', 'optimize', 'update', 'better'],
      'bug-fix': ['fix', 'resolve', 'correct', 'repair', 'bug', 'error'],
      security: ['security', 'secure', 'auth', 'permission', 'access'],
      performance: ['performance', 'speed', 'fast', 'optimize', 'cache']
    };

    for (const [type, typeKeywords] of Object.entries(keywords)) {
      if (typeKeywords.some(keyword => lowerDesc.includes(keyword))) {
        return {
          type,
          confidence: 'high',
          impact: type === 'security' ? 'critical' : type === 'feature' || type === 'bug-fix' ? 'high' : 'medium'
        };
      }
    }

    return {
      type: 'enhancement',
      confidence: 'medium',
      impact: 'medium'
    };
  };

  const preview = getDetectionPreview();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-500" />
          Auto Changelog
          <Badge variant="outline" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
        </CardTitle>
        <CardDescription>
          Describe your changes and we'll automatically categorize and log them in real-time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Detection Preview */}
        {preview && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Auto-Detection Preview</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {preview.type}
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  preview.impact === 'critical' ? 'bg-red-500 text-white' :
                  preview.impact === 'high' ? 'bg-orange-500 text-white' :
                  preview.impact === 'medium' ? 'bg-yellow-500 text-white' :
                  'bg-green-500 text-white'
                }`}
              >
                {preview.impact} impact
              </Badge>
              <Badge variant="outline" className="text-xs">
                {preview.confidence} confidence
              </Badge>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">
              What did you change? *
            </label>
            <Textarea
              placeholder="e.g., Added dark mode toggle to header and footer with smooth animations"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Version (optional)</label>
              <Input
                placeholder="e.g., v2.12.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Author (optional)</label>
              <Input
                placeholder="Development Team"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Files changed (optional, one per line)
            </label>
            <Textarea
              placeholder="src/components/hero.tsx&#10;src/app/layout.tsx"
              value={files}
              onChange={(e) => setFiles(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleAutoLog}
          disabled={isLoading || !description.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Auto-Logging...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Auto-Log Change
            </>
          )}
        </Button>

        {/* Last Result */}
        {lastResult && (
          <div className={`p-3 rounded-lg border ${
            lastResult.success 
              ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {lastResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">
                {lastResult.success ? 'Success' : 'Failed'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {lastResult.message}
            </p>
            {lastResult.entryId && (
              <p className="text-xs text-muted-foreground mt-1">
                Entry ID: {lastResult.entryId}
              </p>
            )}
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Tips:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Be descriptive about what you changed</li>
            <li>Include keywords like "add", "fix", "improve" for better detection</li>
            <li>Changes are instantly visible to all users</li>
            <li>Only user-facing changes are shown publicly</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}


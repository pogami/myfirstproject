"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRealtimeChangelog } from "@/hooks/use-realtime-changelog";
import { 
  GitBranch, 
  RefreshCw, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertCircle,
  Clock,
  User,
  FileText
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
  files: string[];
  type: 'feature' | 'enhancement' | 'bug-fix' | 'security' | 'performance';
  impact: 'low' | 'medium' | 'high' | 'critical';
}

interface CurrentChanges {
  modified: string[];
  added: string[];
  deleted: string[];
}

export function GitAutoChangelog() {
  const { refresh } = useRealtimeChangelog();
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [currentChanges, setCurrentChanges] = useState<CurrentChanges>({ modified: [], added: [], deleted: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const loadGitData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/changelog/git-auto');
      const result = await response.json();
      
      if (result.success) {
        setCommits(result.commits);
        setCurrentChanges(result.currentChanges);
      } else {
        toast({
          title: "Error",
          description: "Failed to load git data",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to load git data:', error);
      toast({
        title: "Error",
        description: "Failed to load git data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const autoLogCommits = async () => {
    try {
      setIsLoading(true);
      setLastResult(null);

      const response = await fetch('/api/changelog/git-auto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ limit: 5 }),
      });

      const result = await response.json();
      setLastResult(result);

      if (result.success) {
        toast({
          title: "Success!",
          description: `${result.count} commits auto-logged to changelog`,
        });
        
        // Refresh changelog and git data
        refresh();
        loadGitData();
      } else {
        toast({
          title: "Auto-log Failed",
          description: result.error || "Could not auto-log commits",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Auto-log error:', error);
      toast({
        title: "Error",
        description: "Failed to auto-log commits",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return "✨";
      case 'enhancement': return "🔧";
      case 'bug-fix': return "🐛";
      case 'security': return "🔒";
      case 'performance': return "⚡";
      default: return "📝";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  useEffect(() => {
    loadGitData();
  }, []);

  const totalChanges = currentChanges.modified.length + currentChanges.added.length + currentChanges.deleted.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-green-500" />
          Git Auto Changelog
          <Badge variant="outline" className="text-xs">
            <GitBranch className="h-3 w-3 mr-1" />
            Git-Powered
          </Badge>
        </CardTitle>
        <CardDescription>
          Automatically detect and log important changes from your git commits.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Changes */}
        {totalChanges > 0 && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Uncommitted Changes</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              {currentChanges.modified.length > 0 && (
                <div>Modified: {currentChanges.modified.length} files</div>
              )}
              {currentChanges.added.length > 0 && (
                <div>Added: {currentChanges.added.length} files</div>
              )}
              {currentChanges.deleted.length > 0 && (
                <div>Deleted: {currentChanges.deleted.length} files</div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={loadGitData}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={autoLogCommits}
            disabled={isLoading || commits.length === 0}
            size="sm"
          >
            <Play className="h-4 w-4 mr-2" />
            Auto-Log Commits
          </Button>
        </div>

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
            {lastResult.loggedEntries && lastResult.loggedEntries.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Logged {lastResult.loggedEntries.length} entries
              </p>
            )}
          </div>
        )}

        {/* Recent Commits */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Recent Commits</h4>
          {isLoading ? (
            <div className="text-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading commits...</p>
            </div>
          ) : commits.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No important commits found</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {commits.map((commit) => (
                <div key={commit.hash} className="p-3 border rounded-lg bg-muted/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getTypeIcon(commit.type)}</span>
                      <Badge variant="outline" className="text-xs">
                        {commit.type}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getImpactColor(commit.impact)} text-white`}
                      >
                        {commit.impact}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {commit.hash.substring(0, 7)}
                    </div>
                  </div>
                  
                  <p className="text-sm font-medium mb-2">{commit.message}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {commit.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {commit.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {commit.files.length} files
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>How it works:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Scans recent git commits for important changes</li>
            <li>Analyzes commit messages and changed files</li>
            <li>Only logs user-facing changes to the public changelog</li>
            <li>Automatically categorizes by type and impact</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

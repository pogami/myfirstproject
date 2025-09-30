"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useRealtimeChangelog } from "@/hooks/use-realtime-changelog";
import { RealtimeChangelogEntry } from "@/lib/realtime-changelog";
import { 
  Plus, 
  Save, 
  Trash2, 
  Edit, 
  CheckCircle, 
  AlertCircle,
  Wifi,
  WifiOff,
  RefreshCw
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AutoChangelogWidget } from "@/components/auto-changelog-widget";
import { GitAutoChangelog } from "@/components/git-auto-changelog";

export default function RealtimeChangelogAdmin() {
  const { 
    entries, 
    loading, 
    error, 
    stats, 
    addEntry, 
    updateEntry, 
    deleteEntry, 
    refresh, 
    isConnected 
  } = useRealtimeChangelog({
    userFacingOnly: false, // Show all entries for admin
    limit: 100
  });

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    version: "",
    type: "enhancement" as RealtimeChangelogEntry['type'],
    impact: "medium" as RealtimeChangelogEntry['impact'],
    author: "Development Team",
    changes: ""
  });

  const handleAddEntry = async () => {
    if (!formData.version || !formData.changes) {
      toast({
        title: "Validation Error",
        description: "Version and changes are required",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAdding(true);
      const changes = formData.changes.split('\n').filter(change => change.trim());
      
      await addEntry({
        date: new Date().toISOString().split('T')[0],
        version: formData.version,
        type: formData.type,
        changes,
        impact: formData.impact,
        author: formData.author
      });

      // Reset form
      setFormData({
        version: "",
        type: "enhancement",
        impact: "medium",
        author: "Development Team",
        changes: ""
      });

      toast({
        title: "Success",
        description: "Changelog entry added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add changelog entry",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this changelog entry?")) {
      return;
    }

    try {
      await deleteEntry(entryId);
      toast({
        title: "Success",
        description: "Changelog entry deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete changelog entry",
        variant: "destructive"
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'launch': return "🚀";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Real-time Changelog Admin
                  {isConnected ? (
                    <Wifi className="h-5 w-5 text-green-500" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-red-500" />
                  )}
                </CardTitle>
                <CardDescription>
                  Manage changelog entries in real-time. Changes are instantly visible to all users.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refresh}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                {error && (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Error
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalEntries}</div>
                <div className="text-sm text-muted-foreground">Total Entries</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-500">{stats.userFacingEntries}</div>
                <div className="text-sm text-muted-foreground">User-Facing</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-500">{stats.byType.feature || 0}</div>
                <div className="text-sm text-muted-foreground">Features</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-500">{stats.latestVersion}</div>
                <div className="text-sm text-muted-foreground">Latest Version</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Git Auto Changelog */}
        <GitAutoChangelog />

        {/* Auto Changelog Widget */}
        <AutoChangelogWidget />

        {/* Manual Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Changelog Entry</CardTitle>
            <CardDescription>
              Manually add a changelog entry with full control over categorization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Version</label>
                <Input
                  placeholder="e.g., v2.12.0"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(value: RealtimeChangelogEntry['type']) => 
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="launch">🚀 Launch</SelectItem>
                    <SelectItem value="feature">✨ Feature</SelectItem>
                    <SelectItem value="enhancement">🔧 Enhancement</SelectItem>
                    <SelectItem value="bug-fix">🐛 Bug Fix</SelectItem>
                    <SelectItem value="security">🔒 Security</SelectItem>
                    <SelectItem value="performance">⚡ Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Impact</label>
                <Select
                  value={formData.impact}
                  onValueChange={(value: RealtimeChangelogEntry['impact']) => 
                    setFormData({ ...formData, impact: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Low</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="high">🟠 High</SelectItem>
                    <SelectItem value="critical">🔴 Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Author</label>
              <Input
                placeholder="Development Team"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Changes (one per line)</label>
              <Textarea
                placeholder="Added new feature&#10;Fixed bug in dashboard&#10;Improved performance"
                value={formData.changes}
                onChange={(e) => setFormData({ ...formData, changes: e.target.value })}
                rows={4}
              />
            </div>
            
            <Button
              onClick={handleAddEntry}
              disabled={isAdding || loading}
              className="w-full"
            >
              {isAdding ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Entries List */}
        <Card>
          <CardHeader>
            <CardTitle>Changelog Entries</CardTitle>
            <CardDescription>
              {loading ? "Loading entries..." : `${entries.length} entries found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading changelog entries...</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No changelog entries found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <Card key={entry.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{getTypeIcon(entry.type)}</span>
                            <Badge variant="outline" className="text-xs">
                              {entry.type}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getImpactColor(entry.impact)} text-white`}
                            >
                              {entry.impact}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {entry.date}
                            </span>
                          </div>
                          
                          <h3 className="font-semibold text-lg mb-2">
                            {entry.version}
                            {entry.author && (
                              <span className="text-sm font-normal text-muted-foreground ml-2">
                                by {entry.author}
                              </span>
                            )}
                          </h3>
                          
                          <ul className="space-y-1">
                            {entry.changes.map((change, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{change}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteEntry(entry.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

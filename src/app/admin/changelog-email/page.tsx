"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, CheckCircle, AlertCircle } from "lucide-react";

export default function ChangelogEmailAdmin() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    version: "",
    date: new Date().toISOString().split('T')[0],
    type: "enhancement",
    impact: "medium",
    author: "Development Team",
    changes: ""
  });

  const handleSendEmail = async () => {
    if (!formData.version || !formData.changes) {
      setResult({ success: false, error: "Version and changes are required" });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const changelogData = {
        ...formData,
        changes: formData.changes.split('\n').filter(change => change.trim())
      };

      const response = await fetch('/api/changelog-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ changelogData }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: 'Network error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSend = async (template: string) => {
    const templates = {
      'bug-fix': {
        version: "v2.8.1",
        type: "bug-fix",
        impact: "medium",
        changes: "Fixed chat input clearing issue\nImproved message scrolling behavior\nEnhanced AI response reliability"
      },
      'feature': {
        version: "v2.9.0",
        type: "feature",
        impact: "high",
        changes: "Added new AI tutoring features\nImplemented advanced study tools\nEnhanced user dashboard experience"
      },
      'enhancement': {
        version: "v2.8.2",
        type: "enhancement",
        impact: "medium",
        changes: "Improved newsletter subscription system\nEnhanced email templates\nBetter user feedback mechanisms"
      }
    };

    const templateData = templates[template as keyof typeof templates];
    setFormData(prev => ({ ...prev, ...templateData }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Mail className="h-3 w-3 mr-1" />
              Admin Panel
            </Badge>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Changelog Email Manager
            </h1>
            <p className="text-xl text-gray-600">
              Send changelog update emails to all subscribers
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send Changelog Email
                </CardTitle>
                <CardDescription>
                  Create and send a changelog update to all subscribers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Version</label>
                    <Input
                      placeholder="v2.8.1"
                      value={formData.version}
                      onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="launch">Launch</SelectItem>
                        <SelectItem value="feature">Feature</SelectItem>
                        <SelectItem value="enhancement">Enhancement</SelectItem>
                        <SelectItem value="bug-fix">Bug Fix</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Impact</label>
                    <Select value={formData.impact} onValueChange={(value) => setFormData(prev => ({ ...prev, impact: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Author</label>
                  <Input
                    placeholder="Development Team"
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Changes (one per line)</label>
                  <Textarea
                    placeholder="Fixed chat input clearing issue&#10;Improved message scrolling behavior&#10;Enhanced AI response reliability"
                    value={formData.changes}
                    onChange={(e) => setFormData(prev => ({ ...prev, changes: e.target.value }))}
                    rows={6}
                  />
                </div>

                <Button 
                  onClick={handleSendEmail} 
                  disabled={isLoading || !formData.version || !formData.changes}
                  className="w-full"
                >
                  {isLoading ? "Sending..." : "Send Email to Subscribers"}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Templates & Results */}
            <div className="space-y-6">
              {/* Quick Templates */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Templates</CardTitle>
                  <CardDescription>
                    Use these templates for common update types
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleQuickSend('bug-fix')}
                  >
                    🐛 Bug Fix Template
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleQuickSend('feature')}
                  >
                    ✨ Feature Template
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleQuickSend('enhancement')}
                  >
                    🚀 Enhancement Template
                  </Button>
                </CardContent>
              </Card>

              {/* Results */}
              {result && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      Result
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result.success ? (
                      <div className="space-y-2">
                        <p className="text-green-600 font-medium">{result.message}</p>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>📧 Sent: {result.sentCount}</p>
                          <p>❌ Failed: {result.failedCount}</p>
                          <p>👥 Total Subscribers: {result.totalSubscribers}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-red-600">{result.error}</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

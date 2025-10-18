"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Facebook, 
  Twitter, 
  MessageSquare, 
  Link as LinkIcon, 
  Smartphone, 
  Monitor,
  Tablet,
  Copy,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

export default function TestOGPage() {
  const [copied, setCopied] = useState<string | null>(null);
  
  const testUrl = "https://courseconnectai.com";
  const ogImage = "https://courseconnectai.com/apple-touch-icon.png";
  
  const platforms = [
    {
      name: "Facebook",
      icon: <Facebook className="size-5" />,
      color: "bg-blue-600",
      preview: {
        title: "CourseConnect AI - Your AI-Powered Study Companion",
        description: "Transform your academic journey with AI-powered study tools, personalized tutoring, and smart course management.",
        image: ogImage,
        url: testUrl
      }
    },
    {
      name: "Twitter/X",
      icon: <Twitter className="size-5" />,
      color: "bg-black",
      preview: {
        title: "CourseConnect AI - Your AI-Powered Study Companion",
        description: "Transform your academic journey with AI-powered study tools, personalized tutoring, and smart course management.",
        image: ogImage,
        url: testUrl
      }
    },
    {
      name: "LinkedIn",
      icon: <MessageSquare className="size-5" />,
      color: "bg-blue-700",
      preview: {
        title: "CourseConnect AI - Your AI-Powered Study Companion",
        description: "Transform your academic journey with AI-powered study tools, personalized tutoring, and smart course management.",
        image: ogImage,
        url: testUrl
      }
    },
    {
      name: "iMessage",
      icon: <MessageSquare className="size-5" />,
      color: "bg-green-500",
      preview: {
        title: "CourseConnect AI - Your AI-Powered Study Companion",
        description: "Transform your academic journey with AI-powered study tools, personalized tutoring, and smart course management.",
        image: ogImage,
        url: testUrl
      }
    },
    {
      name: "WhatsApp",
      icon: <MessageSquare className="size-5" />,
      color: "bg-green-600",
      preview: {
        title: "CourseConnect AI - Your AI-Powered Study Companion",
        description: "Transform your academic journey with AI-powered study tools, personalized tutoring, and smart course management.",
        image: ogImage,
        url: testUrl
      }
    },
    {
      name: "Discord",
      icon: <MessageSquare className="size-5" />,
      color: "bg-indigo-600",
      preview: {
        title: "CourseConnect AI - Your AI-Powered Study Companion",
        description: "Transform your academic journey with AI-powered study tools, personalized tutoring, and smart course management.",
        image: ogImage,
        url: testUrl
      }
    }
  ];

  const devices = [
    { name: "Desktop", icon: <Monitor className="size-4" />, width: "w-full" },
    { name: "Tablet", icon: <Tablet className="size-4" />, width: "w-3/4 max-w-md" },
    { name: "Mobile", icon: <Smartphone className="size-4" />, width: "w-1/2 max-w-xs" }
  ];

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const testLinks = [
    {
      name: "Facebook Sharing Debugger",
      url: "https://developers.facebook.com/tools/debug/",
      description: "Test how your link appears on Facebook"
    },
    {
      name: "Twitter Card Validator",
      url: "https://cards-dev.twitter.com/validator",
      description: "Test how your link appears on Twitter/X"
    },
    {
      name: "LinkedIn Post Inspector",
      url: "https://www.linkedin.com/post-inspector/",
      description: "Test how your link appears on LinkedIn"
    },
    {
      name: "Open Graph Preview",
      url: "https://www.opengraph.xyz/",
      description: "General Open Graph testing tool"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Open Graph Test Center
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Preview how CourseConnect AI appears when shared across all platforms including iMessage, WhatsApp, Discord, and social media
          </p>
        </div>

        {/* Current OG Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="size-5" />
              Current Open Graph Data
            </CardTitle>
            <CardDescription>
              This is what platforms will see when your link is shared
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Title</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-2 bg-muted rounded text-sm">
                    CourseConnect AI - Your AI-Powered Study Companion
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard("CourseConnect AI - Your AI-Powered Study Companion", "title")}
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">URL</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-2 bg-muted rounded text-sm">
                    {testUrl}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(testUrl, "url")}
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 p-2 bg-muted rounded text-sm">
                  Transform your academic journey with AI-powered study tools, personalized tutoring, and smart course management.
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard("Transform your academic journey with AI-powered study tools, personalized tutoring, and smart course management.", "description")}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Image</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 p-2 bg-muted rounded text-sm">
                  {ogImage}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(ogImage, "image")}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Previews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {platforms.map((platform) => (
            <Card key={platform.name}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`p-2 rounded ${platform.color} text-white`}>
                    {platform.icon}
                  </div>
                  {platform.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Desktop Preview */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Monitor className="size-4" />
                    Desktop Preview
                  </div>
                  <div className="border rounded-lg p-4 bg-white dark:bg-slate-800">
                    <div className="flex gap-3">
                      <img 
                        src={platform.preview.image} 
                        alt="CourseConnect" 
                        className="w-20 h-20 rounded object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2">
                          {platform.preview.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {platform.preview.description}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
                          {platform.preview.url}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Preview */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Smartphone className="size-4" />
                    Mobile Preview
                  </div>
                  <div className="border rounded-lg p-3 bg-white dark:bg-slate-800 max-w-xs">
                    <div className="space-y-2">
                      <div>
                        <img 
                          src="/homepage.png" 
                          alt="CourseConnect" 
                          className="w-full h-56 rounded object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2">
                          {platform.preview.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-3">
                          {platform.preview.description}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
                          {platform.preview.url}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testing Tools */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Tools</CardTitle>
            <CardDescription>
              Use these tools to test your Open Graph data on different platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testLinks.map((link) => (
                <div key={link.name} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-medium">{link.name}</h3>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    <ExternalLink className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Test */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Test</CardTitle>
            <CardDescription>
              Test your link by sharing it in these platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(testUrl, "test")}
                className="flex items-center gap-2"
              >
                <Copy className="size-4" />
                Copy Link to Test
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(testUrl)}`, '_blank')}
                className="flex items-center gap-2"
              >
                <Facebook className="size-4" />
                Test on Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(testUrl)}`, '_blank')}
                className="flex items-center gap-2"
              >
                <Twitter className="size-4" />
                Test on Twitter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

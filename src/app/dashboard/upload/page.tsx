"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Sparkles, CheckCircle, ArrowRight, Zap, MessageSquare, Target } from "lucide-react";
import InteractiveSyllabusDemo from "@/components/interactive-syllabus-demo";
import { HowItWorksSlideshow } from "@/components/how-it-works-slideshow";

const features = [
  {
    icon: <Sparkles className="size-5 text-purple-500" />,
    title: "AI-Powered Analysis",
    description: "Smart parsing extracts key information automatically"
  },
  {
    icon: <FileText className="size-5 text-blue-500" />,
    title: "Instant Processing",
    description: "Get results in seconds, not minutes"
  },
  {
    icon: <CheckCircle className="size-5 text-green-500" />,
    title: "Auto-Class Detection",
    description: "Automatically creates a dedicated chat for your course"
  }
];

export default function EnhancedSyllabusUploadPage() {
  const [showSlideshow, setShowSlideshow] = useState(false);

  useEffect(() => {
    // Check if slideshow should be shown from URL params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('showSlideshow') === 'true') {
      setShowSlideshow(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      {/* How It Works Section - Moved to Top */}
      <Card className="border-0 bg-gradient-to-br from-muted/20 to-muted/10 mb-6 sm:mb-8">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-center text-lg sm:text-xl">How It Works</CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Simple steps to transform your syllabus into a powerful learning tool
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            <div className="text-center space-y-2 sm:space-y-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-base sm:text-lg font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold text-sm sm:text-base">Upload File</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Drag and drop your course syllabus (DOCX, TXT)
              </p>
            </div>
            <div className="text-center space-y-2 sm:space-y-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-base sm:text-lg font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold text-sm sm:text-base">AI Analysis</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Our AI extracts key information and course details
              </p>
            </div>
            <div className="text-center space-y-2 sm:space-y-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-base sm:text-lg font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold text-sm sm:text-base">Study Groups <span className="text-xs text-muted-foreground">(Coming Soon)</span></h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Connect with classmates and collaborate together
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section - Mobile Optimized */}
        <div className="text-center space-y-4 py-6 sm:py-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <Upload className="size-10 sm:size-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Upload Your Syllabus
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Transform your course syllabus into an interactive learning experience. Get AI-powered analysis, 
            join study groups, and unlock personalized study tools.
          </p>
          <div className="flex flex-wrap justify-center gap-2 px-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
              <Sparkles className="size-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge variant="outline" className="text-xs">Instant Results</Badge>
            <Badge variant="outline" className="text-xs">Free to Use</Badge>
          </div>
        </div>

        {/* Features Grid - Mobile Optimized */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-6 sm:mb-8 px-4 sm:px-0">
          {features.map((feature, index) => (
            <Card key={feature.title} className="border-0 bg-gradient-to-br from-card/50 to-card/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="flex justify-center mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-muted/50">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upload Component */}
        <div className="mx-4 sm:mx-0">
          <InteractiveSyllabusDemo redirectToSignup={false} />
        </div>

        {/* Bottom Info Section - Centers the upload area */}
        <div className="mt-12 mb-16 px-4 sm:px-0">
          <Card className="max-w-2xl mx-auto border-0 bg-gradient-to-br from-muted/20 to-muted/10">
            <CardContent className="p-6 sm:p-8">
              <h3 className="text-xl font-semibold mb-6 text-center">What happens after upload?</h3>
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="flex flex-col items-center text-center space-y-3 group">
                  <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/20 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/30 transition-colors">
                    <Zap className="size-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Instant AI Analysis</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">Your course content is analyzed automatically</p>
                </div>
                <div className="flex flex-col items-center text-center space-y-3 group">
                  <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30 transition-colors">
                    <MessageSquare className="size-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Dedicated Chat</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">A personalized chat is created for your class</p>
                </div>
                <div className="flex flex-col items-center text-center space-y-3 group">
                  <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20 group-hover:bg-green-200 dark:group-hover:bg-green-900/30 transition-colors">
                    <Target className="size-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Study Assistance</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">Get personalized help tailored to your course</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Slideshow */}
        {showSlideshow && (
          <HowItWorksSlideshow onClose={() => setShowSlideshow(false)} />
        )}
      </div>
    </div>
  );
}

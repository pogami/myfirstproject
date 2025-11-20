"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  NeuralOrb, 
  LogoBreath, 
  HarmonicWave, 
  ClaudeDots, 
  SearchingRing,
  DataFlow,
  ThinkingGrid,
  PulseRing
} from '@/components/ui/ai-thinking';
import { ThinkingProcess } from '@/components/ui/thinking-process';

export default function AnimationShowcasePage() {
  return (
    <div className="space-y-8 p-8 max-w-6xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">AI Thinking Animations</h1>
        <p className="text-muted-foreground text-lg">
          A collection of modern, fluid states for CourseConnect AI processing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Neural Orb */}
        <Card className="overflow-hidden border-blue-100 dark:border-blue-900 bg-gradient-to-b from-white to-blue-50/50 dark:from-gray-950 dark:to-blue-950/20">
          <CardHeader>
            <CardTitle>The Neural Orb</CardTitle>
            <CardDescription>For major processing or voice mode</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center bg-grid-black/5 dark:bg-grid-white/5">
            <NeuralOrb />
          </CardContent>
        </Card>

        {/* Chain of Thought (o1) - Spanning 2 cols */}
        <Card className="md:col-span-2 row-span-2">
          <CardHeader>
            <CardTitle>Chain of Thought (o1)</CardTitle>
            <CardDescription>Expandable reasoning process with live timer</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[400px] flex flex-col items-start justify-start p-8 bg-zinc-50/50 dark:bg-zinc-900/50 gap-12">
            <div className="w-full max-w-lg">
               <p className="text-sm font-medium text-muted-foreground mb-4">Active Thinking State:</p>
               <ThinkingProcess 
                status="thinking"
                steps={[
                  "Analyzing request context...",
                  "Retrieving relevant course materials...",
                  "Identifying key concepts in React hooks...",
                  "Synthesizing explanation...",
                  "Drafting response with code examples..."
                ]}
                defaultOpen={true}
              />
            </div>
            
            <div className="w-full max-w-lg">
                <p className="text-sm font-medium text-muted-foreground mb-4">Completed State:</p>
                <ThinkingProcess 
                status="complete"
                steps={[
                    "Analyzed request parameters",
                    "Searched vector database for 'neural networks'",
                    "Found 12 relevant citations",
                    "Generated comprehensive summary",
                    "Formatted output markdown"
                ]}
                />
            </div>
          </CardContent>
        </Card>

        {/* Logo Breath */}
        <Card>
          <CardHeader>
            <CardTitle>Logo Breath</CardTitle>
            <CardDescription>Subtle brand reinforcement</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col items-center gap-4">
              <LogoBreath />
              <span className="text-sm text-muted-foreground animate-pulse">CourseConnect AI is thinking...</span>
            </div>
          </CardContent>
        </Card>

        {/* Harmonic Wave */}
        <Card>
          <CardHeader>
            <CardTitle>Harmonic Wave</CardTitle>
            <CardDescription>Voice input or audio generation</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <HarmonicWave />
          </CardContent>
        </Card>

        {/* Claude Dots */}
        <Card>
          <CardHeader>
            <CardTitle>Minimal Dots</CardTitle>
            <CardDescription>Unobtrusive text streaming waiter</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                <div className="pt-2">
                  <ClaudeDots />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deep Search */}
        <Card>
          <CardHeader>
            <CardTitle>Deep Research</CardTitle>
            <CardDescription>For web searching or long context lookups</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center flex-col gap-4">
            <SearchingRing />
            <span className="text-xs font-medium text-muted-foreground">Searching academic database...</span>
          </CardContent>
        </Card>

        {/* Data Flow */}
        <Card>
          <CardHeader>
            <CardTitle>Data Flow</CardTitle>
            <CardDescription>Processing streams or file parsing</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center bg-muted/10">
            <div className="flex flex-col items-center gap-4">
              <DataFlow />
              <span className="text-xs text-muted-foreground font-mono">PROCESSING_STREAM</span>
            </div>
          </CardContent>
        </Card>

        {/* Thinking Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Neural Grid</CardTitle>
            <CardDescription>Complex reasoning or connecting concepts</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <div className="p-4 bg-primary/5 rounded-xl">
              <ThinkingGrid />
            </div>
          </CardContent>
        </Card>

        {/* Pulse Ring */}
        <Card>
          <CardHeader>
            <CardTitle>Pulse Ring</CardTitle>
            <CardDescription>Attention grabber or success state</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <PulseRing />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

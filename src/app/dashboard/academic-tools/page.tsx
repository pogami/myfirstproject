"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search } from "lucide-react";
import CitationGenerator from "@/components/citation-generator";
import PlagiarismChecker from "@/components/plagiarism-checker";

export default function AcademicToolsPage() {

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
          <CitationGenerator />
        </TabsContent>

        <TabsContent value="plagiarism" className="mt-6">
          <PlagiarismChecker />
        </TabsContent>
      </Tabs>
    </div>
  );
}
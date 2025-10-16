"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search } from "lucide-react";
import CitationGenerator from "@/components/citation-generator";
import PlagiarismChecker from "@/components/plagiarism-checker";

export default function AcademicToolsPage() {
  const [activeTab, setActiveTab] = useState<'citation' | 'plagiarism'>('citation');

  return (
    <div className="flex gap-6">
      {/* Main Content Area - Centered */}
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Academic Tools</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            MLA Citation Generator and Plagiarism Checker for CourseConnect
          </p>
        </div>

        {/* Toggle Tabs */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'citation' | 'plagiarism')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger 
                value="citation" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <FileText className="h-4 w-4" />
                MLA Citation Generator
              </TabsTrigger>
              <TabsTrigger 
                value="plagiarism" 
                className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
              >
                <Search className="h-4 w-4" />
                Plagiarism Checker
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Main Tool - Single Tool at a Time */}
        <div>
          {activeTab === 'citation' ? (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 min-h-[600px]">
              <CitationGenerator />
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 min-h-[600px]">
              <PlagiarismChecker />
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 space-y-4">
        {/* MLA Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            MLA Citation Tips
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <li>• Always include page numbers for direct quotes</li>
            <li>• Use "et al." for 3+ authors</li>
            <li>• Check publication dates</li>
            <li>• Verify URL accessibility</li>
            <li>• Include DOI when available</li>
            <li>• Use hanging indent format</li>
          </ul>
        </div>

        {/* Plagiarism Tips */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
            <Search className="h-4 w-4" />
            Plagiarism Tips
          </h3>
          <ul className="text-sm text-green-800 dark:text-green-200 space-y-2">
            <li>• Paraphrase in your own words</li>
            <li>• Always cite your sources</li>
            <li>• Use quotation marks for direct quotes</li>
            <li>• Check similarity percentages</li>
            <li>• Use multiple sources</li>
            <li>• Take notes in your own words</li>
          </ul>
        </div>

        {/* Common Mistakes */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <h3 className="font-semibold text-red-900 dark:text-red-100 mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Common Mistakes
          </h3>
          <ul className="text-sm text-red-800 dark:text-red-200 space-y-2">
            <li>• Forgetting to cite sources</li>
            <li>• Copy-pasting without quotes</li>
            <li>• Incorrect citation format</li>
            <li>• Missing page numbers</li>
            <li>• Wrong publication dates</li>
          </ul>
        </div>

        {/* Help Section */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Need Help?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Our AI-powered tools make academic writing easier and more accurate.
          </p>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-md transition-colors">
            View Documentation
          </button>
        </div>
      </div>
    </div>
  );
}
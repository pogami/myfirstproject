"use client";

import { useState } from 'react';
import { SyllabusUpload } from '@/components/syllabus-parser/syllabus-upload';
import { SyllabusReview } from '@/components/syllabus-parser/syllabus-review';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, FileText, Calendar, BookOpen, Users } from 'lucide-react';
import { ParsingResult, ParsedSyllabus } from '@/types/syllabus-parsing';

export default function SyllabusParserPage() {
  const [parsingResult, setParsingResult] = useState<ParsingResult | null>(null);
  const [savedSyllabus, setSavedSyllabus] = useState<ParsedSyllabus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParsed = (result: ParsingResult) => {
    setParsingResult(result);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setParsingResult(null);
  };

  const handleSave = (data: ParsedSyllabus) => {
    setSavedSyllabus(data);
    setParsingResult(null);
    // Here you would typically save to your database
    console.log('Saving syllabus:', data);
  };

  const handleCancel = () => {
    setParsingResult(null);
  };

  const handleNewUpload = () => {
    setParsingResult(null);
    setSavedSyllabus(null);
    setError(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Syllabus Parser</h1>
        <p className="text-muted-foreground">
          Upload your syllabus and let AI extract all the important information automatically
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {savedSyllabus ? (
        <div className="space-y-6">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Syllabus successfully parsed and saved! All course information has been extracted.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Course</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{savedSyllabus.courseInfo.title}</div>
                <p className="text-xs text-muted-foreground">
                  {savedSyllabus.courseInfo.courseCode} • {savedSyllabus.courseInfo.credits} credits
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Schedule</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{savedSyllabus.schedule.length}</div>
                <p className="text-xs text-muted-foreground">
                  Class sessions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assignments</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{savedSyllabus.assignments.length}</div>
                <p className="text-xs text-muted-foreground">
                  Due dates tracked
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Instructor</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{savedSyllabus.contacts.instructor.name}</div>
                <p className="text-xs text-muted-foreground">
                  {savedSyllabus.contacts.instructor.email}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <button
              onClick={handleNewUpload}
              className="text-primary hover:underline"
            >
              Parse Another Syllabus
            </button>
          </div>
        </div>
      ) : parsingResult ? (
        <SyllabusReview
          result={parsingResult}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <SyllabusUpload
          onParsed={handleParsed}
          onError={handleError}
        />
      )}
    </div>
  );
}

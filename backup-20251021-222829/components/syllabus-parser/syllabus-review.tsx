"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertTriangle, Edit3, Save, X } from 'lucide-react';
import { ParsedSyllabus, ParsingResult } from '@/types/syllabus-parsing';

interface SyllabusReviewProps {
  result: ParsingResult;
  onSave: (data: ParsedSyllabus) => void;
  onCancel: () => void;
}

export function SyllabusReview({ result, onSave, onCancel }: SyllabusReviewProps) {
  const [editedData, setEditedData] = useState<ParsedSyllabus | null>(result.data || null);
  const [activeTab, setActiveTab] = useState('course');

  if (!editedData) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No data to review. Please try uploading the syllabus again.
        </AlertDescription>
      </Alert>
    );
  }

  const handleSave = () => {
    if (editedData) {
      onSave(editedData);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return <Badge className="bg-green-100 text-green-800">High</Badge>;
    if (confidence >= 0.6) return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    return <Badge className="bg-red-100 text-red-800">Low</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Review Parsed Syllabus
            </CardTitle>
            <div className="flex items-center gap-2">
              {getConfidenceBadge(result.confidence)}
              <span className={`text-sm font-medium ${getConfidenceColor(result.confidence)}`}>
                {Math.round(result.confidence * 100)}% Confidence
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {result.warnings && result.warnings.length > 0 && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warnings:</strong> {result.warnings.join(', ')}
              </AlertDescription>
            </Alert>
          )}
          
          {result.errors && result.errors.length > 0 && (
            <Alert className="mb-4" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Errors:</strong> {result.errors.join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Review Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="course">Course Info</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="grading">Grading</TabsTrigger>
          <TabsTrigger value="readings">Readings</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        {/* Course Information */}
        <TabsContent value="course" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Course Title</label>
                  <Input
                    value={editedData.courseInfo.title || ''}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      courseInfo: { ...editedData.courseInfo, title: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Instructor</label>
                  <Input
                    value={editedData.courseInfo.instructor || ''}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      courseInfo: { ...editedData.courseInfo, instructor: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Course Code</label>
                  <Input
                    value={editedData.courseInfo.courseCode || ''}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      courseInfo: { ...editedData.courseInfo, courseCode: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Credits</label>
                  <Input
                    type="number"
                    value={editedData.courseInfo.credits || ''}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      courseInfo: { ...editedData.courseInfo, credits: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Semester</label>
                  <Input
                    value={editedData.courseInfo.semester || ''}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      courseInfo: { ...editedData.courseInfo, semester: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Year</label>
                  <Input
                    value={editedData.courseInfo.year || ''}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      courseInfo: { ...editedData.courseInfo, year: e.target.value }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {editedData.schedule.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Day</label>
                        <Input
                          value={item.day || ''}
                          onChange={(e) => {
                            const newSchedule = [...editedData.schedule];
                            newSchedule[index] = { ...item, day: e.target.value };
                            setEditedData({ ...editedData, schedule: newSchedule });
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Time</label>
                        <Input
                          value={item.time || ''}
                          onChange={(e) => {
                            const newSchedule = [...editedData.schedule];
                            newSchedule[index] = { ...item, time: e.target.value };
                            setEditedData({ ...editedData, schedule: newSchedule });
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Location</label>
                        <Input
                          value={item.location || ''}
                          onChange={(e) => {
                            const newSchedule = [...editedData.schedule];
                            newSchedule[index] = { ...item, location: e.target.value };
                            setEditedData({ ...editedData, schedule: newSchedule });
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Type</label>
                        <Input
                          value={item.type || ''}
                          onChange={(e) => {
                            const newSchedule = [...editedData.schedule];
                            newSchedule[index] = { ...item, type: e.target.value as any };
                            setEditedData({ ...editedData, schedule: newSchedule });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments */}
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assignments & Due Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {editedData.assignments.map((assignment, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Assignment Name</label>
                        <Input
                          value={assignment.name || ''}
                          onChange={(e) => {
                            const newAssignments = [...editedData.assignments];
                            newAssignments[index] = { ...assignment, name: e.target.value };
                            setEditedData({ ...editedData, assignments: newAssignments });
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Type</label>
                        <Input
                          value={assignment.type || ''}
                          onChange={(e) => {
                            const newAssignments = [...editedData.assignments];
                            newAssignments[index] = { ...assignment, type: e.target.value as any };
                            setEditedData({ ...editedData, assignments: newAssignments });
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Due Date</label>
                        <Input
                          type="date"
                          value={assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const newAssignments = [...editedData.assignments];
                            newAssignments[index] = { ...assignment, dueDate: new Date(e.target.value) };
                            setEditedData({ ...editedData, assignments: newAssignments });
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Weight (%)</label>
                        <Input
                          type="number"
                          value={assignment.weight || ''}
                          onChange={(e) => {
                            const newAssignments = [...editedData.assignments];
                            newAssignments[index] = { ...assignment, weight: parseInt(e.target.value) || 0 };
                            setEditedData({ ...editedData, assignments: newAssignments });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would be similar... */}
        <TabsContent value="grading">
          <Card>
            <CardHeader>
              <CardTitle>Grading Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Grading policy review coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="readings">
          <Card>
            <CardHeader>
              <CardTitle>Required Readings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Readings review coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>Course Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Policies review coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Syllabus
        </Button>
      </div>
    </div>
  );
}

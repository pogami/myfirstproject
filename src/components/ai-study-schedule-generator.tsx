"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, BookOpen, Target, TrendingUp, Bell, Download, Upload, Plus, Edit, Trash2, CheckCircle, AlertCircle, CalendarDays, Brain, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase/client';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy } from 'firebase/firestore';

interface StudySession {
  id: string;
  course: string;
  topic: string;
  duration: number; // in minutes
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  completed: boolean;
  scheduledTime?: string;
  location?: string;
  notes?: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  difficulty: 'easy' | 'medium' | 'hard';
  workload: number; // hours per week
  assignments: Assignment[];
  exams: Exam[];
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  points: number;
  type: 'homework' | 'project' | 'essay' | 'lab';
  estimatedHours: number;
  completed: boolean;
}

interface Exam {
  id: string;
  title: string;
  date: string;
  weight: number;
  topics: string[];
  studyHours: number;
}

interface StudySchedule {
  id: string;
  name: string;
  courses: Course[];
  sessions: StudySession[];
  preferences: {
    preferredStudyTimes: string[];
    breakDuration: number;
    maxSessionLength: number;
    studyDays: string[];
  };
  generatedAt: string;
}

export function AIStudyScheduleGenerator() {
  const [currentSchedule, setCurrentSchedule] = useState<StudySchedule | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    credits: 3,
    difficulty: 'medium' as const,
    workload: 6
  });
  const [studyPreferences, setStudyPreferences] = useState({
    preferredStudyTimes: ['09:00', '14:00', '19:00'],
    breakDuration: 15,
    maxSessionLength: 120,
    studyDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load data from Firebase on component mount
  useEffect(() => {
    loadCourses();
    loadStudyPreferences();
    loadCurrentSchedule();
  }, []);

  const loadCourses = async () => {
    try {
      const coursesRef = collection(db, 'courses');
      const snapshot = await getDocs(coursesRef);
      const coursesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudyPreferences = async () => {
    try {
      const prefsRef = doc(db, 'userPreferences', 'studyPreferences');
      // This would load from user's preferences document
      // For now, we'll use the default preferences
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const loadCurrentSchedule = async () => {
    try {
      const schedulesRef = collection(db, 'studySchedules');
      const q = query(schedulesRef, orderBy('generatedAt', 'desc'));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const latestSchedule = {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data()
        } as StudySchedule;
        setCurrentSchedule(latestSchedule);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
    }
  };

  const generateSchedule = async () => {
    if (courses.length === 0) {
      toast({
        title: "No Courses",
        description: "Please add courses before generating a schedule.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Call AI service to generate intelligent schedule
      const response = await fetch('/api/ai/generate-study-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courses,
          preferences: studyPreferences,
          currentDate: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate schedule');
      }

      const { schedule } = await response.json();
      
      // Save schedule to Firebase
      const schedulesRef = collection(db, 'studySchedules');
      const docRef = await addDoc(schedulesRef, {
        ...schedule,
        generatedAt: new Date().toISOString(),
        userId: 'current-user' // This would be the actual user ID
      });

      setCurrentSchedule({
        ...schedule,
        id: docRef.id
      });
      
      toast({
        title: "Schedule Generated!",
        description: "Your personalized study schedule has been created.",
      });
    } catch (error) {
      console.error('Error generating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to generate schedule. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const addCourse = async () => {
    if (!newCourse.name || !newCourse.code) return;
    
    try {
      const coursesRef = collection(db, 'courses');
      const docRef = await addDoc(coursesRef, {
        ...newCourse,
        assignments: [],
        exams: [],
        createdAt: new Date().toISOString(),
        userId: 'current-user' // This would be the actual user ID
      });
      
      const course: Course = {
        id: docRef.id,
        ...newCourse,
        assignments: [],
        exams: []
      };
      
      setCourses([...courses, course]);
      setNewCourse({ name: '', code: '', credits: 3, difficulty: 'medium', workload: 6 });
      
      toast({
        title: "Course Added",
        description: `${course.name} has been added to your schedule.`,
      });
    } catch (error) {
      console.error('Error adding course:', error);
      toast({
        title: "Error",
        description: "Failed to add course. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleSessionComplete = async (sessionId: string) => {
    if (!currentSchedule) return;
    
    try {
      const updatedSessions = currentSchedule.sessions.map(session =>
        session.id === sessionId ? { ...session, completed: !session.completed } : session
      );
      
      const updatedSchedule = {
        ...currentSchedule,
        sessions: updatedSessions
      };
      
      // Update in Firebase
      const scheduleRef = doc(db, 'studySchedules', currentSchedule.id);
      await updateDoc(scheduleRef, {
        sessions: updatedSessions,
        lastModified: new Date().toISOString()
      });
      
      setCurrentSchedule(updatedSchedule);
      
      toast({
        title: "Session Updated",
        description: "Your progress has been saved.",
      });
    } catch (error) {
      console.error('Error updating session:', error);
      toast({
        title: "Error",
        description: "Failed to update session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getCompletionPercentage = () => {
    if (!currentSchedule || currentSchedule.sessions.length === 0) return 0;
    const completed = currentSchedule.sessions.filter(s => s.completed).length;
    return Math.round((completed / currentSchedule.sessions.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Study Schedule Generator
          </h2>
          <p className="text-muted-foreground">
            Create personalized study plans based on your courses and learning patterns
          </p>
        </div>
        <Button onClick={generateSchedule} disabled={isGenerating} className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          {isGenerating ? 'Generating...' : 'Generate Schedule'}
        </Button>
      </div>

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="schedule">Study Schedule</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Your Courses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Course */}
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="courseName">Course Name</Label>
                  <Input
                    id="courseName"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                    placeholder="e.g., Calculus I"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="courseCode">Course Code</Label>
                  <Input
                    id="courseCode"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                    placeholder="e.g., MATH 101"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workload">Weekly Workload (hours)</Label>
                  <Input
                    id="workload"
                    type="number"
                    value={newCourse.workload}
                    onChange={(e) => setNewCourse({ ...newCourse, workload: parseInt(e.target.value) })}
                  />
                </div>
                <div className="col-span-2">
                  <Button onClick={addCourse} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                  </Button>
                </div>
              </div>

              {/* Course List */}
              <div className="space-y-3">
                {courses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{course.name}</h3>
                        <p className="text-sm text-muted-foreground">{course.code} • {course.credits} credits</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{course.difficulty}</Badge>
                          <Badge variant="secondary">{course.workload}h/week</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Study Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          {currentSchedule ? (
            <div className="space-y-4">
              {/* Progress Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Study Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-muted-foreground">{getCompletionPercentage()}%</span>
                    </div>
                    <Progress value={getCompletionPercentage()} className="h-2" />
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">{currentSchedule.sessions.length}</div>
                        <div className="text-xs text-muted-foreground">Total Sessions</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {currentSchedule.sessions.filter(s => s.completed).length}
                        </div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {currentSchedule.sessions.filter(s => !s.completed).length}
                        </div>
                        <div className="text-xs text-muted-foreground">Remaining</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Study Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Study Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentSchedule.sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          session.completed ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSessionComplete(session.id)}
                            className="hover:bg-transparent h-8 w-8 p-0"
                          >
                            {session.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                            )}
                          </Button>
                          <div>
                            <h3 className={`font-semibold ${session.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {session.topic}
                            </h3>
                            <p className="text-sm text-muted-foreground">{session.course}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getPriorityColor(session.priority)}>
                                {session.priority}
                              </Badge>
                              <Badge variant="outline">
                                <Clock className="h-3 w-3 mr-1" />
                                {session.duration}min
                              </Badge>
                              {session.deadline && (
                                <Badge variant="outline">
                                  <CalendarDays className="h-3 w-3 mr-1" />
                                  {new Date(session.deadline).toLocaleDateString()}
                                </Badge>
                              )}
                            </div>
                            {session.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{session.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Bell className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Study Schedule</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Generate your personalized study schedule to get started
                </p>
                <Button onClick={generateSchedule} disabled={isGenerating}>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Schedule
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Study Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Session Length (minutes)</Label>
                  <Input
                    type="number"
                    value={studyPreferences.maxSessionLength}
                    onChange={(e) => setStudyPreferences({
                      ...studyPreferences,
                      maxSessionLength: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Break Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={studyPreferences.breakDuration}
                    onChange={(e) => setStudyPreferences({
                      ...studyPreferences,
                      breakDuration: parseInt(e.target.value)
                    })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Preferred Study Times</Label>
                <div className="flex gap-2">
                  {studyPreferences.preferredStudyTimes.map((time, index) => (
                    <Input
                      key={index}
                      type="time"
                      value={time}
                      onChange={(e) => {
                        const newTimes = [...studyPreferences.preferredStudyTimes];
                        newTimes[index] = e.target.value;
                        setStudyPreferences({
                          ...studyPreferences,
                          preferredStudyTimes: newTimes
                        });
                      }}
                      className="w-24"
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Study Days</Label>
                <div className="flex gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <Button
                      key={day}
                      variant={studyPreferences.studyDays.includes(day) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const newDays = studyPreferences.studyDays.includes(day)
                          ? studyPreferences.studyDays.filter(d => d !== day)
                          : [...studyPreferences.studyDays, day];
                        setStudyPreferences({
                          ...studyPreferences,
                          studyDays: newDays
                        });
                      }}
                    >
                      {day.slice(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Study Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Study Time Distribution</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Morning (6-12)</span>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Afternoon (12-18)</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Evening (18-24)</span>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Course Focus</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Calculus I</span>
                      <span className="text-sm font-medium">40%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">CS Fundamentals</span>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Other</span>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

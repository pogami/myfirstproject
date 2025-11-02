'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { AlertCircle, Info, CheckCircle2, XCircle } from 'lucide-react';

export default function ComponentsDemoPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');

  const toggleLoading = () => {
    setIsLoading(!isLoading);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8 max-w-7xl">
        {/* Breadcrumb (#10) */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="hover:text-blue-600">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/components-demo" className="hover:text-blue-600">Components</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold">Demo</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Shadcn/ui Components
          </h1>
          <p className="text-lg text-muted-foreground">Beautiful components for CourseConnect 🎨</p>
        </div>

      {/* Alert (#7) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
          <h2 className="text-3xl font-bold">Alerts - System Messages</h2>
        </div>
        <div className="grid gap-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Info</AlertTitle>
            <AlertDescription>
              Your syllabus has been uploaded successfully!
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Exam Alert!</AlertTitle>
            <AlertDescription>
              Your MATH-101 midterm exam is tomorrow at 2:00 PM. Don't forget to bring your calculator!
            </AlertDescription>
          </Alert>

          <Alert className="border-green-500 text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              You've completed 5 quizzes this week! Keep up the great work! 🎉
            </AlertDescription>
          </Alert>

          <Alert className="border-yellow-500 text-yellow-700 dark:text-yellow-400">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Assignment Due Soon</AlertTitle>
            <AlertDescription>
              Your CS-202 project proposal is due in 2 days (Friday at 11:59 PM).
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Tabs (#8) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
          <h2 className="text-3xl font-bold">Tabs - Dashboard Organization</h2>
        </div>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="study-plan">Study Plan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Overview</CardTitle>
                <CardDescription>Your current progress across all courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>MATH-101</span>
                    <span className="text-green-600 font-semibold">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CS-202</span>
                    <span className="text-blue-600 font-semibold">92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ENG-105</span>
                    <span className="text-yellow-600 font-semibold">78%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Assignments</CardTitle>
                <CardDescription>3 assignments due this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border-l-4 border-red-500 pl-3">
                    <p className="font-semibold">CS-202: Data Structures Project</p>
                    <p className="text-sm text-muted-foreground">Due: Friday, Oct 20 at 11:59 PM</p>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-3">
                    <p className="font-semibold">MATH-101: Problem Set 5</p>
                    <p className="text-sm text-muted-foreground">Due: Monday, Oct 23 at 9:00 AM</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-3">
                    <p className="font-semibold">ENG-105: Essay Draft</p>
                    <p className="text-sm text-muted-foreground">Due: Wednesday, Oct 25 at 5:00 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="exams" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Exams</CardTitle>
                <CardDescription>2 exams scheduled</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <p className="font-bold text-red-700 dark:text-red-400">MATH-101 Midterm</p>
                    <p className="text-sm">Tomorrow, Oct 14 at 2:00 PM</p>
                    <p className="text-sm text-muted-foreground mt-1">Location: Room 305</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="font-bold text-blue-700 dark:text-blue-400">CS-202 Quiz 3</p>
                    <p className="text-sm">Oct 20 at 10:00 AM</p>
                    <p className="text-sm text-muted-foreground mt-1">Location: Online</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="study-plan" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Study Plan</CardTitle>
                <CardDescription>Personalized study recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">📚 Review MATH-101 Chapter 5 (1 hour)</p>
                  <p className="text-sm">💻 Complete CS-202 coding practice (2 hours)</p>
                  <p className="text-sm">✍️ Outline ENG-105 essay (45 minutes)</p>
                  <p className="text-sm">🧠 Take a 15-minute break</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Skeleton (#1) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
          <h2 className="text-3xl font-bold">Skeleton - Loading States</h2>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={toggleLoading} variant="outline">
            {isLoading ? 'Hide Loading' : 'Show Loading'}
          </Button>
        </div>
        
        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[80%]" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Course Content Loaded</CardTitle>
              <CardDescription>All your syllabus data is ready!</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Your MATH-101 course has 12 topics, 8 assignments, and 3 exams.</p>
              <div className="flex gap-2 mt-4">
                <Button size="sm">View Details</Button>
                <Button size="sm" variant="outline">Edit</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Tooltip (#6) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
          <h2 className="text-3xl font-bold">Tooltip - Helpful Hints</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Tooltip Examples</CardTitle>
            <CardDescription>Hover over the items below for more info</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4 flex-wrap">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Upload Syllabus</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upload a PDF, DOCX, or TXT file of your syllabus</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">⌘K</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open Command Menu (Ctrl+K on Windows)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg cursor-help">
                    <span className="text-sm">Study Score: 85%</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your study consistency this week</p>
                  <p className="text-xs text-muted-foreground">Based on quiz performance and time spent</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardContent>
        </Card>
      </section>

      {/* Radio Group (#9) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
          <h2 className="text-3xl font-bold">Radio Group - Quiz Interface</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Quiz Question</CardTitle>
            <CardDescription>Select the correct answer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="font-semibold">What is the capital of France?</p>
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="london" id="london" />
                  <Label htmlFor="london" className="flex-1 cursor-pointer">London</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="paris" id="paris" />
                  <Label htmlFor="paris" className="flex-1 cursor-pointer">Paris</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="berlin" id="berlin" />
                  <Label htmlFor="berlin" className="flex-1 cursor-pointer">Berlin</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="rome" id="rome" />
                  <Label htmlFor="rome" className="flex-1 cursor-pointer">Rome</Label>
                </div>
              </RadioGroup>
              {selectedAnswer && (
                <div className="mt-4">
                  <Alert className={selectedAnswer === 'paris' ? 'border-green-500' : 'border-red-500'}>
                    {selectedAnswer === 'paris' ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-600">Correct! 🎉</AlertTitle>
                        <AlertDescription>Paris is indeed the capital of France!</AlertDescription>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertTitle className="text-red-600">Incorrect</AlertTitle>
                        <AlertDescription>Try again! The correct answer is Paris.</AlertDescription>
                      </>
                    )}
                  </Alert>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Textarea */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
          <h2 className="text-3xl font-bold">Textarea - Long Form Input</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Essay Response</CardTitle>
            <CardDescription>Write your answer below (minimum 200 words)</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Type your essay here..." 
              className="min-h-[200px] resize-y"
            />
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-muted-foreground">0 / 200 words</p>
              <Button>Submit Essay</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Calendar (#2) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
          <h2 className="text-3xl font-bold">Calendar - Exam & Assignment Dates</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Course Calendar</CardTitle>
            <CardDescription>View upcoming exams and assignment deadlines</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
            {date && (
              <div className="mt-4 w-full">
                <p className="text-sm text-muted-foreground mb-2">
                  Selected: {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Events on this day</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>MATH-101 Midterm Exam - 2:00 PM</li>
                      <li>Office Hours with Prof. Smith - 4:00 PM</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Data Table Preview (#3) */}
      <section className="space-y-6 pb-12">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
          <h2 className="text-3xl font-bold">Data Table - Assignments Overview</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Assignments</CardTitle>
            <CardDescription>Sortable and filterable assignment tracker</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-semibold">Course</th>
                    <th className="text-left p-3 font-semibold">Assignment</th>
                    <th className="text-left p-3 font-semibold">Due Date</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-3">MATH-101</td>
                    <td className="p-3">Problem Set 5</td>
                    <td className="p-3">Oct 23, 2025</td>
                    <td className="p-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
                        In Progress
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-3">CS-202</td>
                    <td className="p-3">Project Proposal</td>
                    <td className="p-3">Oct 20, 2025</td>
                    <td className="p-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                        Due Soon
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/50">
                    <td className="p-3">ENG-105</td>
                    <td className="p-3">Essay Draft</td>
                    <td className="p-3">Oct 25, 2025</td>
                    <td className="p-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                        Not Started
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <div className="text-center py-12 border-t">
        <p className="text-muted-foreground">
          Built with ❤️ by Adam for CourseConnect
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Using <a href="https://ui.shadcn.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">shadcn/ui</a> components
        </p>
      </div>
      </div>
    </div>
  );
}


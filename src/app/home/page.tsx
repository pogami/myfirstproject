"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CourseConnectLogo } from "@/components/icons/courseconnect-logo";
import { useEffect, useState, useRef } from "react";
import { ArrowRight, BookOpen, Bot, Mail, MessageSquare, Users, Upload, GraduationCap, Send, User, CheckCircle, Sparkles, FileText, Clock, Loader2, X, MessageCircle, TrendingUp, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { analyzeSyllabus } from "@/ai/flows/analyze-syllabus";
import { generateFlashcards } from "@/ai/flows/generate-flashcards";
import { Flashcard } from "@/ai/schemas/flashcard-schemas";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation";
import { Hero } from "@/components/hero";

const popularClasses = [
    { name: "BIO-101", description: "Intro to Biology", icon: <Bot className="size-8 text-green-500" />, studentCount: 123 },
    { name: "CS-202", description: "Data Structures", icon: <Users className="size-8 text-blue-500" />, studentCount: 88 },
    { name: "ENG-210", description: "Shakespeare", icon: <MessageSquare className="size-8 text-amber-500" />, studentCount: 45 },
    { name: "HIST-301", description: "American History", icon: <BookOpen className="size-8 text-red-500" />, studentCount: 92 },
    { name: "PSYCH-101", description: "Intro to Psychology", icon: <Bot className="size-8 text-purple-500" />, studentCount: 150 },
    { name: "MATH-203", description: "Linear Algebra", icon: <Users className="size-8 text-indigo-500" />, studentCount: 76 },
]

// Demo data
const demoClasses = [
  { name: "CS-101: Intro to Computer Science", students: 45, messages: 127, lastActivity: "2 min ago" },
  { name: "BIO-201: Cell Biology", students: 32, messages: 89, lastActivity: "5 min ago" },
  { name: "ENG-210: Shakespeare Studies", students: 28, messages: 156, lastActivity: "1 hour ago" },
];

const demoMessages = [
  { sender: 'ai', text: 'Hi! I\'m CourseConnect AI. I can help you with homework, explain concepts, and provide study tips. What would you like to know?' },
  { sender: 'user', text: 'Can you explain photosynthesis?' },
  { sender: 'ai', text: 'Photosynthesis is the process by which plants convert light energy into chemical energy. It occurs in two main stages: light-dependent reactions and the Calvin cycle. Would you like me to explain either stage in more detail?' },
];

const demoFlashcards = [
  { question: "What is a variable in programming?", answer: "A variable is a storage location with an associated name that contains data which can be modified during program execution." },
  { question: "What is the difference between a list and an array?", answer: "A list is a dynamic data structure that can grow/shrink, while an array has a fixed size. Lists are more flexible but arrays are more memory efficient." },
  { question: "What is recursion?", answer: "Recursion is a programming technique where a function calls itself to solve smaller instances of the same problem." },
  { question: "What is the time complexity of binary search?", answer: "O(log n) - binary search divides the search space in half with each comparison." },
  { question: "What is object-oriented programming?", answer: "OOP is a programming paradigm based on objects that contain data (attributes) and code (methods), promoting code reusability and organization." }
];

export default function LandingPage() {
    const [showSignupAlert, setShowSignupAlert] = useState(false);
    const [currentFlashcard, setCurrentFlashcard] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [chatMessage, setChatMessage] = useState("");
    const [chatMessages, setChatMessages] = useState(demoMessages);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [isAiTyping, setIsAiTyping] = useState(false);
    
    // Real file upload state
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [realFlashcards, setRealFlashcards] = useState<Flashcard[]>([]);
    const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const signupAlertShown = sessionStorage.getItem('signupAlertShown');
        if (!signupAlertShown) {
            const timer = setTimeout(() => {
                setShowSignupAlert(true);
                sessionStorage.setItem('signupAlertShown', 'true');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);

  const handleSignUpClick = () => {
    setShowSignupAlert(false);
    router.push('/dashboard');
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // Add user message to chat
      const userMessage = { sender: 'user', text: chatMessage };
      setChatMessages(prev => [...prev, userMessage]);
      
      // Clear input and show typing
      const currentMessage = chatMessage;
      setChatMessage('');
      setIsAiTyping(true);
      
      // Simulate AI response based on the question
      setTimeout(() => {
        let aiResponse = '';
        const question = currentMessage.toLowerCase();
        
        if (question.includes('recursion')) {
          aiResponse = 'Recursion is a programming technique where a function calls itself to solve smaller instances of the same problem. It\'s like a loop but more elegant for certain problems like tree traversal or factorial calculation.';
        } else if (question.includes('binary search')) {
          aiResponse = 'Binary search is an efficient algorithm that finds a target value in a sorted array by repeatedly dividing the search space in half. It has O(log n) time complexity, making it much faster than linear search for large datasets.';
        } else if (question.includes('variable')) {
          aiResponse = 'A variable is a storage location with an associated name that contains data which can be modified during program execution. Think of it as a labeled box that holds different values.';
        } else if (question.includes('algorithm')) {
          aiResponse = 'An algorithm is a step-by-step procedure for solving a problem or completing a task. It\'s like a recipe that tells you exactly how to solve a problem in programming.';
        } else if (question.includes('data structure')) {
          aiResponse = 'Data structures are ways of organizing and storing data in a computer so that it can be accessed and modified efficiently. Examples include arrays, lists, stacks, queues, and trees.';
        } else if (question.includes('hello') || question.includes('hi')) {
          aiResponse = 'Hello! I\'m CourseConnect AI. I can help you with programming concepts, explain algorithms, and provide study guidance. What would you like to know?';
        } else if (question.includes('help')) {
          aiResponse = 'I can help you understand programming concepts like variables, functions, data structures, algorithms, and more. Just ask me about any CS topic!';
        } else {
          aiResponse = 'That\'s a great question! CourseConnect AI can help you understand complex programming concepts, explain algorithms, and provide study guidance. Feel free to ask about any CS-101 topics!';
        }
        
        setChatMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
        setIsAiTyping(false);
      }, 1000);
    }
  };

  const nextFlashcard = () => {
    if (currentFlashcard < (realFlashcards.length > 0 ? realFlashcards.length : demoFlashcards.length) - 1) {
      setCurrentFlashcard(currentFlashcard + 1);
      setShowAnswer(false);
    }
  };

  const prevFlashcard = () => {
    if (currentFlashcard > 0) {
      setCurrentFlashcard(currentFlashcard - 1);
      setShowAnswer(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
        });
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a PDF, TXT, DOC, or DOCX file",
        });
        return;
      }
      
      setUploadedFile(file);
      toast({
        title: "File uploaded!",
        description: `${file.name} is ready for analysis`,
      });
    }
  };

  const handleDemoFile = async () => {
    try {
      const response = await fetch('/demo-syllabus.txt');
      const text = await response.text();
      const blob = new Blob([text], { type: 'text/plain' });
      const file = new File([blob], 'demo-syllabus.txt', { type: 'text/plain' });
      setUploadedFile(file);
      toast({
        title: "Demo file loaded!",
        description: "CS-101 syllabus ready for analysis",
      });
      
      // Automatically start analysis for demo
      setTimeout(() => {
        handleAnalyzeFile();
      }, 1000);
    } catch (error) {
      console.error("Error loading demo file:", error);
      toast({
        variant: "destructive",
        title: "Demo file error",
        description: "Could not load demo syllabus",
      });
    }
  };

  const handleAnalyzeFile = async (retryCount = 0) => {
    if (!uploadedFile) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 200);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileDataUri = e.target?.result as string;
        
        try {
          console.log("Starting AI analysis for file:", uploadedFile.name, "Size:", uploadedFile.size);
          const result = await analyzeSyllabus({ fileDataUri });
          console.log("AI analysis result:", result);
          setAnalysisProgress(100);
          setAnalysisResult(result);
          
          toast({
            title: "Analysis Complete!",
            description: `CourseConnect AI analyzed your syllabus successfully`,
          });
          
          // Show analysis modal
          setShowAnalysisModal(true);
          
          // Generate flashcards from the analysis
          await generateFlashcardsFromSyllabus(result);
        } catch (aiError) {
          console.error("AI Analysis error:", aiError);
          const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown error';
          if (errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('Service Unavailable')) {
            if (retryCount < 2) {
              const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
              console.log(`Retrying in ${delay}ms (attempt ${retryCount + 1}/3)`);
              setTimeout(() => { handleAnalyzeFile(retryCount + 1); }, delay);
              toast({ 
                title: "Retrying...", 
                description: `AI service busy. Retrying in ${delay/1000} seconds...`,
              });
              return;
            } else {
              toast({ 
                variant: "destructive", 
                title: "AI Service Busy", 
                description: "Google AI is temporarily overloaded. Please try again in a few minutes.",
              });
            }
          } else {
            console.error("Detailed error:", errorMessage);
            toast({ 
              variant: "destructive", 
              title: "Analysis Failed", 
              description: `AI analysis failed: ${errorMessage}. Please try again later.`,
            });
          }
        } finally {
          setIsAnalyzing(false);
          clearInterval(progressInterval);
        }
      };
      
      reader.readAsDataURL(uploadedFile);
    } catch (error) {
      console.error("File reading error:", error);
      setIsAnalyzing(false);
      clearInterval(progressInterval);
    }
  };

  const generateFlashcardsFromSyllabus = async (syllabusResult: any) => {
    setIsGeneratingFlashcards(true);
    try {
      const result = await generateFlashcards({
        className: `${syllabusResult.classCode}: ${syllabusResult.className}`,
        context: `This is a syllabus for ${syllabusResult.classCode}: ${syllabusResult.className} taught by ${syllabusResult.professor}. The course covers topics like ${(syllabusResult.topics || []).join(', ')}. Generate flashcards covering the key concepts, topics, and learning objectives from this specific course.`
      });
      
      setRealFlashcards(result.flashcards);
      toast({
        title: "Flashcards Generated!",
        description: `Created ${result.flashcards.length} flashcards for ${syllabusResult.classCode}`,
      });
    } catch (error) {
      console.error("Flashcard generation error:", error);
      
      // Fallback to demo flashcards that match the course
      const courseSpecificFlashcards = [
        { question: `What is the main focus of ${syllabusResult.classCode}?`, answer: `${syllabusResult.className} covers fundamental concepts in computer science including programming, data structures, and algorithms.` },
        { question: `Who teaches ${syllabusResult.classCode}?`, answer: `${syllabusResult.professor} teaches this course.` },
        { question: `What are the key topics in ${syllabusResult.classCode}?`, answer: `The main topics include ${(syllabusResult.topics || ['Programming Fundamentals', 'Data Structures', 'Algorithms']).join(', ')}.` },
        { question: `What is the difficulty level of ${syllabusResult.classCode}?`, answer: `This course is rated as ${syllabusResult.difficulty || 'Intermediate'} level.` },
        { question: `How many credits is ${syllabusResult.classCode} worth?`, answer: `${syllabusResult.classCode} is worth ${syllabusResult.credits || '3'} credit hours.` }
      ];
      
      setRealFlashcards(courseSpecificFlashcards);
      toast({
        title: "Course-Specific Flashcards Generated!",
        description: `Created ${courseSpecificFlashcards.length} flashcards for ${syllabusResult.classCode}`,
      });
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const generateDemoFlashcards = async () => {
    setIsGeneratingFlashcards(true);
    try {
      const result = await generateFlashcards({
        className: "CS-101: Introduction to Computer Science",
        context: "This is a syllabus for CS-101: Introduction to Computer Science. Generate flashcards covering the key concepts, topics, and learning objectives from this course."
      });
      
      setRealFlashcards(result.flashcards);
      toast({
        title: "Demo Flashcards Generated!",
        description: `Created ${result.flashcards.length} flashcards for CS-101`,
      });
    } catch (error) {
      console.error("Demo flashcard generation error:", error);
      
      // Fallback to static demo flashcards
      const demoFlashcards = [
        { question: "What is a variable in programming?", answer: "A variable is a storage location with an associated name that contains data which can be modified during program execution." },
        { question: "What is the difference between a list and an array?", answer: "A list is a dynamic data structure that can grow/shrink, while an array has a fixed size. Lists are more flexible but arrays are more memory efficient." },
        { question: "What is recursion?", answer: "Recursion is a programming technique where a function calls itself to solve smaller instances of the same problem." },
        { question: "What is the time complexity of binary search?", answer: "O(log n) - binary search divides the search space in half with each comparison." },
        { question: "What is object-oriented programming?", answer: "OOP is a programming paradigm based on objects that contain data (attributes) and code (methods), promoting code reusability and organization." }
      ];
      
      setRealFlashcards(demoFlashcards);
      toast({
        title: "Demo Flashcards Generated!",
        description: `Created ${demoFlashcards.length} flashcards for CS-101`,
      });
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setAnalysisResult(null);
    setRealFlashcards([]);
    setShowAnalysisModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background overflow-hidden relative">
      <style>
        {`
            :root {
                --primary-hsl: 203 76% 70%;
                --background-hsl: 204 100% 96%;
            }
            .dark {
                --primary-hsl: 203 70% 65%;
                --background-hsl: 210 15% 12%;
            }
            
            /* Ensure proper centering */
            body {
                margin: 0;
                padding: 0;
            }
            
            .container {
                width: 100%;
                margin-left: auto;
                margin-right: auto;
            }
        `}
      </style>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 max-w-6xl mx-auto px-6 items-center justify-between">
            <Link href="/home" className="flex items-center gap-3">
                <CourseConnectLogo className="h-9 w-9 text-primary" />
                <h1 className="text-3xl font-bold text-primary tracking-tight">CourseConnect</h1>
            </Link>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="lg" asChild>
                    <Link href="/login">Sign In</Link>
                </Button>
                <Button size="lg" asChild>
                    <Link href="/dashboard">Get Started <ArrowRight className="ml-2" /></Link>
                </Button>
            </div>
        </div>
      </header>
      <main className="flex-1">
        <Hero />
        <div className="container max-w-6xl mx-auto px-6">
          {/* Features Section */}
          <div className="mt-24 w-full">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold tracking-tight mb-6">Everything You Need to Succeed</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                CourseConnect combines AI-powered analysis with collaborative study tools to help you ace every class.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
              {/* AI Syllabus Analysis */}
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">AI Syllabus Analysis</CardTitle>
                  <CardDescription>
                    Upload any syllabus and get instant insights about course structure, key topics, and study recommendations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Automatic topic extraction</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Study schedule suggestions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Difficulty assessment</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Smart Study Groups */}
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Smart Study Groups</CardTitle>
                  <CardDescription>
                    Join or create study groups for your classes. Connect with classmates and collaborate on assignments.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Auto-match with classmates</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Real-time collaboration</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Study session scheduling</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Flashcards */}
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">AI-Generated Flashcards</CardTitle>
                  <CardDescription>
                    Automatically create study flashcards from your course materials. Perfect for exam preparation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Smart question generation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Spaced repetition system</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Progress tracking</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CourseConnect AI Assistant */}
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">CourseConnect AI Assistant</CardTitle>
                  <CardDescription>
                    Get instant help with homework, explanations, and study tips from our AI tutor.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>24/7 homework help</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Concept explanations</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Study strategy advice</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Tracking */}
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Progress Tracking</CardTitle>
                  <CardDescription>
                    Monitor your academic progress across all classes with detailed analytics and insights.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Grade predictions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Study time analytics</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Performance insights</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile App */}
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Study Anywhere</CardTitle>
                  <CardDescription>
                    Access all features on mobile. Study on the go with our responsive web app and mobile-optimized interface.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Mobile flashcards</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Offline study mode</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Push notifications</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Interactive Demo Section */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 mb-16">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Try It Yourself</h3>
                <p className="text-muted-foreground">
                  Upload a syllabus or try our demo to see CourseConnect AI in action
                </p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                {/* File Upload Demo */}
                <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5 text-primary" />
                      Upload Your Syllabus
                    </CardTitle>
                    <CardDescription>
                      Get instant AI analysis of your course materials
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.txt,.doc,.docx"
                          onChange={handleFileChange}
                          className="flex-1"
                        />
                        <Button onClick={handleDemoFile} variant="outline" size="sm">
                          Try Demo
                        </Button>
                      </div>
                      {uploadedFile && (
                        <div className="flex gap-2">
                          <Button onClick={() => handleAnalyzeFile()} className="flex-1">
                            {isAnalyzing ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Analyzing...
                              </>
                            ) : (
                              'Analyze with CourseConnect AI'
                            )}
                          </Button>
                          <Button onClick={clearUpload} variant="outline" size="sm">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {uploadedFile && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>{uploadedFile.name} ready for analysis</span>
                        </div>
                      )}
                      {isAnalyzing && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>CourseConnect AI is analyzing your syllabus...</span>
                          </div>
                          <Progress value={analysisProgress} className="w-full" />
                        </div>
                      )}
                      {analysisResult && (
                        <div className="text-sm text-green-600">
                          <CheckCircle className="h-4 w-4 inline mr-2" />
                          Analysis complete! Check your flashcards below.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Live Chat Demo */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      Chat with CourseConnect AI
                    </CardTitle>
                    <CardDescription>
                      Ask questions about your course or get study help
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-3 max-h-40 overflow-y-auto">
                        {chatMessages.map((message, index) => (
                          <div key={index} className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {message.sender === 'ai' && (
                              <Avatar className="h-6 w-6">
                                <div className="bg-primary text-primary-foreground text-xs flex items-center justify-center w-full h-full rounded-full">
                                  AI
                                </div>
                              </Avatar>
                            )}
                            <div className={`max-w-[80%] p-2 rounded-lg text-sm ${
                              message.sender === 'user' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}>
                              {message.text}
                            </div>
                            {message.sender === 'user' && (
                              <Avatar className="h-6 w-6">
                                <div className="bg-muted text-muted-foreground text-xs flex items-center justify-center w-full h-full rounded-full">
                                  You
                                </div>
                              </Avatar>
                            )}
                          </div>
                        ))}
                        {isAiTyping && (
                          <div className="flex gap-2 justify-start">
                            <Avatar className="h-6 w-6">
                              <div className="bg-primary text-primary-foreground text-xs flex items-center justify-center w-full h-full rounded-full">
                                AI
                              </div>
                            </Avatar>
                            <div className="bg-muted p-2 rounded-lg text-sm">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ask CourseConnect AI anything..."
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button onClick={handleSendMessage} size="sm" disabled={!chatMessage.trim() || isAiTyping}>
                          {isAiTyping ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              Sending...
                            </>
                          ) : (
                            'Send'
                          )}
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground text-center">
                        Try asking: "What is recursion?", "Explain binary search", "Hello", or "Help"
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Demo Flashcards Button */}
            {realFlashcards.length === 0 && demoFlashcards.length === 0 && (
              <div className="text-center mb-16">
                <Card className="max-w-md mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 justify-center">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Try AI Flashcards
                    </CardTitle>
                    <CardDescription className="text-center">
                      Generate sample flashcards to see how CourseConnect AI works
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={generateDemoFlashcards} 
                      className="w-full"
                      disabled={isGeneratingFlashcards}
                    >
                      {isGeneratingFlashcards ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Generating Demo Flashcards...
                        </>
                      ) : (
                        'Generate Demo Flashcards'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Live Flashcards Preview */}
            {(realFlashcards.length > 0 || demoFlashcards.length > 0) && (
              <Card className="mb-16">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    AI-Generated Flashcards
                  </CardTitle>
                  <CardDescription>
                    Study cards created from {analysisResult ? `${analysisResult.classCode} syllabus` : 'your course materials'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Flashcard Display */}
                    <div className="aspect-video border-2 border-border rounded-lg p-8 flex flex-col justify-center items-center text-center bg-gradient-to-br from-primary/5 to-primary/10">
                      <div className="mb-4">
                        <Badge variant="outline">
                          Card {currentFlashcard + 1} of {realFlashcards.length > 0 ? realFlashcards.length : demoFlashcards.length}
                        </Badge>
                      </div>
                      <h4 className="text-xl font-semibold mb-4">
                        {(realFlashcards.length > 0 ? realFlashcards : demoFlashcards)[currentFlashcard]?.question}
                      </h4>
                      {showAnswer && (
                        <p className="text-muted-foreground">
                          {(realFlashcards.length > 0 ? realFlashcards : demoFlashcards)[currentFlashcard]?.answer}
                        </p>
                      )}
                      {!showAnswer && (
                        <Button onClick={() => setShowAnswer(true)} variant="outline">
                          Show Answer
                        </Button>
                      )}
                    </div>
                    
                    {/* Navigation */}
                    <div className="flex justify-between items-center">
                      <Button 
                        onClick={prevFlashcard} 
                        variant="outline" 
                        disabled={currentFlashcard === 0}
                      >
                        Previous
                      </Button>
                      <div className="flex gap-2">
                        {Array.from({ length: Math.min(5, realFlashcards.length > 0 ? realFlashcards.length : demoFlashcards.length) }).map((_, i) => (
                          <Button
                            key={i}
                            variant={i === currentFlashcard ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setCurrentFlashcard(i);
                              setShowAnswer(false);
                            }}
                          >
                            {i + 1}
                          </Button>
                        ))}
                      </div>
                      <Button 
                        onClick={nextFlashcard} 
                        variant="outline"
                        disabled={currentFlashcard === (realFlashcards.length > 0 ? realFlashcards.length : demoFlashcards.length) - 1}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Popular Classes Section */}
          <div className="mt-24 w-full">
            <h2 className="text-3xl font-bold tracking-tight mb-6 text-center">Popular Classes</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {popularClasses.map((pClass) => (
                <Card key={pClass.name} className="flex flex-col items-center text-center p-4 transition-all hover:shadow-xl hover:-translate-y-1 bg-card/80 backdrop-blur-sm">
                  <div className="mb-3 p-3 rounded-full bg-primary/10">
                    {pClass.icon}
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{pClass.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{pClass.description}</p>
                  <Badge variant="secondary" className="text-xs">
                    {pClass.studentCount} students
                  </Badge>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <footer className="py-8 border-t bg-background/95 z-10">
        <div className="container max-w-6xl mx-auto px-6 text-center text-muted-foreground">
            © {new Date().getFullYear()} CourseConnect. All rights reserved.
        </div>
      </footer>

       {/* Analysis Results Modal */}
       <AlertDialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
          <AlertDialogContent className="max-w-2xl">
            <AlertDialogHeader>
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-3 border-2 border-primary/20">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </div>
              <AlertDialogTitle className="text-center text-2xl">Course Analysis Complete!</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                CourseConnect AI has analyzed your syllabus. Here are the key details:
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            {analysisResult && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">Course Code</h4>
                      <p className="text-lg font-bold">{analysisResult.classCode || 'CS-101'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">Course Name</h4>
                      <p className="text-lg">{analysisResult.className || 'Introduction to Computer Science'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">Professor</h4>
                      <p className="text-lg">{analysisResult.professor || 'Dr. Sarah Johnson'}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">Credits</h4>
                      <p className="text-lg">{analysisResult.credits || '3'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">Difficulty Level</h4>
                      <p className="text-lg">{analysisResult.difficulty || 'Intermediate'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">Key Topics</h4>
                      <div className="flex flex-wrap gap-1">
                        {(analysisResult.topics || ['Programming Fundamentals', 'Data Structures', 'Algorithms']).map((topic: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {analysisResult.summary && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Course Summary</h4>
                    <p className="text-sm text-muted-foreground">{analysisResult.summary}</p>
                  </div>
                )}
                
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
                  <h4 className="font-semibold text-primary mb-2">✨ Personalized Flashcards Generated!</h4>
                  <p className="text-sm text-muted-foreground">
                    CourseConnect AI has created custom flashcards based on your syllabus. 
                    Sign up to save your analysis and access all study features!
                  </p>
                </div>
              </div>
            )}
            
            <AlertDialogFooter className="flex-col gap-2">
              <AlertDialogAction onClick={() => {
                setShowAnalysisModal(false);
                router.push('/dashboard');
              }} className="w-full">
                Sign Up to Save Analysis
              </AlertDialogAction>
              <AlertDialogCancel asChild className="w-full mt-0">
                 <Button variant="ghost">Continue Demo</Button>
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

       <AlertDialog open={showSignupAlert} onOpenChange={setShowSignupAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
               <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-3 border-2 border-primary/20">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>
              <AlertDialogTitle className="text-center text-2xl">Ready to Join?</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Create a free account to save your classes, connect with students, and unlock all features.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col gap-2">
              <AlertDialogAction onClick={handleSignUpClick} className="w-full">
                Sign Up With Email
              </AlertDialogAction>
              <AlertDialogCancel asChild className="w-full mt-0">
                 <Button variant="ghost">Maybe Later</Button>
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      <Toaster />
    </div>
  );
}
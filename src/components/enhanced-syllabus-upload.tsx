"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, Users, Bot, Brain, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/hooks/use-chat-store";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/client";
import { Progress } from "@/components/ui/progress";
import { AnalyzingIcon } from "./icons/analyzing-icon";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DocumentProcessorClient } from "@/lib/syllabus-parser/document-processor-client";
import { AISyllabusParser } from "@/lib/syllabus-parser/ai-parser";
import { ParsedSyllabus, ParsingResult } from "@/types/syllabus-parsing";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const encouragingMessages = [
    "Get ready! The AI is analyzing your syllabus...",
    "Extracting course information... Almost there!",
    "Building your course profile. This will just take a moment.",
    "The AI is parsing your syllabus. Hang tight!",
    "Just a few more seconds while we process everything."
];

export default function EnhancedSyllabusUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentMessage, setCurrentMessage] = useState(encouragingMessages[0]);
    const [parsingResult, setParsingResult] = useState<ParsingResult | null>(null);
    const [showReview, setShowReview] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const router = useRouter();
    const { addChat, setCurrentTab } = useChatStore();
    const [user] = useAuthState(auth);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const droppedFile = event.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const removeFile = () => {
        setFile(null);
        setParsingResult(null);
        setShowReview(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const processSyllabus = async () => {
        if (!file || !user) return;

        setIsAnalyzing(true);
        setProgress(0);
        setCurrentMessage(encouragingMessages[0]);

        try {
            // Stage 1: Validate file
            setProgress(10);
            setCurrentMessage("Validating file...");
            
            const validation = DocumentProcessorClient.validateFile(file);
            if (!validation.valid) {
                throw new Error(validation.error || 'Invalid file');
            }

            // Stage 2: Extract text
            setProgress(30);
            setCurrentMessage("Extracting text from document...");
            
            const documentText = await DocumentProcessorClient.extractText(file);

            // Stage 3: AI parsing
            setProgress(60);
            setCurrentMessage("Analyzing content with AI...");
            
            const result = await AISyllabusParser.parseSyllabus(
                documentText.text,
                file.name,
                documentText.format
            );

            setParsingResult(result);
            setProgress(90);
            setCurrentMessage("Processing complete!");

            // Stage 4: Review or auto-create
            if (result.requiresReview) {
                setShowReview(true);
                setProgress(100);
            } else {
                await createCourseFromParsedData(result.data!);
            }

        } catch (error) {
            console.error('Syllabus processing error:', error);
            toast({
                title: "Processing Failed",
                description: error instanceof Error ? error.message : "Failed to process syllabus",
                variant: "destructive"
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const createCourseFromParsedData = async (data: ParsedSyllabus) => {
        if (!user) return;

        try {
            // Create a new chat for this course
            const courseTitle = data.courseInfo.title || 'New Course';
            const chatId = `course-${Date.now()}`;
            
            await addChat(chatId, courseTitle, [
                {
                    id: `welcome-${Date.now()}`,
                    text: `Welcome to ${courseTitle}! Your syllabus has been successfully parsed and analyzed.`,
                    sender: 'bot',
                    name: 'CourseConnect AI',
                    timestamp: Date.now()
                }
            ]);

            setCurrentTab(chatId);

            toast({
                title: "Course Created Successfully!",
                description: `Your course "${courseTitle}" has been set up with all parsed information.`,
            });

            // Navigate to the chat
            router.push('/dashboard/chat');

        } catch (error) {
            console.error('Error creating course:', error);
            toast({
                title: "Error",
                description: "Failed to create course. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleSaveAndCreate = async (data: ParsedSyllabus) => {
        setShowReview(false);
        await createCourseFromParsedData(data);
    };

    const getFileIcon = (file: File) => {
        if (file.type === 'application/pdf') return <FileText className="w-8 h-8 text-red-500" />;
        if (file.type.startsWith('image/')) return <FileText className="w-8 h-8 text-blue-500" />;
        return <FileText className="w-8 h-8 text-gray-500" />;
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

    if (showReview && parsingResult?.data) {
        return (
            <div className="space-y-6">
                <Alert>
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                        <div className="flex items-center gap-2">
                            <span>Syllabus parsed with</span>
                            {getConfidenceBadge(parsingResult.confidence)}
                            <span className={`font-medium ${getConfidenceColor(parsingResult.confidence)}`}>
                                {Math.round(parsingResult.confidence * 100)}% confidence
                            </span>
                        </div>
                    </AlertDescription>
                </Alert>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            Parsed Course Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Course Title</Label>
                                <p className="text-sm text-muted-foreground">
                                    {parsingResult.data.courseInfo.title || 'Not found'}
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Instructor</Label>
                                <p className="text-sm text-muted-foreground">
                                    {parsingResult.data.courseInfo.instructor || 'Not found'}
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Course Code</Label>
                                <p className="text-sm text-muted-foreground">
                                    {parsingResult.data.courseInfo.courseCode || 'Not found'}
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Credits</Label>
                                <p className="text-sm text-muted-foreground">
                                    {parsingResult.data.courseInfo.credits || 'Not found'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">
                                    {parsingResult.data.schedule.length}
                                </div>
                                <div className="text-sm text-muted-foreground">Class Sessions</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">
                                    {parsingResult.data.assignments.length}
                                </div>
                                <div className="text-sm text-muted-foreground">Assignments</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">
                                    {parsingResult.data.readings.length}
                                </div>
                                <div className="text-sm text-muted-foreground">Readings</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-2">
                    <Button onClick={() => setShowReview(false)} variant="outline">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>
                    <Button onClick={() => handleSaveAndCreate(parsingResult.data!)}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Create Course
                    </Button>
                </div>
            </div>
        );
    }

    if (isAnalyzing) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <AnalyzingIcon className="mx-auto" />
                            <div>
                                <h3 className="text-lg font-semibold mb-2">AI-Powered Syllabus Analysis</h3>
                                <p className="text-muted-foreground">{currentMessage}</p>
                            </div>
                            <Progress value={progress} className="w-full" />
                            <p className="text-sm text-muted-foreground">{progress}% Complete</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {file ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-primary" />
                            Enhanced Syllabus Upload
                        </CardTitle>
                        <CardDescription>
                            Our AI will extract all course information automatically
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 p-4 border rounded-lg">
                            {getFileIcon(file)}
                            <div className="flex-1">
                                <p className="font-medium">{file.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {file.type} • {(file.size / 1024 / 1024).toFixed(1)} MB
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={removeFile}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button onClick={processSyllabus} className="w-full">
                                <Brain className="w-4 h-4 mr-2" />
                                Parse with AI
                            </Button>
                            <Button variant="outline" onClick={removeFile}>
                                <X className="w-4 h-4 mr-2" />
                                Remove File
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-primary" />
                            Enhanced Syllabus Upload
                        </CardTitle>
                        <CardDescription>
                            Upload your syllabus and let AI extract all the important information automatically
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.docx,.txt,image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <div>
                                <p className="text-lg font-medium mb-2">
                                    Drag & drop your syllabus here
                                </p>
                                <p className="text-sm text-muted-foreground mb-4">
                                    or click to browse files
                                </p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    <Badge variant="outline">PDF</Badge>
                                    <Badge variant="outline">DOCX</Badge>
                                    <Badge variant="outline">TXT</Badge>
                                    <Badge variant="outline">Images</Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

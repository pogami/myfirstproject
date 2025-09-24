
"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeSyllabus } from "@/ai/flows/analyze-syllabus";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/hooks/use-chat-store";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/client";
import { Progress } from "@/components/ui/progress";
import { AnalyzingIcon } from "./icons/analyzing-icon";

const encouragingMessages = [
    "Get ready! The AI is creating your new study space.",
    "Unlocking your course secrets... Almost there!",
    "Building your collaborative corner. This will just take a moment.",
    "The AI is brewing up your study group. Hang tight!",
    "Just a few more seconds while we connect you with your classmates."
];


export default function SyllabusUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentMessage, setCurrentMessage] = useState(encouragingMessages[0]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const router = useRouter();
    const { addChat, chats, setShowUpgrade } = useChatStore();
    const [user] = useAuthState(auth);
    const isGuest = !user;

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isAnalyzing) {
            const randomIndex = Math.floor(Math.random() * encouragingMessages.length);
            setCurrentMessage(encouragingMessages[randomIndex]);
            setProgress(0);
            const interval = 50; // ms
            const totalTime = 5000; // 5 seconds for the full animation
            const increment = (interval / totalTime) * 100;
            
            timer = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 95) { // Stop just before 100 to wait for async operation
                        clearInterval(timer);
                        return 95;
                    }
                    return prev + increment;
                });
            }, interval);
        }
        return () => {
            clearInterval(timer);
        };
    }, [isAnalyzing]);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
                toast({
                    variant: "destructive",
                    title: "File too large",
                    description: "Please select a file smaller than 10MB.",
                });
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setIsAnalyzing(true);
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async (readerEvent) => {
            const fileDataUri = readerEvent.target?.result as string;

            try {
                const result = await analyzeSyllabus({ fileDataUri });
                 setProgress(100);

                // Create class chat with proper synchronization
                const chatName = result.isSyllabus ? 
                    `${result.classCode}: ${result.className}` : 
                    `Course: ${file.name.replace(/\.[^/.]+$/, "")}`;
                
                // Create a unique chat ID based on class code for synchronization
                const chatId = result.isSyllabus ? 
                    `class-${result.classCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : 
                    `course-${file.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
                
                await addChat(chatName, { sender: 'bot', name: 'CourseConnect AI', text: `Welcome to the ${chatName} class chat! 🎓\n\n**Class Chat Features:**\n• Ask questions about course topics\n• Collaborate with classmates\n• Get AI assistance with homework\n• Share study resources\n\n**Chat Guidelines:**\n• Be respectful and helpful\n• Ask specific, detailed questions\n• Share relevant course materials\n• Help your classmates when you can\n\nStart by asking a question about the course!`, timestamp: Date.now() }, chatId);

                toast({
                    title: "Upload Complete",
                    description: `Created chat room: ${chatName}`,
                });

                router.push('/dashboard/chat');

            } catch (aiError) {
                console.error("AI Error:", aiError);
                
                // Fallback: create a generic chat room even if AI fails
                const chatName = `Course: ${file.name.replace(/\.[^/.]+$/, "")}`;
                
                await addChat(
                    chatName,
                    { sender: 'bot', name: 'CourseConnect AI', text: `Welcome to the chat for ${chatName}! Ask a question to get started.\n\n**Chat Guidelines:**\nAsk specific questions about your course topics. Be detailed with your questions for better assistance! CourseConnect AI can help with math, science, English, history, computer science, and more.`, timestamp: Date.now() }
                );

                toast({
                    title: "Upload Complete",
                    description: `Created chat room: ${chatName} (AI analysis unavailable)`,
                });

                router.push('/dashboard/chat');
            } finally {
                // Check if the component is still mounted before setting state
                 if (fileInputRef.current) {
                    setIsAnalyzing(false);
                    setFile(null);
                 }
            }
        };
        reader.onerror = (error) => {
            console.error("File Reader Error:", error);
            toast({
                variant: "destructive",
                title: "File Read Error",
                description: "Could not read the selected file.",
            });
            setIsAnalyzing(false);
        }
    };

    const triggerFileIput = () => {
        fileInputRef.current?.click();
    }


    return (
        <Card className="transform transition-all hover:shadow-xl hover:-translate-y-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Upload /> Upload Syllabus</CardTitle>
                <CardDescription>Upload syllabi to find your classes and connect with classmates.</CardDescription>
            </CardHeader>
            <CardContent>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                    disabled={isAnalyzing}
                />
                {!file && !isAnalyzing && (
                     <div 
                        onClick={triggerFileIput} 
                        className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-xl p-6 sm:p-8 md:p-10 cursor-pointer hover:bg-muted transition-colors"
                    >
                        <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 mb-3 sm:mb-4" />
                        <p className="text-muted-foreground font-semibold text-sm sm:text-base text-center">Click or drag file to this area to upload</p>
                        <p className="text-xs text-muted-foreground mt-1 text-center">Supported formats: PDF, DOC, DOCX, TXT (max 10MB)</p>
                    </div>
                )}

                {file && !isAnalyzing && (
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-secondary/50 border">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-secondary-foreground flex-shrink-0" />
                                <p className="text-xs sm:text-sm font-medium truncate text-secondary-foreground">{file.name}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0" onClick={() => setFile(null)}>
                                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                        </div>
                        
                        <Button onClick={handleAnalyze} className="w-full text-sm sm:text-base">
                            <Upload className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            Upload and Analyze
                        </Button>
                    </div>
                )}
                {isAnalyzing && (
                     <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 space-y-3 sm:space-y-4 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-24 w-24 sm:h-32 sm:w-32 bg-primary/10 rounded-full animate-ping"></div>
                        </div>
                        <AnalyzingIcon className="h-20 w-20 sm:h-24 sm:w-24 text-primary mb-3 sm:mb-4 relative" />
                        <h3 className="text-lg sm:text-xl font-semibold">Analyzing your syllabus...</h3>
                        <p className="text-muted-foreground text-sm sm:text-base">{currentMessage}</p>
                        <Progress value={progress} className="w-full" />
                        <p className="text-sm font-bold text-primary">{Math.round(progress)}%</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

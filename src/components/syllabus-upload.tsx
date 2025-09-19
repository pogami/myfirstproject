
"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, Users, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeSyllabus } from "@/ai/flows/analyze-syllabus";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/hooks/use-chat-store";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/client";
import { Progress } from "@/components/ui/progress";
import { AnalyzingIcon } from "./icons/analyzing-icon";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
    findMatchingClassGroups, 
    createClassGroup, 
    joinClassGroup, 
    generateClassChatId, 
    generateSyllabusId,
    type SyllabusData,
    type ChatPreference 
} from "@/lib/syllabus-matching-service";

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
    const [chatPreference, setChatPreference] = useState<ChatPreference>({
        type: 'public-chat',
        allowJoining: true
    });
    const [matchingGroups, setMatchingGroups] = useState<any[]>([]);
    const [showGroupSelection, setShowGroupSelection] = useState(false);
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

                if (!result.isSyllabus) {
                    // Handle non-syllabus files
                    const chatName = `Course: ${file.name.replace(/\.[^/.]+$/, "")}`;
                    const chatId = `course-${file.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
                    
                    await addChat(
                        chatName,
                        { 
                            sender: 'bot', 
                            name: 'CourseConnect AI', 
                            text: `Welcome to the ${chatName} chat! 🎓\n\n**Chat Features:**\n• Ask questions about course topics\n• Get AI assistance with homework\n• Share study resources\n\n**Chat Guidelines:**\n• Be respectful and helpful\n• Ask specific, detailed questions\n• Share relevant course materials\n\nStart by asking a question about the course!`, 
                            timestamp: Date.now() 
                        },
                        chatId
                    );

                    toast({
                        title: "Upload Complete",
                        description: `Created chat room: ${chatName}`,
                    });

                    router.push('/dashboard/chat');
                    return;
                }

                // Create syllabus data
                const syllabusData: SyllabusData = {
                    id: generateSyllabusId({
                        className: result.className,
                        classCode: result.classCode,
                        uploadedBy: user?.uid || 'guest',
                        uploadedAt: Date.now(),
                        isPublic: chatPreference.type === 'public-chat'
                    }),
                    className: result.className,
                    classCode: result.classCode,
                    uploadedBy: user?.uid || 'guest',
                    uploadedAt: Date.now(),
                    isPublic: chatPreference.type === 'public-chat'
                };

                // If user wants AI-only chat, create it directly
                if (chatPreference.type === 'ai-only') {
                    const chatName = `${result.classCode}: ${result.className}`;
                    const chatId = generateClassChatId(syllabusData);
                    
                    await addChat(
                        chatName,
                        { 
                            sender: 'bot', 
                            name: 'CourseConnect AI', 
                            text: `Welcome to your personal ${chatName} AI chat! 🤖\n\n**AI Chat Features:**\n• Ask questions about course topics\n• Get AI assistance with homework\n• Request study materials\n• Get explanations of concepts\n\n**Chat Guidelines:**\n• Ask specific, detailed questions\n• Request help with assignments\n• Get clarification on topics\n\nStart by asking a question about the course!`, 
                            timestamp: Date.now() 
                        },
                        chatId
                    );

                    toast({
                        title: "Upload Complete",
                        description: `Created AI chat: ${chatName}`,
                    });

                    router.push('/dashboard/chat');
                    return;
                }

                // For public chats, find matching groups
                const matchingGroups = await findMatchingClassGroups(syllabusData);
                
                if (matchingGroups.length > 0) {
                    setMatchingGroups(matchingGroups);
                    setShowGroupSelection(true);
                    setIsAnalyzing(false);
                    return;
                }

                // No matching groups found, create new one
                const chatName = `${result.classCode}: ${result.className}`;
                const chatId = generateClassChatId(syllabusData);
                
                await addChat(
                    chatName,
                    { 
                        sender: 'bot', 
                        name: 'CourseConnect AI', 
                        text: `Welcome to the ${chatName} class chat! 🎓\n\n**Class Chat Features:**\n• Ask questions about course topics\n• Collaborate with classmates\n• Get AI assistance with homework\n• Share study resources\n\n**Chat Guidelines:**\n• Be respectful and helpful\n• Ask specific, detailed questions\n• Share relevant course materials\n• Help your classmates when you can\n\nStart by asking a question about the course!`, 
                        timestamp: Date.now() 
                    },
                    chatId
                );

                // Create class group
                await createClassGroup(syllabusData, chatId, chatPreference);

                console.log('Created class chat:', { chatName, chatId, syllabusData });

                toast({
                    title: "Upload Complete",
                    description: `Created new class chat: ${chatName}`,
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

    const handleJoinGroup = async (groupId: string, chatId: string) => {
        try {
            if (user) {
                await joinClassGroup(groupId, user.uid);
            }
            
            // Switch to the existing chat
            const group = matchingGroups.find(g => g.id === groupId);
            if (group) {
                await addChat(
                    group.className,
                    { 
                        sender: 'bot', 
                        name: 'CourseConnect AI', 
                        text: `Welcome to the ${group.className} class chat! 🎓\n\nYou've joined an existing class group with ${group.members.length} members.\n\n**Class Chat Features:**\n• Ask questions about course topics\n• Collaborate with classmates\n• Get AI assistance with homework\n• Share study resources\n\n**Chat Guidelines:**\n• Be respectful and helpful\n• Ask specific, detailed questions\n• Share relevant course materials\n• Help your classmates when you can\n\nStart by asking a question about the course!`, 
                        timestamp: Date.now() 
                    },
                    chatId
                );
            }

            toast({
                title: "Joined Class Group",
                description: `You've joined an existing class chat!`,
            });

            router.push('/dashboard/chat');
        } catch (error) {
            console.error('Error joining group:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to join the class group. Please try again.",
            });
        }
    };

    const handleCreateNewGroup = async () => {
        setShowGroupSelection(false);
        setIsAnalyzing(true);
        // Continue with creating new group logic
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const droppedFile = files[0];
            if (droppedFile.size > 10 * 1024 * 1024) { // 10MB limit
                toast({
                    variant: "destructive",
                    title: "File too large",
                    description: "Please select a file smaller than 10MB.",
                });
                return;
            }
            setFile(droppedFile);
        }
    };

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
                
                {/* Chat Preferences */}
                {!file && !isAnalyzing && (
                    <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                        <h3 className="text-sm font-medium mb-3">Chat Preferences</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="public-chat"
                                    checked={chatPreference.type === 'public-chat'}
                                    onCheckedChange={(checked) => 
                                        setChatPreference(prev => ({ 
                                            ...prev, 
                                            type: checked ? 'public-chat' : 'ai-only' 
                                        }))
                                    }
                                />
                                <Label htmlFor="public-chat" className="flex items-center gap-2 cursor-pointer">
                                    <Users className="h-4 w-4" />
                                    Join/Create Public Class Chat
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="ai-only"
                                    checked={chatPreference.type === 'ai-only'}
                                    onCheckedChange={(checked) => 
                                        setChatPreference(prev => ({ 
                                            ...prev, 
                                            type: checked ? 'ai-only' : 'public-chat' 
                                        }))
                                    }
                                />
                                <Label htmlFor="ai-only" className="flex items-center gap-2 cursor-pointer">
                                    <Bot className="h-4 w-4" />
                                    AI-Only Personal Chat
                                </Label>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {chatPreference.type === 'public-chat' 
                                ? 'You\'ll be matched with classmates who uploaded similar syllabi'
                                : 'You\'ll get a private chat with AI assistance only'
                            }
                        </p>
                    </div>
                )}
                
                {!file && !isAnalyzing && (
                     <div 
                        onClick={triggerFileInput} 
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
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
            
            {/* Group Selection Modal */}
            {showGroupSelection && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Found Matching Class Groups
                            </CardTitle>
                            <CardDescription>
                                We found existing class chats that match your syllabus. Choose one to join or create a new group.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {matchingGroups.map((group) => (
                                <div key={group.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm truncate">{group.className}</h4>
                                            <p className="text-xs text-muted-foreground">
                                                {group.classCode} • {group.members.length} members
                                            </p>
                                            {group.university && (
                                                <p className="text-xs text-muted-foreground">{group.university}</p>
                                            )}
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleJoinGroup(group.id, group.chatId)}
                                            className="ml-2"
                                        >
                                            Join
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={handleCreateNewGroup}
                                    className="w-full"
                                >
                                    Create New Group Instead
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </Card>
    );
}


"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, Loader2, Bot, GraduationCap, Sparkles, BookUser, PencilLine, BrainCircuit, Save, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateFlashcards } from "@/ai/flows/generate-flashcards";
import { Flashcard } from "@/ai/schemas/flashcard-schemas";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useChatStore, Chat } from "@/hooks/use-chat-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase/client-simple";
import { addDoc, collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/client-simple";

export default function FlashcardGenerator() {
    const { chats } = useChatStore();
    const router = useRouter();
    const [user] = useAuthState(auth);
    const [topic, setTopic] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [currentCard, setCurrentCard] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [studyStats, setStudyStats] = useState({ correct: 0, total: 0 });
    const { toast } = useToast();
    
    const classChats = Object.entries(chats).filter(([key]) => key !== 'general-chat');


    const handleGenerateFromClass = async (chat: Chat) => {
        setIsGenerating(true);
        setFlashcards([]);
        setCurrentCard(0);
        setIsFlipped(false);
        
        try {
            const chatHistory = chat.messages
                .map(m => `${m.name}: ${m.text}`)
                .join('\n');

            const result = await generateFlashcards({ 
                className: chat.name,
                chatHistory,
             });

            if (result.flashcards.length === 0) {
                 toast({
                    variant: "default",
                    title: "Not Enough Context",
                    description: "There wasn't enough chat history to generate flashcards. Try again after more discussion!",
                });
            } else {
                setFlashcards(result.flashcards);
                toast({
                    title: "Flashcards Generated!",
                    description: `Created ${result.flashcards.length} flashcards for ${chat.name}.`,
                });
            }

        } catch (aiError) {
            console.error("AI Error:", aiError);
            toast({
                variant: "destructive",
                title: "AI Generation Failed",
                description: "The AI could not generate flashcards. Please try again.",
            });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleGenerateFromTopic = async () => {
        if (!topic.trim()) {
            toast({ variant: "destructive", title: "No topic provided", description: "Please enter a topic to generate flashcards." });
            return;
        };

        setIsGenerating(true);
        setFlashcards([]);
        setCurrentCard(0);
        setIsFlipped(false);
        
        try {
            const result = await generateFlashcards({ topic });
            setFlashcards(result.flashcards);
            toast({
                title: "Flashcards Generated!",
                description: `Created ${result.flashcards.length} flashcards for you to study.`,
            });
        } catch (aiError) {
            console.error("AI Error:", aiError);
            toast({
                variant: "destructive",
                title: "AI Generation Failed",
                description: "The AI could not generate flashcards. Please try again with a different topic.",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const saveFlashcardsToFirebase = async (flashcards: Flashcard[], title: string) => {
        if (!user || flashcards.length === 0) return;

        setIsSaving(true);
        try {
            const flashcardSetData = {
                title,
                topic: topic || 'General',
                flashcards: flashcards.map(f => ({
                    front: f.question,
                    back: f.answer
                })),
                userId: user.uid,
                createdAt: new Date().toISOString(),
                studyStats: {
                    totalStudies: 0,
                    correctAnswers: 0,
                    lastStudied: null
                }
            };

            await addDoc(collection(db, 'flashcardSets'), flashcardSetData);
            
            toast({
                title: "Flashcards Saved!",
                description: "Your flashcard set has been saved to your collection.",
            });

            // Notify parent component of flashcard save event
            window.dispatchEvent(new CustomEvent('flashcard-event', {
                detail: { type: 'flashcards_saved', data: { count: flashcards.length } }
            }));

        } catch (error) {
            console.error('Error saving flashcards:', error);
            toast({
                variant: "destructive",
                title: "Save Failed",
                description: "Could not save flashcards. Please try again.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const trackStudySession = (wasCorrect: boolean) => {
        setStudyStats(prev => ({
            correct: prev.correct + (wasCorrect ? 1 : 0),
            total: prev.total + 1
        }));
    };

    const resetState = () => {
        setTopic("");
        setFlashcards([]);
        setCurrentCard(0);
        setIsFlipped(false);
        setStudyStats({ correct: 0, total: 0 });
    }
    
    if (isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 rounded-xl border-2 border-dashed border-muted-foreground/30 h-96 relative">
                 <BrainCircuit className="h-16 w-16 text-primary" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-24 w-24 bg-primary/20 rounded-full animate-ping"></div>
                </div>
                <h3 className="text-xl font-semibold">AI is generating your flashcards</h3>
                <p className="text-muted-foreground">This may take a moment...</p>
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        )
    }

    if (flashcards.length > 0) {
        return (
            <div className="space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Sparkles/> Your Flashcards</CardTitle>
                        <CardDescription>Click the card to flip it. Use the arrows to navigate.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-6">
                        <div 
                            className="w-full h-64 perspective-1000"
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <div className={cn("relative w-full h-full transition-transform duration-700 transform-style-preserve-3d", isFlipped && "rotate-y-180")}>
                                <div className="absolute w-full h-full backface-hidden flex items-center justify-center p-6 rounded-2xl bg-card border shadow-lg text-center cursor-pointer">
                                    <p className="text-xl font-semibold">{flashcards[currentCard].question}</p>
                                </div>
                                <div className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center p-6 rounded-2xl bg-primary text-primary-foreground border shadow-lg text-center cursor-pointer">
                                     <p className="text-lg">{flashcards[currentCard].answer}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between w-full">
                            <Button variant="outline" onClick={() => {
                                setCurrentCard(prev => Math.max(0, prev - 1));
                                setIsFlipped(false);
                            }} disabled={currentCard === 0}>Previous</Button>
                            <p className="text-sm font-medium text-muted-foreground">{currentCard + 1} / {flashcards.length}</p>
                            <Button variant="outline" onClick={() => {
                                setCurrentCard(prev => Math.min(flashcards.length - 1, prev + 1));
                                setIsFlipped(false);
                            }} disabled={currentCard === flashcards.length - 1}>Next</Button>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="flex w-full gap-4">
                            <Button variant="outline" onClick={resetState} className="flex-1">
                                <X className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                            <Button 
                                onClick={() => saveFlashcardsToFirebase(flashcards, `Flashcards: ${topic || 'Generated Set'}`)}
                                disabled={isSaving || !user}
                                className="flex-1"
                                variant="secondary"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Set
                                    </>
                                )}
                            </Button>
                            <Button 
                                onClick={() => {
                                    const isCorrect = isFlipped; // Simple correct/incorrect tracking
                                    trackStudySession(isCorrect);
                                    toast({
                                        title: isCorrect ? "Correct! 📚" : "Keep trying! 💪",
                                        description: isCorrect ? "Great job!" : "Click to see the answer and try again."
                                    });
                                }}
                                className="flex-1"
                                variant={studyStats.total > 0 ? "default" : "outline"}
                            >
                                <TrendingUp className="mr-2 h-4 w-4" />
                                Track ({studyStats.correct}/{studyStats.total})
                            </Button>
                        </div>
                        {studyStats.total > 0 && (
                            <div className="w-full mt-4 p-3 bg-muted rounded-lg">
                                <div className="flex justify-between items-center text-sm">
                                    <span>Study Progress:</span>
                                    <span className="font-medium">
                                        {Math.round((studyStats.correct / studyStats.total) * 100)}% accuracy
                                    </span>
                                </div>
                                <div className="w-full bg-background rounded-full h-2 mt-2">
                                    <div 
                                        className="bg-primary h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${(studyStats.correct / studyStats.total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </CardFooter>
                 </Card>
                 <style jsx>{`
                    .perspective-1000 { perspective: 1000px; }
                    .transform-style-preserve-3d { transform-style: preserve-3d; }
                    .rotate-y-180 { transform: rotateY(180deg); }
                    .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
                 `}</style>
            </div>
        )
    }

    return (
        <Card className="group transform transition-all hover:shadow-xl hover:-translate-y-1 border-0 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                    <div className="p-1 rounded bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <GraduationCap className="size-5 text-primary" />
                    </div>
                    Flashcard Generator
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                    Generate study flashcards from your class chats or by topic.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Tabs defaultValue="classes" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                        <TabsTrigger value="classes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            <BookUser className="mr-2"/> From Your Classes
                        </TabsTrigger>
                        <TabsTrigger value="topic" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            <PencilLine className="mr-2"/> By Topic
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="classes" className="mt-4">
                        <div className="space-y-4">
                            <p className="text-center text-muted-foreground text-sm">Select a class to generate flashcards based on its chat history.</p>
                            {classChats.length > 0 ? (
                                <>
                                {classChats.map(([id, chat]) => (
                                    <Button 
                                    key={id} 
                                    variant="outline" 
                                    className="w-full justify-start h-auto py-4 hover:bg-primary/10 hover:border-primary/30 group transition-all duration-300" 
                                    onClick={() => handleGenerateFromClass(chat)}
                                >
                                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors mr-4">
                                            <BookUser className="size-5 text-primary" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold group-hover:text-primary transition-colors">{chat.name}</div>
                                            <div className="text-sm text-muted-foreground">{chat.messages.length} messages in chat</div>
                                        </div>
                                    </Button>
                                ))}
                                <div className="pt-2">
                                    <Button variant="secondary" className="w-full" onClick={() => router.push('/dashboard/upload')}>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload another syllabus
                                    </Button>
                                </div>
                                </>
                            ) : (
                                 <div className="text-center text-muted-foreground text-sm p-8 border-2 border-dashed rounded-xl">
                                    <p className="mb-4">No classes found. Upload a syllabus to get started.</p>
                                    <Button variant="secondary" onClick={() => router.push('/dashboard/upload')}>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Syllabus
                                    </Button>
                                 </div>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="topic" className="mt-4 space-y-4">
                        <p className="text-center text-muted-foreground text-sm">Enter a topic and the AI will generate flashcards for you.</p>
                        <Input 
                            placeholder="e.g., Photosynthesis, The American Revolution" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="text-base"
                        />
                        <Button onClick={handleGenerateFromTopic} disabled={isGenerating || !topic.trim()} className="w-full">
                            {isGenerating ? <Loader2 className="animate-spin" /> : <> <Sparkles className="mr-2"/> Generate Flashcards </>}
                        </Button>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

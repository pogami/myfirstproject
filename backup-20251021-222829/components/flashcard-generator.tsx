
"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, Loader2, Bot, GraduationCap, Sparkles, BookUser, PencilLine, BrainCircuit, Save, TrendingUp, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// Removed direct import of generateFlashcards - now using API route
import { Flashcard } from "@/ai/schemas/flashcard-schemas";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useChatStore, Chat } from "@/hooks/use-chat-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase/client-simple";
import { addDoc, collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { LatexMathRenderer } from "@/components/latex-math-renderer";
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
    const [isQuizMode, setIsQuizMode] = useState(false);
    const [userAnswer, setUserAnswer] = useState("");
    const [showAnswer, setShowAnswer] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [hasSeenAnswer, setHasSeenAnswer] = useState(false); // Track if user has seen the answer
    const [quizResults, setQuizResults] = useState<any[]>([]); // Store quiz results for summary
    const [showQuizSummary, setShowQuizSummary] = useState(false); // Show quiz summary
    const [quizSummaryCard, setQuizSummaryCard] = useState(0); // Current card in quiz summary
    const [answerType, setAnswerType] = useState<'text' | 'mcq'>('text'); // Track answer input type
    const [mcqOptions, setMcqOptions] = useState<string[]>([]); // Store MCQ options
    const { toast } = useToast();

    // Function to generate MCQ options
    const generateOptionsForFlashcard = (answer: string, question: string = ''): string[] => {
        const answerLower = answer.toLowerCase().trim();
        const questionLower = question.toLowerCase();
        const options: string[] = [];
        options.push(answer); // Correct answer

        // Generate contextually relevant wrong options
        if (questionLower.includes('photosynthesis')) {
            // Photosynthesis-specific wrong answers (without giving away they're wrong!)
            options.push('CO₂ + H₂O → C₆H₁₂O₆ + O₂');
            options.push('6CO₂ + 6H₂O → C₆H₁₂O₆ + 3O₂');
            options.push('3CO₂ + 3H₂O → C₆H₁₂O₆ + 3O₂');
        } else if (questionLower.includes('water') || questionLower.includes('h2o') || questionLower.includes('h₂o')) {
            // Water-related wrong answers
            options.push('H₂O₂');
            options.push('H₂');
            options.push('O₂');
        } else if (questionLower.includes('chemical') || questionLower.includes('formula')) {
            // Chemical formula wrong answers
            options.push('CO₂');
            options.push('CH₄');
            options.push('NH₃');
        } else if (!isNaN(parseFloat(answerLower)) && isFinite(parseFloat(answerLower))) {
            // Numeric answer: generate variations
            const numAnswer = parseFloat(answer);
            options.push((numAnswer + 1).toString());
            options.push((numAnswer - 1).toString());
            options.push((numAnswer * 2).toString());
        } else if (answerLower.split(' ').length <= 2) {
            // Short phrase/word: generate related terms
            options.push(`Not ${answer}`);
            options.push(`Alternative to ${answer}`);
            options.push(`Different from ${answer}`);
        } else {
            // For complex answers, create meaningful variations
            const answerWords = answerLower.split(' ');
            if (answerWords.length > 2) {
                // Create variations that make sense
                options.push(answer.replace(/is/g, 'was').replace(/are/g, 'were'));
                options.push(answer.replace(/the/g, 'a').replace(/a/g, 'the'));
                options.push(answer.replace(/and/g, 'or').replace(/or/g, 'and'));
            } else {
                options.push(`Not ${answer}`);
                options.push(`Alternative to ${answer}`);
                options.push(`Different from ${answer}`);
            }
        }

        // Remove duplicates and ensure we have exactly 4 options
        const uniqueOptions = Array.from(new Set(options));
        
        // Ensure correct answer is always present
        if (!uniqueOptions.includes(answer)) {
            uniqueOptions[Math.floor(Math.random() * uniqueOptions.length)] = answer;
        }
        
        // Take exactly 4 options
        const finalOptions = uniqueOptions.slice(0, 4);
        
        // Shuffle to randomize position of correct answer
        for (let i = finalOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [finalOptions[i], finalOptions[j]] = [finalOptions[j], finalOptions[i]];
        }
        
        return finalOptions;
    };
    
    // Debug flip state changes
    useEffect(() => {
        console.log('Flip state changed to:', isFlipped);
    }, [isFlipped]);

    // Reset answer type when flashcards change or current card changes
    useEffect(() => {
        if (flashcards.length > 0) {
            setAnswerType('text'); // Default to text input
            setMcqOptions([]);
        }
    }, [flashcards, currentCard]);


    // Function to generate wrong options for MCQ
    const generateWrongOptions = (correctAnswer: string, question: string) => {
        const answerLower = correctAnswer.toLowerCase();
        const questionLower = question.toLowerCase();
        
        // Generate contextually relevant wrong answers
        const wrongOptions: string[] = [];
        
        // For mathematical answers
        if (answerLower.match(/^\d+$/) || answerLower.match(/^\d+\.\d+$/)) {
            const num = parseFloat(answerLower);
            wrongOptions.push(
                (num + 1).toString(),
                (num - 1).toString(),
                (num * 2).toString(),
                (num / 2).toString()
            );
        }
        // For yes/no questions
        else if (answerLower === 'yes' || answerLower === 'no') {
            wrongOptions.push(answerLower === 'yes' ? 'no' : 'yes', 'maybe', 'sometimes');
        }
        // For true/false questions
        else if (answerLower === 'true' || answerLower === 'false') {
            wrongOptions.push(answerLower === 'true' ? 'false' : 'true', 'maybe', 'unknown');
        }
        // For color questions
        else if (questionLower.includes('color') || questionLower.includes('colour')) {
            const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'black', 'white'];
            wrongOptions.push(...colors.filter(c => c !== answerLower).slice(0, 3));
        }
        // For general answers, create variations
        else {
            // Add common wrong answers based on question type
            if (questionLower.includes('what is')) {
                wrongOptions.push('Unknown', 'Not specified', 'Various', 'Multiple');
            } else if (questionLower.includes('who')) {
                wrongOptions.push('Unknown person', 'Various people', 'Not specified', 'Multiple people');
            } else if (questionLower.includes('when')) {
                wrongOptions.push('Unknown time', 'Various times', 'Not specified', 'Multiple times');
            } else if (questionLower.includes('where')) {
                wrongOptions.push('Unknown location', 'Various places', 'Not specified', 'Multiple locations');
            } else {
                wrongOptions.push('Option A', 'Option B', 'Option C', 'Alternative answer');
            }
        }
        
        return wrongOptions.slice(0, 3); // Return max 3 wrong options
    };
    
    const classChats = Object.entries(chats).filter(([key, chat]) => 
        key !== 'general-chat' && 
        key !== 'private-general-chat' && 
        key !== 'private-general-chat-guest' &&
        chat.chatType === 'class'
    );

    // Remove duplicate courses (same course code)
    const uniqueClassChats = classChats.reduce((acc, [id, chat]) => {
        const courseCode = chat.courseData?.courseCode?.toLowerCase();
        if (courseCode) {
            const existingIndex = acc.findIndex(([, existingChat]) => 
                existingChat.courseData?.courseCode?.toLowerCase() === courseCode
            );
            if (existingIndex === -1) {
                acc.push([id, chat]);
            }
        } else {
            acc.push([id, chat]);
        }
        return acc;
    }, [] as [string, Chat][]);


    const handleGenerateFromClass = async (chat: Chat) => {
        setIsGenerating(true);
        setFlashcards([]);
        setCurrentCard(0);
        setIsFlipped(false);
        
        try {
            const chatHistory = chat.messages
                .map(m => `${m.name}: ${m.text}`)
                .join('\n');

            const response = await fetch('/api/flashcards/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    className: chat.name,
                    chatHistory,
                })
            });

            if (!response.ok) {
                throw new Error(`API call failed: ${response.status}`);
            }

            const result = await response.json();

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
            const response = await fetch('/api/flashcards/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic,
                })
            });

            if (!response.ok) {
                throw new Error(`API call failed: ${response.status}`);
            }

            const result = await response.json();
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

    const trackStudySession = async (wasCorrect: boolean) => {
        setStudyStats(prev => ({
            correct: prev.correct + (wasCorrect ? 1 : 0),
            total: prev.total + 1
        }));
        
        // Update Firebase study stats for the current flashcard set
        updateFirebaseStudyStats(wasCorrect);
        
        // Save individual study session data
        await saveStudySession(wasCorrect);
    };

    const saveStudySession = async (wasCorrect: boolean) => {
        if (!user || flashcards.length === 0 || currentCard >= flashcards.length) return;
        
        try {
            const currentFlashcard = flashcards[currentCard];
            const studySessionData = {
                userId: user.uid,
                flashcardSetId: '', // We'll need to get this from the current set
                setTitle: `Flashcards: ${topic || 'Generated Set'}`, // Changed from flashcardSetTitle to setTitle
                question: currentFlashcard.question,
                userAnswer: userAnswer,
                correctAnswer: currentFlashcard.answer,
                isCorrect: wasCorrect,
                timestamp: new Date().toISOString(),
                difficulty: 'Medium', // Could be calculated based on success rate
                topic: topic || 'General'
            };
            
            console.log('Saving study session:', studySessionData);
            const docRef = await addDoc(collection(db, 'studySessions'), studySessionData);
            console.log('Study session saved with ID:', docRef.id);
        } catch (error) {
            console.error('Error saving study session:', error);
        }
    };

    const updateFirebaseStudyStats = async (wasCorrect: boolean) => {
        if (!user) return;
        
        try {
            // Find the most recent flashcard set for this user
            const q = query(
                collection(db, 'flashcardSets'),
                where('userId', '==', user.uid)
            );
            
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                // Sort by createdAt in JavaScript to avoid Firebase index requirement
                const docs = snapshot.docs.sort((a, b) => 
                    new Date(b.data().createdAt).getTime() - new Date(a.data().createdAt).getTime()
                );
                const doc = docs[0];
                const currentData = doc.data();
                
                await updateDoc(doc.ref, {
                    'studyStats.totalStudies': currentData.studyStats.totalStudies + 1,
                    'studyStats.correctAnswers': currentData.studyStats.correctAnswers + (wasCorrect ? 1 : 0),
                    'studyStats.lastStudied': new Date().toISOString()
                });
                
                // Notify flashcards page to refresh stats
                window.dispatchEvent(new CustomEvent('study-event', {
                    detail: { type: 'study_session_completed', wasCorrect }
                }));
            }
        } catch (error) {
            console.error('Error updating study stats:', error);
        }
    };

    const checkAnswer = () => {
        if (!userAnswer.trim()) return;
        
        let isAnswerCorrect = false;
        let actualUserAnswer = userAnswer;
        
        if (answerType === 'mcq') {
            // For MCQ, check if the selected letter corresponds to the correct option
            const selectedIndex = userAnswer.charCodeAt(0) - 65; // Convert A=0, B=1, etc.
            const selectedOption = mcqOptions[selectedIndex];
            isAnswerCorrect = selectedOption === flashcards[currentCard].answer;
            actualUserAnswer = selectedOption || userAnswer; // Use the actual option text
        } else {
            // For text input, use smart fuzzy matching
            const correctAnswer = flashcards[currentCard].answer.toLowerCase();
            const userAnswerLower = userAnswer.toLowerCase();
            
            // Normalize both answers for better matching
            const normalizeAnswer = (answer: string) => {
                return answer
                    .toLowerCase()
                    .replace(/₂/g, '2')  // Convert subscript 2 to regular 2
                    .replace(/₃/g, '3')  // Convert subscript 3 to regular 3
                    .replace(/₄/g, '4')  // Convert subscript 4 to regular 4
                    .replace(/₅/g, '5')  // Convert subscript 5 to regular 5
                    .replace(/₆/g, '6')  // Convert subscript 6 to regular 6
                    .replace(/₇/g, '7')  // Convert subscript 7 to regular 7
                    .replace(/₈/g, '8')  // Convert subscript 8 to regular 8
                    .replace(/₉/g, '9')  // Convert subscript 9 to regular 9
                    .replace(/₀/g, '0')  // Convert subscript 0 to regular 0
                    .replace(/₁/g, '1')  // Convert subscript 1 to regular 1
                    .replace(/[^\w\s]/g, '') // Remove special characters
                    .trim();
            };
            
            const normalizedCorrect = normalizeAnswer(correctAnswer);
            const normalizedUser = normalizeAnswer(userAnswerLower);
            
            // Only accept answers that are substantial (not just single characters)
            const isSubstantialAnswer = normalizedUser.length >= 2;
            
            if (!isSubstantialAnswer) {
                isAnswerCorrect = false;
            } else {
                isAnswerCorrect = normalizedCorrect.includes(normalizedUser) || 
                                 normalizedUser.includes(normalizedCorrect) ||
                                 normalizedUser === normalizedCorrect ||
                                 correctAnswer.includes(userAnswerLower) || 
                                 userAnswerLower.includes(correctAnswer) ||
                                 userAnswerLower === correctAnswer;
            }
            actualUserAnswer = userAnswer;
        }
        
        setIsCorrect(isAnswerCorrect);
        setShowAnswer(true);
        
        // Store quiz result for summary
        const quizResult = {
            question: flashcards[currentCard].question,
            userAnswer: actualUserAnswer,
            correctAnswer: flashcards[currentCard].answer,
            isCorrect: isAnswerCorrect,
            cardIndex: currentCard,
            answerType: answerType
        };
        setQuizResults(prev => [...prev, quizResult]);
        
        // Track study session
        trackStudySession(isAnswerCorrect);
        
        // Show toast with animation
        toast({
            title: isAnswerCorrect ? "🎉 Correct!" : "❌ Not quite right",
            description: isAnswerCorrect ? "Great job! Keep it up!" : "Don't worry, keep studying!",
            className: isAnswerCorrect ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
        });
    };

    const nextQuestion = () => {
        setUserAnswer("");
        setShowAnswer(false);
        setIsCorrect(false);
        setHasSeenAnswer(false); // Reset answer tracking for next question
        setCurrentCard(prev => Math.min(flashcards.length - 1, prev + 1));
    };

    const finishQuiz = () => {
        setShowQuizSummary(true);
    };

    const resetState = () => {
        setTopic("");
        setFlashcards([]);
        setCurrentCard(0);
        setIsFlipped(false);
        setStudyStats({ correct: 0, total: 0 });
        setIsQuizMode(false);
        setUserAnswer("");
        setShowAnswer(false);
        setIsCorrect(false);
        setHasSeenAnswer(false); // Reset answer tracking
        setQuizResults([]); // Reset quiz results
        setShowQuizSummary(false); // Reset quiz summary
        setQuizSummaryCard(0); // Reset quiz summary card
    }
    
    if (isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-6 rounded-xl border-2 border-dashed border-muted-foreground/30 h-96 relative overflow-hidden">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 animate-pulse"></div>
                
                {/* Main animation */}
                <div className="relative z-10 space-y-6">
                    {/* Elegant loading animation */}
                    <div className="relative">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center shadow-lg">
                            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                        </div>
                        <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-primary/20 to-primary/10 animate-ping"></div>
                    </div>
                    
                    {/* Text content */}
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-primary">Generating Your Flashcards</h3>
                        <p className="text-muted-foreground">Creating personalized study materials...</p>
                    </div>
                    
                    {/* Progress dots */}
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        )
    }

    if (flashcards.length > 0) {
        return (
            <div className="space-y-6">
                {showQuizSummary ? (
                    /* Quiz Summary View */
                    <Card className="border-2 border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <Target className="size-5" />
                                Quiz Summary
                            </CardTitle>
                            <CardDescription>
                                Here's how you did on your quiz! Use arrows to navigate through questions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Overall Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {quizResults.filter(r => r.isCorrect).length}
                                    </div>
                                    <div className="text-sm text-green-600/80 dark:text-green-400/80">Correct</div>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {quizResults.filter(r => !r.isCorrect).length}
                                    </div>
                                    <div className="text-sm text-red-600/80 dark:text-red-400/80">Incorrect</div>
                                </div>
                            </div>

                            {/* Question Review Slide */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Question Review</h3>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setQuizSummaryCard(prev => Math.max(0, prev - 1))}
                                            disabled={quizSummaryCard === 0}
                                            className="hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-600"
                                        >
                                            Previous
                                        </Button>
                                        <span className="text-sm font-medium text-muted-foreground">
                                            {quizSummaryCard + 1} / {quizResults.length}
                                        </span>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setQuizSummaryCard(prev => Math.min(quizResults.length - 1, prev + 1))}
                                            disabled={quizSummaryCard === quizResults.length - 1}
                                            className="hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-600"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                                
                                {quizResults[quizSummaryCard] && (
                                    <div className={`p-4 rounded-lg border-2 ${
                                        quizResults[quizSummaryCard].isCorrect 
                                            ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/10' 
                                            : 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/10'
                                    }`}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-lg">{quizResults[quizSummaryCard].isCorrect ? "✅" : "❌"}</span>
                                            <span className="font-medium">Question {quizSummaryCard + 1}</span>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-1">Question:</p>
                                                <div className="text-sm bg-background/50 rounded p-2 border">
                                                    <LatexMathRenderer text={quizResults[quizSummaryCard].question} />
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground mb-1">Your Answer:</p>
                                                    <div className={`text-sm p-2 rounded border ${
                                                        quizResults[quizSummaryCard].isCorrect 
                                                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                                                            : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                                                    }`}>
                                                        <LatexMathRenderer text={quizResults[quizSummaryCard].userAnswer} />
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground mb-1">Correct Answer:</p>
                                                    <div className="text-sm p-2 rounded bg-muted/50 border">
                                                        <LatexMathRenderer text={quizResults[quizSummaryCard].correctAnswer} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <div className="flex gap-3 w-full">
                                <Button onClick={() => setShowQuizSummary(false)} variant="outline" className="flex-1">
                                    Continue Studying
                                </Button>
                                <Button onClick={resetState} className="flex-1">
                                    Start New Quiz
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ) : (
                    /* Flashcards View */
                    <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2"><Sparkles/> Your Flashcards</CardTitle>
                            <Button 
                                variant={isQuizMode ? "default" : "outline"}
                                disabled={!isQuizMode && hasSeenAnswer}
                                onClick={() => {
                                    // Prevent switching to quiz mode if user has seen the answer
                                    if (!isQuizMode && hasSeenAnswer) {
                                        toast({
                                            title: "❌ Not Allowed!",
                                            description: "You can't switch to quiz mode after seeing the answer. That would be cheating!",
                                            variant: "destructive",
                                            duration: 5000
                                        });
                                        return;
                                    }
                                    
                                    setIsQuizMode(!isQuizMode);
                                    setUserAnswer("");
                                    setShowAnswer(false);
                                    setIsCorrect(false);
                                    setIsFlipped(false); // Reset flip state when switching modes
                                }}
                                size="sm"
                            >
                                {isQuizMode ? "Study Mode" : "Quiz Mode"}
                            </Button>
                        </div>
                        <CardDescription>
                            {isQuizMode ? "Type your answer and check if you're right!" : 
                             hasSeenAnswer ? "⚠️ You've seen the answer - can't switch to quiz mode!" : 
                             "Click the card to flip it. Use the arrows to navigate."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-6">
                        <div 
                            className={cn("w-full h-64", !isQuizMode && "cursor-pointer")}
                            style={{ perspective: '1000px' }}
                            onClick={() => {
                                if (!isQuizMode) {
                                    console.log('Card clicked, current flip state:', isFlipped);
                                    setIsFlipped(!isFlipped);
                                    if (!isFlipped) {
                                        setHasSeenAnswer(true); // Mark that user has seen the answer
                                    }
                                }
                            }}
                        >
                            <div 
                                className="relative w-full h-full transition-transform duration-700"
                                style={{ 
                                    transformStyle: 'preserve-3d',
                                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                                }}
                            >
                                <div className="absolute w-full h-full flex items-center justify-center p-6 rounded-2xl bg-card border shadow-lg text-center"
                                     style={{ backfaceVisibility: 'hidden' }}>
                                    <LatexMathRenderer 
                                        text={flashcards[currentCard].question} 
                                        className="text-xl font-semibold"
                                    />
                                </div>
                                <div className="absolute w-full h-full flex items-center justify-center p-6 rounded-2xl bg-primary text-primary-foreground border shadow-lg text-center"
                                     style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                                    <LatexMathRenderer 
                                        text={flashcards[currentCard].answer} 
                                        className="text-lg"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Quiz Mode Interface */}
                        {isQuizMode && (
                            <div className="w-full space-y-4">
                                {/* Answer Type Toggle */}
                                <div className="flex items-center justify-center gap-2 p-2 bg-muted rounded-lg">
                                    <span className="text-sm font-medium">Answer Type:</span>
                                    <Button
                                        size="sm"
                                        variant={answerType === 'text' ? 'default' : 'outline'}
                                        onClick={() => setAnswerType('text')}
                                        className="text-xs"
                                    >
                                        Text Input
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={answerType === 'mcq' ? 'default' : 'outline'}
                                        onClick={() => {
                                            setAnswerType('mcq');
                                            // Generate MCQ options when switching to MCQ
                                            if (flashcards.length > 0 && flashcards[currentCard]) {
                                                const currentFlashcard = flashcards[currentCard];
                                                const correctAnswer = currentFlashcard.answer;
                                                const options = generateOptionsForFlashcard(correctAnswer, currentFlashcard.question);
                                                setMcqOptions(options);
                                            }
                                        }}
                                        className="text-xs"
                                    >
                                        Multiple Choice
                                    </Button>
                                </div>
                                
                                {answerType === 'mcq' ? (
                                    /* MCQ Interface */
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium text-muted-foreground">Choose the correct answer:</p>
                                        <div className="grid gap-2">
                                            {mcqOptions.map((option, index) => {
                                                const letter = String.fromCharCode(65 + index);
                                                const isSelected = userAnswer === letter;
                                                const isCorrectOption = option === flashcards[currentCard].answer;
                                                
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => {
                                                            if (!showAnswer) {
                                                                setUserAnswer(letter);
                                                            }
                                                        }}
                                                        disabled={showAnswer}
                                                        className={cn(
                                                            "p-3 rounded-lg border-2 text-left transition-all duration-200",
                                                            isSelected 
                                                                ? "border-primary bg-primary/5 text-primary" 
                                                                : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600",
                                                            showAnswer && isCorrectOption && "border-green-500 bg-green-50 dark:bg-green-950/20",
                                                            showAnswer && isSelected && !isCorrectOption && "border-red-500 bg-red-50 dark:bg-red-950/20"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-bold text-lg">{letter}.</span>
                                                            <div className="flex-1">
                                                                {option.includes('$') || option.includes('\\') 
                                                                    ? <LatexMathRenderer text={option} />
                                                                    : <span>{option}</span>
                                                                }
                                                            </div>
                                                            {showAnswer && isCorrectOption && (
                                                                <span className="text-green-600 dark:text-green-400">✓</span>
                                                            )}
                                                            {showAnswer && isSelected && !isCorrectOption && (
                                                                <span className="text-red-600 dark:text-red-400">✗</span>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <Button 
                                            onClick={checkAnswer} 
                                            disabled={!userAnswer || showAnswer}
                                            className="w-full"
                                        >
                                            Check Answer
                                        </Button>
                                    </div>
                                ) : (
                                    /* Text Input Interface */
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Type your answer here..."
                                            value={userAnswer}
                                            onChange={(e) => setUserAnswer(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && !showAnswer && checkAnswer()}
                                            className="flex-1"
                                            disabled={showAnswer}
                                        />
                                        <Button 
                                            onClick={checkAnswer} 
                                            disabled={!userAnswer.trim() || showAnswer}
                                            className="px-6"
                                        >
                                            Check
                                        </Button>
                                    </div>
                                )}
                                
                                {showAnswer && (
                                    <div className="space-y-3">
                                        {/* Enhanced feedback for MCQ */}
                                        {answerType === 'mcq' ? (
                                            <div className={cn(
                                                "p-4 rounded-lg border-2 transition-all duration-500",
                                                isCorrect 
                                                    ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-300" 
                                                    : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-300"
                                            )}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xl">{isCorrect ? "✓" : "✗"}</span>
                                                    <span className="font-semibold">{isCorrect ? "Correct!" : "Incorrect"}</span>
                                                </div>
                                                {!isCorrect && (
                                                    <div className="text-sm">
                                                        <p className="mb-2">The correct answer is <strong>{
                                                            (() => {
                                                                const correctIndex = mcqOptions.findIndex(option => option === flashcards[currentCard].answer);
                                                                return String.fromCharCode(65 + correctIndex); // Convert to A, B, C, D
                                                            })()
                                                        }</strong>.</p>
                                                        <p className="text-muted-foreground">
                                                            {(() => {
                                                                const question = flashcards[currentCard].question.toLowerCase();
                                                                const correctAnswer = flashcards[currentCard].answer.toLowerCase();
                                                                
                                                                console.log('Debug MCQ explanation:');
                                                                console.log('Question:', question);
                                                                console.log('Correct Answer:', correctAnswer);
                                                                
                                                                if (question.includes('photosynthesis') && question.includes('equation')) {
                                                                    return "The balanced chemical equation for photosynthesis is 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. This shows that 6 carbon dioxide molecules and 6 water molecules produce 1 glucose molecule and 6 oxygen molecules.";
                                                                } else if (question.includes('photosynthesis') && question.includes('stages')) {
                                                                    return "Photosynthesis occurs in two main stages: light-dependent reactions (in thylakoids) and light-independent reactions/Calvin cycle (in stroma).";
                                                                } else if (question.includes('photosynthesis') && question.includes('outputs')) {
                                                                    return "The primary outputs of photosynthesis are glucose (C₆H₁₂O₆) and oxygen (O₂). Glucose is used for energy storage, while oxygen is released as a byproduct.";
                                                                } else if (question.includes('photosynthesis')) {
                                                                    return "Photosynthesis is the process by which plants convert light energy into chemical energy, producing glucose and oxygen from carbon dioxide and water.";
                                                                } else if (question.includes('water') || question.includes('h2o') || question.includes('h₂o')) {
                                                                    return "Water has the chemical formula H₂O, meaning each water molecule contains 2 hydrogen atoms and 1 oxygen atom bonded together.";
                                                                } else if (question.includes('chemical') || question.includes('formula')) {
                                                                    return "Chemical formulas use element symbols (like H, O, C) with subscripts to show the exact number of each atom in a molecule.";
                                                                } else if (question.includes('balanced') || question.includes('equation')) {
                                                                    return "A balanced chemical equation has the same number of each type of atom on both sides of the arrow, following the law of conservation of mass.";
                                                                } else if (correctAnswer.includes('co₂') || correctAnswer.includes('carbon dioxide')) {
                                                                    return "Carbon dioxide (CO₂) is a gas composed of one carbon atom and two oxygen atoms, essential for photosynthesis.";
                                                                } else if (correctAnswer.includes('glucose') || correctAnswer.includes('c₆h₁₂o₆')) {
                                                                    return "Glucose (C₆H₁₂O₆) is a simple sugar produced during photosynthesis, serving as the primary energy source for plants.";
                                                                } else if (correctAnswer.includes('oxygen') || correctAnswer.includes('o₂')) {
                                                                    return "Oxygen (O₂) is a gas produced during photosynthesis and is essential for cellular respiration in most living organisms.";
                                                                } else if (correctAnswer.includes('atp')) {
                                                                    return "ATP (adenosine triphosphate) is the primary energy currency of cells, storing and transferring energy for cellular processes.";
                                                                } else if (correctAnswer.includes('nadph')) {
                                                                    return "NADPH is a reducing agent that provides electrons and hydrogen ions for the Calvin cycle during photosynthesis.";
                                                                } else {
                                                                    return `The correct answer "${flashcards[currentCard].answer}" is the most accurate response to this question about ${question.split(' ').slice(0, 3).join(' ')}.`;
                                                                }
                                                            })()}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            /* Detailed feedback for text input */
                                            <div className={cn(
                                                "p-4 rounded-lg border-2 transition-all duration-500",
                                                isCorrect 
                                                    ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-300" 
                                                    : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-300"
                                            )}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-2xl">{isCorrect ? "🎉" : "❌"}</span>
                                                    <span className="font-semibold">{isCorrect ? "Correct!" : "Not quite right"}</span>
                                                </div>
                                                <p className="text-sm mb-3">
                                                    <strong>Your answer:</strong> 
                                                    <div className="ml-2 mt-1">
                                                        {(() => {
                                                            const answerText = userAnswer;
                                                            // Only render KaTeX if it contains LaTeX syntax
                                                            return answerText.includes('$') || answerText.includes('\\') 
                                                                ? <LatexMathRenderer text={answerText} />
                                                                : <span>{answerText}</span>;
                                                        })()}
                                                    </div>
                                                </p>
                                                <div className="text-sm mb-3">
                                                    <strong>Correct answer:</strong> 
                                                    <div className="ml-2 mt-1">
                                                        {(() => {
                                                            const answerText = flashcards[currentCard].answer;
                                                            // Only render KaTeX if it contains LaTeX syntax
                                                            return answerText.includes('$') || answerText.includes('\\') 
                                                                ? <LatexMathRenderer text={answerText} />
                                                                : <span>{answerText}</span>;
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex items-center justify-between w-full">
                            <Button variant="outline" onClick={() => {
                                setCurrentCard(prev => Math.max(0, prev - 1));
                                setIsFlipped(false);
                                setHasSeenAnswer(false); // Reset answer tracking
                                if (isQuizMode) {
                                    setUserAnswer("");
                                    setShowAnswer(false);
                                    setIsCorrect(false);
                                }
                            }} disabled={currentCard === 0} className="hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-600">Previous</Button>
                            <p className="text-sm font-medium text-muted-foreground">{currentCard + 1} / {flashcards.length}</p>
                            <Button variant="outline" onClick={() => {
                                if (currentCard === flashcards.length - 1) {
                                    // If it's the last card and in quiz mode, finish the quiz
                                    if (isQuizMode) {
                                        finishQuiz();
                                    } else {
                                        setCurrentCard(prev => Math.min(flashcards.length - 1, prev + 1));
                                    }
                                } else {
                                    // Normal next card behavior
                                    setCurrentCard(prev => Math.min(flashcards.length - 1, prev + 1));
                                }
                                setIsFlipped(false);
                                setHasSeenAnswer(false); // Reset answer tracking
                                if (isQuizMode) {
                                    setUserAnswer("");
                                    setShowAnswer(false);
                                    setIsCorrect(false);
                                }
                            }} disabled={currentCard === flashcards.length - 1 && !isQuizMode} className="hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-600">
                                {currentCard === flashcards.length - 1 && isQuizMode ? "Finish Quiz" : "Next"}
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="flex w-full gap-4">
                            <Button variant="outline" onClick={resetState} className="flex-1 hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-600">
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
                        </div>
                    </CardFooter>
                    </Card>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {showQuizSummary ? null : (
                <Card className="group transform transition-all hover:shadow-lg hover:-translate-y-0.5 border-0 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                            <div className="p-1 rounded bg-primary/10 group-hover:bg-primary/15 transition-colors">
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
                            {uniqueClassChats.length > 0 ? (
                                <>
                                {uniqueClassChats.map(([id, chat]) => (
                                    <Button 
                                    key={id} 
                                    variant="outline" 
                                    className="w-full justify-start h-auto py-4 hover:bg-primary/5 hover:border-primary/20 group transition-all duration-300" 
                                    onClick={() => handleGenerateFromClass(chat)}
                                >
                                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors mr-4">
                                            <BookUser className="size-5 text-primary" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold group-hover:text-primary transition-colors">
                                                {chat.courseData?.courseName || chat.title || chat.name}
                                            </div>
                                            <div className="text-sm text-muted-foreground">{chat.courseData?.courseCode || 'Class Chat'}</div>
                                        </div>
                                    </Button>
                                ))}
                                <div className="pt-2">
                                    <Button variant="secondary" className="w-full hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => router.push('/dashboard/upload')}>
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
                        <Button onClick={handleGenerateFromTopic} disabled={isGenerating || !topic.trim()} className="w-full hover:bg-primary/90 disabled:hover:bg-primary">
                            {isGenerating ? <Loader2 className="animate-spin" /> : <> <Sparkles className="mr-2"/> Generate Flashcards </>}
                        </Button>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
            )}
        </div>
    );
}

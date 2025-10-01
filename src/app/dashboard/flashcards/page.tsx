"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Brain, Target, Zap, Sparkles, BookOpen, ArrowRight, TrendingUp, Clock, CheckCircle, RefreshCw, Plus, Eye } from "lucide-react";
import FlashcardGenerator from "@/components/flashcard-generator";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/client-simple";
import { collection, getDocs, addDoc, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/client-simple";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface FlashcardSet {
  id: string;
  title: string;
  topic: string;
  flashcards: Array<{
    front: string;
    back: string;
  }>;
  createdAt: string;
  userId: string;
  studyStats: {
    totalStudies: number;
    correctAnswers: number;
    lastStudied?: string;
  };
}

const studyTips = [
  "Review flashcards daily for best results",
  "Focus on difficult cards more frequently",
  "Use the shuffle feature to avoid memorizing order",
  "Take breaks between study sessions"
];

export default function FlashcardsPage() {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);
  const { toast } = useToast();

  // Real-time data loading
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'flashcardSets'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const sets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FlashcardSet[];
      
      setFlashcardSets(sets);
      setLoading(false);
    }, (error) => {
      console.error('Error loading flashcard sets:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your flashcards"
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const totalCards = flashcardSets.reduce((sum, set) => sum + set.flashcards.length, 0);
  const totalStudies = flashcardSets.reduce((sum, set) => sum + set.studyStats.totalStudies, 0);
  const totalCorrect = flashcardSets.reduce((sum, set) => sum + set.studyStats.correctAnswers, 0);
  const accuracyRate = totalStudies > 0 ? Math.round((totalCorrect / totalStudies) * 100) : 0;

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your flashcards...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Enhanced Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-75 animate-pulse"></div>
            <div className="relative p-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <GraduationCap className="size-10 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent animate-gradient">
              Flashcards
            </h1>
            <p className="text-xl text-muted-foreground">
              AI-powered flashcards from your course discussions
            </p>
          </div>
        </div>

        {/* Enhanced Real-time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="group border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-950/30 dark:to-blue-900/30 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Sets</p>
                    <motion.p 
                      key={flashcardSets.length}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-3xl font-bold text-blue-600 dark:text-blue-400"
                    >
                      {flashcardSets.length}
                    </motion.p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                    <BookOpen className="size-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="group border-0 bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-950/30 dark:to-green-900/30 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 cursor-pointer hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Cards</p>
                    <motion.p 
                      key={totalCards}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-3xl font-bold text-green-600 dark:text-green-400"
                    >
                      {totalCards}
                    </motion.p>
                  </div>
                  <div className="p-2 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                    <GraduationCap className="size-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="group border-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-950/30 dark:to-purple-900/30 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Study Sessions</p>
                    <motion.p 
                      key={totalStudies}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-3xl font-bold text-purple-600 dark:text-purple-400"
                    >
                      {totalStudies}
                    </motion.p>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                    <Target className="size-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="group border-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 dark:from-orange-950/30 dark:to-orange-900/30 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 cursor-pointer hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Accuracy</p>
                    <motion.p 
                      key={accuracyRate}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-3xl font-bold text-orange-600 dark:text-orange-400"
                    >
                      {accuracyRate}%
                    </motion.p>
                  </div>
                  <div className="p-2 rounded-lg bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                    <CheckCircle className="size-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
        {/* Enhanced Flashcard Generator */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="group border-0 bg-gradient-to-br from-card to-card/50 shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-1 backdrop-blur-sm">
            <CardHeader className="text-center pb-8 relative">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl blur-lg animate-pulse group-hover:animate-none"></div>
                  <div className="relative p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 group-hover:border-primary/50 transition-all">
                    <Sparkles className="size-10 text-primary group-hover:animate-spin" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                  Generate Flashcards
                </CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-3">
                  Create personalized flashcards from your syllabus content
                </CardDescription>
              </CardHeader>
            <CardContent className="p-8 bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm">
                <FlashcardGenerator />
              </CardContent>
            </Card>
        </motion.div>

        {/* Enhanced Sidebar */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
            {/* Study Tips */}
          <Card className="group border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-950/30 dark:to-emerald-950/30 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 hover:scale-105">
              <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400 group-hover:text-green-600 dark:group-hover:text-green-300 transition-colors">
                <div className="p-1 rounded bg-green-500/20">
                  <Target className="size-5" />
                </div>
                  Study Tips
                </CardTitle>
              </CardHeader>
            <CardContent className="space-y-4">
                  {studyTips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.7 }}
                  className="hover:bg-green-500/5 p-3 rounded-lg flex items-start gap-3 transition-colors cursor-default"
                >
                  <div className="p-1 rounded-full bg-green-500/20 mt-0.5 group-hover:bg-green-500/30 transition-colors">
                    <CheckCircle className="size-3 text-green-600 dark:text-green-400" />
                    </div>
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium">{tip}</p>
                </motion.div>
                  ))}
              </CardContent>
            </Card>

          {/* Enhanced Recent Flashcard Sets */}
          <Card className="group border-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-950/30 dark:to-violet-950/30 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105">
              <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                <div className="p-1 rounded bg-purple-500/20">
                  <BookOpen className="size-5" />
                </div>
                Recent Sets
                </CardTitle>
              <CardDescription className="text-muted-foreground">
                Your latest flashcard collections
                </CardDescription>
              </CardHeader>
              <CardContent>
              {flashcardSets.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="size-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No flashcards yet</p>
                  <p className="text-sm text-muted-foreground">Generate your first set below!</p>
                    </div>
              ) : (
                <div className="space-y-3">
                  {flashcardSets.slice(0, 3).map((set) => (
                    <motion.div
                      key={set.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-purple-200/50 dark:border-purple-800/50"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-purple-900 dark:text-purple-100">
                          {set.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {set.flashcards.length} cards • {set.topic}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {set.studyStats?.totalStudies || 0} studies
                          </Badge>
                          {set.studyStats?.correctAnswers && set.studyStats?.totalStudies ? (
                            <Badge 
                              variant={set.studyStats.correctAnswers / set.studyStats.totalStudies > 0.7 ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {Math.round((set.studyStats.correctAnswers / set.studyStats.totalStudies) * 100)}% accurate
                            </Badge>
                          ) : null}
                    </div>
                  </div>
                      <Button size="sm" variant="ghost" className="ml-2">
                        <Eye className="size-4" />
                      </Button>
                    </motion.div>
                  ))}
                  
                  {flashcardSets.length > 3 && (
                    <div className="text-center pt-3">
                      <Button variant="outline" size="sm" className="w-full">
                        <Plus className="size-4 mr-2" />
                        View All ({flashcardSets.length - 3} more)
                      </Button>
                    </div>
                  )}
                </div>
              )}
              </CardContent>
            </Card>
        </motion.div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GraduationCap, Brain, Target, Zap, Sparkles, BookOpen, ArrowRight, TrendingUp, Clock, CheckCircle, RefreshCw, Plus, Eye, X, BarChart3, AlertCircle, ThumbsUp, ThumbsDown, Trash2, Info } from "lucide-react";
import FlashcardGenerator from "@/components/flashcard-generator";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/client-simple";
import { collection, getDocs, addDoc, query, limit, onSnapshot, where, deleteDoc, doc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/client-simple";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { LatexMathRenderer } from "@/components/latex-math-renderer";

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
  const [showAnalyticsPopup, setShowAnalyticsPopup] = useState(false);
  const [studyAnalytics, setStudyAnalytics] = useState<any[]>([]);
  const [showSetAnalyticsPopup, setShowSetAnalyticsPopup] = useState(false);
  const [selectedSetAnalytics, setSelectedSetAnalytics] = useState<any[]>([]);
  const [selectedSetTitle, setSelectedSetTitle] = useState('');
  const [user] = useAuthState(auth);
  const { toast } = useToast();

  // Add timeout fallback to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout reached, setting loading to false');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  // Function to load flashcard sets
  const loadFlashcardSets = async () => {
    if (!user) return;

    const q = query(
      collection(db, 'flashcardSets'),
      where('userId', '==', user.uid)
    );

    try {
      const snapshot = await getDocs(q);
      const sets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FlashcardSet[];
      
      // Sort by createdAt in JavaScript to avoid Firebase index requirement
      sets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setFlashcardSets(sets);
      setLoading(false);
    } catch (error) {
      console.error('Error loading flashcard sets:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your flashcards"
      });
    }
  };

  // Function to delete a flashcard set
  const deleteFlashcardSet = async (setId: string, setName: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'flashcardSets', setId));
      toast({
        title: "Flashcard Set Deleted",
        description: `${setName} has been removed from your collection.`,
      });
      // Refresh the data
      loadFlashcardSets();
    } catch (error) {
      console.error('Error deleting flashcard set:', error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not delete the flashcard set. Please try again.",
      });
    }
  };

  // Real-time data loading
  useEffect(() => {
    console.log('useEffect triggered, user:', user);
    if (!user) {
      console.log('No user, setting loading to false');
      setLoading(false);
      return;
    }

    console.log('Setting up Firebase listener for user:', user.uid);
    const q = query(
      collection(db, 'flashcardSets'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('Firebase snapshot received:', snapshot.docs.length, 'docs');
        const sets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FlashcardSet[];
      
      // Sort by createdAt in JavaScript to avoid Firebase index requirement
      sets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
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

  // Listen for flashcard save events to refresh data
  useEffect(() => {
    const handleFlashcardEvent = (event: CustomEvent) => {
      if (event.detail.type === 'flashcards_saved') {
        console.log('Flashcard save event received, refreshing data...');
        // Actually reload the data from Firebase
        loadFlashcardSets();
      }
    };

    const handleStudyEvent = (event: CustomEvent) => {
      if (event.detail.type === 'study_session_completed') {
        console.log('Study session completed, refreshing data...');
        // Reload flashcards to get updated study stats
        loadFlashcardSets();
      }
    };

    window.addEventListener('flashcard-event', handleFlashcardEvent as EventListener);
    window.addEventListener('study-event', handleStudyEvent as EventListener);
    
    return () => {
      window.removeEventListener('flashcard-event', handleFlashcardEvent as EventListener);
      window.removeEventListener('study-event', handleStudyEvent as EventListener);
    };
  }, [user]);

  // Load study analytics when popup opens
  useEffect(() => {
    if (showAnalyticsPopup && user) {
      loadStudyAnalytics();
    }
  }, [showAnalyticsPopup, user]);

  const loadStudyAnalytics = async () => {
    if (!user) return;
    
    try {
      console.log('Loading study analytics for user:', user.uid);
      
      // Load real study analytics from Firebase
      const q = query(
        collection(db, 'studySessions'),
        where('userId', '==', user.uid)
      );
      
      const snapshot = await getDocs(q);
      console.log('Found study sessions:', snapshot.docs.length);
      
      const analytics = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Study analytics data:', analytics);
      
      // Sort by timestamp (most recent first)
      analytics.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setStudyAnalytics(analytics);
    } catch (error) {
      console.error('Error loading study analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load study analytics",
        variant: "destructive",
      });
    }
  };

  // Function to load analytics for a specific set
  const loadSetAnalytics = async (setTitle: string) => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'studySessions'),
        where('userId', '==', user.uid),
        where('setTitle', '==', setTitle)
      );

      const snapshot = await getDocs(q);
      const analytics = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by timestamp in JavaScript to avoid Firebase index requirement
      analytics.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setSelectedSetAnalytics(analytics);
      setSelectedSetTitle(setTitle);
      setShowSetAnalyticsPopup(true);
    } catch (error) {
      console.error('Error loading set analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load study analytics for this set",
        variant: "destructive",
      });
    }
  };

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
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent animate-gradient">
              Flashcards
            </h1>
            <p className="text-xl text-muted-foreground">
              AI-powered flashcards from your course discussions
            </p>
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-muted-foreground">Generate from class chats</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-muted-foreground">Create by topic</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-muted-foreground">Quiz mode with scoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-muted-foreground">Track study analytics</span>
                </div>
              </div>
            </div>
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
                  <BookOpen className="size-12 text-muted-foreground mx-auto mb-4" />
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
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          onClick={() => loadSetAnalytics(set.title)}
                        >
                          <Info className="size-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          onClick={() => deleteFlashcardSet(set.id, set.title)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                  
                  {flashcardSets.length > 3 && (
                    <div className="text-center pt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setShowAnalyticsPopup(true)}
                      >
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

      {/* Study Analytics Popup */}
      <Dialog open={showAnalyticsPopup} onOpenChange={setShowAnalyticsPopup}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="size-6 text-primary" />
              </div>
              Study Analytics
            </DialogTitle>
            <DialogDescription className="text-base">
              Track your learning progress and identify areas for improvement
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[calc(85vh-120px)] pr-2">
            <div className="space-y-6">
              {/* Summary Stats - Cleaner Design */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-800/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <ThumbsUp className="size-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                        {studyAnalytics.filter(a => a.isCorrect).length}
                      </p>
                      <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">Correct Answers</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/30 dark:to-rose-900/20 rounded-xl p-4 border border-rose-200/50 dark:border-rose-800/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose-500/10">
                      <ThumbsDown className="size-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">
                        {studyAnalytics.filter(a => !a.isCorrect).length}
                      </p>
                      <p className="text-sm text-rose-600/80 dark:text-rose-400/80">Incorrect Answers</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Target className="size-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                        {studyAnalytics.length > 0 ? Math.round((studyAnalytics.filter(a => a.isCorrect).length / studyAnalytics.length) * 100) : 0}%
                      </p>
                      <p className="text-sm text-blue-600/80 dark:text-blue-400/80">Accuracy Rate</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/20 rounded-xl p-4 border border-violet-200/50 dark:border-violet-800/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-500/10">
                      <BookOpen className="size-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-violet-700 dark:text-violet-400">
                        {new Set(studyAnalytics.map(a => a.setTitle)).size}
                      </p>
                      <p className="text-sm text-violet-600/80 dark:text-violet-400/80">Sets Studied</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Study History - Improved Design */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <Clock className="size-5 text-primary" />
                  <h3 className="text-xl font-semibold">Study History</h3>
                </div>
                
                {studyAnalytics.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                      <AlertCircle className="size-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Study Data Yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Start studying your flashcards to see detailed analytics and track your progress here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {studyAnalytics.map((session, index) => (
                      <div key={session.id} className={`rounded-xl border-2 transition-all hover:shadow-md ${
                        session.isCorrect 
                          ? 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-800/30 dark:bg-emerald-950/10' 
                          : 'border-rose-200 bg-rose-50/30 dark:border-rose-800/30 dark:bg-rose-950/10'
                      }`}>
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs font-medium">
                                {session.setTitle}
                              </Badge>
                              <Badge 
                                variant={session.difficulty === 'Easy' ? 'secondary' : session.difficulty === 'Medium' ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {session.difficulty}
                              </Badge>
                              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                                session.isCorrect 
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' 
                                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                              }`}>
                                {session.isCorrect ? (
                                  <>
                                    <ThumbsUp className="size-3" />
                                    Correct
                                  </>
                                ) : (
                                  <>
                                    <ThumbsDown className="size-3" />
                                    Incorrect
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="size-3" />
                              {new Date(session.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">Question:</p>
                              <div className="text-sm bg-background/50 rounded-lg p-3 border">
                                <LatexMathRenderer text={session.question} />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Your Answer:</p>
                                <div className={`text-sm p-3 rounded-lg border ${
                                  session.isCorrect 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-200' 
                                    : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-800 dark:text-rose-200'
                                }`}>
                                  <LatexMathRenderer text={session.userAnswer} />
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Correct Answer:</p>
                                <div className="text-sm p-3 rounded-lg bg-muted/50 border text-foreground">
                                  <LatexMathRenderer text={session.correctAnswer} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Individual Set Analytics Popup */}
      <Dialog open={showSetAnalyticsPopup} onOpenChange={setShowSetAnalyticsPopup}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="size-6 text-primary" />
              </div>
              Study Analytics - {selectedSetTitle}
            </DialogTitle>
            <DialogDescription className="text-base">
              Track your learning progress for this specific flashcard set
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[calc(85vh-120px)] pr-2">
            <div className="space-y-6">
              {/* Summary Stats for this set */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-800/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <ThumbsUp className="size-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                        {selectedSetAnalytics.filter(a => a.isCorrect).length}
                      </p>
                      <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">Correct Answers</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/30 dark:to-rose-900/20 rounded-xl p-4 border border-rose-200/50 dark:border-rose-800/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose-500/10">
                      <ThumbsDown className="size-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">
                        {selectedSetAnalytics.filter(a => !a.isCorrect).length}
                      </p>
                      <p className="text-sm text-rose-600/80 dark:text-rose-400/80">Incorrect Answers</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Target className="size-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                        {selectedSetAnalytics.length > 0 ? Math.round((selectedSetAnalytics.filter(a => a.isCorrect).length / selectedSetAnalytics.length) * 100) : 0}%
                      </p>
                      <p className="text-sm text-blue-600/80 dark:text-blue-400/80">Accuracy Rate</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/20 rounded-xl p-4 border border-violet-200/50 dark:border-violet-800/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-500/10">
                      <BookOpen className="size-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-violet-700 dark:text-violet-400">
                        {selectedSetAnalytics.length}
                      </p>
                      <p className="text-sm text-violet-600/80 dark:text-violet-400/80">Total Attempts</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Study History for this set */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <Clock className="size-5 text-primary" />
                  <h3 className="text-xl font-semibold">Study History for {selectedSetTitle}</h3>
                </div>
                
                {selectedSetAnalytics.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                      <AlertCircle className="size-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Study Data Yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Start studying this flashcard set to see detailed analytics and track your progress here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedSetAnalytics.map((session, index) => (
                      <div key={session.id} className={`rounded-xl border-2 transition-all hover:shadow-md ${
                        session.isCorrect 
                          ? 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-800/30 dark:bg-emerald-950/10' 
                          : 'border-rose-200 bg-rose-50/30 dark:border-rose-800/30 dark:bg-rose-950/10'
                      }`}>
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={session.difficulty === 'Easy' ? 'secondary' : session.difficulty === 'Medium' ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {session.difficulty}
                              </Badge>
                              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                                session.isCorrect 
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' 
                                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                              }`}>
                                {session.isCorrect ? (
                                  <>
                                    <ThumbsUp className="size-3" />
                                    Correct
                                  </>
                                ) : (
                                  <>
                                    <ThumbsDown className="size-3" />
                                    Incorrect
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="size-3" />
                              {new Date(session.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">Question:</p>
                              <div className="text-sm bg-background/50 rounded-lg p-3 border">
                                <LatexMathRenderer text={session.question} />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Your Answer:</p>
                                <div className={`text-sm p-3 rounded-lg border ${
                                  session.isCorrect 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-200' 
                                    : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-800 dark:text-rose-200'
                                }`}>
                                  <LatexMathRenderer text={session.userAnswer} />
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Correct Answer:</p>
                                <div className="text-sm p-3 rounded-lg bg-muted/50 border text-foreground">
                                  <LatexMathRenderer text={session.correctAnswer} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
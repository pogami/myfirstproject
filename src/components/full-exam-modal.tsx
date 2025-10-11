"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, CheckCircle, XCircle, Award, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface ExamQuestion {
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

interface FullExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: ExamQuestion[];
  topic: string;
  timeLimit?: number; // in minutes
  onComplete?: (score: number, total: number) => void;
}

export function FullExamModal({ 
  isOpen, 
  onClose, 
  questions, 
  topic, 
  timeLimit = 30,
  onComplete 
}: FullExamModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60); // Convert to seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // Timer
  useEffect(() => {
    if (!isOpen || isSubmitted) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers({ ...answers, [questionIndex]: answer });
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setShowReview(true);
    
    // Calculate score
    const score = questions.reduce((acc, question, index) => {
      const userAnswer = answers[index]?.toLowerCase().trim();
      const correctAnswer = question.answer.toLowerCase().trim();
      return acc + (userAnswer === correctAnswer ? 1 : 0);
    }, 0);
    
    if (onComplete) {
      onComplete(score, questions.length);
    }
  };

  const calculateScore = () => {
    return questions.reduce((acc, question, index) => {
      const userAnswer = answers[index]?.toLowerCase().trim();
      const correctAnswer = question.answer.toLowerCase().trim();
      return acc + (userAnswer === correctAnswer ? 1 : 0);
    }, 0);
  };

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;
  const score = calculateScore();
  const percentage = Math.round((score / questions.length) * 100);

  // Results view
  if (isSubmitted && showReview) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-500" />
              Exam Results: {topic}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Score Summary */}
            <div className="bg-gradient-to-br from-primary/5 to-background p-6 rounded-lg border-2 border-primary/20 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                className="mb-4"
              >
                <Award className="w-16 h-16 mx-auto text-yellow-500" />
              </motion.div>
              
              <h3 className="text-3xl font-bold mb-2">
                {score}/{questions.length}
              </h3>
              <p className="text-4xl font-bold text-primary mb-4">{percentage}%</p>
              
              {percentage >= 80 && (
                <p className="text-green-600 font-medium">Excellent work! 🌟</p>
              )}
              {percentage >= 60 && percentage < 80 && (
                <p className="text-yellow-600 font-medium">Good job! Keep practicing! 💪</p>
              )}
              {percentage < 60 && (
                <p className="text-orange-600 font-medium">Keep studying! You'll get better! 📚</p>
              )}
            </div>

            {/* Question Review */}
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {questions.map((question, index) => {
                  const userAnswer = answers[index];
                  const isCorrect = userAnswer?.toLowerCase().trim() === question.answer.toLowerCase().trim();
                  
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        isCorrect
                          ? "bg-green-50 border-green-500 dark:bg-green-950/50"
                          : "bg-red-50 border-red-500 dark:bg-red-950/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1">
                          <p className={`font-medium mb-2 ${
                            isCorrect 
                              ? "text-green-900 dark:text-green-100" 
                              : "text-red-900 dark:text-red-100"
                          }`}>
                            {index + 1}. {question.question}
                          </p>
                          <div className="text-sm space-y-1">
                            <p className="text-gray-800 dark:text-gray-200">
                              <span className="font-medium">Your answer:</span>{" "}
                              <span className={isCorrect ? "text-green-700 dark:text-green-300 font-medium" : "text-red-700 dark:text-red-300 font-medium"}>
                                {userAnswer || "(No answer)"}
                              </span>
                            </p>
                            {!isCorrect && (
                              <p className="text-gray-800 dark:text-gray-200">
                                <span className="font-medium">Correct answer:</span>{" "}
                                <span className="text-green-700 dark:text-green-300 font-medium">{question.answer}</span>
                              </p>
                            )}
                            {question.explanation && (
                              <p className="text-gray-700 dark:text-gray-300 mt-2">
                                {question.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Button onClick={onClose} variant="outline" className="flex-1">
                Close
              </Button>
              <Button onClick={() => {
                setIsSubmitted(false);
                setShowReview(false);
                setAnswers({});
                setCurrentQuestion(0);
                setTimeLeft(timeLimit * 60);
              }} className="flex-1">
                Retake Exam
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Exam view
  return (
    <Dialog open={isOpen} onOpenChange={!isSubmitted ? onClose : undefined}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>📝 Practice Exam: {topic}</span>
            <div className="flex items-center gap-4">
              <Badge variant={timeLeft < 300 ? "destructive" : "secondary"} className="text-base">
                <Clock className="w-4 h-4 mr-2" />
                {formatTime(timeLeft)}
              </Badge>
              <Badge variant="outline" className="text-base">
                {answeredCount}/{questions.length} answered
              </Badge>
            </div>
          </DialogTitle>
          <Progress value={progress} className="h-2 mt-2" />
        </DialogHeader>

        <div className="grid grid-cols-[200px_1fr] gap-6">
          {/* Question Navigator */}
          <ScrollArea className="h-[500px]">
            <div className="space-y-2 pr-4">
              <p className="text-sm font-medium mb-2">Questions:</p>
              {questions.map((_, index) => {
                const isAnswered = answers[index] !== undefined;
                const isCurrent = currentQuestion === index;
                
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-full p-2 text-left rounded-lg border-2 transition-all ${
                      isCurrent
                        ? "bg-primary text-primary-foreground border-primary"
                        : isAnswered
                        ? "bg-green-50 border-green-500 dark:bg-green-950/50 text-green-900 dark:text-green-100"
                        : "border-gray-200 hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{index + 1}</span>
                      {isAnswered && (
                        <CheckCircle className={`w-4 h-4 ${isCurrent ? 'text-primary-foreground' : 'text-green-600 dark:text-green-400'}`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          {/* Question Content */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Question {currentQuestion + 1} of {questions.length}
                  </p>
                  <p className="text-base font-medium">
                    {questions[currentQuestion].question}
                  </p>
                </div>

                {questions[currentQuestion].options ? (
                  <div className="space-y-2">
                    {questions[currentQuestion].options!.map((option, index) => {
                      const letter = String.fromCharCode(65 + index);
                      const isSelected = answers[currentQuestion] === letter;
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleAnswerChange(currentQuestion, letter)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? "bg-primary/10 border-primary"
                              : "border-gray-200 hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-primary">{letter}.</span>
                            <span className="flex-1">{option}</span>
                            {isSelected && (
                              <CheckCircle className="w-5 h-5 text-primary" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <textarea
                    value={answers[currentQuestion] || ""}
                    onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full p-4 rounded-lg border-2 border-gray-200 focus:border-primary min-h-[150px] resize-none"
                  />
                )}

                <div className="flex gap-2 justify-between pt-4">
                  <Button
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    variant="outline"
                    disabled={currentQuestion === 0}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex gap-2">
                    {currentQuestion < questions.length - 1 ? (
                      <Button
                        onClick={() => setCurrentQuestion(currentQuestion + 1)}
                        variant="default"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Submit Exam
                      </Button>
                    )}
                  </div>
                </div>

                {answeredCount < questions.length && currentQuestion === questions.length - 1 && (
                  <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 dark:bg-orange-950 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span>
                      You have {questions.length - answeredCount} unanswered question(s). Review before submitting!
                    </span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


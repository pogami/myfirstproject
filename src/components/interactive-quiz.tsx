"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Award, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuizQuestion {
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

interface InteractiveQuizProps {
  questions: QuizQuestion[];
  topic: string;
  onComplete?: (score: number, total: number) => void;
}

export function InteractiveQuiz({ questions, topic, onComplete }: InteractiveQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(new Array(questions.length).fill(false));
  const [questionResults, setQuestionResults] = useState<('correct' | 'incorrect' | null)[]>(new Array(questions.length).fill(null));
  const [isComplete, setIsComplete] = useState(false);

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isCorrect = selectedAnswer.toLowerCase().trim() === question.answer.toLowerCase().trim();

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    
    setShowFeedback(true);
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    const newAnswered = [...answeredQuestions];
    newAnswered[currentQuestion] = true;
    setAnsweredQuestions(newAnswered);
    
    // Track whether this question was correct or incorrect
    const newResults = [...questionResults];
    newResults[currentQuestion] = isCorrect ? 'correct' : 'incorrect';
    setQuestionResults(newResults);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
      setShowFeedback(false);
    } else {
      setIsComplete(true);
      if (onComplete) {
        onComplete(score + (isCorrect ? 1 : 0), questions.length);
      }
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setShowFeedback(false);
    setScore(0);
    setAnsweredQuestions(new Array(questions.length).fill(false));
    setQuestionResults(new Array(questions.length).fill(null));
    setIsComplete(false);
  };

  if (isComplete) {
    const finalScore = score + (isCorrect ? 1 : 0);
    const percentage = Math.round((finalScore / questions.length) * 100);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="my-4"
      >
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="p-6 text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Award className="w-16 h-16 mx-auto text-yellow-500" />
            </motion.div>
            
            <div>
              <h3 className="text-2xl font-bold mb-2">Quiz Complete! 🎉</h3>
              <p className="text-muted-foreground">
                You scored <span className="text-primary font-bold text-xl">{finalScore}/{questions.length}</span>
              </p>
              <p className="text-3xl font-bold text-primary mt-2">{percentage}%</p>
            </div>
            
            <div className="space-y-2">
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
            
            <div className="flex gap-2 justify-center pt-4">
              <Button onClick={handleRestart} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => {}} variant="default">
                Review Answers
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-4"
    >
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              🎯 Quiz: {topic}
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        
        <CardContent className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-base font-medium">{question.question}</p>
              </div>

              {question.options ? (
                <div className="space-y-2">
                  {question.options.map((option, index) => {
                    const letter = String.fromCharCode(65 + index); // A, B, C, D
                    const isSelected = selectedAnswer === letter;
                    const isAnswered = showFeedback;
                    const isCorrectOption = letter === question.answer.toUpperCase();
                    
                    let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all ";
                    let textClass = "";
                    
                    if (isAnswered) {
                      if (isCorrectOption) {
                        buttonClass += "bg-green-50 border-green-500 dark:bg-green-950/50 dark:border-green-500";
                        textClass = "text-green-900 dark:text-green-100";
                      } else if (isSelected && !isCorrect) {
                        buttonClass += "bg-red-50 border-red-500 dark:bg-red-950/50 dark:border-red-500";
                        textClass = "text-red-900 dark:text-red-100";
                      } else {
                        buttonClass += "border-gray-200 opacity-50";
                        textClass = "text-gray-500 dark:text-gray-400";
                      }
                    } else {
                      buttonClass += isSelected 
                        ? "bg-primary/10 border-primary" 
                        : "border-gray-200 hover:border-primary/50 hover:bg-muted/50";
                    }
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(letter)}
                        disabled={showFeedback}
                        className={buttonClass}
                      >
                        <div className={`flex items-center gap-3 ${textClass}`}>
                          <span className="font-bold">{letter}.</span>
                          <span className="flex-1">{option}</span>
                          {isAnswered && isCorrectOption && (
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          )}
                          {isAnswered && isSelected && !isCorrect && (
                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={selectedAnswer}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full p-4 rounded-lg border-2 border-gray-200 focus:border-primary min-h-[100px] resize-none"
                    disabled={showFeedback}
                  />
                </div>
              )}

              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border-2 ${
                    isCorrect 
                      ? "bg-green-50 border-green-500 dark:bg-green-950/50" 
                      : "bg-red-50 border-red-500 dark:bg-red-950/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-700 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-700 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 space-y-1">
                      <div className={`font-bold ${
                        isCorrect 
                          ? "text-green-900 dark:text-green-100" 
                          : "text-red-900 dark:text-red-100"
                      }`}>
                        {isCorrect ? "✓ Correct!" : "✗ Not quite"}
                      </div>
                      {!isCorrect && (
                        <div className={`text-sm ${
                          isCorrect 
                            ? "text-green-800 dark:text-green-200" 
                            : "text-red-800 dark:text-red-200"
                        }`}>
                          The correct answer is: <span className="font-bold">{question.answer}</span>
                        </div>
                      )}
                      {question.explanation && (
                        <div className={`text-sm leading-relaxed ${
                          isCorrect 
                            ? "text-green-800 dark:text-green-200" 
                            : "text-red-800 dark:text-red-200"
                        }`}>
                          {question.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-1">
                  {Array.from({ length: questions.length }).map((_, i) => {
                    const result = questionResults[i];
                    let dotColor = "bg-gray-300 dark:bg-gray-600"; // Default: unanswered
                    
                    if (result === 'correct') {
                      dotColor = "bg-green-500 dark:bg-green-500"; // Correct
                    } else if (result === 'incorrect') {
                      dotColor = "bg-red-500 dark:bg-red-500"; // Incorrect
                    } else if (i === currentQuestion) {
                      dotColor = "bg-primary"; // Current question (unanswered)
                    }
                    
                    return (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-colors ${dotColor}`}
                        title={
                          result === 'correct' ? 'Correct' :
                          result === 'incorrect' ? 'Incorrect' :
                          i === currentQuestion ? 'Current' :
                          'Not answered'
                        }
                      />
                    );
                  })}
                </div>
                <span className="text-sm text-muted-foreground">
                  Score: {score}/{currentQuestion + (showFeedback ? 1 : 0)}
                </span>
              </div>

              <div className="flex gap-2">
                {!showFeedback ? (
                  <Button 
                    onClick={handleSubmit} 
                    className="w-full"
                    disabled={!selectedAnswer}
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="w-full">
                    {currentQuestion < questions.length - 1 ? (
                      <>
                        Next Question <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      "See Results"
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}


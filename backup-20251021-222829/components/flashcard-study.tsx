"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, ArrowRight, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardStudyProps {
  flashcards: Flashcard[];
  onComplete?: (correct: number, total: number) => void;
}

export default function FlashcardStudy({ flashcards, onComplete }: FlashcardStudyProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentCard = flashcards[currentIndex];
  const isLastCard = currentIndex === flashcards.length - 1;

  const handleAnswer = (correct: boolean) => {
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (isLastCard) {
      setCompleted(true);
      onComplete?.(correctCount, flashcards.length);
    } else {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      setShowResult(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowResult(false);
    setCorrectCount(0);
    setCompleted(false);
  };

  if (completed) {
    const accuracy = Math.round((correctCount / flashcards.length) * 100);
    return (
      <div className="text-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        </motion.div>
        <h3 className="text-2xl font-bold mb-2">Study Complete!</h3>
        <p className="text-lg text-muted-foreground mb-4">
          You got {correctCount} out of {flashcards.length} correct ({accuracy}%)
        </p>
        <Button onClick={handleRestart} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Study Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Card {currentIndex + 1} of {flashcards.length}</span>
          <span>{Math.round(((currentIndex + 1) / flashcards.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <Card className="mb-6 min-h-[300px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <CardContent className="p-8 h-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={isFlipped ? 'back' : 'front'}
              initial={{ rotateY: 90 }}
              animate={{ rotateY: 0 }}
              exit={{ rotateY: -90 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <p className="text-xl font-medium">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {isFlipped ? 'Answer' : 'Question'} - Click to flip
              </p>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Answer Buttons */}
      {isFlipped && !showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4 justify-center"
        >
          <Button
            variant="destructive"
            size="lg"
            onClick={() => handleAnswer(false)}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Wrong
          </Button>
          <Button
            size="lg"
            onClick={() => handleAnswer(true)}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Correct
          </Button>
        </motion.div>
      )}

      {/* Result Animation */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center mb-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
            >
              {isCorrect ? (
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-2" />
              ) : (
                <X className="h-16 w-16 text-red-500 mx-auto mb-2" />
              )}
            </motion.div>
            <p className={`text-xl font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next Button */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Button onClick={handleNext} size="lg" className="gap-2">
            {isLastCard ? 'Finish' : 'Next Card'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}

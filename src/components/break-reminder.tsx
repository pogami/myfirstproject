'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Coffee, Brain, Zap, CheckCircle } from 'lucide-react';

interface BreakReminderProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  onEndBreak: () => void;
  studyTime: number; // in minutes
  isLoading: boolean;
}

export function BreakReminder({ isOpen, onClose, onSkip, onEndBreak, studyTime, isLoading }: BreakReminderProps) {
  const [breakTime, setBreakTime] = useState(5); // 5 minute break by default
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [breakCountdown, setBreakCountdown] = useState(breakTime * 60);
  const [showSkipConfirmation, setShowSkipConfirmation] = useState(false);
  const [showEndBreakConfirmation, setShowEndBreakConfirmation] = useState(false);

  useEffect(() => {
    if (isBreakActive && breakCountdown > 0) {
      const timer = setTimeout(() => {
        setBreakCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isBreakActive && breakCountdown === 0) {
      setIsBreakActive(false);
      onClose();
    }
  }, [isBreakActive, breakCountdown, onClose]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startBreak = () => {
    setIsBreakActive(true);
    setBreakCountdown(breakTime * 60);
  };

  const skipBreak = () => {
    setShowSkipConfirmation(true);
  };

  const confirmSkip = () => {
    setShowSkipConfirmation(false);
    onSkip();
  };

  const cancelSkip = () => {
    setShowSkipConfirmation(false);
  };

  const requestEndBreak = () => {
    setShowEndBreakConfirmation(true);
  };

  const confirmEndBreak = () => {
    setShowEndBreakConfirmation(false);
    setIsBreakActive(false);
    onEndBreak();
  };

  const cancelEndBreak = () => {
    setShowEndBreakConfirmation(false);
  };

  if (isBreakActive) {
    return (
      <>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center">
              <Coffee className="h-5 w-5 text-orange-500" />
              Take a Break!
            </DialogTitle>
            <DialogDescription className="text-center">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                  <span>Calculating study time...</span>
                </div>
              ) : (
                <>
                  You've been studying for {Math.floor(studyTime / 60)} hours and {Math.floor(studyTime % 60)} minutes. 
                  Time to rest your mind!
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10 border-orange-200">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {formatTime(breakCountdown)}
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Break time remaining
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-orange-900 dark:text-orange-100">Break Activities:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Coffee className="h-4 w-4 text-orange-600" />
                    <span>Get a drink</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-orange-600" />
                    <span>Stretch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-orange-600" />
                    <span>Take a walk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-600" />
                    <span>Rest your eyes</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              The site is locked during break time to ensure you get proper rest.
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              Please take this time to rest and recharge. The break will end automatically.
            </p>
            <p className="text-xs text-red-500 mb-4">
              Changed your mind? Click below to end the break early
            </p>
            <Button 
              onClick={requestEndBreak}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              End Break
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <EndBreakConfirmationDialog 
        isOpen={showEndBreakConfirmation}
        onConfirm={confirmEndBreak}
        onCancel={cancelEndBreak}
      />
    </>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center">
              <Clock className="h-5 w-5 text-blue-500" />
              Study Break Recommended
            </DialogTitle>
            <DialogDescription className="text-center">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span>Calculating study time...</span>
                </div>
              ) : (
                <>
                  You've been studying for {Math.floor(studyTime / 60)} hours and {Math.floor(studyTime % 60)} minutes. 
                  Taking regular breaks improves focus and retention!
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <Badge variant="secondary" className="mb-2">
                  {isLoading ? (
                    <div className="flex items-center gap-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    `Study Time: ${Math.floor(studyTime / 60)}h ${Math.floor(studyTime % 60)}m`
                  )}
                </Badge>
                <h3 className="text-lg font-semibold mb-2">Recommended Break Duration</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="text-sm">Short Break (5 min)</span>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setBreakTime(5);
                      startBreak();
                    }}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Start 5min
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="text-sm">Medium Break (10 min)</span>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setBreakTime(10);
                      startBreak();
                    }}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Start 10min
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="text-sm">Long Break (15 min)</span>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setBreakTime(15);
                      startBreak();
                    }}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Start 15min
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex gap-3">
            <Button 
              onClick={skipBreak}
              variant="outline"
              className="flex-1"
            >
              Skip Break
            </Button>
            <Button 
              onClick={() => {
                setBreakTime(5);
                startBreak();
              }}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              <Coffee className="h-4 w-4 mr-2" />
              Start 5min Break
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <SkipConfirmationDialog 
        isOpen={showSkipConfirmation}
        onConfirm={confirmSkip}
        onCancel={cancelSkip}
      />
      
      <EndBreakConfirmationDialog 
        isOpen={showEndBreakConfirmation}
        onConfirm={confirmEndBreak}
        onCancel={cancelEndBreak}
      />
    </>
  );
}

// Skip Confirmation Dialog
function SkipConfirmationDialog({ isOpen, onConfirm, onCancel }: { isOpen: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <Clock className="h-5 w-5 text-orange-500" />
            Are you sure?
          </DialogTitle>
          <DialogDescription className="text-center">
            Taking regular breaks improves focus and retention. Are you sure you want to skip this break?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-3">
          <Button 
            onClick={onCancel}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            className="flex-1 bg-orange-500 hover:bg-orange-600"
          >
            Yes, Skip Break
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// End Break Confirmation Dialog
function EndBreakConfirmationDialog({ isOpen, onConfirm, onCancel }: { isOpen: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <Coffee className="h-5 w-5 text-orange-500" />
            End Break Early?
          </DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to end your break early? Taking the full break time helps you rest and recharge properly.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-3">
          <Button 
            onClick={onCancel}
            variant="outline"
            className="flex-1"
          >
            Continue Break
          </Button>
          <Button 
            onClick={onConfirm}
            className="flex-1 bg-orange-500 hover:bg-orange-600"
          >
            Yes, End Break
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

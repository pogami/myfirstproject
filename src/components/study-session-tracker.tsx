'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Square, Clock, Brain, Target } from 'lucide-react';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { auth } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';

export function StudySessionTracker() {
  const [isStudying, setIsStudying] = useState(false);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionType, setSessionType] = useState<'focused' | 'break' | 'review'>('focused');
  const [subject, setSubject] = useState('');
  
  const { updateStudyTime, startStudySession, endStudySession } = useDashboardStats(auth.currentUser);
  const { toast } = useToast();

  // Update elapsed time every second - ONLY when tab is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let lastActiveTime = Date.now();
    let isTabActive = !document.hidden;
    
    if (isStudying && sessionStartTime) {
      interval = setInterval(() => {
        const now = Date.now();
        
        // Check if tab is currently active
        const currentlyActive = !document.hidden;
        
        // Only add time if tab was active during this interval
        if (currentlyActive && isTabActive) {
          const timeDiff = now - lastActiveTime;
          setElapsedTime(prev => prev + Math.floor(timeDiff / 1000));
        }
        
        lastActiveTime = now;
        isTabActive = currentlyActive;
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStudying, sessionStartTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartStudy = async () => {
    try {
      const sessionId = await startStudySession(subject, sessionType);
      if (sessionId) {
        setCurrentSession(sessionId);
        setSessionStartTime(new Date());
        setIsStudying(true);
        setElapsedTime(0);
        
        toast({
          title: "Study session started",
          description: `Started ${sessionType} study session${subject ? ` for ${subject}` : ''}. Time only counts when this tab is active.`,
        });
      }
    } catch (error) {
      console.error('Error starting study session:', error);
      toast({
        title: "Error",
        description: "Failed to start study session",
        variant: "destructive",
      });
    }
  };

  const handlePauseStudy = () => {
    setIsStudying(false);
    toast({
      title: "Study session paused",
      description: "Your session has been paused",
    });
  };

  const handleResumeStudy = () => {
    setIsStudying(true);
    toast({
      title: "Study session resumed",
      description: "Your session has been resumed",
    });
  };

  const handleEndStudy = async () => {
    if (!currentSession || !sessionStartTime) return;

    try {
      const duration = Math.floor(elapsedTime / 60); // Convert to minutes
      await endStudySession(currentSession, duration);
      
      const finalTime = elapsedTime;
      setIsStudying(false);
      setCurrentSession(null);
      setSessionStartTime(null);
      setElapsedTime(0);
      
      toast({
        title: "Study session ended",
        description: `Great job! You studied for ${formatTime(finalTime)} (active time only)`,
      });
    } catch (error) {
      console.error('Error ending study session:', error);
      toast({
        title: "Error",
        description: "Failed to end study session",
        variant: "destructive",
      });
    }
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'focused': return 'bg-blue-500';
      case 'break': return 'bg-green-500';
      case 'review': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'focused': return <Brain className="h-4 w-4" />;
      case 'break': return <Clock className="h-4 w-4" />;
      case 'review': return <Target className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  if (!auth.currentUser) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Study Session Tracker
        </CardTitle>
        <CardDescription>
          Track your study time and build productive habits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Session Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Session Type</label>
          <div className="flex gap-2">
            {(['focused', 'break', 'review'] as const).map((type) => (
              <Button
                key={type}
                variant={sessionType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSessionType(type)}
                className="flex items-center gap-1"
              >
                {getSessionTypeIcon(type)}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Subject Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Subject (Optional)</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Math, Biology, History..."
            className="w-full px-3 py-2 border border-input rounded-md text-sm"
          />
        </div>

        {/* Timer Display */}
        <div className="text-center py-4">
          <div className="text-3xl font-mono font-bold text-primary">
            {formatTime(elapsedTime)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {isStudying ? (
              document.hidden ? '⏸️ Tab inactive - time paused' : '🟢 Studying...'
            ) : 'Session paused'}
          </div>
          {isStudying && (
            <div className="text-xs text-muted-foreground mt-2">
              ⚠️ Time only counts when this tab is active
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          {!isStudying ? (
            <Button
              onClick={handleStartStudy}
              className="flex-1"
              disabled={!sessionStartTime && elapsedTime > 0}
            >
              <Play className="h-4 w-4 mr-2" />
              {sessionStartTime ? 'Resume' : 'Start'}
            </Button>
          ) : (
            <Button
              onClick={handlePauseStudy}
              variant="outline"
              className="flex-1"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          
          {sessionStartTime && (
            <Button
              onClick={handleEndStudy}
              variant="destructive"
              className="flex-1"
            >
              <Square className="h-4 w-4 mr-2" />
              End
            </Button>
          )}
        </div>

        {/* Session Info */}
        {sessionStartTime && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Session started:</span>
              <span>{sessionStartTime.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">Type:</span>
              <Badge className={getSessionTypeColor(sessionType)}>
                {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)}
              </Badge>
            </div>
            {subject && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-muted-foreground">Subject:</span>
                <span>{subject}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

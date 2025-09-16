'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, BookOpen, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  course?: string;
  type: 'assignment' | 'exam' | 'study_session' | 'class' | 'deadline';
  priority: 'low' | 'medium' | 'high';
  completed?: boolean;
}

interface GoogleCalendarIntegrationProps {
  userId?: string;
  courses?: string[];
}

export function GoogleCalendarIntegration({ userId, courses = [] }: GoogleCalendarIntegrationProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  // Mock data for demonstration
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'CS-101 Assignment Due',
      start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      description: 'Data Structures Assignment #3',
      course: 'CS-101',
      type: 'assignment',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Math-203 Midterm Exam',
      start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      description: 'Linear Algebra Midterm',
      course: 'MATH-203',
      type: 'exam',
      priority: 'high'
    },
    {
      id: '3',
      title: 'Study Session - Biology',
      start: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      description: 'Group study for BIO-101',
      course: 'BIO-101',
      type: 'study_session',
      priority: 'medium'
    }
  ];

  useEffect(() => {
    // Check if Google Calendar is connected
    const checkConnection = () => {
      const connected = localStorage.getItem('googleCalendarConnected') === 'true';
      setIsConnected(connected);
      if (connected) {
        setEvents(mockEvents);
      }
    };
    checkConnection();
  }, []);

  const connectGoogleCalendar = async () => {
    setIsLoading(true);
    try {
      // Simulate Google Calendar API connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      localStorage.setItem('googleCalendarConnected', 'true');
      setIsConnected(true);
      setEvents(mockEvents);
      
      toast({
        title: "Google Calendar Connected!",
        description: "Your calendar events are now synced with CourseConnect.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Failed to connect to Google Calendar. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const syncCalendar = async () => {
    setIsSyncing(true);
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Calendar Synced!",
        description: "Your calendar has been updated with the latest events.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: "Failed to sync calendar. Please try again.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const createStudyEvent = (course: string, duration: number = 2) => {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
    
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: `Study Session - ${course}`,
      start: startTime,
      end: endTime,
      description: `Focused study session for ${course}`,
      course: course,
      type: 'study_session',
      priority: 'medium'
    };
    
    setEvents(prev => [...prev, newEvent]);
    
    toast({
      title: "Study Session Created!",
      description: `Added ${duration}h study session for ${course} to your calendar.`,
    });
  };

  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'assignment': return <BookOpen className="h-4 w-4" />;
      case 'exam': return <AlertCircle className="h-4 w-4" />;
      case 'study_session': return <Clock className="h-4 w-4" />;
      case 'class': return <Calendar className="h-4 w-4" />;
      case 'deadline': return <AlertCircle className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: CalendarEvent['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Connect Your Calendar</h3>
              <p className="text-muted-foreground mb-4">
                Sync your academic schedule with Google Calendar for better time management.
              </p>
              <Button 
                onClick={connectGoogleCalendar} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  'Connect Google Calendar'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Calendar Connected</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={syncCalendar}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Now
                    </>
                  )}
                </Button>
              </div>
              
              <div className="grid gap-3">
                <h4 className="font-medium">Upcoming Events</h4>
                {events.map((event) => (
                  <div 
                    key={event.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getEventIcon(event.type)}
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(event.start)} at {formatTime(event.start)}
                        </div>
                        {event.course && (
                          <Badge variant="outline" className="mt-1">
                            {event.course}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(event.priority)}>
                        {event.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid gap-2">
                <h4 className="font-medium">Quick Actions</h4>
                <div className="flex gap-2 flex-wrap">
                  {courses.map((course) => (
                    <Button
                      key={course}
                      variant="outline"
                      size="sm"
                      onClick={() => createStudyEvent(course)}
                    >
                      + Study {course}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

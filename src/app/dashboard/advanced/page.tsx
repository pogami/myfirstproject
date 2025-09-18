'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Music, 
  Brain, 
  BarChart3, 
  Users, 
  Zap,
  TrendingUp,
  Clock,
  BookOpen,
  Target,
  Star,
  Bell,
  Settings,
  Plus,
  ArrowRight,
  Crown
} from 'lucide-react';
import Link from 'next/link';
import { GoogleCalendarIntegration } from '@/components/google-calendar-integration';
import { EnhancedSpotifyIntegration } from '@/components/enhanced-spotify-integration';
import { AdvancedAITutor } from '@/components/advanced-ai-tutor';
import { GradePredictionSystem } from '@/components/grade-prediction-system';
import { EnhancedStudyGroups } from '@/components/enhanced-study-groups';
import { MultiModalAI } from '@/components/multi-modal-ai';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/client';
import { useChatStore } from '@/hooks/use-chat-store';

interface DashboardStats {
  studyTimeToday: number;
  assignmentsCompleted: number;
  studyStreak: number;
  averageGrade: number;
  upcomingDeadlines: number;
  studyGroupsJoined: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

export default function AdvancedDashboard() {
  // Use a safer approach for auth state
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  
  useEffect(() => {
    // Safely handle auth state
    try {
      if (auth && typeof auth.onAuthStateChanged === 'function') {
        const unsubscribe = auth.onAuthStateChanged(
          (user: any) => {
            setUser(user);
            setLoading(false);
            setError(null);
          },
          (error: any) => {
            console.warn("Auth state error (offline mode):", error);
            setUser(null);
            setLoading(false);
            setError(error);
          }
        );
        return unsubscribe;
      } else {
        // Mock auth - no user
        setUser(null);
        setLoading(false);
        setError(null);
      }
    } catch (authError) {
      console.warn("Auth initialization error (offline mode):", authError);
      setUser(null);
      setLoading(false);
      setError(authError);
    }
  }, []);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isProUser, setIsProUser] = useState(false); // Demo access - set to true for demo
  const { isDemoMode, trialActivated, trialDaysLeft, updateTrialDaysLeft } = useChatStore();
  
  // Check if user has Scholar Features access (trial or subscription)
  useEffect(() => {
    // Update trial countdown
    if (trialActivated) {
      updateTrialDaysLeft();
    }
    
    // Check if user has access to Scholar Features
    const hasScholarAccess = isDemoMode || trialDaysLeft > 0;
    
    if (!hasScholarAccess) {
      // Only redirect if user truly doesn't have access
      window.location.href = '/dashboard';
    }
  }, [isDemoMode, trialDaysLeft, trialActivated, updateTrialDaysLeft]);
  const [stats, setStats] = useState<DashboardStats>({
    studyTimeToday: 2.5,
    assignmentsCompleted: 8,
    studyStreak: 15,
    averageGrade: 87.5,
    upcomingDeadlines: 3,
    studyGroupsJoined: 2
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: '1',
      type: 'assignment',
      title: 'Completed CS-101 Assignment 3',
      time: '2 hours ago',
      icon: <BookOpen className="h-4 w-4" />
    },
    {
      id: '2',
      type: 'study_session',
      title: 'Study session with Math Warriors',
      time: '4 hours ago',
      icon: <Users className="h-4 w-4" />
    },
    {
      id: '3',
      type: 'ai_chat',
      title: 'Asked AI tutor about recursion',
      time: '6 hours ago',
      icon: <Brain className="h-4 w-4" />
    },
    {
      id: '4',
      type: 'grade_update',
      title: 'Math-201 Quiz 2 graded: 92%',
      time: '1 day ago',
      icon: <BarChart3 className="h-4 w-4" />
    }
  ]);

  const quickActions: QuickAction[] = [
    {
      id: 'start_study',
      title: 'Start Study Session',
      description: 'Begin a focused study session',
      icon: <Target className="h-5 w-5" />,
      action: () => setActiveTab('ai-tutor'),
      color: 'bg-blue-500'
    },
    {
      id: 'join_group',
      title: 'Join Study Group',
      description: 'Connect with classmates',
      icon: <Users className="h-5 w-5" />,
      action: () => setActiveTab('study-groups'),
      color: 'bg-green-500'
    },
    {
      id: 'check_grades',
      title: 'Check Grades',
      description: 'View grade predictions',
      icon: <BarChart3 className="h-5 w-5" />,
      action: () => setActiveTab('grades'),
      color: 'bg-purple-500'
    },
    {
      id: 'sync_calendar',
      title: 'Sync Calendar',
      description: 'Update your schedule',
      icon: <Calendar className="h-5 w-5" />,
      action: () => setActiveTab('calendar'),
      color: 'bg-orange-500'
    }
  ];

  const upcomingEvents = [
    {
      id: '1',
      title: 'CS-101 Assignment Due',
      time: 'Tomorrow at 11:59 PM',
      type: 'assignment',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Math-201 Study Group',
      time: 'Friday at 2:00 PM',
      type: 'study_group',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Biology Lab Report',
      time: 'Next Monday',
      type: 'assignment',
      priority: 'medium'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'study_session': return <Users className="h-4 w-4 text-green-500" />;
      case 'ai_chat': return <Brain className="h-4 w-4 text-purple-500" />;
      case 'grade_update': return <BarChart3 className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto px-6 py-8">
        {/* Demo Access Banner */}
        {isDemoMode && (
          <Card className="mb-8 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30">
                  <Crown className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-green-900 dark:text-green-100">🎉 Demo Mode Active!</h2>
              <p className="text-green-700 dark:text-green-300 mb-6 max-w-2xl mx-auto">
                You're currently experiencing our Pro features in demo mode. All advanced AI tools, voice input, 
                image analysis, and premium features are available for testing.
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                  <Link href="/pricing">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Pro - $5.99/mo
                  </Link>
                </Button>
                <Button variant="outline" size="lg" onClick={() => setIsDemoMode(false)}>
                  Exit Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Paywall for non-Pro users (only show if not in demo mode) */}
        {!isDemoMode && (
          <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <Crown className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Pro Features</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Unlock advanced AI-powered tools including specialized tutors, voice input, image analysis, 
                grade predictions, and more. Upgrade to Pro for just $5.99/month.
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-primary to-purple-600">
                  <Link href="/pricing">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">
            Here's your academic overview and today's focus areas.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Study Time Today</p>
                  <p className="text-2xl font-bold">{stats.studyTimeToday}h</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assignments Done</p>
                  <p className="text-2xl font-bold">{stats.assignmentsCompleted}</p>
                </div>
                <BookOpen className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Study Streak</p>
                  <p className="text-2xl font-bold">{stats.studyStreak} days</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Grade</p>
                  <p className="text-2xl font-bold">{stats.averageGrade}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai-tutor">AI Tutor</TabsTrigger>
            <TabsTrigger value="study-groups">Study Groups</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="multimodal">AI Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {quickActions.map((action) => (
                      <div
                        key={action.id}
                        className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={action.action}
                      >
                        <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center text-white`}>
                          {action.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{action.title}</h4>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(event.priority)}`} />
                        <div className="flex-1">
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">{event.time}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {event.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Study Groups Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Study Groups
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">CS-101 Study Squad</h4>
                        <p className="text-sm text-muted-foreground">5 members • Next session: Tomorrow</p>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Math Warriors</h4>
                        <p className="text-sm text-muted-foreground">3 members • Next session: Friday</p>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  </div>
                  <Button className="w-full mt-3" onClick={() => setActiveTab('study-groups')}>
                    View All Groups
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-tutor">
            <AdvancedAITutor user={user} />
          </TabsContent>

          <TabsContent value="study-groups">
            <EnhancedStudyGroups />
          </TabsContent>

          <TabsContent value="grades">
            <GradePredictionSystem />
          </TabsContent>

          <TabsContent value="calendar">
            <div className="space-y-6">
              <GoogleCalendarIntegration courses={['CS-101', 'MATH-201', 'BIO-101']} />
              <EnhancedSpotifyIntegration />
            </div>
          </TabsContent>

          <TabsContent value="multimodal">
            <MultiModalAI />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

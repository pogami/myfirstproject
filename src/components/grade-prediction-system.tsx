'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  BookOpen,
  Calculator,
  BarChart3,
  Lightbulb,
  Clock,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  currentGrade: number;
  assignments: Assignment[];
  predictions: GradePrediction;
}

interface Assignment {
  id: string;
  name: string;
  type: 'homework' | 'quiz' | 'exam' | 'project' | 'participation';
  weight: number;
  score: number;
  maxScore: number;
  dueDate: Date;
  completed: boolean;
}

interface GradePrediction {
  predictedGrade: number;
  confidence: number;
  factors: PredictionFactor[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  trend: 'improving' | 'stable' | 'declining';
}

interface PredictionFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

interface GradePredictionSystemProps {
  courses?: Course[];
}

export function GradePredictionSystem({ courses = [] }: GradePredictionSystemProps) {
  const [courseData, setCourseData] = useState<Course[]>(courses);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  // Mock data for demonstration
  const mockCourses: Course[] = [
    {
      id: '1',
      name: 'Introduction to Computer Science',
      code: 'CS-101',
      credits: 3,
      currentGrade: 87.5,
      assignments: [
        {
          id: '1',
          name: 'Programming Assignment 1',
          type: 'homework',
          weight: 15,
          score: 85,
          maxScore: 100,
          dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          completed: true
        },
        {
          id: '2',
          name: 'Midterm Exam',
          type: 'exam',
          weight: 25,
          score: 92,
          maxScore: 100,
          dueDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          completed: true
        },
        {
          id: '3',
          name: 'Final Project',
          type: 'project',
          weight: 30,
          score: 0,
          maxScore: 100,
          dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          completed: false
        }
      ],
      predictions: {
        predictedGrade: 89.2,
        confidence: 85,
        factors: [
          {
            factor: 'Assignment Performance',
            impact: 'positive',
            weight: 0.3,
            description: 'Strong performance on completed assignments'
          },
          {
            factor: 'Exam Performance',
            impact: 'positive',
            weight: 0.25,
            description: 'Excellent midterm exam score'
          },
          {
            factor: 'Final Project Risk',
            impact: 'negative',
            weight: 0.2,
            description: 'Large project with significant weight remaining'
          },
          {
            factor: 'Attendance',
            impact: 'positive',
            weight: 0.15,
            description: 'Consistent class attendance'
          },
          {
            factor: 'Study Time',
            impact: 'positive',
            weight: 0.1,
            description: 'Regular study sessions logged'
          }
        ],
        recommendations: [
          'Focus extra time on the final project - it\'s worth 30% of your grade',
          'Consider forming a study group for the final exam',
          'Review past assignments to identify areas for improvement'
        ],
        riskLevel: 'medium',
        trend: 'improving'
      }
    },
    {
      id: '2',
      name: 'Calculus I',
      code: 'MATH-201',
      credits: 4,
      currentGrade: 78.3,
      assignments: [
        {
          id: '4',
          name: 'Quiz 1',
          type: 'quiz',
          weight: 10,
          score: 75,
          maxScore: 100,
          dueDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
          completed: true
        },
        {
          id: '5',
          name: 'Quiz 2',
          type: 'quiz',
          weight: 10,
          score: 82,
          maxScore: 100,
          dueDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          completed: true
        },
        {
          id: '6',
          name: 'Final Exam',
          type: 'exam',
          weight: 40,
          score: 0,
          maxScore: 100,
          dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
          completed: false
        }
      ],
      predictions: {
        predictedGrade: 81.5,
        confidence: 75,
        factors: [
          {
            factor: 'Quiz Performance',
            impact: 'positive',
            weight: 0.2,
            description: 'Improving quiz scores show learning progress'
          },
          {
            factor: 'Final Exam Weight',
            impact: 'negative',
            weight: 0.4,
            description: 'Final exam is worth 40% - high risk if unprepared'
          },
          {
            factor: 'Homework Completion',
            impact: 'neutral',
            weight: 0.2,
            description: 'Average homework completion rate'
          },
          {
            factor: 'Study Consistency',
            impact: 'positive',
            weight: 0.2,
            description: 'Regular study sessions are helping'
          }
        ],
        recommendations: [
          'The final exam is critical - start preparing now',
          'Focus on areas where quiz scores were lower',
          'Consider getting a tutor for challenging concepts'
        ],
        riskLevel: 'high',
        trend: 'improving'
      }
    }
  ];

  useEffect(() => {
    if (courses.length === 0) {
      setCourseData(mockCourses);
      setSelectedCourse(mockCourses[0]);
    }
  }, [courses]);

  const analyzeGrades = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Grade Analysis Complete!",
        description: "AI predictions have been updated based on your performance data.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Failed to analyze grades. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <Target className="h-4 w-4 text-blue-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'negative': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'neutral': return <Clock className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Grade Prediction System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courseData.map((course) => (
              <div
                key={course.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedCourse?.id === course.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedCourse(course)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{course.code}</h4>
                  <Badge variant="outline">{course.credits} credits</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{course.name}</p>
                <div className="flex items-center justify-between">
                  <div className={`text-lg font-bold ${getGradeColor(course.currentGrade)}`}>
                    {course.currentGrade.toFixed(1)}%
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(course.predictions.trend)}
                    <span className="text-xs text-muted-foreground">
                      {course.predictions.predictedGrade.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedCourse && (
        <>
          {/* Grade Prediction Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                {selectedCourse.code} - Grade Prediction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current vs Predicted Grade */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-muted-foreground">Current</div>
                  <div className={`text-3xl font-bold ${getGradeColor(selectedCourse.currentGrade)}`}>
                    {selectedCourse.currentGrade.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-primary/5">
                  <div className="text-2xl font-bold text-primary">Predicted</div>
                  <div className={`text-3xl font-bold ${getGradeColor(selectedCourse.predictions.predictedGrade)}`}>
                    {selectedCourse.predictions.predictedGrade.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-muted-foreground">Confidence</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {selectedCourse.predictions.confidence}%
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getRiskColor(selectedCourse.predictions.riskLevel)}`} />
                  <span className="font-medium">Risk Level: {selectedCourse.predictions.riskLevel.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(selectedCourse.predictions.trend)}
                  <span className="text-sm text-muted-foreground">
                    Trend: {selectedCourse.predictions.trend}
                  </span>
                </div>
              </div>

              {/* Prediction Factors */}
              <div>
                <h4 className="font-medium mb-3">Prediction Factors</h4>
                <div className="space-y-3">
                  {selectedCourse.predictions.factors.map((factor, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      {getImpactIcon(factor.impact)}
                      <div className="flex-1">
                        <div className="font-medium">{factor.factor}</div>
                        <div className="text-sm text-muted-foreground">{factor.description}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {(factor.weight * 100).toFixed(0)}% impact
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  AI Recommendations
                </h4>
                <div className="space-y-2">
                  {selectedCourse.predictions.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Star className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span className="text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Assignment Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedCourse.assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${assignment.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div>
                        <div className="font-medium">{assignment.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {assignment.type} • {assignment.weight}% weight
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {assignment.completed ? `${assignment.score}/${assignment.maxScore}` : 'Not completed'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {assignment.completed ? `${((assignment.score / assignment.maxScore) * 100).toFixed(1)}%` : 'Pending'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Analysis Button */}
      <div className="text-center">
        <Button 
          onClick={analyzeGrades}
          disabled={isAnalyzing}
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Calculator className="h-4 w-4 animate-spin mr-2" />
              Analyzing Grades...
            </>
          ) : (
            <>
              <BarChart3 className="h-4 w-4 mr-2" />
              Run Grade Analysis
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

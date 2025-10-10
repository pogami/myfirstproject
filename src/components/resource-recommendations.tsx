"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, BookOpen, Video, FileText, Wrench, Target, Star } from 'lucide-react';
import { ResourceRecommendation } from '@/app/api/syllabus/recommend-resources/route';

interface ResourceRecommendationsProps {
  tags: {
    topics: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    skills: string[];
    prerequisites: string[];
    learningOutcomes: string[];
  };
  courseInfo: {
    title: string;
    courseCode: string;
    department: string;
  };
}

export function ResourceRecommendations({ tags, courseInfo }: ResourceRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<ResourceRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tags.topics.length > 0) {
      fetchRecommendations();
    }
  }, [tags.topics]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/syllabus/recommend-resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags, courseInfo })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to load resource recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'textbook': return <BookOpen className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      case 'practice': return <Target className="w-4 h-4" />;
      case 'tool': return <Wrench className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCostColor = (cost: string) => {
    switch (cost) {
      case 'free': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'paid': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'subscription': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Recommended Resources
          </CardTitle>
          <CardDescription>
            Finding the best resources for {courseInfo.title}...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Recommended Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={fetchRecommendations} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Recommended Resources
          </CardTitle>
          <CardDescription>
            No resources found for this course yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Recommended Resources
        </CardTitle>
        <CardDescription>
          {recommendations.length} resources found for {courseInfo.title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(rec.type)}
                  <h3 className="font-medium text-sm">{rec.title}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <Badge className={getDifficultyColor(rec.difficulty)}>
                    {rec.difficulty}
                  </Badge>
                  <Badge className={getCostColor(rec.cost)}>
                    {rec.cost}
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {rec.description}
              </p>
              
              {rec.topics.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {rec.topics.slice(0, 3).map((topic, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                  {rec.topics.length > 3 && (
                    <div className="relative group">
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-muted">
                        +{rec.topics.length - 3} more
                      </Badge>
                      <div className="absolute bottom-full left-0 mb-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[300px] max-w-[90vw] sm:max-w-[400px]"
                           role="tooltip" aria-label="All topics">
                        <div className="text-sm font-semibold mb-3 text-center text-gray-900 dark:text-gray-100">All Topics</div>
                        <div className="grid grid-cols-2 gap-2">
                          {rec.topics.map((topic, index) => (
                            <div key={index} className="text-xs p-2 bg-gray-50 dark:bg-gray-700 rounded-md text-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                              {topic}
                            </div>
                          ))}
                        </div>
                        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-200 dark:border-t-gray-700"></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">
                      {Math.round(rec.relevance * 100)}% relevant
                    </span>
                  </div>
                </div>
                
                {rec.url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(rec.url, '_blank')}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Visit
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}



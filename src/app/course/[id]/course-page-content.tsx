'use client';

import { CourseData } from '@/lib/open-graph';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Calendar, User, MessageSquare, Share2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface CoursePageContentProps {
  course: CourseData;
}

export default function CoursePageContent({ course }: CoursePageContentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950">
      <div className="container mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-sm">
              {course.courseCode}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {course.department}
            </Badge>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {course.title}
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            {course.description}
          </p>
          
          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            {course.instructor && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Instructor: {course.instructor}</span>
              </div>
            )}
            {course.memberCount && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{course.memberCount} students</span>
              </div>
            )}
            {course.semester && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{course.semester}</span>
              </div>
            )}
          </div>
        </div>

        {/* Course Actions */}
        <div className="flex gap-4 mb-8">
          <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <MessageSquare className="h-4 w-4 mr-2" />
            Join Course Chat
          </Button>
          <Button variant="outline" size="lg">
            <Share2 className="h-4 w-4 mr-2" />
            Share Course
          </Button>
        </div>

        {/* Course Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Welcome to {course.title}! This course covers fundamental concepts and provides 
                  hands-on learning opportunities. Join the community of students studying this 
                  course together on CourseConnect.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Study Groups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Join study groups with your classmates to collaborate and learn together.
                </p>
                <Button variant="outline">
                  Browse Study Groups
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.courseCode && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Course Code</span>
                    <p className="text-sm">{course.courseCode}</p>
                  </div>
                )}
                {course.department && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</span>
                    <p className="text-sm">{course.department}</p>
                  </div>
                )}
                {course.semester && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Semester</span>
                    <p className="text-sm">{course.semester}</p>
                  </div>
                )}
                {course.year && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Year</span>
                    <p className="text-sm">{course.year}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Course Chat
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Study Groups
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Resources
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

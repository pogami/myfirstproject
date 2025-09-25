import { Metadata } from 'next';
import { generateCourseMeta, CourseData } from '@/lib/open-graph';
import CoursePageContent from './course-page-content';

interface CoursePageProps {
  params: {
    id: string;
  };
}

// Mock course data - replace with actual data fetching
async function getCourseData(courseId: string): Promise<CourseData> {
  // In a real implementation, you would fetch this from your database
  // For now, return mock data
  return {
    id: courseId,
    title: `Course ${courseId}`,
    description: `Learn about ${courseId} with CourseConnect. Join thousands of students studying this course together.`,
    instructor: 'Dr. Smith',
    courseCode: courseId,
    department: 'Computer Science',
    semester: 'Fall 2024',
    year: '2024',
    memberCount: 150,
  };
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const course = await getCourseData(params.id);
  return generateCourseMeta(course);
}

export default async function CoursePage({ params }: CoursePageProps) {
  const course = await getCourseData(params.id);
  
  return <CoursePageContent course={course} />;
}

/**
 * @fileOverview Syllabus Parsing Data Models
 * 
 * Comprehensive data structures for parsing and storing syllabus information
 */

export interface CourseInfo {
  title: string;
  instructor: string;
  credits: number;
  semester: string;
  year: string;
  courseCode: string;
  department: string;
}

export interface ScheduleItem {
  day: string;
  time: string;
  location: string;
  type: 'lecture' | 'lab' | 'discussion' | 'exam' | 'office_hours';
  description?: string;
}

export interface Assignment {
  name: string;
  type: 'homework' | 'exam' | 'project' | 'quiz' | 'paper' | 'presentation';
  dueDate: Date;
  weight: number; // percentage of total grade
  description?: string;
  instructions?: string;
}

export interface GradingPolicy {
  breakdown: {
    [key: string]: number; // e.g., { "homework": 40, "exams": 60 }
  };
  scale: {
    [key: string]: string; // e.g., { "A": "90-100", "B": "80-89" }
  };
  policies: string[];
}

export interface Reading {
  title: string;
  author: string;
  required: boolean;
  week?: number;
  chapter?: string;
  pages?: string;
  type: 'textbook' | 'article' | 'handout' | 'online';
}

export interface Policies {
  attendance: string;
  late: string;
  academic_integrity: string;
  technology: string;
  other: string[];
}

export interface ContactInfo {
  instructor: {
    name: string;
    email: string;
    phone?: string;
    office: string;
    office_hours: string;
  };
  tas: Array<{
    name: string;
    email: string;
    office_hours?: string;
  }>;
}

export interface ParsedSyllabus {
  courseInfo: CourseInfo;
  schedule: ScheduleItem[];
  assignments: Assignment[];
  gradingPolicy: GradingPolicy;
  readings: Reading[];
  policies: Policies;
  contacts: ContactInfo;
  metadata: {
    parsedAt: Date;
    confidence: number; // 0-1 confidence score
    source: string; // original filename
    format: 'pdf' | 'docx' | 'txt' | 'image';
  };
}

export interface ParsingResult {
  success: boolean;
  data?: ParsedSyllabus;
  errors?: string[];
  warnings?: string[];
  confidence: number;
  requiresReview: boolean;
}

export interface ParsingProgress {
  stage: 'uploading' | 'extracting' | 'parsing' | 'structuring' | 'validating' | 'complete';
  progress: number; // 0-100
  message: string;
  details?: string;
}

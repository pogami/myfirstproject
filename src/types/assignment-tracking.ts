// Assignment tracking types for CourseConnect
export interface Course {
  id: string;
  code: string; // "MATH101", "CS201"
  name: string; // "Calculus I", "Data Structures"
  semester: string; // "Fall 2024", "Spring 2025"
  professor?: string;
  chat_id: string; // Links to chat room
  user_id: string; // Owner of the course
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  estimated_time: number; // in hours
  actual_time?: number; // in hours
  grade?: number; // grade received
  chat_id: string; // Link to course chat
  user_id: string; // Owner of the assignment
  created_at: string;
  updated_at: string;
  // Joined data
  course?: Course;
}

export interface AssignmentFormData {
  title: string;
  description?: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  estimated_time: number;
  course_id: string;
}

export interface CourseFormData {
  code: string;
  name: string;
  semester: string;
  professor?: string;
  chat_id: string;
}

// Assignment status colors and labels
export const ASSIGNMENT_STATUS = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: '🔄' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: '✅' },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800', icon: '⚠️' }
} as const;

// Priority colors and labels
export const ASSIGNMENT_PRIORITY = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-800', icon: '🟢' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
  high: { label: 'High', color: 'bg-red-100 text-red-800', icon: '🔴' }
} as const;

// Helper functions
export const getDaysUntilDue = (dueDate: string): number => {
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isOverdue = (dueDate: string): boolean => {
  return getDaysUntilDue(dueDate) < 0;
};

export const getUrgencyLevel = (dueDate: string, priority: Assignment['priority']): 'low' | 'medium' | 'high' => {
  const daysUntilDue = getDaysUntilDue(dueDate);
  
  if (daysUntilDue < 0) return 'high'; // Overdue
  if (daysUntilDue <= 1) return 'high'; // Due today or tomorrow
  if (daysUntilDue <= 3 && priority === 'high') return 'high';
  if (daysUntilDue <= 3) return 'medium';
  if (daysUntilDue <= 7 && priority === 'high') return 'medium';
  
  return 'low';
};

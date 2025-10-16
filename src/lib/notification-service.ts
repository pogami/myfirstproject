import { auth, db } from '@/lib/firebase/client-simple';
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore';

export interface CreateNotificationData {
  title: string;
  description: string;
  type: 'assignment' | 'exam' | 'message' | 'reminder' | 'system' | 'study_group';
  priority: 'low' | 'medium' | 'high';
  classId?: string;
  actionUrl?: string;
}

export class NotificationService {
  static async createNotification(data: CreateNotificationData, userId?: string) {
    const currentUser = auth.currentUser;
    if (!currentUser && !userId) {
      throw new Error('User must be authenticated or userId must be provided');
    }

    const notificationData = {
      userId: userId || currentUser!.uid,
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
      classId: data.classId || null,
      actionUrl: data.actionUrl || null,
      isRead: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async createSampleNotifications(userId: string) {
    const sampleNotifications: CreateNotificationData[] = [
      {
        title: "Upcoming: Mid-term Exam",
        description: "Your MATH-101 mid-term is next Tuesday at 2:00 PM. Don't forget to bring your calculator!",
        type: "exam",
        priority: "high",
        classId: "math-101",
        actionUrl: "/dashboard/classes/math-101"
      },
      {
        title: "Assignment Due Soon",
        description: "CS-202 Data Structures project proposal is due this Friday at 11:59 PM.",
        type: "assignment",
        priority: "medium",
        classId: "cs-202",
        actionUrl: "/dashboard/classes/cs-202"
      },
      {
        title: "New Study Group Message",
        description: "Sarah shared a study guide for Chapter 5 in the Biology study group.",
        type: "study_group",
        priority: "low",
        classId: "bio-101",
        actionUrl: "/dashboard/chat/bio-101"
      },
      {
        title: "Message from Professor",
        description: "Professor Johnson posted new class notes and updated the syllabus.",
        type: "message",
        priority: "medium",
        classId: "eng-210",
        actionUrl: "/dashboard/classes/eng-210"
      },
      {
        title: "FAFSA Deadline Reminder",
        description: "The deadline for FAFSA applications is approaching. Complete your application soon.",
        type: "reminder",
        priority: "high",
        actionUrl: "/dashboard/financial-aid"
      },
      {
        title: "System Maintenance",
        description: "CourseConnect will undergo maintenance this Sunday from 2:00 AM to 4:00 AM EST.",
        type: "system",
        priority: "low"
      }
    ];

    const notificationIds = [];
    for (const notification of sampleNotifications) {
      try {
        const id = await this.createNotification(notification, userId);
        notificationIds.push(id);
      } catch (error) {
        console.error('Error creating sample notification:', error);
      }
    }

    return notificationIds;
  }

  static async createAssignmentReminder(
    userId: string, 
    assignmentName: string, 
    dueDate: string, 
    className: string,
    classId: string
  ) {
    return this.createNotification({
      title: `Assignment Due: ${assignmentName}`,
      description: `Your ${className} assignment "${assignmentName}" is due ${dueDate}.`,
      type: "assignment",
      priority: "medium",
      classId,
      actionUrl: `/dashboard/classes/${classId}`
    }, userId);
  }

  static async createExamReminder(
    userId: string,
    examName: string,
    examDate: string,
    className: string,
    classId: string
  ) {
    return this.createNotification({
      title: `Upcoming Exam: ${examName}`,
      description: `Your ${className} ${examName} is scheduled for ${examDate}.`,
      type: "exam",
      priority: "high",
      classId,
      actionUrl: `/dashboard/classes/${classId}`
    }, userId);
  }

  static async createStudyGroupNotification(
    userId: string,
    groupName: string,
    message: string,
    classId: string
  ) {
    return this.createNotification({
      title: `New Message in ${groupName}`,
      description: message,
      type: "study_group",
      priority: "low",
      classId,
      actionUrl: `/dashboard/chat/${classId}`
    }, userId);
  }

  static async createSystemNotification(
    userId: string,
    title: string,
    description: string,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ) {
    return this.createNotification({
      title,
      description,
      type: "system",
      priority
    }, userId);
  }
}

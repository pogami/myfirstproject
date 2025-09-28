import { auth, db } from '@/lib/firebase/client';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate: Timestamp;
  completed: boolean;
  completedAt?: Timestamp;
  classId: string;
  className?: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  notes?: string;
  attachments?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class AssignmentService {
  static async createAssignment(assignmentData: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated');
    }

    const assignment = {
      ...assignmentData,
      userId: currentUser.uid,
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'assignments'), assignment);
    return docRef.id;
  }

  static async updateAssignment(assignmentId: string, updates: Partial<Assignment>) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated');
    }

    const assignmentRef = doc(db, 'assignments', assignmentId);
    await updateDoc(assignmentRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  static async completeAssignment(assignmentId: string, actualTime?: number) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated');
    }

    const assignmentRef = doc(db, 'assignments', assignmentId);
    await updateDoc(assignmentRef, {
      completed: true,
      completedAt: serverTimestamp(),
      actualTime: actualTime || null,
      updatedAt: serverTimestamp(),
    });
  }

  static async uncompleteAssignment(assignmentId: string) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated');
    }

    const assignmentRef = doc(db, 'assignments', assignmentId);
    await updateDoc(assignmentRef, {
      completed: false,
      completedAt: null,
      actualTime: null,
      updatedAt: serverTimestamp(),
    });
  }

  static async deleteAssignment(assignmentId: string) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated');
    }

    await deleteDoc(doc(db, 'assignments', assignmentId));
  }

  static async getAssignments(completed?: boolean) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated');
    }

    const assignmentsRef = collection(db, 'assignments');
    let q = query(
      assignmentsRef,
      where('userId', '==', currentUser.uid),
      orderBy('dueDate', 'asc')
    );

    if (completed !== undefined) {
      q = query(
        assignmentsRef,
        where('userId', '==', currentUser.uid),
        where('completed', '==', completed),
        orderBy('dueDate', 'asc')
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Assignment));
  }

  static async getUpcomingAssignments(days: number = 7) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated');
    }

    try {
      const assignmentsRef = collection(db, 'assignments');
      const q = query(
        assignmentsRef,
        where('userId', '==', currentUser.uid),
        where('completed', '==', false),
        orderBy('dueDate', 'asc')
      );

      const snapshot = await getDocs(q);
      const now = new Date();
      const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      return snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Assignment))
        .filter(assignment => {
          const dueDate = assignment.dueDate.toDate();
          return dueDate >= now && dueDate <= futureDate;
        });
    } catch (error) {
      console.warn('Firebase offline, returning empty array for upcoming assignments:', error);
      return [];
    }
  }

  static async getCompletedAssignmentsCount() {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated');
    }

    try {
      const assignmentsRef = collection(db, 'assignments');
      const q = query(
        assignmentsRef,
        where('userId', '==', currentUser.uid),
        where('completed', '==', true)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.warn('Firebase offline, returning 0 for completed assignments:', error);
      return 0;
    }
  }

  static async createSampleAssignments() {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated');
    }

    const sampleAssignments = [
      {
        title: "Math 101 - Chapter 5 Exercises",
        description: "Complete problems 1-20 from Chapter 5",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        classId: "math-101",
        className: "Mathematics 101",
        priority: "high" as const,
        estimatedTime: 120
      },
      {
        title: "CS 202 - Data Structures Project",
        description: "Implement binary search tree with all operations",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        classId: "cs-202",
        className: "Computer Science 202",
        priority: "high" as const,
        estimatedTime: 300
      },
      {
        title: "English 210 - Essay Draft",
        description: "First draft of argumentative essay",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        classId: "eng-210",
        className: "English 210",
        priority: "medium" as const,
        estimatedTime: 180
      },
      {
        title: "Biology 101 - Lab Report",
        description: "Write lab report for photosynthesis experiment",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        classId: "bio-101",
        className: "Biology 101",
        priority: "medium" as const,
        estimatedTime: 90
      },
      {
        title: "History 150 - Reading Response",
        description: "Respond to chapters 8-10 of textbook",
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        classId: "hist-150",
        className: "History 150",
        priority: "low" as const,
        estimatedTime: 60
      }
    ];

    const assignmentIds = [];
    for (const assignment of sampleAssignments) {
      try {
        const id = await this.createAssignment(assignment);
        assignmentIds.push(id);
      } catch (error) {
        console.error('Error creating sample assignment:', error);
      }
    }

    return assignmentIds;
  }
}

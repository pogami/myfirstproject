// Group chat and study board system
export interface StudyGroup {
  id: string;
  courseId: string;
  name: string;
  members: Array<{
    userId: string;
    userName: string;
    role: 'admin' | 'member';
    joinedAt: Date;
  }>;
  chatChannel: string;
  studyBoards: StudyBoard[];
  createdAt: Date;
  settings: {
    maxMembers: number;
    isPublic: boolean;
    autoJoin: boolean; // Auto-join students with same syllabus
  };
}

export interface StudyBoard {
  id: string;
  groupId: string;
  title: string;
  type: 'notes' | 'assignments' | 'resources' | 'discussion';
  content: any; // Rich text content
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  permissions: {
    canEdit: string[]; // User IDs
    canView: string[]; // User IDs
  };
}

// Auto-create study groups based on syllabus matching
export async function createStudyGroupFromSyllabus(
  parsedSyllabus: EnhancedParsedSyllabus,
  userId: string
): Promise<StudyGroup> {
  // 1. Find students with similar syllabi
  const matches = await findHybridMatches(parsedSyllabus, signature, userId);
  
  // 2. Create group with auto-matched students
  const group = await createStudyGroup({
    courseId: parsedSyllabus.courseInfo.courseCode,
    name: `${parsedSyllabus.courseInfo.title} Study Group`,
    members: matches.semanticMatches.map(match => ({
      userId: match.userId,
      userName: match.userName,
      role: 'member'
    })),
    settings: {
      maxMembers: 20,
      isPublic: true,
      autoJoin: true
    }
  });
  
  // 3. Create initial study boards
  await createDefaultStudyBoards(group.id, parsedSyllabus);
  
  return group;
}

async function createDefaultStudyBoards(groupId: string, syllabus: EnhancedParsedSyllabus) {
  const boards = [
    {
      title: "Course Notes",
      type: "notes" as const,
      content: `# ${syllabus.courseInfo.title} Notes\n\nWelcome to our study group!`
    },
    {
      title: "Assignments & Due Dates",
      type: "assignments" as const,
      content: syllabus.assignments.map(a => `- ${a.name} (${a.dueDate})`).join('\n')
    },
    {
      title: "Resources & Links",
      type: "resources" as const,
      content: syllabus.readings.map(r => `- ${r.title} by ${r.author}`).join('\n')
    },
    {
      title: "General Discussion",
      type: "discussion" as const,
      content: "Discuss course topics, ask questions, share insights!"
    }
  ];
  
  for (const board of boards) {
    await createStudyBoard(groupId, board);
  }
}



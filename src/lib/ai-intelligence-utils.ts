/**
 * AI Intelligence Utilities
 * Helper functions for smart features like deadline tracking, topic analysis, etc.
 */

import { Chat } from '@/hooks/use-chat-store';

// Calculate days until a date
export function calculateDaysUntil(dateString: string): number {
  if (!dateString) return Infinity;
  
  try {
    const targetDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    return Infinity;
  }
}

// Check for upcoming deadlines (within 7 days)
export function getUpcomingDeadlines(courseData: Chat['courseData']) {
  if (!courseData) return { assignments: [], exams: [] };
  
  const upcomingAssignments = (courseData.assignments || [])
    .map(assignment => ({
      ...assignment,
      daysUntil: assignment.dueDate ? calculateDaysUntil(assignment.dueDate) : Infinity
    }))
    .filter(assignment => assignment.daysUntil >= 0 && assignment.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil);
    
  const upcomingExams = (courseData.exams || [])
    .map(exam => ({
      ...exam,
      daysUntil: exam.date ? calculateDaysUntil(exam.date) : Infinity
    }))
    .filter(exam => exam.daysUntil >= 0 && exam.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil);
    
  return { assignments: upcomingAssignments, exams: upcomingExams };
}

// Format date in friendly way
export function formatDeadlineMessage(name: string, dateString: string, type: 'assignment' | 'exam'): string {
  const daysUntil = calculateDaysUntil(dateString);
  
  if (daysUntil === 0) {
    return `${name} is due TODAY!`;
  } else if (daysUntil === 1) {
    return `${name} is due TOMORROW!`;
  } else if (daysUntil <= 3) {
    return `${name} is due in ${daysUntil} days (that's really soon!)`;
  } else if (daysUntil <= 7) {
    return `${name} is coming up in ${daysUntil} days`;
  }
  
  return `${name} is due on ${dateString}`;
}

// Generate deadline reminder context for AI
export function generateDeadlineContext(courseData: Chat['courseData']): string {
  const { assignments, exams } = getUpcomingDeadlines(courseData);
  
  if (assignments.length === 0 && exams.length === 0) {
    return '';
  }
  
  let context = '\n\n🚨 IMPORTANT UPCOMING DEADLINES:\n';
  
  if (exams.length > 0) {
    context += '\nExams:\n';
    exams.forEach(exam => {
      context += `- ${formatDeadlineMessage(exam.name, exam.date!, 'exam')}\n`;
    });
  }
  
  if (assignments.length > 0) {
    context += '\nAssignments:\n';
    assignments.forEach(assignment => {
      context += `- ${formatDeadlineMessage(assignment.name, assignment.dueDate!, 'assignment')}\n`;
    });
  }
  
  context += '\nMention these proactively if relevant to the conversation!\n';
  
  return context;
}

// Detect question complexity
export function detectQuestionComplexity(question: string): 'basic' | 'intermediate' | 'advanced' {
  const lowerQuestion = question.toLowerCase();
  
  // Basic indicators
  const basicIndicators = [
    'what is', 'define', 'explain simply', 'basics', 'introduction',
    'eli5', 'simple terms', 'for beginners', 'confused', "don't understand"
  ];
  
  // Advanced indicators
  const advancedIndicators = [
    'analyze', 'compare', 'contrast', 'evaluate', 'synthesize',
    'critique', 'in depth', 'detailed', 'advanced', 'complex',
    'relationship between', 'why does', 'how does this relate'
  ];
  
  if (basicIndicators.some(indicator => lowerQuestion.includes(indicator))) {
    return 'basic';
  }
  
  if (advancedIndicators.some(indicator => lowerQuestion.includes(indicator))) {
    return 'advanced';
  }
  
  return 'intermediate';
}

// Generate adaptive response instructions based on complexity
export function getAdaptiveInstructions(complexity: 'basic' | 'intermediate' | 'advanced'): string {
  switch (complexity) {
    case 'basic':
      return `
ADAPTIVE RESPONSE MODE: BASIC
- Use simple, clear language
- Define terms before using them
- Provide concrete examples
- Break concepts into small steps
- Be extra patient and encouraging
- Avoid jargon and complex terminology`;
      
    case 'advanced':
      return `
ADAPTIVE RESPONSE MODE: ADVANCED
- Use more sophisticated language and analysis
- Assume familiarity with basic concepts
- Provide deeper insights and connections
- Discuss nuances and complexities
- Reference academic concepts naturally
- Challenge them with thought-provoking questions`;
      
    default:
      return `
ADAPTIVE RESPONSE MODE: INTERMEDIATE
- Balance clarity with depth
- Introduce new terminology with brief explanations
- Provide good examples alongside theory
- Assume some foundational knowledge`;
  }
}

// Detect if question is asking for a quiz
export function isQuizRequest(question: string): boolean {
  const lowerQuestion = question.toLowerCase();
  const quizIndicators = [
    'quiz me', 'test me', 'practice questions', 'questions about',
    'practice problems', 'can you quiz', 'give me questions',
    'test my knowledge', 'ask me questions'
  ];
  
  return quizIndicators.some(indicator => lowerQuestion.includes(indicator));
}

// Detect if asking for full practice exam
export function isPracticeExamRequest(question: string): boolean {
  const lowerQuestion = question.toLowerCase();
  const examIndicators = [
    'practice exam', 'practice test', 'full exam', 'mock exam',
    'give me an exam', 'simulate exam', 'exam simulation',
    'comprehensive test', 'full practice test'
  ];
  
  return examIndicators.some(indicator => lowerQuestion.includes(indicator));
}

// Extract topic from quiz request
export function extractQuizTopic(question: string, availableTopics: string[]): string | null {
  const lowerQuestion = question.toLowerCase();
  
  // Try to find topic in available topics list
  for (const topic of availableTopics) {
    if (lowerQuestion.includes(topic.toLowerCase())) {
      return topic;
    }
  }
  
  // Try common patterns
  const patterns = [
    /quiz me on (.*)/i,
    /test me on (.*)/i,
    /questions about (.*)/i,
    /practice (.*) questions/i
  ];
  
  for (const pattern of patterns) {
    const match = question.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
}

// Detect if student is expressing confusion
export function detectConfusion(question: string): boolean {
  const lowerQuestion = question.toLowerCase();
  const confusionIndicators = [
    "don't understand", "confused", "not sure", "struggling",
    "hard to grasp", "difficult", "lost", "unclear",
    "what does this mean", "makes no sense", "not getting"
  ];
  
  return confusionIndicators.some(indicator => lowerQuestion.includes(indicator));
}

// Detect if student is asking for study plan
export function isStudyPlanRequest(question: string): boolean {
  const lowerQuestion = question.toLowerCase();
  const studyPlanIndicators = [
    'study plan', 'study schedule', 'how should i study',
    'prepare for exam', 'help me study', 'study tips',
    'study strategy', 'plan for studying'
  ];
  
  return studyPlanIndicators.some(indicator => lowerQuestion.includes(indicator));
}

// Generate study plan based on exam date
export function generateStudyPlan(
  examName: string,
  examDate: string,
  topics: string[]
): string {
  const daysUntil = calculateDaysUntil(examDate);
  
  if (daysUntil < 0) {
    return `The exam (${examName}) has already passed on ${examDate}.`;
  }
  
  if (daysUntil === 0) {
    return `${examName} is TODAY! Focus on quick review of key concepts and get good rest.`;
  }
  
  if (daysUntil <= 2) {
    return `You have ${daysUntil} day${daysUntil > 1 ? 's' : ''} until ${examName}. Focus on:
- Quick review of all major topics
- Practice problems for weak areas
- Review your notes and key concepts
- Get good sleep before the exam`;
  }
  
  const topicsCount = topics.length || 1;
  const daysPerTopic = Math.floor(daysUntil * 0.7 / topicsCount); // 70% study, 30% review
  const reviewDays = Math.ceil(daysUntil * 0.3);
  
  let plan = `Here's a study plan for ${examName} (${daysUntil} days away):\n\n`;
  
  let currentDay = 1;
  topics.forEach((topic, index) => {
    const days = daysPerTopic || 1;
    const dayRange = days === 1 
      ? `Day ${currentDay}` 
      : `Days ${currentDay}-${currentDay + days - 1}`;
    
    plan += `${dayRange}: ${topic}\n`;
    plan += `  - Study time: ${days === 1 ? '2-3 hours' : `1-2 hours/day`}\n`;
    plan += `  - Focus on key concepts and examples\n\n`;
    
    currentDay += days;
  });
  
  if (reviewDays > 0) {
    plan += `Days ${currentDay}-${daysUntil}: Review and Practice\n`;
    plan += `  - Review all topics\n`;
    plan += `  - Take practice quizzes\n`;
    plan += `  - Focus on weak areas\n`;
    plan += `  - Get good rest before exam day\n`;
  }
  
  return plan;
}

// Extract topics mentioned in conversation
export function extractTopics(text: string, availableTopics: string[]): string[] {
  const mentionedTopics: string[] = [];
  const lowerText = text.toLowerCase();
  
  availableTopics.forEach(topic => {
    if (lowerText.includes(topic.toLowerCase())) {
      mentionedTopics.push(topic);
    }
  });
  
  return mentionedTopics;
}

// Detect if asking for assignment help
export function isAssignmentHelpRequest(question: string): boolean {
  const lowerQuestion = question.toLowerCase();
  const assignmentIndicators = [
    'help with', 'how do i', 'assignment', 'project',
    'homework', 'report', 'essay', 'paper'
  ];
  
  return assignmentIndicators.some(indicator => lowerQuestion.includes(indicator));
}

// Find specific assignment being asked about
export function findRelevantAssignment(
  question: string,
  assignments: Array<{ name: string; dueDate?: string; description?: string }>
): typeof assignments[0] | null {
  const lowerQuestion = question.toLowerCase();
  
  return assignments.find(assignment =>
    lowerQuestion.includes(assignment.name.toLowerCase())
  ) || null;
}

// Detect if asking for resource recommendations
export function isResourceRequest(question: string): boolean {
  const lowerQuestion = question.toLowerCase();
  const resourceIndicators = [
    'resources', 'videos', 'youtube', 'links', 'articles',
    'where can i learn', 'recommend', 'suggestions', 'materials',
    'study materials', 'helpful videos', 'good videos'
  ];
  
  return resourceIndicators.some(indicator => lowerQuestion.includes(indicator));
}

// Generate time-based memory context
export function generateMemoryContext(metadata?: {
  topicsCovered?: string[];
  strugglingWith?: string[];
  questionComplexityLevel?: 'basic' | 'intermediate' | 'advanced';
}): string {
  if (!metadata) return '';
  
  let memoryContext = '';
  
  if (metadata.topicsCovered && metadata.topicsCovered.length > 0) {
    memoryContext += `\n\n📝 CONVERSATION MEMORY:
Topics you've already covered: ${metadata.topicsCovered.join(', ')}
`;
  }
  
  if (metadata.strugglingWith && metadata.strugglingWith.length > 0) {
    memoryContext += `Topics you've struggled with before: ${metadata.strugglingWith.join(', ')}
- Reference these when relevant
- Offer to revisit if related to current topic
- Be extra patient with these areas
`;
  }
  
  if (metadata.questionComplexityLevel) {
    memoryContext += `Previous question complexity: ${metadata.questionComplexityLevel}
`;
  }
  
  return memoryContext;
}

// Generate practice exam prompt
export function generatePracticeExamInstructions(topics: string[], examName?: string): string {
  const topicsList = topics.join(', ');
  
  return `\n\n📝 PRACTICE EXAM MODE:
Generate a comprehensive practice exam${examName ? ` for ${examName}` : ''}.

Requirements:
- 20 questions total covering all major topics: ${topicsList}
- Mix of question types: multiple choice, short answer, and conceptual
- Number each question 1-20
- Cover topics evenly
- Include difficulty progression (easier → harder)
- Format naturally without fancy markdown

After presenting all questions, say:
"Take your time with these questions. When you're done, share your answers and I'll provide detailed feedback on each one!"

DO NOT provide answers yet - just the questions.`;
}


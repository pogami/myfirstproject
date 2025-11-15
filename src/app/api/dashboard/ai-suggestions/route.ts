import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

// Helper function to detect course type
function detectCourseType(courseCode: string, courseTitle: string, topics: string[]): 'STEM' | 'humanities' | 'mixed' {
  const stemKeywords = ['math', 'calculus', 'physics', 'chemistry', 'biology', 'engineering', 'computer', 'science', 'statistics', 'algebra', 'geometry'];
  const humanitiesKeywords = ['history', 'literature', 'english', 'writing', 'philosophy', 'sociology', 'psychology', 'art', 'music', 'theater'];
  
  const allText = `${courseCode} ${courseTitle} ${topics.join(' ')}`.toLowerCase();
  
  const stemMatches = stemKeywords.filter(kw => allText.includes(kw)).length;
  const humanitiesMatches = humanitiesKeywords.filter(kw => allText.includes(kw)).length;
  
  if (stemMatches > humanitiesMatches) return 'STEM';
  if (humanitiesMatches > stemMatches) return 'humanities';
  return 'mixed';
}

// Helper function to detect if course is exam-heavy
function isExamHeavy(courseData: any): boolean {
  const syllabusText = `${courseData.courseDescription || ''} ${courseData.instructor || ''}`.toLowerCase();
  const examKeywords = ['heavy on exams', 'exam-focused', 'multiple exams', 'midterm', 'final exam', 'test-heavy'];
  return examKeywords.some(kw => syllabusText.includes(kw)) || (courseData.exams?.length || 0) > 3;
}

// Helper function to get course difficulty score
function getCourseDifficulty(courseData: any): number {
  let score = 0;
  
  // Credit hours (more credits = harder)
  const credits = parseInt(courseData.creditHours || '3');
  score += credits;
  
  // Number of assignments
  score += (courseData.assignments?.length || 0) * 0.5;
  
  // Number of exams
  score += (courseData.exams?.length || 0) * 0.3;
  
  // Number of topics (more topics = more complex)
  score += (courseData.topics?.length || 0) * 0.1;
  
  return Math.min(score, 10); // Cap at 10
}

// Helper function to find topic progression
function findNextTopic(discussedTopics: string[], allTopics: string[]): string | null {
  if (allTopics.length === 0) return null;
  
  // If no topics discussed, return first topic
  if (discussedTopics.length === 0) return allTopics[0];
  
  // Find last discussed topic index
  const lastDiscussed = discussedTopics[discussedTopics.length - 1];
  const lastIndex = allTopics.findIndex(t => t.toLowerCase() === lastDiscussed.toLowerCase());
  
  // Return next topic if exists
  if (lastIndex >= 0 && lastIndex < allTopics.length - 1) {
    return allTopics[lastIndex + 1];
  }
  
  // If all topics discussed, return first undiscussed
  const undiscussed = allTopics.filter(t => !discussedTopics.some(dt => dt.toLowerCase() === t.toLowerCase()));
  return undiscussed[0] || null;
}

// Helper function to detect difficulty patterns (topics with multiple questions)
function findDifficultTopics(chat: any): string[] {
  const topicQuestionCount: Record<string, number> = {};
  const topics = chat.courseData?.topics || [];
  
  if (!chat.messages) return [];
  
  chat.messages.forEach((msg: any) => {
    if (msg.sender === 'user') {
      const msgText = (msg.text || msg.content || '').toLowerCase();
      topics.forEach((topic: string) => {
        if (msgText.includes(topic.toLowerCase())) {
          topicQuestionCount[topic] = (topicQuestionCount[topic] || 0) + 1;
        }
      });
    }
  });
  
  // Return topics with 3+ questions
  return Object.entries(topicQuestionCount)
    .filter(([_, count]) => count >= 3)
    .map(([topic, _]) => topic);
}

// Helper function to detect study time patterns
function detectStudyPattern(chat: any): { dayOfWeek?: string; timeOfDay?: string } {
  if (!chat.messages) return {};
  
  const userMessages = chat.messages.filter((m: any) => m.sender === 'user');
  if (userMessages.length < 3) return {};
  
  const dayCounts: Record<string, number> = {};
  const hourCounts: Record<string, number> = {};
  
  userMessages.forEach((msg: any) => {
    if (msg.timestamp) {
      const date = new Date(msg.timestamp);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = date.getHours();
      const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
      
      dayCounts[day] = (dayCounts[day] || 0) + 1;
      hourCounts[timeOfDay] = (hourCounts[timeOfDay] || 0) + 1;
    }
  });
  
  const mostActiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const mostActiveTime = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  
  return {
    dayOfWeek: mostActiveDay,
    timeOfDay: mostActiveTime
  };
}

// Helper function to group courses by clusters
function groupCoursesByCluster(classChats: any[]): Record<string, any[]> {
  const clusters: Record<string, any[]> = {
    'science': [],
    'math': [],
    'humanities': [],
    'other': []
  };
  
  classChats.forEach(chat => {
    const courseType = detectCourseType(
      chat.courseData?.courseCode || '',
      chat.title || '',
      chat.courseData?.topics || []
    );
    
    if (courseType === 'STEM') {
      const code = (chat.courseData?.courseCode || '').toLowerCase();
      if (code.includes('math') || code.includes('calc') || code.includes('stat')) {
        clusters.math.push(chat);
      } else {
        clusters.science.push(chat);
      }
    } else if (courseType === 'humanities') {
      clusters.humanities.push(chat);
    } else {
      clusters.other.push(chat);
    }
  });
  
  return clusters;
}

export async function POST(req: NextRequest) {
  try {
    const { chats, userId } = await req.json();

    if (!chats || typeof chats !== 'object') {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid chats data' 
      }, { status: 400 });
    }

    // Collect all course data and chat history
    const classChats = Object.values(chats).filter((chat: any) => chat.chatType === 'class');
    
    if (classChats.length === 0) {
      return NextResponse.json({
        success: true,
        courseCount: 0,
        suggestions: [{
          type: 'action',
          priority: 'high',
          title: 'Upload your first syllabus',
          description: 'Get personalized suggestions and track your assignments.',
          action: 'Upload Syllabus',
          actionUrl: '/'
        }]
      });
    }

    // COURSE LOAD AWARENESS
    const courseCount = classChats.length;
    const targetSuggestionCount = courseCount <= 2 ? 2 : courseCount <= 4 ? 3 : 4; // 2 courses = 2 suggestions, 3-4 = 3, 5+ = 4

    // Analyze all courses for suggestions
    const now = new Date();
    const suggestions: any[] = [];
    
    // Group courses by clusters
    const courseClusters = groupCoursesByCluster(classChats);
    
    // Calculate total workload
    const allAssignments: any[] = [];
    const allExams: any[] = [];
    classChats.forEach((chat: any) => {
      if (chat.courseData?.assignments) {
        chat.courseData.assignments.forEach((a: any) => {
          if (a.dueDate && a.dueDate !== 'null' && a.status !== 'Completed') {
            allAssignments.push({ ...a, chatId: chat.id, course: chat.courseData?.courseCode || chat.title });
          }
        });
      }
      if (chat.courseData?.exams) {
        chat.courseData.exams.forEach((e: any) => {
          if (e.date && e.date !== 'null') {
            allExams.push({ ...e, chatId: chat.id, course: chat.courseData?.courseCode || chat.title });
          }
        });
      }
    });

    // WORKLOAD BALANCING - Suggest order for multiple assignments
    const thisWeekAssignments = allAssignments.filter(a => {
      const dueDate = new Date(a.dueDate);
      const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil >= 0 && daysUntil <= 7;
    }).sort((a, b) => {
      const daysA = Math.ceil((new Date(a.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const daysB = Math.ceil((new Date(b.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysA - daysB;
    });

    if (thisWeekAssignments.length >= 3) {
      const topThree = thisWeekAssignments.slice(0, 3);
      suggestions.push({
        type: 'workload',
        priority: 'high',
        title: `${thisWeekAssignments.length} assignments due this week`,
        description: `Suggested order: ${topThree.map(a => a.name).join(', ')}. Start with the earliest deadline.`,
        action: 'View Assignments',
        actionUrl: `/dashboard/chat?tab=${topThree[0].chatId}`,
        course: 'Multiple courses'
      });
    }

    // 1. Find urgent assignments (due in next 3 days) - with course difficulty weighting
    const urgentAssignments: any[] = [];
    classChats.forEach((chat: any) => {
      const difficulty = getCourseDifficulty(chat.courseData || {});
      if (chat.courseData?.assignments) {
        chat.courseData.assignments.forEach((assignment: any) => {
          if (assignment.dueDate && assignment.dueDate !== 'null' && assignment.status !== 'Completed') {
            const dueDate = new Date(assignment.dueDate);
            const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntil >= 0 && daysUntil <= 3) {
              urgentAssignments.push({
                name: assignment.name,
                course: chat.courseData.courseCode || chat.title,
                daysUntil,
                chatId: chat.id,
                difficulty,
                instructor: chat.courseData?.instructor || chat.courseData?.instructorName
              });
            }
          }
        });
      }
    });

    if (urgentAssignments.length > 0) {
      // Sort by urgency and difficulty (harder courses first if same urgency)
      const mostUrgent = urgentAssignments.sort((a, b) => {
        if (a.daysUntil !== b.daysUntil) return a.daysUntil - b.daysUntil;
        return b.difficulty - a.difficulty;
      })[0];
      
      const daysText = mostUrgent.daysUntil === 0 ? 'today' : mostUrgent.daysUntil === 1 ? 'tomorrow' : `in ${mostUrgent.daysUntil} days`;
      const courseName = mostUrgent.instructor ? `${mostUrgent.instructor}'s ${mostUrgent.course}` : mostUrgent.course;
      
      suggestions.push({
        type: 'urgent',
        priority: 'high',
        title: `${mostUrgent.name}`,
        description: `Due ${daysText} for ${courseName}. This might be a good place to start.`,
        action: 'Open Chat',
        actionUrl: `/dashboard/chat?tab=${mostUrgent.chatId}&prefill=${encodeURIComponent(`Help me with ${mostUrgent.name}`)}`,
        course: mostUrgent.course
      });
    }

    // 2. Find upcoming exams (next 2 weeks) - with exam prep timeline
    const upcomingExams: any[] = [];
    classChats.forEach((chat: any) => {
      const isHeavyOnExams = isExamHeavy(chat.courseData || {});
      if (chat.courseData?.exams) {
        chat.courseData.exams.forEach((exam: any) => {
          if (exam.date && exam.date !== 'null') {
            const examDate = new Date(exam.date);
            const daysUntil = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntil >= 0 && daysUntil <= 14) {
              upcomingExams.push({
                name: exam.name || 'Exam',
                course: chat.courseData.courseCode || chat.title,
                daysUntil,
                chatId: chat.id,
                isHeavyOnExams,
                instructor: chat.courseData?.instructor || chat.courseData?.instructorName
              });
            }
          }
        });
      }
    });

    if (upcomingExams.length > 0) {
      const nextExam = upcomingExams.sort((a, b) => a.daysUntil - b.daysUntil)[0];
      const daysText = nextExam.daysUntil === 0 ? 'today' : nextExam.daysUntil === 1 ? 'tomorrow' : `in ${nextExam.daysUntil} days`;
      const courseName = nextExam.instructor ? `${nextExam.instructor}'s ${nextExam.course}` : nextExam.course;
      
      let description = `Coming up ${daysText}. Your syllabus has topics you can review to prepare.`;
      if (nextExam.daysUntil <= 7 && nextExam.isHeavyOnExams) {
        description = `Your ${courseName} exam is ${daysText}. This course is exam-heavy - start reviewing now.`;
      } else if (nextExam.daysUntil <= 7) {
        description = `Your ${courseName} exam is ${daysText} - here's a suggested study plan: review key topics from your syllabus.`;
      }
      
      suggestions.push({
        type: 'exam',
        priority: 'high',
        title: `${nextExam.course} ${nextExam.name}`,
        description: description,
        action: 'Open Chat',
        actionUrl: `/dashboard/chat?tab=${nextExam.chatId}&prefill=${encodeURIComponent(`Help me prepare for ${nextExam.name}`)}`,
        course: nextExam.course
      });
    }

    // 3. Analyze chat history for comprehensive patterns
    const chatSummaries: Array<{ 
      chatId: string; 
      course: string; 
      summary: string; 
      recentTopics: string[];
      studyPattern?: { dayOfWeek?: string; timeOfDay?: string };
      difficultTopics: string[];
      discussedTopics: string[];
      allTopics: string[];
      courseType: 'STEM' | 'humanities' | 'mixed';
      difficulty: number;
      creditHours: number;
    }> = [];
    
    classChats.forEach((chat: any) => {
      if (chat.messages && Array.isArray(chat.messages)) {
        const userMessages = chat.messages
          .filter((msg: any) => msg.sender === 'user')
          .slice(-15) // Increased to get more context
          .map((msg: any) => msg.text || msg.content || '');
        
        const botMessages = chat.messages
          .filter((msg: any) => msg.sender === 'bot' || msg.sender === 'assistant' || msg.sender === 'ai')
          .slice(-15)
          .map((msg: any) => msg.text || msg.content || '');
        
        const allMessages = [...userMessages, ...botMessages].join(' ').toLowerCase();
        const topics = chat.courseData?.topics || [];
        const mentionedTopics = topics.filter((topic: string) => 
          allMessages.includes(topic.toLowerCase())
        );
        
        // Track discussed topics in order
        const discussedTopics: string[] = [];
        topics.forEach((topic: string) => {
          if (allMessages.includes(topic.toLowerCase())) {
            discussedTopics.push(topic);
          }
        });
        
        // Extract key question patterns (what, how, why, explain, help, etc.)
        const questionPatterns = userMessages
          .join(' ')
          .toLowerCase()
          .match(/(what|how|why|explain|help|understand|difference|compare|define|calculate|solve)/g) || [];
        
        const studyPattern = detectStudyPattern(chat);
        const difficultTopics = findDifficultTopics(chat);
        const courseType = detectCourseType(
          chat.courseData?.courseCode || '',
          chat.title || '',
          topics
        );
        const difficulty = getCourseDifficulty(chat.courseData || {});
        const creditHours = parseInt(chat.courseData?.creditHours || '3');
        
        chatSummaries.push({
          chatId: chat.id,
          course: chat.courseData?.courseCode || chat.title,
          summary: userMessages.slice(-5).join(' | '), // More recent messages for better context
          recentTopics: mentionedTopics.slice(0, 5), // More topics
          studyPattern,
          difficultTopics,
          discussedTopics,
          allTopics: topics,
          courseType,
          difficulty,
          creditHours
        });
      }
    });

    // 4. TOPIC PROGRESSION - Suggest next logical topic (only if there's chat history)
    chatSummaries.forEach((summary) => {
      const nextTopic = findNextTopic(summary.discussedTopics, summary.allTopics);
      if (nextTopic && summary.discussedTopics.length > 0) { // Only show if they've discussed topics
        const chat = classChats.find((c: any) => c.id === summary.chatId);
        if (chat) {
          suggestions.push({
            type: 'progression',
            priority: 'medium',
            title: nextTopic,
            description: `You've covered ${summary.discussedTopics[summary.discussedTopics.length - 1]} - next up is ${nextTopic.toLowerCase()}.`,
            action: 'Open Chat',
            actionUrl: `/dashboard/chat?tab=${summary.chatId}&prefill=${encodeURIComponent(`Help me understand ${nextTopic}`)}`,
            course: summary.course
          });
        }
      }
    });

    // 5. DIFFICULTY PATTERNS - Topics with multiple questions
    chatSummaries.forEach((summary) => {
      if (summary.difficultTopics.length > 0) {
        const difficultTopic = summary.difficultTopics[0];
        suggestions.push({
          type: 'review',
          priority: 'medium',
          title: `Review ${difficultTopic}`,
          description: `You've asked multiple questions about ${difficultTopic.toLowerCase()}. A focused review might help.`,
          action: 'Open Chat',
          actionUrl: `/dashboard/chat?tab=${summary.chatId}&prefill=${encodeURIComponent(`Help me review ${difficultTopic}`)}`,
          course: summary.course
        });
      }
    });

    // 6. STUDY TIME PATTERNS - REMOVED per user request

    // 7. Generate AI-powered summaries based on chat activity
    if (chatSummaries.length > 0) {
      for (const chatSummary of chatSummaries.slice(0, 2)) { // Max 2 chat-based suggestions
        if (suggestions.length >= targetSuggestionCount) break;
        
        try {
          const chat = classChats.find((c: any) => c.id === chatSummary.chatId);
          if (!chat) continue;
          
          // Analyze chat messages to extract key focus areas
          const recentMessages = ((chat as any).messages || []).slice(-20); // Last 20 messages
          const userQuestions = recentMessages
            .filter((m: any) => m.sender === 'user')
            .map((m: any) => (m.text || m.content || '').substring(0, 200))
            .join('\n');
          
          // Extract key concepts/questions from user messages
          const questionKeywords = userQuestions
            .toLowerCase()
            .split(/\s+/)
            .filter((word: string) => word.length > 4)
            .slice(0, 10)
            .join(', ');

          const summaryPrompt = `Based on this student's chat activity in ${chatSummary.course}, identify specific topics or concepts they should focus on discussing with the AI tutor.

Recent student questions:
${userQuestions || 'No questions yet'}

Key concepts they're asking about: ${questionKeywords || 'none'}
Topics they've discussed: ${chatSummary.recentTopics.join(', ') || 'none'}
Areas they're struggling with: ${chatSummary.difficultTopics.join(', ') || 'none'}
All course topics: ${chatSummary.allTopics.slice(0, 10).join(', ') || 'none'}
Upcoming deadlines: ${urgentAssignments.filter(a => a.chatId === chatSummary.chatId).length} assignments, ${upcomingExams.filter(e => e.chatId === chatSummary.chatId).length} exams
Course type: ${chatSummary.courseType}
Course difficulty: ${chatSummary.difficulty}/10

Identify 2-3 specific topics or concepts from their course that they should focus on based on:
- What they've been asking about
- Topics they've discussed but might need more help with
- Related topics that naturally follow from their questions
- Topics they haven't covered yet but are coming up

DO NOT tell them to "start exploring" or "do work". Instead, simply identify the topics/concepts they should focus on.

Format your response as:
SUMMARY: [Brief 1-2 sentence summary of what topics/concepts to focus on based on their chat activity]
FOCUS POINTS:
- [specific topic or concept name]
- [specific topic or concept name]
- [specific topic or concept name if applicable]

Example format:
SUMMARY: Based on your questions about cell structure, focus on these related topics.
FOCUS POINTS:
- Cell membrane transport
- Organelle functions
- Cellular respiration

Be specific with topic/concept names from the course.`;

          const { provideStudyAssistanceWithFallback } = await import('@/ai/services/dual-ai-service');
          
          const aiResult = await provideStudyAssistanceWithFallback({
            question: summaryPrompt,
            context: `Chat summary for ${chatSummary.course}`,
            conversationHistory: [],
            isSearchRequest: false
          });

          let fullResponse = aiResult.answer?.trim() || '';
          
          // Parse the response to extract summary and focus points
          let description = '';
          const focusPoints: string[] = [];
          
          if (fullResponse.includes('SUMMARY:')) {
            const summaryMatch = fullResponse.match(/SUMMARY:\s*([\s\S]+?)(?=FOCUS POINTS:|$)/);
            if (summaryMatch) {
              description = summaryMatch[1].trim();
            }
            
            const focusMatch = fullResponse.match(/FOCUS POINTS:\s*([\s\S]+)/);
            if (focusMatch) {
              const pointsText = focusMatch[1];
              const points = pointsText
                .split('\n')
                .map(p => p.replace(/^[-•]\s*/, '').trim())
                .filter(p => p.length > 0);
              focusPoints.push(...points);
            }
          } else {
            // Fallback: use the whole response as description
            description = fullResponse;
            
            // Try to extract bullet points from the response
            const bulletMatches = fullResponse.match(/[-•]\s*(.+)/g);
            if (bulletMatches) {
              focusPoints.push(...bulletMatches.map(m => m.replace(/^[-•]\s*/, '').trim()));
            }
          }
          
          // Clean up description
          if (description.length > 200) {
            const sentences = description.split(/[.!?]/).filter(s => s.trim().length > 0);
            if (sentences.length >= 2) {
              description = sentences.slice(0, 2).join('. ').trim() + '.';
            } else if (sentences.length === 1) {
              description = sentences[0].trim() + '.';
            }
            if (description.length > 200) {
              const truncated = description.substring(0, 197);
              const lastSpace = truncated.lastIndexOf(' ');
              description = truncated.substring(0, lastSpace) + '...';
            }
          }
          
          if (description && description.length > 20) {
            // Use first focus point as prefill, or first topic mentioned in description
            let prefillText = '';
            if (focusPoints.length > 0) {
              prefillText = `Help me understand ${focusPoints[0]}`;
            } else {
              // Extract topic from description
              const topicMatch = description.match(/(?:focus on|discuss|about)\s+([^.,]+)/i);
              if (topicMatch) {
                prefillText = `Help me understand ${topicMatch[1].trim()}`;
              } else {
                prefillText = description.split(/[.!?]/)[0]?.trim() || description.substring(0, 50).trim();
              }
            }
            
            // Get undiscussed topics for this course
            const undiscussedTopics = chatSummary.allTopics.filter((topic: string) => 
              !chatSummary.discussedTopics.some((dt: string) => dt.toLowerCase() === topic.toLowerCase())
            ).slice(0, 5); // Limit to 5 topics
            
            suggestions.push({
              type: 'ai-recommendation',
              priority: 'medium',
              title: chatSummary.course,
              description: description,
              action: 'Open Chat',
              actionUrl: `/dashboard/chat?tab=${chatSummary.chatId}&prefill=${encodeURIComponent(prefillText)}`,
              course: chatSummary.course,
              focusPoints: focusPoints.slice(0, 3), // Limit to 3 bullet points
              undiscussedTopics: undiscussedTopics // Add undiscussed topics
            });
          }
        } catch (error) {
          console.error('Chat summary generation failed:', error);
          // Continue without this suggestion
        }
      }
    }

    // 8. CROSS-COURSE CONNECTIONS (Course Clusters)
    Object.entries(courseClusters).forEach(([cluster, courses]) => {
      if (courses.length >= 2 && cluster !== 'other') {
        const course1 = courses[0];
        const course2 = courses[1];
        const topics1 = course1.courseData?.topics || [];
        const topics2 = course2.courseData?.topics || [];
        
        // Find overlapping topics
        const overlapping = topics1.filter((t1: string) => 
          topics2.some((t2: string) => t1.toLowerCase().includes(t2.toLowerCase()) || t2.toLowerCase().includes(t1.toLowerCase()))
        );
        
        if (overlapping.length > 0) {
          const connectionTopic = overlapping[0];
          suggestions.push({
            type: 'connection',
            priority: 'medium',
            title: `${course1.courseData?.courseCode || course1.title} ↔ ${course2.courseData?.courseCode || course2.title}`,
            description: `The topic "${connectionTopic}" appears in both courses. Understanding it in one will help with the other.`,
            action: 'Open Chat',
            actionUrl: `/dashboard/chat?tab=${course1.id}&prefill=${encodeURIComponent(`How does ${connectionTopic} connect to ${course2.courseData?.courseCode || course2.title}?`)}`,
            course: 'Multiple courses'
          });
        }
      }
    });

    // 8. ENERGY MANAGEMENT - Suggest lighter topics when heavy workload
    const totalWorkload = thisWeekAssignments.length + upcomingExams.filter(e => e.daysUntil <= 7).length;
    if (totalWorkload >= 4) {
      // Heavy workload - suggest lighter review topics
      chatSummaries.forEach((summary) => {
        if (summary.courseType === 'humanities' || summary.difficulty < 5) {
          const lightTopic = summary.allTopics.find(t => !summary.discussedTopics.includes(t));
          if (lightTopic) {
            suggestions.push({
              type: 'energy',
              priority: 'low',
              title: `Light review: ${lightTopic}`,
              description: `With a heavy workload this week, this lighter topic from ${summary.course} might be a good break.`,
              action: 'Open Chat',
              actionUrl: `/dashboard/chat?tab=${summary.chatId}&prefill=${encodeURIComponent(`Explain ${lightTopic}`)}`,
              course: summary.course
            });
          }
        }
      });
    }

    // 9. UPCOMING TOPICS - Suggest topics before they're covered (if we have schedule info)
    // This would require syllabus schedule data - for now, suggest first undiscussed topic

    // 10. ASSIGNMENT DEPENDENCIES - Connect assignments to previous topics
    classChats.forEach((chat: any) => {
      if (chat.courseData?.assignments) {
        chat.courseData.assignments.forEach((assignment: any) => {
          if (assignment.dueDate && assignment.dueDate !== 'null' && assignment.status !== 'Completed') {
            const dueDate = new Date(assignment.dueDate);
            const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysUntil > 3 && daysUntil <= 14) {
              // Find topics discussed recently that might relate
              const summary = chatSummaries.find(s => s.chatId === chat.id);
              if (summary && summary.recentTopics.length > 0) {
                const relatedTopic = summary.recentTopics[0];
                suggestions.push({
                  type: 'dependency',
                  priority: 'medium',
                  title: assignment.name,
                  description: `This assignment builds on ${relatedTopic.toLowerCase()}, which you asked about recently.`,
                  action: 'Open Chat',
                  actionUrl: `/dashboard/chat?tab=${chat.id}&prefill=${encodeURIComponent(`Help me with ${assignment.name} - it relates to ${relatedTopic}`)}`,
                  course: chat.courseData?.courseCode || chat.title
                });
              }
            }
          }
        });
      }
    });

    // 11. Generate AI-powered summaries for topics (prioritize this over basic fallback)
    const undiscussedTopics = new Set<string>();
    classChats.forEach((chat: any) => {
      const summary = chatSummaries.find(s => s.chatId === chat.id);
      if (summary) {
        summary.allTopics.forEach(topic => {
          if (!summary.discussedTopics.some(dt => dt.toLowerCase() === topic.toLowerCase())) {
            undiscussedTopics.add(topic);
          }
        });
      } else {
        // If no chat history, still add topics from syllabus
        (chat.courseData?.topics || []).forEach((topic: string) => {
          if (topic) undiscussedTopics.add(topic);
        });
      }
    });

    // Generate AI summaries for topics - always try to make them interesting
    if (undiscussedTopics.size > 0 && suggestions.length < targetSuggestionCount) {
      const topicsArray = Array.from(undiscussedTopics).slice(0, Math.min(3, targetSuggestionCount - suggestions.length));
      
      for (const topic of topicsArray) {
        if (suggestions.length >= targetSuggestionCount) break;
        
        // Find the course this topic belongs to
        const topicChat = classChats.find((chat: any) => 
          (chat.courseData?.topics || []).some((t: string) => t.toLowerCase() === topic.toLowerCase())
        ) as any;
        
        if (!topicChat || !topicChat.id) continue;
        
        const summary = chatSummaries.find(s => s.chatId === topicChat.id);
        const courseType = summary?.courseType || detectCourseType(
          topicChat.courseData?.courseCode || '',
          topicChat.title || '',
          topicChat.courseData?.topics || []
        );
        
        try {
          const topicSummaryPrompt = `Based on this student's course syllabus, provide a brief, natural summary (2-3 sentences, max 200 chars) about why they might want to explore "${topic}". 

Course: ${topicChat.courseData?.courseCode || topicChat.title || 'Unknown'}
Course type: ${courseType}
${summary ? `Recent chat topics: ${summary.recentTopics.join(', ') || 'none'}` : 'No chat history yet'}
Other syllabus topics: ${(topicChat.courseData?.topics || []).slice(0, 5).join(', ')}

Be conversational, engaging, and specific. Don't say "it's the first topic" - instead explain why it's interesting or important. Make it sound natural and helpful. Write complete sentences that won't be cut off.`;

          const { provideStudyAssistanceWithFallback } = await import('@/ai/services/dual-ai-service');
          const aiResult = await provideStudyAssistanceWithFallback({
            question: topicSummaryPrompt,
            context: `Topic suggestion for ${topicChat.courseData?.courseCode || topicChat.title || 'Unknown'}`,
            conversationHistory: [],
            isSearchRequest: false
          });

          let description = aiResult.answer?.trim() || '';
          
          // Allow longer descriptions (up to 200 chars) but ensure complete sentences
          if (description.length > 200) {
            const sentences = description.split(/[.!?]/).filter(s => s.trim().length > 0);
            // Take first 2 complete sentences if available
            if (sentences.length >= 2) {
              description = sentences.slice(0, 2).join('. ').trim() + '.';
            } else if (sentences.length === 1) {
              description = sentences[0].trim() + '.';
            }
            // If still too long, truncate at word boundary
            if (description.length > 200) {
              const truncated = description.substring(0, 197);
              const lastSpace = truncated.lastIndexOf(' ');
              description = truncated.substring(0, lastSpace) + '...';
            }
          }
          
          // Better fallback that's not generic
          if (!description || description.length < 20) {
            if (courseType === 'STEM') {
              description = `Understanding ${topic.toLowerCase()} builds the foundation for more advanced concepts in this course.`;
            } else if (courseType === 'humanities') {
              description = `${topic} is a key concept that will help you engage with the course material more deeply.`;
            } else {
              description = `Exploring ${topic.toLowerCase()} will help you get started with this course.`;
            }
          }
          
          suggestions.push({
            type: 'study',
            priority: 'medium',
            title: topic,
            description: description,
            action: 'Open Chat',
            actionUrl: `/dashboard/chat?tab=${topicChat.id}&prefill=${encodeURIComponent(`Help me understand ${topic}`)}`,
            course: topicChat.courseData?.courseCode || topicChat.title || 'Unknown'
          });
        } catch (error) {
          // Better fallback
          const fallbackDesc = courseType === 'STEM' 
            ? `Understanding ${topic.toLowerCase()} builds the foundation for more advanced concepts.`
            : `${topic} is a key concept that will help you engage with the course material.`;
          
          suggestions.push({
            type: 'study',
            priority: 'medium',
            title: topic,
            description: fallbackDesc,
            action: 'Open Chat',
            actionUrl: `/dashboard/chat?tab=${topicChat.id}&prefill=${encodeURIComponent(`Help me understand ${topic}`)}`,
            course: topicChat.courseData?.courseCode || topicChat.title || 'Unknown'
          });
        }
      }
    }

    // 12. Default suggestion if no items
    if (suggestions.length === 0) {
      const firstChat = classChats[0] as any;
      if (firstChat) {
        suggestions.push({
          type: 'general',
          priority: 'low',
          title: 'Your courses',
          description: 'Everything looks on track. You can review your materials or ask questions anytime.',
          action: 'Open Chat',
          actionUrl: `/dashboard/chat?tab=${firstChat.id}`
        });
      }
    }

    // Sort and limit suggestions based on course load
    const topSuggestions = suggestions
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
      })
      .slice(0, targetSuggestionCount);

    // Add course count context to response
    return NextResponse.json({
      success: true,
      courseCount: courseCount,
      courseLoadContext: courseCount <= 2 ? 'light' : courseCount <= 4 ? 'moderate' : 'heavy',
      suggestions: topSuggestions
    });

  } catch (error: any) {
    console.error('Error generating AI suggestions:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate suggestions'
    }, { status: 500 });
  }
}

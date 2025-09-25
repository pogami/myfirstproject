import { NextRequest, NextResponse } from 'next/server';
import { provideStudyAssistance } from '@/ai/services/dual-ai-service';

export async function POST(request: NextRequest) {
  try {
    const { courses, preferences, currentDate } = await request.json();
    
    if (!courses || courses.length === 0) {
      return NextResponse.json({ error: 'No courses provided' }, { status: 400 });
    }

    // Create AI prompt for schedule generation
    const prompt = `You are an AI study schedule generator. Create a personalized study schedule based on the following information:

COURSES:
${courses.map((course: any) => `
- ${course.name} (${course.code})
  Credits: ${course.credits}
  Difficulty: ${course.difficulty}
  Weekly Workload: ${course.workload} hours
  Assignments: ${course.assignments?.length || 0}
  Exams: ${course.exams?.length || 0}
`).join('')}

STUDY PREFERENCES:
- Preferred Study Times: ${preferences.preferredStudyTimes.join(', ')}
- Break Duration: ${preferences.breakDuration} minutes
- Max Session Length: ${preferences.maxSessionLength} minutes
- Study Days: ${preferences.studyDays.join(', ')}

CURRENT DATE: ${currentDate}

Please generate a comprehensive study schedule that:
1. Analyzes course workload and difficulty
2. Prioritizes assignments and exams by due dates
3. Optimizes study times based on user preferences
4. Includes realistic study sessions with breaks
5. Balances workload across study days
6. Provides specific study topics and locations

Return the response as a JSON object with this structure:
{
  "name": "Generated Schedule Name",
  "courses": [...],
  "sessions": [
    {
      "id": "unique-id",
      "course": "Course Name",
      "topic": "Study Topic",
      "duration": 90,
      "priority": "high|medium|low",
      "deadline": "2024-01-15",
      "completed": false,
      "scheduledTime": "2024-01-14T09:00:00",
      "location": "Study Location",
      "notes": "Study Notes"
    }
  ],
  "preferences": {...},
  "generatedAt": "2024-01-10T10:00:00Z"
}`;

    // Call AI service
    const aiResponse = await provideStudyAssistance({
      message: prompt,
      context: 'study-schedule-generation',
      subject: 'General',
      difficulty: 'intermediate'
    });

    // Parse AI response and extract JSON
    let scheduleData;
    try {
      // Try to extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scheduleData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      // Fallback: create a basic schedule structure
      const now = new Date();
      const sessions = [];
      
      courses.forEach((course: any, courseIndex: number) => {
        course.assignments?.forEach((assignment: any, assignmentIndex: number) => {
          const dueDate = new Date(assignment.dueDate);
          const studyDate = new Date(dueDate);
          studyDate.setDate(studyDate.getDate() - 1); // Study day before due date
          
          sessions.push({
            id: `session-${courseIndex}-${assignmentIndex}`,
            course: course.name,
            topic: assignment.title,
            duration: Math.min(assignment.estimatedHours * 60, preferences.maxSessionLength),
            priority: dueDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'high' : 'medium',
            deadline: assignment.dueDate,
            completed: false,
            scheduledTime: studyDate.toISOString(),
            location: 'Library',
            notes: `Focus on ${assignment.title} for ${course.name}`
          });
        });
      });

      scheduleData = {
        name: `Study Schedule - ${now.toLocaleDateString()}`,
        courses,
        sessions,
        preferences,
        generatedAt: now.toISOString()
      };
    }

    return NextResponse.json({ schedule: scheduleData });
  } catch (error) {
    console.error('Error generating study schedule:', error);
    return NextResponse.json({ error: 'Failed to generate study schedule' }, { status: 500 });
  }
}

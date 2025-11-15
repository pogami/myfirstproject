import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { chatId, chatTitle, messages, courseData, chatType } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No messages to summarize'
      }, { status: 400 });
    }

    // Limit message length to avoid token limits
    const maxMessages = 100;
    const messageText = typeof messages === 'string' 
      ? messages.substring(0, 10000) // Limit to 10k chars if it's a string
      : Array.isArray(messages)
      ? messages.slice(-maxMessages).join('\n\n')
      : '';

    // Build context for the summary
    const courseContext = courseData 
      ? `Course: ${courseData.courseCode || courseData.courseName || chatTitle}
Topics: ${(courseData.topics || []).slice(0, 10).join(', ')}
Assignments: ${(courseData.assignments || []).length} assignments
Exams: ${(courseData.exams || []).length} exams`
      : '';

    const summaryPrompt = `Provide a concise overall summary (2-4 sentences) of this chat conversation. Focus on the main points discussed and what the student has been working on.

${courseContext ? `\nContext:\n${courseContext}\n` : ''}

Chat conversation:
${messageText}

Write a natural, conversational summary that captures the essence of the conversation. Be specific about topics, questions, or concepts discussed. Keep it brief but informative.`;

    // Use the existing AI service
    const { provideStudyAssistanceWithFallback } = await import('@/ai/services/dual-ai-service');
    
    const aiResult = await provideStudyAssistanceWithFallback({
      question: summaryPrompt,
      context: `Chat summary for ${chatTitle || chatId}`,
      conversationHistory: [],
      isSearchRequest: false
    });

    const summary = aiResult.answer || 'Unable to generate summary.';

    return NextResponse.json({
      success: true,
      summary: summary
    });

  } catch (error: any) {
    console.error('Error generating chat summary:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate summary'
    }, { status: 500 });
  }
}


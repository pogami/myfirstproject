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

    // Log message info for debugging
    const messageLength = typeof messages === 'string' ? messages.length : (Array.isArray(messages) ? messages.length : 0);
    console.log(`📝 Summary request for chat: ${chatId}, Message type: ${typeof messages}, Length: ${messageLength}`);

    // Limit message length to avoid token limits, but allow more content
    const maxMessages = 200; // Increased from 100
    const maxChars = 50000; // Increased from 10k to 50k to handle longer conversations
    
    let messageText: string;
    if (typeof messages === 'string') {
      // For strings, take the last portion if too long (most recent messages are most relevant)
      if (messages.length > maxChars) {
        messageText = messages.slice(-maxChars);
        console.log(`⚠️ Message text truncated from ${messages.length} to ${maxChars} characters`);
      } else {
        messageText = messages;
      }
    } else if (Array.isArray(messages)) {
      messageText = messages.slice(-maxMessages).join('\n\n');
    } else {
      messageText = '';
    }

    // Build context for the summary
    const courseContext = courseData 
      ? `Course: ${courseData.courseCode || courseData.courseName || chatTitle}
Topics: ${(courseData.topics || []).slice(0, 10).join(', ')}
Assignments: ${(courseData.assignments || []).length} assignments
Exams: ${(courseData.exams || []).length} exams`
      : '';

    // Concise summary prompt that captures essence without being verbose
    const summaryPrompt = `Provide a concise, high-level summary of this chat conversation. The summary should:

1. Capture the MAIN topics and themes discussed (not every single message)
2. Group related discussions together rather than listing them chronologically
3. Be 3-6 sentences maximum - focus on the big picture
4. Highlight the most significant or interesting discussions
5. Skip minor details, brief exchanges, and repetitive content
6. Write in a natural, flowing style - not a play-by-play

${courseContext ? `\nContext:\n${courseContext}\n` : ''}

Chat conversation:
${messageText}

Write a concise summary that captures the essence of the conversation. Focus on the main topics and themes, not every detail. Keep it brief and high-level.`;

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
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate summary'
    }, { status: 500 });
  }
}


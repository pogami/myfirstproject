import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { 
      chatMessages, 
      courseData, 
      options = {} 
    } = await request.json();
    
    if (!chatMessages || !Array.isArray(chatMessages)) {
      return NextResponse.json({ error: 'Chat messages are required' }, { status: 400 });
    }

    // Filter out system messages and file uploads, keep only user questions and AI responses
    const relevantMessages = chatMessages
      .filter((msg: any) => 
        msg.sender === 'user' || msg.sender === 'bot' || msg.sender === 'assistant'
      )
      .map((msg: any) => ({
        role: msg.sender === 'bot' || msg.sender === 'assistant' ? 'assistant' : 'user',
        content: typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)
      }));

    if (relevantMessages.length === 0) {
      return NextResponse.json({ 
        error: 'No relevant messages found in chat history' 
      }, { status: 400 });
    }

    // Build course context
    let courseContext = '';
    if (courseData) {
      const { courseName, courseCode, topics, assignments, exams } = courseData;
      courseContext = `\n\nCOURSE CONTEXT:
Course: ${courseName}${courseCode ? ` (${courseCode})` : ''}
${topics && topics.length > 0 ? `Topics: ${topics.join(', ')}` : ''}
${assignments && assignments.length > 0 ? `Assignments: ${assignments.map((a: any) => a.name).join(', ')}` : ''}
${exams && exams.length > 0 ? `Exams: ${exams.map((e: any) => e.name).join(', ')}` : ''}`;
    }

    // Build the prompt for note generation
    const conversationText = relevantMessages
      .map((msg: any) => `${msg.role === 'assistant' ? 'AI' : 'Student'}: ${msg.content}`)
      .join('\n\n');

    const prompt = `You are an AI study assistant helping to generate comprehensive study notes from a student's chat conversation with an AI tutor.

${courseContext}

CHAT CONVERSATION:
${conversationText}

TASK: Generate well-organized, comprehensive study notes from this conversation. The notes should:

1. **Extract Key Information**: Pull out all important concepts, definitions, explanations, and insights from the conversation
2. **Organize by Topic**: Group related information together logically
3. **Fill Gaps**: Based on the course topics provided, identify what topics were discussed and suggest what might be missing
4. **Structure Clearly**: Use clear headings, bullet points, and sections
5. **Be Comprehensive**: Include all important details from the conversation
${options.createStudyGuide ? '6. **Create Study Guide Format**: Format as a study guide with key points, summaries, and review questions' : ''}

OUTPUT FORMAT:
- Use clear section headings (## for main sections, ### for subsections)
- Use bullet points for key points
- Include definitions and explanations
- Add examples where mentioned
- Note any formulas, equations, or important facts
- Include any study tips or strategies mentioned
${options.createStudyGuide ? '- End with review questions or practice problems' : ''}

Generate the notes now:`;

    // Call OpenAI to generate notes
    let generatedNotes = '';
    try {
      if (process.env.OPENAI_API_KEY) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an expert at creating study notes and organizing information. You help students by extracting key information from conversations and structuring it into comprehensive, easy-to-review notes.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 2000,
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        generatedNotes = data.choices?.[0]?.message?.content || 'No notes generated';
      } else {
        // Fallback: Simple extraction
        generatedNotes = `# Study Notes from Chat Conversation\n\n## Key Topics Discussed\n\n${relevantMessages
          .filter((msg: any) => msg.role === 'assistant')
          .map((msg: any, idx: number) => `### Point ${idx + 1}\n${msg.content.substring(0, 200)}...`)
          .join('\n\n')}\n\n## Summary\n\nThis conversation covered various topics. Review the chat history above for detailed information.`;
      }
    } catch (error: any) {
      console.error('Error generating notes:', error);
      // Return a basic structure if AI fails
      generatedNotes = `# Study Notes from Chat Conversation\n\n## Conversation Summary\n\n${relevantMessages
        .filter((msg: any) => msg.role === 'assistant')
        .slice(0, 5)
        .map((msg: any, idx: number) => `**Key Point ${idx + 1}:**\n${msg.content.substring(0, 300)}...`)
        .join('\n\n')}`;
    }

    // Extract topics mentioned
    const topicsMentioned = courseData?.topics?.filter((topic: string) => 
      conversationText.toLowerCase().includes(topic.toLowerCase())
    ) || [];

    // Identify gaps (topics in course but not discussed)
    const topicsNotDiscussed = courseData?.topics?.filter((topic: string) => 
      !conversationText.toLowerCase().includes(topic.toLowerCase())
    ) || [];

    return NextResponse.json({
      success: true,
      notes: generatedNotes,
      metadata: {
        topicsMentioned,
        topicsNotDiscussed,
        messageCount: relevantMessages.length,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error: any) {
    console.error('Generate notes from chat error:', error);
    
    return NextResponse.json({
      error: 'Failed to generate notes from chat',
      details: error.message 
    }, { status: 500 });
  }
}


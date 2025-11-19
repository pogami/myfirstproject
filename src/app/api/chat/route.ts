import { NextRequest, NextResponse } from 'next/server';
import { provideStudyAssistanceWithFallback } from '@/ai/services/dual-ai-service';
import { filterContent, generateFilterResponse } from '@/lib/content-filter';
import { createAIResponseNotification } from '@/lib/notifications/server';

export const runtime = 'nodejs';

// SearchResult interface for sources
interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

// Removed Ollama - now using Gemini + OpenAI fallback

export async function POST(request: NextRequest) {
  try {
    const {
      question,
      context,
      conversationHistory,
      shouldCallAI = true,
      isPublicChat = false,
      hasAIMention = false,
      allSyllabi,
      userId,
      chatId,
      chatTitle,
      isSearchRequest = false
    } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // If it's a public chat and AI shouldn't be called, return no response
    if (isPublicChat && !shouldCallAI) {
      return NextResponse.json({
        success: true,
        answer: null, // No AI response
        shouldRespond: false
      });
    }

    // Clean @ mentions from the question if present
    const cleanedQuestion = question.replace(/@ai\s*/gi, '').trim();
    const lowerQuestion = cleanedQuestion.toLowerCase();

    // Check if it's a general academic question (not CourseConnect support)
    const isGeneralQuestion = /^(what is|how do|explain|solve|calculate|define|tell me about|help me with).*(math|science|homework|biology|chemistry|physics|history|english|literature|essay|assignment|quiz|test|exam)/i.test(cleanedQuestion);

    if (isGeneralQuestion && !isSearchRequest) {
      return NextResponse.json({
        success: true,
        answer: "I'm CourseConnect's support assistant. I can only help with questions about our platform. For academic help, try our AI tutoring features! Please sign up here: [Get Started](https://courseconnectai.com/dashboard)",
        provider: 'support-filter',
        shouldRespond: true,
        timestamp: new Date().toISOString(),
        sources: [],
        crisisResources: []
      });
    }

    // Content filtering for safety
    const filterResult = filterContent(cleanedQuestion);
    if (!filterResult.isSafe) {
      console.log(`Content filtered: ${filterResult.category} (confidence: ${filterResult.confidence})`);
      return NextResponse.json({
        success: true,
        answer: generateFilterResponse(filterResult),
        provider: 'safety-filter',
        shouldRespond: true,
        timestamp: new Date().toISOString(),
        sources: [],
        crisisResources: filterResult.crisisResources
      });
    }

    // Detect math/physics style questions to force direct solving behavior
    const isMathQuestion = /(?:\\int|\\sum|\\frac|∫|√|=|≥|≤|≠|≈|\^|\bx\b|\by\b|\bdx\b|\bdy\b|\bsolve\b|\bequation\b|\bderivative\b|\bintegral\b|\bfactor\b|\bquadratic\b|\bpolynomial\b|\bsimplify\b|\bmatrix\b|\blimit\b|\btheta\b|\bsin\b|\bcos\b|\btan\b)/i.test(cleanedQuestion);

    console.log('Chat API called with:', {
      question: cleanedQuestion,
      context,
      conversationHistory: conversationHistory?.length || 0,
      shouldCallAI,
      isPublicChat,
      hasAIMention,
      timestamp: new Date().toISOString()
    });

    // Check if we need current information and search for it
    let sources: SearchResult[] = []; // Will be populated by AI service if search is performed
    const questionLower = cleanedQuestion.toLowerCase();
    const needsCurrentInfo = questionLower.includes('news') ||
      questionLower.includes('current') ||
      questionLower.includes('today') ||
      questionLower.includes('recent') ||
      questionLower.includes('trump') ||
      questionLower.includes('tylenol') ||
      questionLower.includes('politics') ||
      questionLower.includes('2025') ||
      questionLower.includes('what is') ||
      questionLower.includes('who is') ||
      questionLower.includes('when did') ||
      questionLower.includes('where is') ||
      questionLower.includes('how does') ||
      questionLower.includes('capital') ||
      questionLower.includes('president') ||
      questionLower.includes('country') ||
      questionLower.includes('history');

    // AI service will handle search when isSearchRequest is true

    // Build natural, human-like prompt with file information
    const convoContext = conversationHistory?.length > 0
      ? `\n\nPrevious chat:\n${conversationHistory.map((msg: any) => {
        let content = msg.content || '';
        // Add file information if present
        if (msg.files && msg.files.length > 0) {
          const fileInfo = msg.files.map((f: any) => `${f.name} (${f.type})`).join(', ');
          content += ` [Attached files: ${fileInfo}]`;
        } else if (msg.file) {
          content += ` [Attached file: ${msg.file.name} (${msg.file.type})]`;
        }
        return `${msg.role === 'assistant' ? 'AI' : 'User'}: ${content}`;
      }).join('\n')}\n\n`
      : '';

    // Build syllabi context if available (General Chat with all courses)
    let syllabiContext = '';
    if (allSyllabi && allSyllabi.length > 0) {
      syllabiContext = `\n\nYou have access to ALL of the student's course syllabi (see details below). You must use these when answering any questions about those courses.\n\n`;
      allSyllabi.forEach((syllabus: any, index: number) => {
        console.log(`Processing syllabus ${index + 1}:`, {
          hasText: !!syllabus.syllabusText,
          textLength: syllabus.syllabusText?.length
        });
        syllabiContext += `📚 Course ${index + 1}: ${syllabus.courseName || 'Unknown'}${syllabus.courseCode ? ` (${syllabus.courseCode})` : ''}\n`;
        if (syllabus.fileName) syllabiContext += `   Source File: ${syllabus.fileName} (Uploaded: ${syllabus.uploadDate || 'Unknown Date'})\n`;
        if (syllabus.professor) syllabiContext += `   Professor: ${syllabus.professor}\n`;
        if (syllabus.classTime) syllabiContext += `   Class Time: ${syllabus.classTime}\n`;
        if (syllabus.description) syllabiContext += `   Description: ${syllabus.description}\n`;
        if (syllabus.topics && syllabus.topics.length > 0) {
          syllabiContext += `   Topics: ${syllabus.topics.slice(0, 5).join(', ')}${syllabus.topics.length > 5 ? '...' : ''}\n`;
        }
        if (syllabus.exams && syllabus.exams.length > 0) {
          syllabiContext += `   Exams: ${syllabus.exams.map((e: any) => e.name).join(', ')}\n`;
        }
        if (syllabus.assignments && syllabus.assignments.length > 0) {
          syllabiContext += `   Assignments: ${syllabus.assignments.length} total\n`;
        }
        if (syllabus.syllabusText) {
          syllabiContext += `   Raw Syllabus Excerpt: ${syllabus.syllabusText.substring(0, 4000)}...\n`;
        }
        syllabiContext += '\n';
      });
      syllabiContext += `\nYou can help with ANY of these courses! The student can ask about any topic, assignment, or exam from any of their classes.\n\n`;
      syllabiContext += `IMPORTANT: When answering, if you find information in a specific syllabus, please cite it like this:\n`;
      syllabiContext += `Source: [Source File Name] (Uploaded: [Date])\n`;
      syllabiContext += `Example: "According to your syllabus..." -> "According to Week 2 Lecture Notes (Uploaded: 9/9/2025)..."\n`;
      syllabiContext += `If the text mentions a page number, include it like "Syllabus • Page 4".\n\n`;
    }

    // Direct-response helpers using syllabus data
    const formatCourseSummary = (course: any) => {
      const parts = [];
      if (course.courseName) {
        parts.push(course.courseName + (course.courseCode ? ` (${course.courseCode})` : ''));
      } else if (course.courseCode) {
        parts.push(course.courseCode);
      } else {
        parts.push('Unnamed Course');
      }
      if (course.professor) {
        parts.push(`Professor: ${course.professor}`);
      }
      if (course.classTime) {
        parts.push(`Class Time: ${course.classTime}`);
      }
      if (course.university) {
        parts.push(`University: ${course.university}`);
      }
      return parts.join(' — ');
    };

    const findCourseMatch = (text: string) => {
      if (!allSyllabi || allSyllabi.length === 0) return null;
      return allSyllabi.find((course: any) => {
        const nameMatch = course.courseName && text.includes(course.courseName.toLowerCase());
        const codeMatch = course.courseCode && text.includes(course.courseCode.toLowerCase());
        return nameMatch || codeMatch;
      });
    };

    if (allSyllabi && allSyllabi.length > 0) {
      const wantsClassList = lowerQuestion.includes('what classes am i in') ||
        lowerQuestion.includes('what courses am i taking') ||
        lowerQuestion.includes('what classes do i have') ||
        lowerQuestion.includes('list my classes') ||
        lowerQuestion.includes('what am i enrolled in');

      const wantsProfessor = lowerQuestion.includes('who is my professor') ||
        lowerQuestion.includes('who teaches') ||
        lowerQuestion.includes('what is my professor');

      const wantsClassTime = lowerQuestion.includes('what time is class') ||
        lowerQuestion.includes('when does class meet') ||
        lowerQuestion.includes('what time do we meet') ||
        lowerQuestion.includes('class schedule');

      const courseMatch = findCourseMatch(lowerQuestion);

      if (wantsClassList) {
        const summary = allSyllabi.map((course: any, idx: number) => `${idx + 1}. ${formatCourseSummary(course)}`).join('\n');
        return NextResponse.json({
          success: true,
          answer: `You're currently enrolled in:\n${summary}`,
          provider: 'syllabus-direct',
          shouldRespond: true,
          timestamp: new Date().toISOString()
        });
      }

      if (wantsProfessor) {
        if (courseMatch && courseMatch.professor) {
          return NextResponse.json({
            success: true,
            answer: `Your professor for ${courseMatch.courseName || courseMatch.courseCode || 'this course'} is ${courseMatch.professor}.`,
            provider: 'syllabus-direct',
            shouldRespond: true,
            timestamp: new Date().toISOString()
          });
        }

        const professorSummaries = allSyllabi
          .filter((course: any) => course.professor)
          .map((course: any) => `• ${course.courseName || course.courseCode || 'Course'} — ${course.professor}`);

        if (professorSummaries.length > 0) {
          return NextResponse.json({
            success: true,
            answer: `Here are the professors from your uploaded courses:\n${professorSummaries.join('\n')}`,
            provider: 'syllabus-direct',
            shouldRespond: true,
            timestamp: new Date().toISOString()
          });
        }
      }

      if (wantsClassTime) {
        if (courseMatch && courseMatch.classTime) {
          return NextResponse.json({
            success: true,
            answer: `${courseMatch.courseName || courseMatch.courseCode || 'This class'} meets ${courseMatch.classTime}.`,
            provider: 'syllabus-direct',
            shouldRespond: true,
            timestamp: new Date().toISOString()
          });
        }

        const scheduleSummaries = allSyllabi
          .filter((course: any) => course.classTime)
          .map((course: any) => `• ${course.courseName || course.courseCode || 'Course'} — ${course.classTime}`);

        if (scheduleSummaries.length > 0) {
          return NextResponse.json({
            success: true,
            answer: `Here are the class times from your uploaded courses:\n${scheduleSummaries.join('\n')}`,
            provider: 'syllabus-direct',
            shouldRespond: true,
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    // Simple prompt - AI service will handle search and insert results if needed
    const prompt = `You're CourseConnect AI - an all-in-one academic assistant${allSyllabi && allSyllabi.length > 0 ? ` with full access to the student's course syllabi` : ''}.

🚨 CRITICAL INSTRUCTIONS - READ THIS FIRST:
${allSyllabi && allSyllabi.length > 0 ? `- You have COMPLETE ACCESS to ${allSyllabi.length} course syllabus/syllabi listed below
- If the student asks "what classes am I in" or "what courses am I taking", you MUST list ALL the courses from the syllabi below
  EXAMPLE: "You're taking: [Course Name] ([Course Code]) with [Professor], [Course Name 2] ([Course Code 2]) with [Professor 2]..."
- If the student asks "who is my professor" for a specific course, answer DIRECTLY with the professor name from that course's syllabus
  EXAMPLE: "Your professor for [Course Name] is [Professor Name]"
- If the student asks "what time is class" for a course, answer DIRECTLY with the class time from that course's syllabus
  EXAMPLE: "Class for [Course Name] meets [Class Time]"
- If the student asks about ANYTHING related to their courses (school, topics, assignments, exams), use the EXACT information from the syllabi below
- NEVER say "I don't have access" or "I don't know your classes" or "check your syllabus" - you HAVE the syllabus data right here
- NEVER say "I'm just an AI" or "I don't have personal data" - you DO have their course data from the syllabi below
- The course information below is REAL and ACCURATE - use it directly in your answers
- When listing courses, include: course name, course code, professor (if available), and class time (if available)` : ''}

${syllabiContext}

You help with:
- Academic questions (math, science, homework, any subject)
- Course-specific help (assignments, exams, topics)
- Study strategies and explanations
- General knowledge and learning
- Current events and real-time information (when search results are provided)

Style rules:
- Be conversational and helpful
- Provide clear, detailed explanations
- If you know about their courses, reference them naturally
- Be encouraging and supportive

If the user's question is mathematical or an equation, strictly follow these rules:
- Do NOT ask for confirmation. Provide the solution immediately.
- Show concise, numbered steps when useful.
- Prefer plain text narrative; use LaTeX only for formulas.
- End with a single line: 'Final Answer: [value]' (no bold).
- Keep it brief unless the user asks for more detail.

Context: ${context || 'General Chat'}

${convoContext}User: ${cleanedQuestion}

CourseConnect AI:`;

    // Use Gemini + OpenAI fallback (no more Ollama)
    let aiResponse: string;
    let selectedModel: string;
    let aiResult: any = null; // Store AI result for later use

    try {
      console.log('Using Gemini + OpenAI fallback system');

      // Use the dual AI service with Gemini first, OpenAI fallback
      // If we have syllabi context, include it in the context parameter
      let enrichedContext = context || 'General Chat';
      if (syllabiContext) {
        enrichedContext = `${context || 'General Chat'}${syllabiContext}`;
      }

      // Let AI service handle search directly (simpler approach)
      aiResult = await provideStudyAssistanceWithFallback({
        question: cleanedQuestion,
        context: enrichedContext,
        conversationHistory: conversationHistory || [],
        isSearchRequest: isSearchRequest
      });

      // Ensure we have a valid answer
      if (!aiResult || !aiResult.answer || typeof aiResult.answer !== 'string') {
        console.warn('AI service returned invalid response:', aiResult);
        throw new Error('AI service returned invalid response');
      }

      aiResponse = aiResult.answer;
      selectedModel = aiResult.provider;
      sources = aiResult.sources || []; // Sources come from AI service when it performs search


    } catch (error) {
      console.log('AI service failed, using intelligent fallback response');

      // Intelligent fallback for when AI service fails
      const lowerQuestion = cleanedQuestion.toLowerCase();

      if (lowerQuestion.includes('hello') || lowerQuestion.includes('hi') || lowerQuestion.includes('hey')) {
        aiResponse = "Hey there! I'm CourseConnect AI, your friendly study buddy! I'm here to help with academics, homework questions, study strategies, or just chat about whatever's on your mind. What's up today?";
      } else if (lowerQuestion.includes('who are you')) {
        aiResponse = "I'm CourseConnect AI, your friendly study buddy! I was created by a solo developer who built CourseConnect as a unified platform for college students. I'm here to help you with studies, answer questions, or just chat about whatever's on your mind. What's up?";
      } else if (lowerQuestion.includes('news') || lowerQuestion.includes('current')) {
        aiResponse = "I'd love to help with current events! Unfortunately I'm having trouble accessing real-time info right now. Feel free to ask me about academic topics, or try asking something like 'what's the latest news about...' specifically.";
      } else {
        aiResponse = "That's an interesting question! I'd normally chat about this with you, but I'm having some technical issues right now. Want to talk about academics, ask about homework, or try asking something else? I'm here to help once we get this sorted out!";
      }
      selectedModel = 'fallback';
    }

    // Final sanitation: limit emoji usage just in case a provider ignores style rules
    const sanitizeEmojis = (text: string): string => {
      try {
        // Simple emoji removal - remove common emoji ranges
        return (text || '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '');
      } catch {
        // Fallback: broadly remove non-ASCII characters which captures most emojis
        return (text || '').replace(/[\x80-\uFFFF]/g, '');
      }
    };

    // Ensure aiResponse is always a valid string
    if (!aiResponse || typeof aiResponse !== 'string') {
      console.error('aiResponse is invalid:', aiResponse);
      aiResponse = "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";
      selectedModel = 'fallback';
    }

    aiResponse = sanitizeEmojis(aiResponse);

    console.log('Chat API result:', {
      model: selectedModel || 'fallback',
      answerLength: aiResponse?.length || 0,
      timestamp: new Date().toISOString()
    });

    // Create notification for AI response (only if user is authenticated and not in public chat)
    if (userId && chatId && !isPublicChat) {
      try {
        // Check if user is currently active in this chat (not away)
        const isUserActive = request.headers.get('user-active') === 'true';

        // Only create notification if user is not actively in the chat
        if (!isUserActive) {
          await createAIResponseNotification(
            userId,
            aiResponse,
            chatId,
            chatTitle || context
          );
          console.log(`✅ Notification created for user ${userId} in ${chatTitle || context} (user was away)`);
        } else {
          console.log(`ℹ️ No notification created - user is actively in chat ${chatId}`);
        }
      } catch (error) {
        console.error('Failed to create notification:', error);
        // Don't fail the request if notification creation fails
      }
    }

    // Filter and rank sources to only those most relevant to the final answer
    let filteredSources = sources;
    try {
      if (Array.isArray(sources) && sources.length > 0 && typeof aiResponse === 'string') {
        const stop = new Set(['the', 'a', 'an', 'and', 'or', 'to', 'of', 'in', 'on', 'for', 'with', 'by', 'at', 'is', 'are', 'was', 'were', 'it', 'as', 'that', 'this', 'these', 'those', 'from', 'be', 'can', 'will']);
        const tokenize = (s: string) => (s || '')
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter(t => t && !stop.has(t) && t.length > 2);
        const answerTokens = new Set(tokenize(aiResponse));
        const scored = sources.map((s) => {
          const hay = `${s.title || ''} ${s.snippet || ''}`.toLowerCase();
          let score = 0;
          answerTokens.forEach(t => { if (hay.includes(t)) score += 1; });
          try { const host = new URL(s.url).hostname.replace(/^www\./, ''); if (host) score += 0.25; } catch { }
          return { s, score };
        });
        const maxKeep = Math.min(parseInt(process.env.SEARCH_RESULTS_LIMIT || '12', 10), 20);
        const used = scored
          .filter(x => x.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, maxKeep)
          .map(x => x.s);
        filteredSources = used.length > 0 ? used : sources.slice(0, Math.max(3, Math.min(10, sources.length)));
      }
    } catch (e) {
      console.warn('Source ranking failed; returning original sources:', e);
      filteredSources = sources;
    }

    // Use isSearchRequest from AI result if available (more accurate), otherwise use original request
    const finalIsSearchRequest = aiResult?.isSearchRequest !== undefined ? aiResult.isSearchRequest : isSearchRequest;

    // Add syllabus sources if available (Memory pulled from)
    if (allSyllabi && allSyllabi.length > 0) {
      const syllabusSources = allSyllabi.map((s: any) => ({
        title: s.courseName ? `${s.courseName} Syllabus` : 'Course Syllabus',
        url: '#',
        snippet: 'Syllabus Context'
      }));

      // Combine with existing sources
      sources = [...(sources || []), ...syllabusSources];
    }

    const response = {
      success: true,
      answer: aiResponse,
      provider: selectedModel || 'fallback',
      shouldRespond: true,
      timestamp: new Date().toISOString(),
      sources: filteredSources.length > 0 ? filteredSources : undefined,
      isSearchRequest: finalIsSearchRequest // CRITICAL: Include flag from AI service result
    };


    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Chat API error:', error);

    return NextResponse.json({
      error: 'Failed to process chat message',
      details: error.message
    }, { status: 500 });
  }
}
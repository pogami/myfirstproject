import { NextRequest, NextResponse } from 'next/server';
import { provideStudyAssistanceWithFallback } from '@/ai/services/dual-ai-service';
import { filterContent, generateFilterResponse } from '@/lib/content-filter';
import {
  generateDeadlineContext,
  detectQuestionComplexity,
  getAdaptiveInstructions,
  isQuizRequest,
  extractQuizTopic,
  detectConfusion,
  isStudyPlanRequest,
  generateStudyPlan,
  isAssignmentHelpRequest,
  findRelevantAssignment,
  extractTopics,
  calculateDaysUntil,
  isPracticeExamRequest,
  isResourceRequest,
  generateMemoryContext,
  generatePracticeExamInstructions
} from '@/lib/ai-intelligence-utils';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { 
      question, 
      context, 
      conversationHistory, 
      shouldCallAI = true, 
      courseData,
      chatId,
      metadata 
    } = await request.json();
    
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // Clean @ mentions from the question if present
    const cleanedQuestion = question.replace(/@ai\s*/gi, '').trim();

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

    // Detect question characteristics
    const questionComplexity = detectQuestionComplexity(cleanedQuestion);
    const isQuiz = isQuizRequest(cleanedQuestion);
    const isConfused = detectConfusion(cleanedQuestion);
    const wantsStudyPlan = isStudyPlanRequest(cleanedQuestion);
    const needsAssignmentHelp = isAssignmentHelpRequest(cleanedQuestion);
    const wantsPracticeExam = isPracticeExamRequest(cleanedQuestion);
    const wantsResources = isResourceRequest(cleanedQuestion);

    console.log('Class Chat API called with:', { 
      question: cleanedQuestion, 
      context, 
      conversationHistory: conversationHistory?.length || 0, 
      shouldCallAI,
      questionCharacteristics: {
        complexity: questionComplexity,
        isQuiz,
        isConfused,
        wantsStudyPlan,
        needsAssignmentHelp,
        wantsPracticeExam,
        wantsResources
      },
      courseData: courseData ? {
        courseName: courseData.courseName,
        courseCode: courseData.courseCode,
        topicsCount: courseData.topics?.length || 0,
        assignmentsCount: courseData.assignments?.length || 0,
        examsCount: courseData.exams?.length || 0
      } : null,
      chatId,
      timestamp: new Date().toISOString()
    });

    // Build course-specific context with intelligent features
    let courseContext = '';
    let specialInstructions = '';
    
    if (courseData) {
      const { courseName, courseCode, professor, university, semester, year, topics, assignments, exams } = courseData;
      
      // Add deadline awareness
      const deadlineContext = generateDeadlineContext(courseData);
      
      // Add adaptive complexity instructions
      const adaptiveInstructions = getAdaptiveInstructions(questionComplexity);
      
      // Add memory context (persistent learning)
      const memoryContext = generateMemoryContext(metadata);
      
      // Handle special request types
      if (wantsPracticeExam && topics && topics.length > 0) {
        const nextExam = exams?.find(e => calculateDaysUntil(e.date || '') >= 0);
        specialInstructions = `\n\n📝 PRACTICE EXAM MODE - INTERACTIVE:
Generate a comprehensive practice exam${nextExam?.name ? ` for ${nextExam.name}` : ''}.

CRITICAL: You MUST output the exam in this EXACT format:

First, write a brief introduction (1-2 sentences).

Then on a new line, output:
EXAM_DATA: {"topic":"${nextExam?.name || courseName}","timeLimit":30,"questions":[{"question":"Your question here","options":["A) Option 1","B) Option 2","C) Option 3","D) Option 4"],"answer":"A","explanation":"Why this is correct"},{"question":"Next question","options":["A) Option 1","B) Option 2","C) Option 3","D) Option 4"],"answer":"B","explanation":"Explanation"}]}

Requirements:
- 20 questions total covering: ${topics.join(', ')}
- All must be multiple choice with 4 options (A, B, C, D)
- Answer must be just the letter (A, B, C, or D)
- Include brief explanation for each
- Difficulty progression (easier → harder)
- Cover topics evenly

The JSON must be valid and on ONE line after EXAM_DATA:`;
      } else if (wantsResources) {
        const topicForResources = extractTopics(cleanedQuestion, topics || []).join(', ') || courseName;
        specialInstructions = `\n\n📚 RESOURCE RECOMMENDATION REQUEST:
The student wants learning resources for: ${topicForResources}

Provide 3-5 high-quality resources with clickable blue links:
- YouTube videos (use https://youtube.com/results?search_query= format)
- Khan Academy articles (if relevant)
- Educational websites

Format each as: [Resource Title](actual_working_url)

Example:
"Here are some great resources for ${topicForResources}:

[Introduction to ${topicForResources} - YouTube](https://youtube.com/results?search_query=${encodeURIComponent(topicForResources + ' tutorial')})

[${topicForResources} Explained - Khan Academy](https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(topicForResources)})

Make sure URLs are actual working links, not placeholders!"`;
      } else if (isQuiz && topics && topics.length > 0) {
        const quizTopic = extractQuizTopic(cleanedQuestion, topics) || 'the course material';
        specialInstructions = `\n\n🎯 QUIZ MODE ACTIVATED - INTERACTIVE:
The student wants to be quizzed on: ${quizTopic}

CRITICAL: You MUST output the quiz in this EXACT format:

First, write a brief encouraging message (1 sentence).

Then on a new line, output:
QUIZ_DATA: {"topic":"${quizTopic}","questions":[{"question":"Your question here","options":["A) Option 1","B) Option 2","C) Option 3","D) Option 4"],"answer":"A","explanation":"Brief explanation"},{"question":"Next question","options":["A) Option 1","B) Option 2","C) Option 3","D) Option 4"],"answer":"B","explanation":"Explanation"}]}

Requirements:
- 5 questions total about ${quizTopic}
- All must be multiple choice with 4 options (A, B, C, D)
- Answer must be just the letter (A, B, C, or D)
- Include brief explanation for each
- Cover different aspects (definitions, applications, connections)

The JSON must be valid and on ONE line after QUIZ_DATA:`;
      } else if (wantsStudyPlan && exams && exams.length > 0) {
        const nextExam = exams
          .map(e => ({ ...e, daysUntil: calculateDaysUntil(e.date || '') }))
          .filter(e => e.daysUntil >= 0)
          .sort((a, b) => a.daysUntil - b.daysUntil)[0];
          
        if (nextExam && nextExam.date) {
          const studyPlan = generateStudyPlan(nextExam.name, nextExam.date, topics || []);
          specialInstructions = `\n\n📅 STUDY PLAN REQUEST:
The student wants help preparing for ${nextExam.name}.
Here's a study plan you should present:

${studyPlan}

Present this naturally and offer to help with any specific topics.`;
        }
      } else if (needsAssignmentHelp && assignments && assignments.length > 0) {
        const relevantAssignment = findRelevantAssignment(cleanedQuestion, assignments);
        if (relevantAssignment) {
          specialInstructions = `\n\n📝 ASSIGNMENT HELP REQUEST:
The student needs help with: ${relevantAssignment.name}
${relevantAssignment.dueDate ? `Due: ${relevantAssignment.dueDate}` : ''}
${relevantAssignment.description ? `Description: ${relevantAssignment.description}` : ''}

Provide specific, actionable guidance for this assignment:
- Break down what they need to do
- Give concrete steps or approach
- Connect to course topics
- Offer to help with specific parts`;
        }
      } else if (isConfused) {
        specialInstructions = `\n\n💡 CONFUSION DETECTED:
The student is struggling with this concept.
- Break it down step-by-step
- Use simple language
- Provide multiple examples
- Check understanding before moving forward
- Be extra patient and encouraging`;
      }
      
      courseContext = `\n\nCOURSE CONTEXT - You are the AI assistant for ${courseName}${courseCode ? ` (${courseCode})` : ''}:

${professor ? `👨‍🏫 Professor: ${professor}` : ''}
${university ? `🏫 University: ${university}` : ''}
${semester && year ? `📅 Semester: ${semester} ${year}` : ''}

📚 Course Topics (${topics?.length || 0} topics):
${topics && topics.length > 0 ? topics.map(topic => `- ${topic}`).join('\n') : 'No topics listed'}

📝 Assignments (${assignments?.length || 0} assignments):
${assignments && assignments.length > 0 ? assignments.map(assignment => 
  `- ${assignment.name}${assignment.dueDate ? ` (Due: ${assignment.dueDate})` : ''}${assignment.description ? ` - ${assignment.description}` : ''}`
).join('\n') : 'No assignments listed'}

📅 Exams (${exams?.length || 0} exams):
${exams && exams.length > 0 ? exams.map(exam => 
  `- ${exam.name}${exam.date ? ` (Date: ${exam.date})` : ''}`
).join('\n') : 'No exams listed'}
${deadlineContext}

You have access to this course's syllabus information and can help with:
- Questions about course topics and concepts
- Assignment help and due date reminders
- Exam preparation and study strategies
- Course-specific academic guidance
- Clarifying course requirements and policies
${adaptiveInstructions}
${memoryContext}
${specialInstructions}

IMPORTANT: 
- You have full access to the syllabus and course details above
- Be proactive and encouraging - start helping immediately without asking what they want
- Use specific details from the syllabus to show you know the course
- Be enthusiastic and supportive, like a knowledgeable study buddy
- Don't ask "what would you like to know?" - instead, offer specific help based on the context`;
    }

    // Build conversation context
    const convoContext = conversationHistory?.length > 0 
      ? `\n\nPrevious conversation:\n${conversationHistory.map((msg: any) => `${msg.role === 'assistant' ? 'AI' : 'User'}: ${msg.content}`).join('\n')}\n\n`
      : '';

    // Create course-aware prompt
    const prompt = `You are CourseConnect AI, an enthusiastic and knowledgeable academic tutor for this specific course. You have full access to the syllabus and are ready to help!${courseContext}

Your personality and approach:
- Talk like a friendly, knowledgeable study buddy - casual but smart
- NO markdown formatting (no ###, no numbered lists)
- Avoid bold (**text**) and italics (*text*) - only use them very sparingly for critical emphasis (1-2 times per response max)
- Write naturally like you're texting or chatting, not writing a document
- Use simple paragraphs and natural line breaks
- Be encouraging and positive - help them build confidence
- Get straight to the point, no fluff or formal structure
- Vary your approach: sometimes explain deeply, sometimes ask questions, sometimes test understanding

Response guidelines:
- For "what is this course" questions: Give an enthusiastic overview using SPECIFIC details from the syllabus (course topics, professor, assignments, exams). Show that you know the actual course!
- For vague requests: Jump right into explaining relevant course topics with specific examples from the syllabus
- For specific questions: Give clear, detailed explanations in a conversational tone
- For confusion: Break down complex concepts step-by-step in simple language
- Always reference actual course information from the syllabus (specific topics, assignment names, exam dates)
- Keep it conversational - write like you're talking to them in person
- Use emojis very sparingly (1-2 max per response)
- Reference specific course details naturally in conversation
- Connect topics to real-world applications when it makes sense
- When discussing the course, ALWAYS use the actual syllabus details provided, not generic information
- NO formal formatting - just natural paragraphs and conversational flow

${convoContext}Student: ${cleanedQuestion}

CourseConnect AI:`;

    // Use OpenAI as primary for class chat (better contextual responses)
    let aiResponse: string;
    let selectedModel: string;
    
    try {
      console.log('Using OpenAI for class chat (better context understanding)');
      
      // Try OpenAI first with gpt-4o-mini
      if (process.env.OPENAI_API_KEY) {
        try {
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
                  content: 'You are CourseConnect AI, a supportive and engaging academic tutor. Be conversational and genuinely helpful like a caring tutor. Adapt your response style based on the student\'s input: sometimes explain deeply, sometimes ask questions, sometimes test understanding. Use course context to provide relevant examples. Be encouraging and positive. Avoid generic responses - just start helping immediately. Vary your endings: sometimes ask questions, sometimes offer to continue, sometimes test understanding, sometimes just explain more.'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.7,
              max_tokens: 1500,
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.log('OpenAI API error:', response.status, errorText);
            throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          aiResponse = data.choices?.[0]?.message?.content || 'No response generated';
          selectedModel = 'openai-gpt4o';
          
          console.log(`Class chat AI response from OpenAI (gpt-4o-mini): ${aiResponse.substring(0, 100)}...`);
          
        } catch (openaiError) {
          console.log('OpenAI failed, trying Google AI:', openaiError);
          throw openaiError;
        }
      } else {
        throw new Error('No OpenAI API key');
      }
      
    } catch (error) {
      // Fallback to Google AI if OpenAI fails
      try {
        if (process.env.GOOGLE_AI_API_KEY) {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1500,
              }
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.log('Google AI API error:', response.status, errorText);
            throw new Error(`Google AI API error: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
          selectedModel = 'google-gemini';
          
          console.log(`Class chat AI response from Google AI: ${aiResponse.substring(0, 100)}...`);
          
        } else {
          throw new Error('No Google AI API key');
        }
        
      } catch (googleError) {
        console.log('AI service failed for class chat, using fallback response');
        
        // Enhanced fallback responses that are proactive and helpful
        const lowerQuestion = cleanedQuestion.toLowerCase();
        
        if (lowerQuestion.includes('hello') || lowerQuestion.includes('hi') || lowerQuestion.includes('hey')) {
          aiResponse = `Hello! I'm your AI assistant for ${courseData?.courseName || 'this course'}. I'm excited to help you succeed! 

I can assist you with:
• Understanding course concepts and topics
• Assignment guidance and study strategies  
• Exam preparation and review
• Clarifying course requirements

What would you like to dive into first?`;
        } else if (lowerQuestion.includes('help') || lowerQuestion.includes('can you help')) {
          if (courseData) {
            const topics = courseData.topics?.slice(0, 3).join(', ') || 'various topics';
            const assignmentCount = courseData.assignments?.length || 0;
            const examCount = courseData.exams?.length || 0;
            
            aiResponse = `Of course! I'm excited to help you with ${courseData.courseName}. 

Let me dive right in - this course covers some really interesting topics like ${topics}${courseData.topics?.length > 3 ? ' and more' : ''}. ${assignmentCount > 0 ? `You've got ${assignmentCount} assignments coming up, ` : ''}${examCount > 0 ? `and ${examCount} exams to prepare for. ` : ''}

What's been challenging for you? Are you struggling with understanding any particular concepts, or do you need help with study strategies? I'm here to break things down and help you feel more confident about the material!`;
          } else {
            aiResponse = `Absolutely! I'm here to help you succeed. 

I can help you understand course concepts, work through assignments, prepare for exams, and develop effective study strategies. 

What's on your mind? What topic or concept would you like to dive into together?`;
          }
        } else if (lowerQuestion.includes('what is this course') || lowerQuestion.includes('tell me about this course')) {
          if (courseData) {
            const topics = courseData.topics?.slice(0, 3).join(', ') || 'various topics';
            aiResponse = `Great question! ${courseData.courseName}${courseData.courseCode ? ` (${courseData.courseCode})` : ''} is an exciting course that covers ${topics}${courseData.topics?.length > 3 ? ' and more' : ''}.

${courseData.professor ? `👨‍🏫 **Professor**: ${courseData.professor}` : ''}
📚 **Topics**: ${courseData.topics?.length || 0} key concepts to master
📝 **Assignments**: ${courseData.assignments?.length || 0} assignments to complete
📅 **Exams**: ${courseData.exams?.length || 0} exams to prepare for

This course will help you develop important skills and knowledge. What aspect interests you most?`;
          } else {
            aiResponse = "I'd love to tell you about this course! I'm having a small technical hiccup accessing the course details right now, but I'm here to help with any questions you have. What would you like to know?";
          }
        } else if (lowerQuestion.includes('assignment') || lowerQuestion.includes('homework')) {
          const assignmentCount = courseData?.assignments?.length || 0;
          aiResponse = `I'd love to help with assignments! ${assignmentCount > 0 ? `I see you have ${assignmentCount} assignments in this course. ` : ''}

Let's tackle this together! I can help you break down the requirements, understand the concepts, and structure your work effectively. 

What assignment are you working on? What's the main challenge you're facing - is it understanding the topic, organizing your thoughts, or something else?`;
        } else if (lowerQuestion.includes('exam') || lowerQuestion.includes('test')) {
          const examCount = courseData?.exams?.length || 0;
          aiResponse = `Exam preparation is one of my specialties! ${examCount > 0 ? `I can help you prepare for your ${examCount} exams. ` : ''}

Let's create a solid study plan together! I can help you review key concepts, practice with sample questions, and develop effective study strategies that work for you.

What exam are you preparing for? Which topics are you feeling less confident about?`;
        } else {
          if (courseData) {
            aiResponse = `That's a great question about ${courseData.courseName}! I'm here to help you succeed.

I can help you understand course concepts, work through assignments, prepare for exams, and develop effective study strategies. 

What's on your mind? What topic or concept would you like to explore together?`;
          } else {
            aiResponse = `That's a great question! I'm here to help you succeed academically.

I can help you understand complex concepts, work through assignments, prepare for exams, and develop effective study strategies.

What would you like to dive into? What's challenging you right now?`;
          }
        }
        selectedModel = 'fallback';
      }
    }

    // Final sanitation: limit emoji usage
    const sanitizeEmojis = (text: string): string => {
      try {
        return (text || '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '');
      } catch {
        return (text || '').replace(/[\x80-\uFFFF]/g, '');
      }
    };

    aiResponse = sanitizeEmojis(aiResponse);

    // Extract topics mentioned in the conversation for tracking
    const mentionedTopics = courseData?.topics 
      ? extractTopics(cleanedQuestion, courseData.topics)
      : [];

    console.log('Class Chat API result:', { 
      model: selectedModel || 'fallback', 
      answerLength: aiResponse?.length || 0,
      chatId,
      mentionedTopics,
      questionComplexity,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      answer: aiResponse,
      provider: selectedModel || 'fallback',
      shouldRespond: true,
      timestamp: new Date().toISOString(),
      courseContext: courseData ? {
        courseName: courseData.courseName,
        courseCode: courseData.courseCode
      } : null,
      // Metadata for intelligent tracking
      metadata: {
        topicsCovered: mentionedTopics,
        questionComplexity,
        isQuiz,
        isConfused,
        wantsStudyPlan,
        needsAssignmentHelp,
        wantsPracticeExam,
        wantsResources
      }
    });
    
  } catch (error: any) {
    console.error('Class Chat API error:', error);
    
    return NextResponse.json({
      error: 'Failed to process class chat message',
      details: error.message 
    }, { status: 500 });
  }
}

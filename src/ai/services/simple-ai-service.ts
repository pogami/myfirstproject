'use server';

/**
 * Simple AI Service for CourseConnect Chat
 * Provides reliable, fast responses for academic questions
 */

export interface AIResponse {
  response: string;
  sources?: string[];
  confidence?: number;
}

export async function getInDepthAnalysis({ question, context }: { question: string; context: string }): Promise<AIResponse> {
  try {
    // Simple, reliable AI responses for common academic questions
    const responses = {
      'who are you': 'I\'m CourseConnect AI, your intelligent study assistant! I\'m part of CourseConnect, the unified platform that helps college students succeed with AI-powered study tools, class chats, syllabus analysis, and personalized learning support. How can I help you with your studies today?',
      'what are you': 'I\'m CourseConnect AI, your intelligent study assistant! I\'m part of CourseConnect, the unified platform that helps college students succeed with AI-powered study tools, class chats, syllabus analysis, and personalized learning support. How can I help you with your studies today?',
      'hi': 'Hello! I\'m CourseConnect AI, your academic assistant. I can help you with homework, explain concepts, provide study tips, and answer questions about any subject. What would you like to know?',
      'hello': 'Hi there! I\'m here to help with your academic needs. Whether it\'s math, science, literature, or any other subject, I\'m ready to assist. What can I help you with today?',
      'help': 'I\'m CourseConnect AI, your academic study companion! I can help you with:\n\n• Homework questions and problem-solving\n• Concept explanations and definitions\n• Study strategies and tips\n• Writing assistance\n• Test preparation\n• Research guidance\n\nJust ask me anything related to your studies!',
      'math': 'I\'d be happy to help with math! I can assist with:\n\n• Algebra and equations\n• Calculus and derivatives\n• Geometry and trigonometry\n• Statistics and probability\n• Word problems\n\nWhat specific math topic or problem would you like help with?',
      'science': 'Science is fascinating! I can help with:\n\n• Biology concepts and processes\n• Chemistry equations and reactions\n• Physics problems and formulas\n• Environmental science\n• Lab report writing\n\nWhat science topic are you studying?',
      'english': 'I can help with English and literature! I assist with:\n\n• Essay writing and structure\n• Literary analysis\n• Grammar and punctuation\n• Reading comprehension\n• Creative writing\n• Research papers\n\nWhat English assignment or topic do you need help with?',
      'history': 'History is full of interesting stories! I can help with:\n\n• Historical events and timelines\n• Cause and effect analysis\n• Historical essay writing\n• Research and citations\n• Understanding historical context\n\nWhat historical period or event are you studying?',
      'computer science': 'Computer science is exciting! I can help with:\n\n• Programming concepts and code\n• Algorithms and data structures\n• Software development\n• Database design\n• Web development\n• Problem-solving approaches\n\nWhat programming language or CS concept are you working on?'
    };

    // Check for exact matches first
    const lowerQuestion = question.toLowerCase().trim();
    if (responses[lowerQuestion]) {
      return {
        response: responses[lowerQuestion],
        sources: ['CourseConnect AI Knowledge Base'],
        confidence: 0.9
      };
    }

    // Check for keyword matches
    for (const [key, response] of Object.entries(responses)) {
      if (lowerQuestion.includes(key)) {
        return {
          response: response,
          sources: ['CourseConnect AI Knowledge Base'],
          confidence: 0.8
        };
      }
    }

    // Default helpful response
    return {
      response: `I'd be happy to help with your question: "${question}"\n\nHere's how I can assist you:\n\n1. **Break it down**: Let's identify the key concepts\n2. **Provide examples**: I'll give you concrete examples\n3. **Step-by-step approach**: I'll guide you through the solution\n4. **Practice suggestions**: I'll recommend ways to practice\n5. **Additional resources**: I'll suggest where to learn more\n\nCould you provide more details about what specific aspect you'd like help with?`,
      sources: ['CourseConnect AI Knowledge Base'],
      confidence: 0.7
    };

  } catch (error) {
    console.error('AI service error:', error);
    return {
      response: 'I apologize, but I encountered an issue processing your request. Please try rephrasing your question or ask about a specific topic like math, science, English, or history.',
      sources: [],
      confidence: 0.5
    };
  }
}

// Additional helper functions
export async function getQuickAnswer(question: string): Promise<string> {
  const response = await getInDepthAnalysis({ question, context: 'quick' });
  return response.response;
}

export async function getStudyTips(subject: string): Promise<string> {
  const tips = {
    'math': 'Math Study Tips:\n\n• Practice daily with different problem types\n• Understand concepts before memorizing formulas\n• Work through examples step-by-step\n• Use visual aids and diagrams\n• Practice explaining solutions to others\n• Review mistakes to learn from them',
    'science': 'Science Study Tips:\n\n• Understand the scientific method\n• Connect concepts to real-world examples\n• Use diagrams and models\n• Practice lab procedures\n• Review key terminology\n• Connect different science disciplines',
    'english': 'English Study Tips:\n\n• Read actively and take notes\n• Practice writing regularly\n• Analyze literary devices\n• Build vocabulary systematically\n• Understand essay structure\n• Practice critical thinking',
    'history': 'History Study Tips:\n\n• Create timelines for events\n• Understand cause and effect\n• Connect events to themes\n• Practice essay writing\n• Use primary and secondary sources\n• Understand historical context'
  };

  return tips[subject.toLowerCase()] || 'Here are general study tips:\n\n• Create a study schedule\n• Find a quiet study space\n• Take regular breaks\n• Use active learning techniques\n• Practice retrieval and recall\n• Get enough sleep\n• Stay organized';
}

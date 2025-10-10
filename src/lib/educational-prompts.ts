// Enhanced Educational Prompts
// Add this to your existing enhanced-ai-prompts.ts

export class EducationalPrompts {
  // Educational system prompts for different subjects
  private static systemPrompts = {
    math: `You are CourseConnect AI, an expert mathematics tutor specializing in college-level math.

Your expertise includes:
- Algebra, Calculus, Statistics, Linear Algebra
- Step-by-step problem solving
- LaTeX formatting for equations
- Real-world applications
- Common student misconceptions

Always provide:
1. Clear, step-by-step solutions
2. LaTeX-formatted equations
3. Explanations of each step
4. Alternative solution methods when applicable
5. Practice suggestions

Format math using LaTeX: $inline$ and $$display$$`,

    coding: `You are CourseConnect AI, an expert programming tutor specializing in multiple languages.

Your expertise includes:
- Python, JavaScript, Java, C++, HTML/CSS
- Best practices and clean code
- Debugging and error resolution
- Algorithm design and optimization
- Real-world applications

Always provide:
1. Clean, runnable code
2. Syntax highlighting in markdown
3. Comments explaining key concepts
4. Alternative approaches
5. Common pitfalls to avoid

Format code using markdown code blocks with language specification.`,

    science: `You are CourseConnect AI, an expert science tutor covering all college-level sciences.

Your expertise includes:
- Physics, Chemistry, Biology, Earth Sciences
- Scientific method and critical thinking
- Lab procedures and safety
- Data analysis and interpretation
- Real-world applications

Always provide:
1. Clear scientific explanations
2. Relevant examples and analogies
3. Connections to broader concepts
4. Critical thinking questions
5. Current research when relevant`,

    general: `You are CourseConnect AI, an expert educational assistant for all college subjects.

Your expertise includes:
- Humanities, Social Sciences, Business, Arts
- Critical thinking and analysis
- Research methods and citations
- Academic writing and communication
- Study strategies and learning techniques

Always provide:
1. Clear, accurate explanations
2. Multiple perspectives when relevant
3. Real-world applications
4. Study tips and strategies
5. Encouragement for learning`
  };

  // Build educational prompt based on subject and question
  static buildEducationalPrompt(question: string, subject: string, context?: any): string {
    const systemPrompt = this.systemPrompts[subject] || this.systemPrompts.general;
    
    // Add context if available
    let contextualInfo = '';
    if (context) {
      contextualInfo = this.buildContextualInfo(context);
    }
    
    return `${systemPrompt}

${contextualInfo}

Question: ${question}

Provide a comprehensive, educational response that helps the student learn and understand the concept.`;
  }

  // Build contextual information
  private static buildContextualInfo(context: any): string {
    let info = '';
    
    if (context.previousQuestions) {
      info += `Previous questions in this conversation: ${context.previousQuestions.join(', ')}\n`;
    }
    
    if (context.currentSubject) {
      info += `Current subject focus: ${context.currentSubject}\n`;
    }
    
    if (context.difficultyLevel) {
      info += `Student level: ${context.difficultyLevel}\n`;
    }
    
    if (context.uploadedFiles) {
      info += `Uploaded files: ${context.uploadedFiles.join(', ')}\n`;
    }
    
    return info ? `Context:\n${info}` : '';
  }

  // Subject-specific question builders
  static buildMathPrompt(question: string): string {
    return this.buildEducationalPrompt(question, 'math');
  }

  static buildCodingPrompt(question: string): string {
    return this.buildEducationalPrompt(question, 'coding');
  }

  static buildSciencePrompt(question: string): string {
    return this.buildEducationalPrompt(question, 'science');
  }

  static buildGeneralPrompt(question: string): string {
    return this.buildEducationalPrompt(question, 'general');
  }

  // Adaptive prompt based on question complexity
  static buildAdaptivePrompt(question: string, subject: string, complexity: string): string {
    const basePrompt = this.buildEducationalPrompt(question, subject);
    
    switch (complexity) {
      case 'simple':
        return `${basePrompt}

Keep the response concise and direct. Focus on the essential information.`;
      
      case 'complex':
        return `${basePrompt}

Provide a detailed, comprehensive explanation. Include multiple examples and connections to broader concepts.`;
      
      case 'reasoning':
        return `${basePrompt}

Focus on the reasoning process. Explain the "why" behind concepts and show step-by-step thinking.`;
      
      case 'debugging':
        return `${basePrompt}

Focus on identifying and solving the problem. Provide clear troubleshooting steps and prevention strategies.`;
      
      case 'creative':
        return `${basePrompt}

Encourage creative thinking and multiple approaches. Provide inspiration and examples.`;
      
      default:
        return basePrompt;
    }
  }

  // Study-focused prompts
  static buildStudyPrompt(question: string, studyType: 'review' | 'practice' | 'explanation'): string {
    const basePrompt = this.buildEducationalPrompt(question, 'general');
    
    switch (studyType) {
      case 'review':
        return `${basePrompt}

This is a review question. Provide a comprehensive overview that reinforces key concepts and helps with retention.`;
      
      case 'practice':
        return `${basePrompt}

This is a practice question. Provide the solution and then suggest similar practice problems.`;
      
      case 'explanation':
        return `${basePrompt}

This is an explanation request. Focus on making the concept clear and understandable with examples.`;
      
      default:
        return basePrompt;
    }
  }

  // Exam preparation prompts
  static buildExamPrompt(question: string, examType: 'quiz' | 'midterm' | 'final'): string {
    const basePrompt = this.buildEducationalPrompt(question, 'general');
    
    switch (examType) {
      case 'quiz':
        return `${basePrompt}

This is quiz preparation. Provide concise, focused answers that cover key points.`;
      
      case 'midterm':
        return `${basePrompt}

This is midterm preparation. Provide comprehensive coverage of the topic with examples.`;
      
      case 'final':
        return `${basePrompt}

This is final exam preparation. Provide thorough coverage with connections to other topics.`;
      
      default:
        return basePrompt;
    }
  }

  // Get prompt type for debugging
  static getPromptType(question: string, subject: string, complexity: string): string {
    return `Educational Prompt - Subject: ${subject}, Complexity: ${complexity}`;
  }
}

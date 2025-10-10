// Gemini-Only Educational Model Manager
// Simplified to use only Google AI (Gemini) for all educational tasks

export class EducationalModelManager {
  // All educational tasks now use Gemini
  private static geminiModel = 'gemini-2.5-flash';

  static getEducationalModel(question: string, context?: any): string {
    const subject = this.detectSubject(question);
    const complexity = this.detectComplexity(question);
    
    console.log(`🎯 Using Gemini for ${subject} (${complexity}) question`);
    return this.geminiModel;
  }

  static getModelInfo(question: string) {
    const subject = this.detectSubject(question);
    const complexity = this.detectComplexity(question);
    
    return {
      subject,
      complexity,
      model: this.geminiModel,
      provider: 'google'
    };
  }

  private static detectSubject(question: string): string {
    const q = question.toLowerCase();
    
    // Math detection
    if (q.includes('math') || q.includes('calculate') || q.includes('solve') || 
        q.includes('equation') || q.includes('formula') || q.includes('derivative') ||
        q.includes('integral') || q.includes('algebra') || q.includes('calculus') ||
        q.includes('geometry') || q.includes('trigonometry') || q.includes('statistics') ||
        q.includes('probability') || q.includes('linear') || q.includes('quadratic') ||
        q.includes('polynomial') || q.includes('matrix') || q.includes('vector') ||
        q.includes('function') || q.includes('limit') || q.includes('series') ||
        q.includes('differential') || q.includes('optimization') || q.includes('graph')) {
      return 'math';
    }
    
    // Programming detection
    if (q.includes('code') || q.includes('programming') || q.includes('algorithm') ||
        q.includes('function') || q.includes('variable') || q.includes('loop') ||
        q.includes('python') || q.includes('javascript') || q.includes('java') ||
        q.includes('c++') || q.includes('sql') || q.includes('html') ||
        q.includes('css') || q.includes('react') || q.includes('node') ||
        q.includes('debug') || q.includes('error') || q.includes('syntax')) {
      return 'coding';
    }
    
    // Science detection
    if (q.includes('physics') || q.includes('chemistry') || q.includes('biology') ||
        q.includes('experiment') || q.includes('hypothesis') || q.includes('theory') ||
        q.includes('molecule') || q.includes('atom') || q.includes('cell') ||
        q.includes('force') || q.includes('energy') || q.includes('reaction') ||
        q.includes('lab') || q.includes('scientific') || q.includes('research')) {
      return 'science';
    }
    
    // Document analysis detection
    if (q.includes('document') || q.includes('pdf') || q.includes('file') ||
        q.includes('upload') || q.includes('analyze') || q.includes('summary') ||
        q.includes('extract') || q.includes('parse') || q.includes('read')) {
      return 'documents';
    }
    
    // Default to general
    return 'general';
  }

  private static detectComplexity(question: string): string {
    const q = question.toLowerCase();
    
    // Simple questions
    if (q.includes('what is') || q.includes('define') || q.includes('explain') ||
        q.includes('how to') || q.includes('basic') || q.includes('simple') ||
        q.includes('example') || q.includes('meaning') || q.includes('definition')) {
      return 'simple';
    }
    
    // Complex questions
    if (q.includes('analyze') || q.includes('compare') || q.includes('evaluate') ||
        q.includes('synthesize') || q.includes('complex') || q.includes('advanced') ||
        q.includes('detailed') || q.includes('comprehensive') || q.includes('thorough') ||
        q.includes('deep') || q.includes('in-depth') || q.includes('critical')) {
      return 'complex';
    }
    
    // Creative questions
    if (q.includes('create') || q.includes('design') || q.includes('write') ||
        q.includes('creative') || q.includes('imagine') || q.includes('brainstorm') ||
        q.includes('innovative') || q.includes('original') || q.includes('unique')) {
      return 'creative';
    }
    
    // Default to simple
    return 'simple';
  }

  // Get specialized prompt for different subjects
  static getSubjectPrompt(subject: string, complexity: string): string {
    const prompts = {
      math: {
        simple: "You are a mathematical tutor. Provide clear, step-by-step solutions with explanations.",
        complex: "You are an advanced mathematics expert. Provide detailed solutions with mathematical reasoning and proofs.",
        creative: "You are a creative mathematics educator. Find innovative ways to explain mathematical concepts."
      },
      coding: {
        simple: "You are a programming tutor. Provide clear code examples with explanations.",
        complex: "You are a senior software engineer. Provide advanced programming solutions with best practices.",
        creative: "You are a creative programmer. Find innovative solutions and approaches to coding problems."
      },
      science: {
        simple: "You are a science tutor. Explain scientific concepts clearly with examples.",
        complex: "You are a research scientist. Provide detailed scientific analysis with evidence.",
        creative: "You are a science communicator. Find creative ways to explain complex scientific concepts."
      },
      documents: {
        simple: "You are a document analysis assistant. Extract key information clearly.",
        complex: "You are a research analyst. Provide comprehensive document analysis.",
        creative: "You are a creative analyst. Find unique insights and connections in documents."
      },
      general: {
        simple: "You are a helpful educational assistant. Provide clear, concise answers.",
        complex: "You are an expert educator. Provide detailed, comprehensive explanations.",
        creative: "You are a creative educator. Find innovative ways to explain concepts."
      }
    };
    
    return prompts[subject]?.[complexity] || prompts.general.simple;
  }
}
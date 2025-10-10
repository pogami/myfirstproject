/**
 * Enhanced AI Prompt System - Makes AI Super Smart Across All Subjects
 * Provides comprehensive knowledge across every academic field
 */
export class EnhancedAIPrompts {
  
  /**
   * Classify query type for adaptive length control
   */
  static classifyQueryType(question: string): 'short_answer' | 'code' | 'reasoning' | 'essay' {
    const lowerQ = question.toLowerCase().trim();
    
    // Coding questions
    if (/write.*code|create.*code|show.*code|generate.*code|code.*in|python|javascript|java|c\+\+|html|css|sql/i.test(lowerQ)) {
      return 'code';
    }
    
    // Short factual questions
    if (/^what is [a-z\s]+[^?]*\??$/i.test(lowerQ) || 
        /^who is [a-z\s]+[^?]*\??$/i.test(lowerQ) ||
        /^when did [a-z\s]+[^?]*\??$/i.test(lowerQ) ||
        /^where is [a-z\s]+[^?]*\??$/i.test(lowerQ)) {
      return 'short_answer';
    }
    
    // Deep analysis questions
    if (/explain|analyze|compare|contrast|discuss|evaluate|describe.*process|how.*work/i.test(lowerQ)) {
      return 'essay';
    }
    
    // Reasoning questions (math, problem solving)
    if (/solve|calculate|find|prove|show.*that|why|how.*do/i.test(lowerQ)) {
      return 'reasoning';
    }
    
    return 'short_answer'; // default
  }
  
  /**
   * Get adaptive token limits based on query type
   */
  static getAdaptiveTokenLimit(queryType: 'short_answer' | 'code' | 'reasoning' | 'essay'): number {
    switch (queryType) {
      case 'short_answer': return 256;
      case 'code': return 1024;
      case 'reasoning': return 768;
      case 'essay': return 1500;
      default: return 512;
    }
  }
  
  /**
   * Generate a comprehensive prompt for any question
   */
  static generateComprehensivePrompt(question: string, context?: string): string {
    // Since we're using the fastest model, prefer simple prompts for immediate responses
    if (this.isSimpleQuestion(question)) {
      return this.buildSimplePrompt(question);
    }
    
    const subject = this.detectSubject(question);
    const complexity = this.detectComplexity(question);
    const queryType = this.classifyQueryType(question);
    
    return this.buildPrompt(question, subject, complexity, context, queryType);
  }

  /**
   * Check if a question needs extensive thinking (for UI animation control)
   */
  /**
   * Check if a question needs extensive thinking (for UI animation control)
   */
  static needsExtensiveThinking(question: string): boolean {
    // Always show thinking animation for all questions
    return true;
  }

  /**
   * Check if this is a simple question that needs immediate response
   */
  static isSimpleQuestion(question: string): boolean {
    const lowerQ = question.toLowerCase().trim();
    
    // Coding questions should NOT be simple - they need proper formatting
    if (/write.*code|create.*code|show.*code|generate.*code|code.*in|python|javascript|java|c\+\+|html|css|sql/i.test(lowerQ)) {
      return false;
    }
    
    // Simple "what is X" questions (basic definitions)
    if (/^what is [a-z\s]+[^?]*\??$/i.test(lowerQ)) {
      // Exclude complex academic topics
      const complexTopics = [
        'quantum', 'thermodynamics', 'calculus', 'philosophy', 'economics',
        'psychology', 'machine learning', 'artificial intelligence', 'neural',
        'organic chemistry', 'molecular', 'atomic', 'nuclear', 'relativity',
        'evolution', 'photosynthesis', 'mitosis', 'meiosis', 'ecosystem',
        'macroeconomics', 'microeconomics', 'statistical', 'hypothesis',
        'thesis', 'research', 'analysis', 'methodology', 'framework'
      ];
      
      // If it contains complex topics, it's not simple
      if (complexTopics.some(topic => lowerQ.includes(topic))) {
        return false;
      }
      
      // Otherwise, it's a simple "what is" question
      return true;
    }
    
    const simpleQuestionPatterns = [
      /^what is \d+[x\+\-\*\/]\d+\??$/i, // Simple math like "what is 3x+2?"
      /^what is \d+\??$/i, // Simple numbers like "what is 5?"
      /^what is \d+\s*[\+\-\*\/]\s*\d+\??$/i, // "what is 3+2?" type questions
      /^solve\s+\w+\^?\d*[\+\-\*\/]?\d*\s*=\s*\d+\??$/i, // Simple solve equations like "solve x^2+5x+6=0"
      /^calculate\s+\d+[\+\-\*\/]\d+\??$/i, // "calculate 5+3"
      /^@?ai\s*(what is|what's|solve|calculate)\s*[\d\+\-\*\/\^=]/i, // "@ai what is 3+5"
      /^[\d\+\-\*\/\^=\s]+$/i, // Pure arithmetic like "3+5"
      /^hello$/i, // Greetings
      /^hi$/i,
      /^hey$/i,
      /^thanks?$/i, // Thank you
      /^thank you$/i,
      /^how are you$/i,
      /^good morning$/i,
      /^good afternoon$/i,
      /^good evening$/i,
      /^what's up$/i,
      /^how's it going$/i,
      /^who are you$/i, // Identity questions
    ];

    return simpleQuestionPatterns.some(pattern => pattern.test(question.trim()));
  }

  /**
   * Build a simple prompt for immediate responses
   */
  public static buildSimplePrompt(question: string): string {
    // Check if it's a pure math question (not science with equations)
    const isPureMathQuestion = /^(what is|solve|calculate|find|derivative|integral)\s+.*[\d\+\-\*\/\^=].*$/.test(question.toLowerCase()) &&
                              !/biology|chemistry|physics|science|photosynthesis|respiration|reaction|molecule|atom|cell/i.test(question.toLowerCase());

    // Check for simple arithmetic questions
    const isSimpleArithmetic = /^@?ai\s*(what is|what's|solve|calculate)\s*[\d\+\-\*\/\^=]/.test(question.toLowerCase()) ||
                              /^[\d\+\-\*\/\^=\s]+$/.test(question.trim()) ||
                              /^what is \d+[\+\-\*\/]\d+/.test(question.toLowerCase());

    if (isPureMathQuestion || isSimpleArithmetic) {
      return `You are CourseConnect AI. Answer this math question: "${question}"

IMPORTANT: First, put your step-by-step thinking process in <think> tags.

<think>
Step 1: Analyze the mathematical problem
Step 2: Recall the appropriate formulas and methods
Step 3: Plan the solution steps
Step 4: Execute the calculations
</think>

Then provide the final answer using LaTeX formatting:
- Use $ for inline math: $x^2$
- Use $$ for display equations: $$\\frac{d}{dx}x^2 = 2x$$
- Box the final answer with \\boxed{}
- Be extremely concise - just the solution
- No explanations, no extra text, just the math answer`;
    }

    return `You are CourseConnect AI. Answer this question: "${question}"

IMPORTANT: First, put your step-by-step thinking process in <think> tags.

<think>
Step 1: Analyze what the user is asking
Step 2: Recall relevant information
Step 3: Plan a clear, conversational response
Step 4: Structure for engagement and clarity
</think>

Then give a natural, conversational answer. Be helpful and clear, like you're talking to a friend. Keep it informative but not too long. Do NOT use LaTeX formatting unless it's specifically a math calculation question.`;
  }

  /**
   * Detect the subject area of the question
   */
  private static detectSubject(question: string): string {
    const lowerQ = question.toLowerCase();
    
    // Mathematics & Statistics
    if (this.containsAny(lowerQ, ['math', 'algebra', 'calculus', 'geometry', 'statistics', 'probability', 'equation', 'solve', 'calculate', 'formula', 'derivative', 'integral'])) {
      return 'mathematics';
    }
    
    // Science
    if (this.containsAny(lowerQ, ['physics', 'chemistry', 'biology', 'science', 'experiment', 'molecule', 'atom', 'cell', 'organism', 'force', 'energy', 'reaction'])) {
      return 'science';
    }
    
    // Computer Science & Technology
    if (this.containsAny(lowerQ, ['programming', 'code', 'algorithm', 'software', 'computer', 'ai', 'machine learning', 'data structure', 'python', 'javascript', 'database'])) {
      return 'computer_science';
    }
    
    // History & Social Studies
    if (this.containsAny(lowerQ, ['history', 'war', 'revolution', 'ancient', 'medieval', 'world war', 'civilization', 'empire', 'historical'])) {
      return 'history';
    }
    
    // Literature & Language Arts
    if (this.containsAny(lowerQ, ['literature', 'poetry', 'novel', 'author', 'writing', 'essay', 'grammar', 'language', 'book', 'story'])) {
      return 'literature';
    }
    
    // Economics & Business
    if (this.containsAny(lowerQ, ['economics', 'business', 'finance', 'market', 'economy', 'investment', 'stock', 'money', 'profit', 'revenue'])) {
      return 'economics';
    }
    
    // Psychology & Social Sciences
    if (this.containsAny(lowerQ, ['psychology', 'behavior', 'mental', 'cognitive', 'social', 'sociology', 'anthropology', 'human behavior'])) {
      return 'psychology';
    }
    
    // Philosophy
    if (this.containsAny(lowerQ, ['philosophy', 'ethics', 'morality', 'existential', 'metaphysics', 'logic', 'reasoning', 'philosopher'])) {
      return 'philosophy';
    }
    
    // Art & Design
    if (this.containsAny(lowerQ, ['art', 'painting', 'drawing', 'design', 'artist', 'creative', 'aesthetic', 'visual', 'artwork'])) {
      return 'art';
    }
    
    // Medicine & Health
    if (this.containsAny(lowerQ, ['medicine', 'health', 'medical', 'disease', 'treatment', 'anatomy', 'physiology', 'doctor', 'patient'])) {
      return 'medicine';
    }
    
    // Law & Politics
    if (this.containsAny(lowerQ, ['law', 'legal', 'court', 'constitution', 'politics', 'government', 'democracy', 'justice', 'rights'])) {
      return 'law';
    }
    
    return 'general';
  }

  /**
   * Detect the complexity level of the question
   */
  private static detectComplexity(question: string): string {
    const lowerQ = question.toLowerCase();
    
    // Advanced/Expert level
    if (this.containsAny(lowerQ, ['advanced', 'expert', 'graduate', 'phd', 'research', 'thesis', 'complex', 'sophisticated', 'detailed analysis'])) {
      return 'advanced';
    }
    
    // Intermediate level
    if (this.containsAny(lowerQ, ['explain', 'how does', 'what is', 'describe', 'analyze', 'compare', 'contrast', 'discuss'])) {
      return 'intermediate';
    }
    
    // Basic level
    if (this.containsAny(lowerQ, ['what', 'who', 'when', 'where', 'define', 'simple', 'basic', 'introduction'])) {
      return 'basic';
    }
    
    return 'intermediate';
  }

  /**
   * Build the comprehensive prompt
   */
  private static buildPrompt(question: string, subject: string, complexity: string, context?: string, queryType?: 'short_answer' | 'code' | 'reasoning' | 'essay'): string {
    const subjectInstructions = this.getSubjectInstructions(subject);
    const complexityInstructions = this.getComplexityInstructions(complexity);
    
    // Check if this is a coding question
    const isCodingQuestion = /write.*code|create.*code|show.*code|generate.*code|code.*in|python|javascript|java|c\+\+|html|css|sql/i.test(question.toLowerCase());
    
    console.log(`🔍 Question: "${question}"`);
    console.log(`🔍 Is coding question: ${isCodingQuestion}`);
    
    if (isCodingQuestion) {
      return `You are CourseConnect AI, a coding expert. Answer this coding question: "${question}"
${context ? `Context: ${context}` : ''}

🚨 CRITICAL: THIS IS A CODING QUESTION - YOU MUST USE MARKDOWN CODE BLOCKS ONLY! 🚨

SYSTEM INSTRUCTION: Answer as concisely as possible. Only generate the code necessary to solve the problem. Do not add unnecessary filler or verbose explanations.

MANDATORY CODING FORMAT - NO EXCEPTIONS:
- ALWAYS use proper markdown code blocks with triple backticks
- NEVER output raw HTML, JavaScript, or any code without markdown formatting
- NEVER mix different languages in one response
- NEVER output plain text code - it must be in markdown blocks

REQUIRED FORMAT EXAMPLES:

For JavaScript:
\`\`\`javascript
function helloWorld() {
    console.log("Hello World");
}
helloWorld();
\`\`\`

For Python:
\`\`\`python
def hello_world():
    print("Hello World")

hello_world()
\`\`\`

For HTML:
\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Hello World</title>
</head>
<body>
    <h1>Hello World</h1>
</body>
</html>
\`\`\`

ABSOLUTE RULES - NO EXCEPTIONS:
1. ALL code MUST be wrapped in markdown code blocks with triple backticks
2. Include proper language specification (javascript, html, python, etc.)
3. Make code complete and runnable
4. Add comments to explain key parts
5. If you need both HTML and JavaScript, show them in separate code blocks
6. NEVER output incomplete or broken code
7. NEVER output plain text code - it will be rejected
8. Always test that your code would work

Brief explanation of what the code does and any important concepts.`;
    }
    
    return `You are CourseConnect AI, a friendly and knowledgeable assistant.

IMPORTANT: First, put your COMPLETE step-by-step thinking process in <think> tags. Show your reasoning, planning, and analysis.

<think>
Step 1: Analyze the question and identify what the user is asking
Step 2: Recall relevant knowledge and concepts from my training data
Step 3: Plan how to explain it clearly and conversationally
Step 4: Consider examples and analogies to make it relatable
Step 5: Structure the response for maximum clarity and engagement
</think>

Then answer this question naturally and conversationally: "${question}"
${context ? `Context: ${context}` : ''}

${subjectInstructions}

${complexityInstructions}

INSTRUCTIONS:
- Write like you're talking to a friend who wants to learn something
- Give enough information to be helpful and informative
- Use natural language and examples to make it interesting
- Don't be too brief (like a dictionary definition) or too verbose (like a textbook)
- Aim for a good paragraph or two that explains things clearly
- Include relevant details, examples, or context when it helps understanding
- Be engaging and conversational, not robotic or academic
- For pure math calculation questions only: Use LaTeX formatting with $ for inline math and $$ for display equations. Do NOT use LaTeX for science concepts, biology, chemistry, or general explanations.

Remember: You're having a helpful conversation, not writing a research paper or giving a one-word answer.`;
  }

  /**
   * Get subject-specific instructions
   */
  private static getSubjectInstructions(subject: string): string {
    const instructions: { [key: string]: string } = {
      mathematics: `You're great at math! Provide quick, accurate answers using KaTeX/LaTeX formatting. Use $ for inline math and $$ for display equations. Keep explanations concise - detailed step-by-step analysis is available via the calculator icon.`,
      
      science: `You know science well! Explain scientific concepts in simple terms with good examples.`,
      
      computer_science: `You're tech-savvy! Explain programming and tech concepts clearly, maybe with code examples when helpful.`,
      
      history: `You know history! Share interesting facts and context in an engaging way.`,
      
      literature: `You love books and writing! Provide thoughtful insights about literature and writing.`,
      
      economics: `You understand economics! Explain economic concepts with real-world examples.`,
      
      psychology: `You understand human behavior! Share insights about psychology in relatable ways.`,
      
      philosophy: `You think deeply! Explain philosophical concepts clearly and thoughtfully.`,
      
      art: `You appreciate creativity! Discuss art and design with enthusiasm and insight.`,
      
      medicine: `You know health and medicine! Provide helpful health information with appropriate disclaimers.`,
      
      law: `You understand legal concepts! Explain law clearly with appropriate disclaimers.`,
      
      general: `You're knowledgeable about many topics! Share your knowledge in a helpful, friendly way.`
    };
    
    return instructions[subject] || instructions.general;
  }

  /**
   * Get complexity-specific instructions
   */
  private static getComplexityInstructions(complexity: string): string {
    const instructions: { [key: string]: string } = {
      basic: `Keep it simple but informative. Explain things clearly with good examples, like you're helping someone understand something for the first time.`,
      
      intermediate: `Provide a solid explanation with good detail and examples. Think of explaining something to someone who has some background knowledge but wants to learn more.`,
      
      advanced: `Go into more depth and detail, but still keep it conversational and engaging. Include nuanced information and deeper insights.`
    };
    
    return instructions[complexity] || instructions.intermediate;
  }

  /**
   * Helper function to check if string contains any of the keywords
   */
  private static containsAny(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }
}

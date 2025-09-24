'use server';

/**
 * @fileOverview Dual AI Provider Service with Automatic Fallback
 * 
 * This service tries Google AI (Gemini) first, and if it fails,
 * automatically falls back to OpenAI (ChatGPT).
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Google AI
const googleApiKey = process.env.GOOGLE_AI_API_KEY;
const ai = genkit({
  plugins: [googleAI({
    apiKey: googleApiKey || 'demo-key',
  })],
  model: 'googleai/gemini-2.5-flash',
});

// AI Provider Types
export type AIProvider = 'google' | 'openai' | 'fallback';

export interface AIResponse {
  answer: string;
  provider: AIProvider;
  error?: string;
}

export interface StudyAssistanceInput {
  question: string;
  context: string;
}

/**
 * Try Google AI (Gemini) first
 */
async function tryGoogleAI(input: StudyAssistanceInput): Promise<AIResponse> {
  try {
    if (!googleApiKey || googleApiKey === 'your_google_ai_api_key_here' || googleApiKey === 'demo-key' || googleApiKey === '') {
      throw new Error('Google AI API key not configured');
    }

    const prompt = ai.definePrompt({
      name: 'provideStudyAssistancePrompt',
      input: { schema: z.object({ question: z.string(), context: z.string() }) },
      output: { schema: z.object({ answer: z.string() }) },
      prompt: `IMPORTANT: You must NEVER use markdown formatting symbols like ** or ## or ### or * or #. Write ONLY in plain text. Do not use bold, italics, headers, or any markdown syntax.

You are CourseConnect AI, an expert teaching assistant that helps students with academic questions across all subjects. You provide concise, direct answers first, with optional detailed explanations available on request.

Current Context: The student is asking in the context of: '{{context}}'
Student's Question: '{{question}}'

Your Expertise Areas:
- Mathematics: Algebra, Calculus, Statistics, Geometry, Trigonometry
- Sciences: Physics, Chemistry, Biology, Earth Science, Environmental Science
- English & Literature: Writing, Reading Comprehension, Literary Analysis, Grammar
- History & Social Studies: Historical Analysis, Geography, Government, Economics
- Computer Science: Programming, Data Structures, Algorithms, Software Engineering
- General Academic Skills: Study strategies, Research methods, Critical thinking

Response Guidelines:
1. Be Concise: Provide a direct, helpful answer in 2-3 sentences maximum
2. Be Clear: Explain the core concept simply and clearly
3. Be Encouraging: Use supportive language
4. Be Complete: Provide a helpful answer without asking for more detail

Response Quality:
- Keep answers short and to the point
- Focus on the essential information
- Use simple language when possible
- Always offer more detail if needed

Examples of Good Concise Responses:
- For "What is lightning?": "Lightning is an electrical discharge that occurs when electrical charges build up in storm clouds and discharge to the ground or other clouds. It's nature's way of balancing electrical charges in the atmosphere."

- For "How do loops work?": "Loops repeat code multiple times - 'for' loops when you know how many times, 'while' loops until a condition is met. They're essential for automating repetitive tasks in programming."

Always provide helpful, concise answers that get straight to the point. CRITICAL: NEVER use markdown formatting symbols like ** or ## or ### or * or # or any special formatting characters. Write ONLY in plain text. Do not use bold, italics, headers, or any markdown syntax. Use simple text formatting only.

For mathematical expressions, use LaTeX formatting:
- For inline math: $expression$ (e.g., $f(x) = x^2$)
- For block math: $$expression$$ (e.g., $$\lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$$)
- Use proper LaTeX syntax for fractions, limits, integrals, etc.`,
    });

    const { output } = await prompt(input);
    return {
      answer: output?.answer || 'I apologize, but I couldn\'t generate a response.',
      provider: 'google'
    };
  } catch (error) {
    console.warn('Google AI failed, trying OpenAI:', error);
    throw error;
  }
}

/**
 * Try OpenAI (ChatGPT) as fallback
 */
async function tryOpenAI(input: StudyAssistanceInput): Promise<AIResponse> {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey || openaiApiKey === 'your_openai_api_key_here' || openaiApiKey === 'demo-key' || openaiApiKey === '') {
      throw new Error('OpenAI API key not configured');
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `IMPORTANT: You must NEVER use markdown formatting symbols like ** or ## or ### or * or #. Write ONLY in plain text. Do not use bold, italics, headers, or any markdown syntax.

You are CourseConnect AI, an expert teaching assistant that helps students with academic questions across all subjects. You provide concise, direct answers first, with optional detailed explanations available on request.

Your Expertise Areas:
- Mathematics: Algebra, Calculus, Statistics, Geometry, Trigonometry
- Sciences: Physics, Chemistry, Biology, Earth Science, Environmental Science
- English & Literature: Writing, Reading Comprehension, Literary Analysis, Grammar
- History & Social Studies: Historical Analysis, Geography, Government, Economics
- Computer Science: Programming, Data Structures, Algorithms, Software Engineering
- General Academic Skills: Study strategies, Research methods, Critical thinking

Response Guidelines:
1. Be Concise: Provide a direct, helpful answer in 2-3 sentences maximum
2. Be Clear: Explain the core concept simply and clearly
3. Be Encouraging: Use supportive language
4. Be Complete: Provide a helpful answer without asking for more detail

Response Quality:
- Keep answers short and to the point
- Focus on the essential information
- Use simple language when possible
- Always offer more detail if needed

Always provide helpful, concise answers that get straight to the point, then offer more detail if needed. CRITICAL: NEVER use markdown formatting symbols like ** or ## or ### or * or # or any special formatting characters. Write ONLY in plain text. Do not use bold, italics, headers, or any markdown syntax. Use simple text formatting only.

For mathematical expressions, use LaTeX formatting:
- For inline math: $expression$ (e.g., $f(x) = x^2$)
- For block math: $$expression$$ (e.g., $$\lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$$)
- Use proper LaTeX syntax for fractions, limits, integrals, etc.`
        },
        {
          role: 'user',
          content: `Context: ${input.context}\n\nQuestion: ${input.question}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const answer = response.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response.';
    
    return {
      answer,
      provider: 'openai'
    };
  } catch (error) {
    console.warn('OpenAI failed:', error);
    throw error;
  }
}

/**
 * Enhanced fallback responses for when both AI providers fail
 */
function getEnhancedFallback(input: StudyAssistanceInput): AIResponse {
  const { question, context } = input;
  const lowerQuestion = question.toLowerCase();
  const lowerContext = context.toLowerCase();
  
  // Math questions
  if (lowerQuestion.includes('derivative') || lowerQuestion.includes('calculus')) {
    return {
      answer: `Let me help you understand derivatives! A derivative measures how fast a function is changing at any point - think of it as the "slope" of a curve at that specific point.

Key Concepts:
• The derivative of f(x) = x² is f'(x) = 2x
• Derivatives help us find maximum and minimum values
• They're essential for optimization problems

Example: If you have a position function, the derivative gives you velocity. If you have velocity, the derivative gives you acceleration.

Common Rules:
• Power Rule: d/dx[xⁿ] = nxⁿ⁻¹
• Product Rule: d/dx[f(x)g(x)] = f'(x)g(x) + f(x)g'(x)
• Chain Rule: d/dx[f(g(x))] = f'(g(x)) × g'(x)

Practice Tip: Start with simple polynomial functions and gradually work up to more complex ones.`,
      provider: 'fallback'
    };
  }
  
  if (lowerQuestion.includes('integral') || lowerQuestion.includes('integration')) {
    return {
      answer: `Integration is the reverse process of differentiation! While derivatives find rates of change, integrals find the total accumulation.

Key Concepts:
• The integral of 2x is x² + C (where C is a constant)
• Integration finds areas under curves
• It's used for calculating volumes, work, and many real-world applications

Types of Integrals:
• Indefinite integrals: ∫f(x)dx = F(x) + C
• Definite integrals: ∫[a to b]f(x)dx = F(b) - F(a)

Common Integration Techniques:
• Power Rule: ∫xⁿdx = xⁿ⁺¹/(n+1) + C
• Substitution: Change variables to simplify
• Integration by Parts: For products of functions

Example: To find the area under y = x² from x=0 to x=2:
∫[0 to 2]x²dx = [x³/3]₀² = 8/3 - 0 = 8/3 square units`,
      provider: 'fallback'
    };
  }
  
  // Science questions
  if (lowerQuestion.includes('lightning') || lowerQuestion.includes('thunder')) {
    return {
      answer: `Lightning is a fascinating natural phenomenon! Here's how it works:

The Science:
• Lightning is an electrical discharge between clouds or between clouds and the ground
• It occurs when electrical charges build up in storm clouds
• The discharge can reach temperatures of 30,000°C (54,000°F) - hotter than the sun's surface!

How It Forms:
1. Ice particles in clouds collide and create electrical charges
2. Positive charges gather at the top, negative at the bottom
3. When the charge difference becomes too great, lightning occurs
4. The lightning bolt heats the air, causing it to expand rapidly
5. This rapid expansion creates the sound we hear as thunder

Safety Tips:
• The "30-30 rule": If you see lightning, count to 30. If you hear thunder before reaching 30, seek shelter immediately
• Stay indoors during storms
• Avoid open areas, tall objects, and water`,
      provider: 'fallback'
    };
  }
  
  if (lowerQuestion.includes('photosynthesis')) {
    return {
      answer: `Photosynthesis is how plants make their own food - it's literally the foundation of life on Earth!

The Process:
• Plants use sunlight, water (H₂O), and carbon dioxide (CO₂) to make glucose (C₆H₁₂O₆) and oxygen (O₂)
• The chemical equation: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

Two Main Stages:
1. Light-dependent reactions: Capture sunlight energy in chloroplasts
2. Light-independent reactions (Calvin cycle): Use that energy to make glucose

Why It Matters:
• Produces the oxygen we breathe
• Removes CO₂ from the atmosphere
• Provides food for the entire food chain
• Without photosynthesis, life as we know it wouldn't exist

Fun Fact: Plants are essentially solar-powered factories that convert sunlight into chemical energy!`,
      provider: 'fallback'
    };
  }
  
  // Programming questions
  if (lowerQuestion.includes('loop') || lowerQuestion.includes('for') || lowerQuestion.includes('while')) {
    return {
      answer: `Loops are fundamental in programming - they let you repeat code multiple times efficiently!

Types of Loops:

1. For Loops:
   • Use when you know how many times to repeat
   • Example: for (int i = 0; i < 10; i++) { ... }
   • Great for counting, iterating through arrays

2. While Loops:
   • Repeat while a condition is true
   • Example: while (condition) { ... }
   • Good when you don't know how many iterations you'll need

3. Do-While Loops:
   • Execute at least once, then check condition
   • Example: do { ... } while (condition);

Best Practices:
• Always ensure your loop has a way to end (avoid infinite loops!)
• Use meaningful variable names for counters
• Consider the efficiency - sometimes a different loop type is better

Common Mistakes:
• Off-by-one errors (starting at 0 vs 1)
• Forgetting to update the loop variable
• Creating infinite loops`,
      provider: 'fallback'
    };
  }
  
  if (lowerQuestion.includes('recursion') || lowerQuestion.includes('recursive')) {
    return {
      answer: `Recursion is a powerful programming concept where a function calls itself! It's like a mathematical proof by induction.

Key Components:
1. Base Case: The stopping condition that prevents infinite recursion
2. Recursive Case: The function calls itself with a modified parameter

Classic Example - Factorial:
• factorial(5) = 5 × factorial(4)
• factorial(4) = 4 × factorial(3)
• ...continues until factorial(1) = 1 (base case)

Code Example:
function factorial(n) {
    if (n <= 1) return 1;        // Base case
    return n * factorial(n-1);   // Recursive case
}

When to Use Recursion:
• Tree traversal (file systems, DOM)
• Mathematical sequences (Fibonacci)
• Divide-and-conquer algorithms
• Problems that can be broken into smaller identical problems

Important: Always have a base case, or you'll get a stack overflow!`,
      provider: 'fallback'
    };
  }
  
  // Generic helpful response
  return {
    answer: `I'd be happy to help with your question: "${question}"

Here's a comprehensive approach to understanding this topic:

1. Start with the Basics:
   • Break down the main concepts
   • Look up definitions of key terms
   • Understand the fundamental principles

2. Find Examples:
   • Look for concrete examples that illustrate the concept
   • Practice with simple cases before complex ones
   • Try to relate it to things you already know

3. Practice and Apply:
   • Work through practice problems
   • Try explaining the concept to someone else
   • Apply it to real-world situations

4. Common Study Strategies:
   • Create flashcards for key terms
   • Draw diagrams or mind maps
   • Form study groups with classmates
   • Ask your professor or TA for clarification

5. Additional Resources:
   • Check your textbook for detailed explanations
   • Look for online tutorials or videos
   • Use practice problems from your course materials

Remember: Learning takes time and practice. Don't hesitate to ask for help when you need it!`,
    provider: 'fallback'
  };
}

/**
 * Get in-depth analysis for a question
 */
export async function getInDepthAnalysis(input: StudyAssistanceInput): Promise<AIResponse> {
  const preference = process.env.AI_PROVIDER_PREFERENCE || 'google';
  
  try {
    // Try preferred provider first for detailed analysis
    if (preference === 'google') {
      try {
        const prompt = ai.definePrompt({
          name: 'inDepthAnalysisPrompt',
          input: { schema: z.object({ question: z.string(), context: z.string() }) },
          output: { schema: z.object({ answer: z.string() }) },
          prompt: `IMPORTANT: You must NEVER use markdown formatting symbols like ** or ## or ### or * or #. Write ONLY in plain text. Do not use bold, italics, headers, or any markdown syntax.

You are CourseConnect AI, providing a comprehensive, detailed analysis of the student's question.

Current Context: The student is asking in the context of: '{{context}}'
Student's Question: '{{question}}'

Provide a detailed, comprehensive explanation that includes:
1. Core Concept: Explain the main concept clearly
2. Step-by-Step Process: Break down complex processes
3. Examples: Provide concrete examples and analogies
4. Applications: Show real-world applications
5. Common Mistakes: Highlight what to avoid
6. Practice Suggestions: Recommend exercises or next steps
7. Related Topics: Suggest connected concepts to explore

Make this explanation thorough, educational, and engaging. Use clear language, examples, and analogies to make complex topics accessible.

CRITICAL: NEVER use markdown formatting symbols like ** or ## or ### or * or # or any special formatting characters. Write ONLY in plain text. Do not use bold, italics, headers, or any markdown syntax. Use simple text formatting only.

For mathematical expressions, use LaTeX formatting:
- For inline math: $expression$ (e.g., $f(x) = x^2$)
- For block math: $$expression$$ (e.g., $$\lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$$)
- Use proper LaTeX syntax for fractions, limits, integrals, etc.`,
        });

        const { output } = await prompt(input);
        return {
          answer: output?.answer || 'I apologize, but I couldn\'t generate a detailed analysis.',
          provider: 'google'
        };
      } catch (error) {
        console.warn('Google AI failed for in-depth analysis, trying OpenAI:', error);
        return await tryOpenAIInDepth(input);
      }
    } else {
      try {
        return await tryOpenAIInDepth(input);
      } catch (openaiError) {
        console.warn('OpenAI failed for in-depth analysis, trying Google AI:', openaiError);
        const prompt = ai.definePrompt({
          name: 'inDepthAnalysisPrompt',
          input: { schema: z.object({ question: z.string(), context: z.string() }) },
          output: { schema: z.object({ answer: z.string() }) },
          prompt: `IMPORTANT: You must NEVER use markdown formatting symbols like ** or ## or ### or * or #. Write ONLY in plain text. Do not use bold, italics, headers, or any markdown syntax.

You are CourseConnect AI, providing a comprehensive, detailed analysis of the student's question.

Current Context: The student is asking in the context of: '{{context}}'
Student's Question: '{{question}}'

Provide a detailed, comprehensive explanation that includes:
1. Core Concept: Explain the main concept clearly
2. Step-by-Step Process: Break down complex processes
3. Examples: Provide concrete examples and analogies
4. Applications: Show real-world applications
5. Common Mistakes: Highlight what to avoid
6. Practice Suggestions: Recommend exercises or next steps
7. Related Topics: Suggest connected concepts to explore

Make this explanation thorough, educational, and engaging. Use clear language, examples, and analogies to make complex topics accessible.

CRITICAL: NEVER use markdown formatting symbols like ** or ## or ### or * or # or any special formatting characters. Write ONLY in plain text. Do not use bold, italics, headers, or any markdown syntax. Use simple text formatting only.

For mathematical expressions, use LaTeX formatting:
- For inline math: $expression$ (e.g., $f(x) = x^2$)
- For block math: $$expression$$ (e.g., $$\lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$$)
- Use proper LaTeX syntax for fractions, limits, integrals, etc.`,
        });

        const { output } = await prompt(input);
        return {
          answer: output?.answer || 'I apologize, but I couldn\'t generate a detailed analysis.',
          provider: 'google'
        };
      }
    }
  } catch (error) {
    console.warn('All AI providers failed for in-depth analysis:', error);
    return {
      answer: `I apologize, but I'm experiencing technical difficulties with my AI services for detailed analysis. Here's a basic detailed response to your question: "${input.question}"

Core Concept: This topic involves understanding the fundamental principles and key concepts related to your question.

Key Points:
- Understanding the basics is essential
- Practice helps reinforce learning
- Asking specific questions leads to better understanding

Applications: This knowledge can be applied in various real-world situations and academic contexts.

Next Steps: Consider exploring related topics or asking more specific questions.`,
      provider: 'fallback'
    };
  }
}

/**
 * Try OpenAI for in-depth analysis
 */
async function tryOpenAIInDepth(input: StudyAssistanceInput): Promise<AIResponse> {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey || openaiApiKey === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key not configured');
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `IMPORTANT: You must NEVER use markdown formatting symbols like ** or ## or ### or * or #. Write ONLY in plain text. Do not use bold, italics, headers, or any markdown syntax.

You are CourseConnect AI, providing a comprehensive, detailed analysis of the student's question.

Provide a detailed, comprehensive explanation that includes:
1. Core Concept: Explain the main concept clearly
2. Step-by-Step Process: Break down complex processes
3. Examples: Provide concrete examples and analogies
4. Applications: Show real-world applications
5. Common Mistakes: Highlight what to avoid
6. Practice Suggestions: Recommend exercises or next steps
7. Related Topics: Suggest connected concepts to explore

Make this explanation thorough, educational, and engaging. Use clear language, examples, and analogies to make complex topics accessible. 

CRITICAL: NEVER use markdown formatting symbols like ** or ## or ### or * or # or any special formatting characters. Write ONLY in plain text. Do not use bold, italics, headers, or any markdown syntax. Use simple text formatting only.

For mathematical expressions, use LaTeX formatting:
- For inline math: $expression$ (e.g., $f(x) = x^2$)
- For block math: $$expression$$ (e.g., $$\lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$$)
- Use proper LaTeX syntax for fractions, limits, integrals, etc.`
        },
        {
          role: 'user',
          content: `Context: ${input.context}\n\nQuestion: ${input.question}\n\nPlease provide a detailed, comprehensive analysis.`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const answer = response.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a detailed analysis.';
    
    return {
      answer,
      provider: 'openai'
    };
  } catch (error) {
    console.warn('OpenAI failed for in-depth analysis:', error);
    throw error;
  }
}

/**
 * Main function that tries providers in order with automatic fallback
 */
export async function provideStudyAssistanceWithFallback(input: StudyAssistanceInput): Promise<AIResponse> {
  const preference = process.env.AI_PROVIDER_PREFERENCE || 'fallback';
  
  // If preference is set to fallback or no API keys are available, use fallback directly
  if (preference === 'fallback' || 
      (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-key' || process.env.OPENAI_API_KEY === '') &&
      (!process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY === 'demo-key' || process.env.GOOGLE_AI_API_KEY === '')) {
    console.log('Using enhanced fallback responses (no API keys configured)');
    return getEnhancedFallback(input);
  }
  
  try {
    // Try preferred provider first
    if (preference === 'google') {
      try {
        return await tryGoogleAI(input);
      } catch (googleError) {
        console.warn('Google AI failed, trying OpenAI:', googleError);
        return await tryOpenAI(input);
      }
    } else {
      try {
        return await tryOpenAI(input);
      } catch (openaiError) {
        console.warn('OpenAI failed, trying Google AI:', openaiError);
        return await tryGoogleAI(input);
      }
    }
  } catch (error) {
    console.warn('Both AI providers failed, using enhanced fallback:', error);
    return getEnhancedFallback(input);
  }
}


/**
 * Legacy function for backward compatibility
 */
export async function provideStudyAssistance(input: StudyAssistanceInput): Promise<{ isRelevant: boolean; answer: string }> {
  const result = await provideStudyAssistanceWithFallback(input);
  return {
    isRelevant: true,
    answer: result.answer
  };
}

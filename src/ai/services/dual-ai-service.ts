'use server';

/**
 * @fileOverview Dual AI Provider Service with Automatic Fallback
 * 
 * This service tries Google AI (Gemini) first, and if it fails,
 * automatically falls back to OpenAI (ChatGPT).
 */

import { genkit } from 'genkit';
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
    if (!googleApiKey || googleApiKey === 'your_google_ai_api_key_here') {
      throw new Error('Google AI API key not configured');
    }

    const prompt = ai.definePrompt({
      name: 'provideStudyAssistancePrompt',
      input: { schema: { question: 'string', context: 'string' } },
      output: { schema: { answer: 'string' } },
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
    if (!openaiApiKey || openaiApiKey === 'your_openai_api_key_here') {
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
  
  // Science questions
  if (lowerQuestion.includes('lightning') || lowerQuestion.includes('thunder')) {
    return {
      answer: `Lightning is an electrical discharge that occurs when electrical charges build up in storm clouds and discharge to the ground or other clouds. It's nature's way of balancing electrical charges in the atmosphere.`,
      provider: 'fallback'
    };
  }
  
  if (lowerQuestion.includes('photosynthesis')) {
    return {
      answer: `Photosynthesis is how plants make their own food using sunlight, water, and carbon dioxide to produce glucose and oxygen. It's the process that keeps most life on Earth alive by producing the oxygen we breathe.`,
      provider: 'fallback'
    };
  }
  
  // Math questions
  if (lowerQuestion.includes('derivative') || lowerQuestion.includes('calculus')) {
    return {
      answer: `A derivative measures how fast a function is changing at any point - think of it as the "slope" of a curve. It's fundamental to calculus and helps us understand rates of change in real-world situations.`,
      provider: 'fallback'
    };
  }
  
  // Programming questions
  if (lowerQuestion.includes('loop') || lowerQuestion.includes('for') || lowerQuestion.includes('while')) {
    return {
      answer: `Loops repeat code multiple times - 'for' loops when you know how many times, 'while' loops until a condition is met. They're essential for automating repetitive tasks in programming.`,
      provider: 'fallback'
    };
  }
  
  // Generic helpful response
  return {
    answer: `I'd be happy to help with your question: "${question}"\n\nI'm currently running in fallback mode, so I can provide basic explanations but may not have access to the full AI capabilities.`,
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
          input: { schema: { question: 'string', context: 'string' } },
          output: { schema: { answer: 'string' } },
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
          input: { schema: { question: 'string', context: 'string' } },
          output: { schema: { answer: 'string' } },
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
  const preference = process.env.AI_PROVIDER_PREFERENCE || 'google';
  
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

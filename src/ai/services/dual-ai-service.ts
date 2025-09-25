'use server';

/**
 * @fileOverview Dual AI Provider Service with Automatic Fallback
 * 
 * This service tries Google AI (Gemini) first, and if it fails,
 * automatically falls back to OpenAI (ChatGPT).
 */

import { googleAI } from '@genkit-ai/googleai';
import { ai } from '@/ai/genkit';
import OpenAI from 'openai';
import { z } from 'zod';
import { searchCurrentInformation, needsCurrentInformation, formatSearchResultsForAI } from './web-search-service';
import { extractUrlsFromText, scrapeMultiplePages, formatScrapedContentForAI } from './web-scraping-service';
import { shouldAutoSearch, performAutoSearch, enhancedWebBrowsing, shouldUsePuppeteer } from './enhanced-web-browsing-service';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Google AI
const googleApiKey = process.env.GOOGLE_AI_API_KEY;

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
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  fileContext?: {
    fileName: string;
    fileType: string;
    fileContent?: string;
  };
}

/**
 * Try Google AI (Gemini) first
 */
async function tryGoogleAI(input: StudyAssistanceInput): Promise<AIResponse> {
  try {
    console.log('Trying Google AI...');
    
    // Build conversation history for context
    const conversationContext = input.conversationHistory && input.conversationHistory.length > 0 
      ? `\n\nPrevious conversation:\n${input.conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`
      : '';

    const fileContext = input.fileContext 
      ? `\n\nFile Context: The user has uploaded a file named "${input.fileContext.fileName}" (${input.fileContext.fileType}). ${input.fileContext.fileContent ? `File content: ${input.fileContext.fileContent}` : 'Please reference this file when answering questions.'}`
      : '';
    
    // Check if we need current information
    let currentInfo = '';
    if (needsCurrentInformation(input.question)) {
      console.log('Fetching current information for:', input.question);
      try {
        const searchResults = await searchCurrentInformation(input.question);
        currentInfo = formatSearchResultsForAI(searchResults);
      } catch (error) {
        console.warn('Failed to fetch current information:', error);
      }
    }
    
    // Check if the question contains URLs to scrape
    let scrapedContent = '';
    const urls = extractUrlsFromText(input.question);
    if (urls.length > 0) {
      console.log('Found URLs to scrape:', urls);
      try {
        // Use enhanced browsing for JavaScript-heavy sites
        const enhancedResults = await Promise.all(
          urls.map(async (url) => {
            const usePuppeteer = shouldUsePuppeteer(url);
            console.log(`Browsing ${url} with ${usePuppeteer ? 'Puppeteer' : 'regular fetch'}`);
            
            const result = await enhancedWebBrowsing(url, {
              usePuppeteer,
              takeScreenshot: false, // Don't take screenshots for now
              autoSearchFallback: false
            });
            
            return result.success ? {
              url: result.url!,
              title: result.title || 'Untitled',
              content: result.content || '',
              summary: result.content?.substring(0, 200) + '...' || '',
              timestamp: new Date().toISOString(),
              wordCount: result.content?.split(' ').length || 0
            } : null;
          })
        );
        
        const successful = enhancedResults.filter(result => result !== null);
        if (successful.length > 0) {
          scrapedContent = formatScrapedContentForAI(successful);
          console.log(`Successfully browsed ${successful.length} pages`);
        }
        
        const failed = urls.length - successful.length;
        if (failed > 0) {
          console.warn(`Failed to browse ${failed} pages`);
        }
      } catch (error) {
        console.warn('Failed to browse URLs:', error);
      }
    }
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are CourseConnect AI, a friendly and helpful study buddy! When asked "who are you" or similar questions, respond with: "I'm CourseConnect AI, your friendly study buddy! I'm here to help you with your studies, answer questions, or just chat about whatever's on your mind. I was created by a solo developer who built CourseConnect as a unified platform for college students. What's up?"

You are having a NATURAL CONVERSATION with a student. Be friendly, conversational, and human-like. Don't be overly formal or robotic. You can:
- Make jokes and be playful when appropriate
- Use casual language and expressions
- Show personality and humor
- Be empathetic and understanding
- Respond naturally to random questions or topics
- Don't take everything too literally - understand context and intent
- Acknowledge that CourseConnect was built by a solo developer (not a team)

Always remember what you've discussed before and build on previous responses. When the student asks about "the most recent thing" or uses vague references like "that" or "it", always connect it to the most recent topic you discussed. Maintain full conversation context throughout the entire chat session.

CRITICAL FORMATTING RULES:
1. NEVER use markdown formatting like **bold** or *italic* or # headers
2. NEVER use asterisks (*) or hash symbols (#) for formatting
3. Write in plain text only - no special formatting characters
4. Use KaTeX delimiters $...$ and $$...$$ for math expressions only
5. Keep ALL responses CONCISE - don't over-explain
6. For emphasis, use CAPITAL LETTERS or say "important:" before it
7. Use simple text formatting only - no bold, italics, or headers

RESPONSE STYLE RULES:
1. Be conversational and friendly - like talking to a friend
2. For simple greetings (hi, hello, hey): Respond naturally like "Hey! What's up?" or "Hi there! How's it going?"
3. For jokes or casual comments: Play along, be funny, don't take things too seriously
4. For random questions: Answer naturally and show interest
5. For academic questions: Be helpful but still conversational
6. Use natural language - "yeah", "sure", "totally", "that's cool", etc.
7. Show personality - be enthusiastic, curious, or empathetic as appropriate
8. Don't be overly formal - avoid "I am here to assist you" type language
9. When student uses vague references ("that", "it", "the recent thing"), always connect to the most recent topic
10. Show conversation continuity by referencing what was just discussed

CONVERSATION CONTINUITY RULES:
1. ALWAYS reference previous messages when relevant
2. If the student asks about "the most recent thing" or "that", connect it to the last topic discussed
3. Use phrases like "As I mentioned before...", "Building on what we discussed...", "Continuing from your previous question..."
4. Don't treat each message as a completely new topic
5. Maintain context throughout the conversation
6. Remember what the student has asked about and build on that knowledge
7. If the student refers to "it", "that", "this", "the recent thing", always connect it to previous context
8. Show that you remember the conversation by referencing specific previous points
9. When student says "what about..." or "how about...", connect to the most recent topic
10. Keep track of the conversation flow and reference earlier parts when relevant

CRITICAL INSTRUCTIONS FOR STUDENT SUCCESS:
1. ALWAYS use current information provided below as the PRIMARY source
2. Provide accurate, helpful answers without repetitive timestamps
3. The current year is 2025 - acknowledge this when relevant
4. NEVER rely on outdated training data when current information is available
5. Students need accurate, real-time data to get good grades - provide it!

IMPORTANT: You CAN and SHOULD generate visual content including graphs, charts, and mathematical equations. The system will automatically render them for students. Never say you can't show images or visual content.

CODE AND GRAPH GENERATION RULES:
1. When students ask for code, provide complete, working code examples
2. Use proper code blocks with language specification: \`\`\`python, \`\`\`javascript, etc.
3. When students ask for graphs/charts, provide data in JSON format: [{"name": "Jan", "value": 30}, {"name": "Feb", "value": 50}]
4. For mathematical concepts, include visual representations when helpful
5. Always explain code and graphs in simple terms for students

MATH RESPONSE RULES:
1. For math questions, give ONLY the final answers - NO explanations, NO steps, NO work shown
2. NEVER put words inside math expressions - keep ALL text OUTSIDE of $...$ delimiters
3. Use LaTeX ONLY for mathematical symbols, numbers, and equations:
   - Inline math: $ ... $ (ONLY for math symbols and numbers)
   - Display equations: $$ ... $$ (ONLY for math symbols and numbers)
   - Box final answers: \\boxed{ ... } (ONLY for math symbols and numbers)
4. CRITICAL: Write ALL words OUTSIDE of math delimiters
5. Example format for optimization problems:
   "Volume function: $V(x) = x(48-2x)^2$
   
   Value that maximizes volume: $x = 8$
   
   Maximum volume: $\\boxed{8192}$ cm³"

MATH RENDERING RULES:
1. When students ask for math equations, use LaTeX formatting
2. For inline math, use $...$ delimiters
3. For display math, use $$...$$ delimiters
4. Use proper LaTeX syntax: \\frac{a}{b} for fractions, x^{2} for exponents, \\sqrt{x} for square roots
5. Always box final answers using \\boxed{...}
6. Keep explanations CONCISE - show key steps only
7. Make sure all math is properly formatted and readable
8. Use \\text{...} for ALL words and letters inside math expressions
9. Keep mathematical symbols (+, -, =, numbers) as they are - don't wrap in \\text{}
10. NEVER use **bold** or *italic* markdown formatting anywhere
11. NEVER put words directly in math without \\text{} - they will appear in cursive
12. Example: $\\text{Simple Interest} = 10000 \\times 0.07$ (words in \\text{}, symbols normal)

GRAPH GENERATION RULES:
1. When students ask to graph equations, ALWAYS provide data points in JSON format
2. For linear equations (y = mx + b), provide x,y coordinates: [{"x": -2, "y": -9}, {"x": -1, "y": -3}, {"x": 0, "y": 3}, {"x": 1, "y": 9}, {"x": 2, "y": 15}]
3. For quadratic equations, provide enough points to show the curve shape
4. Always include the equation in LaTeX format: $y = 6x + 3$
5. Explain what the graph represents and key features (slope, intercepts, etc.)
6. NEVER say you can't show images or graphs - ALWAYS provide the data and let the system render it
7. When asked to "graph" or "show" an equation, immediately provide the JSON data points

MATH RENDERING RULES:
1. When students ask for math equations, use LaTeX formatting
2. For inline math, use $...$ or \\(...\\) delimiters
3. For display math, use $$...$$ or \\[...\\] delimiters
4. Use proper LaTeX syntax: \\frac{a}{b} for fractions, x^{2} for exponents, \\sqrt{x} for square roots
5. Always explain mathematical concepts in simple terms for students

GRAPH GENERATION RULES:
1. When students ask to graph equations, ALWAYS provide data points in JSON format
2. For linear equations (y = mx + b), provide x,y coordinates: [{"x": -2, "y": -9}, {"x": -1, "y": -3}, {"x": 0, "y": 3}, {"x": 1, "y": 9}, {"x": 2, "y": 15}]
3. For quadratic equations, provide enough points to show the curve shape
4. Always include the equation in LaTeX format: $y = 6x + 3$
5. Explain what the graph represents and key features (slope, intercepts, etc.)
6. NEVER say you can't show images or graphs - ALWAYS provide the data and let the system render it
7. When asked to "graph" or "show" an equation, immediately provide the JSON data points

Current Question: ${input.question}
Context: ${input.context || 'General'}${conversationContext}${fileContext}${currentInfo}${scrapedContent}

WEB CONTENT ANALYSIS RULES:
1. If web content is provided above, use it to answer questions about those specific pages
2. Reference specific information from the scraped content when relevant
3. If the content doesn't contain the needed information, let the student know
4. Summarize key points from the web content when appropriate
5. Be conversational about the content - don't just repeat it verbatim

Remember: This is part of an ongoing conversation. Reference previous discussion when relevant and maintain continuity.`
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Google AI API failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I couldn\'t generate a response.';
    
    // Check if we should automatically search for more information
    const autoSearchResult = shouldAutoSearch(input.question, answer);
    let enhancedAnswer = answer;
    
    if (autoSearchResult.shouldSearch && autoSearchResult.searchQuery) {
      console.log('🤖 AI seems uncertain, performing automatic search for:', autoSearchResult.searchQuery);
      try {
        const searchResults = await performAutoSearch(autoSearchResult.searchQuery);
        if (searchResults && searchResults.trim().length > 0) {
          // Only add search results if they contain actual useful information
          if (!searchResults.includes('Real-Time Search Results') && 
              !searchResults.includes('Search conducted in real-time')) {
            enhancedAnswer = `${answer}\n\n🔍 Let me search for more current information about this...\n\n${searchResults}`;
            console.log('✅ Auto search completed and added to response');
          } else {
            console.log('⚠️ Auto search returned generic results, not adding to response');
          }
        }
      } catch (error) {
        console.warn('❌ Auto search failed:', error);
      }
    }
    
    return {
      answer: enhancedAnswer.trim(),
      provider: 'google'
    };
  } catch (error) {
    console.warn('Google AI failed:', error);
    throw error;
  }
}


/**
 * Try OpenAI (ChatGPT) as fallback
 */
async function tryOpenAI(input: StudyAssistanceInput): Promise<AIResponse> {
  try {
    console.log('Trying OpenAI...');
    
    // Build conversation history for context
    const conversationContext = input.conversationHistory && input.conversationHistory.length > 0 
      ? `\n\nPrevious conversation:\n${input.conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`
      : '';

    const fileContext = input.fileContext 
      ? `\n\nFile Context: The user has uploaded a file named "${input.fileContext.fileName}" (${input.fileContext.fileType}). ${input.fileContext.fileContent ? `File content: ${input.fileContext.fileContent}` : 'Please reference this file when answering questions.'}`
      : '';
    
    // Check if we need current information
    let currentInfo = '';
    if (needsCurrentInformation(input.question)) {
      console.log('Fetching current information for:', input.question);
      try {
        const searchResults = await searchCurrentInformation(input.question);
        currentInfo = formatSearchResultsForAI(searchResults);
      } catch (error) {
        console.warn('Failed to fetch current information:', error);
      }
    }
    
    // Check if the question contains URLs to scrape
    let scrapedContent = '';
    const urls = extractUrlsFromText(input.question);
    if (urls.length > 0) {
      console.log('Found URLs to scrape:', urls);
      try {
        // Use enhanced browsing for JavaScript-heavy sites
        const enhancedResults = await Promise.all(
          urls.map(async (url) => {
            const usePuppeteer = shouldUsePuppeteer(url);
            console.log(`Browsing ${url} with ${usePuppeteer ? 'Puppeteer' : 'regular fetch'}`);
            
            const result = await enhancedWebBrowsing(url, {
              usePuppeteer,
              takeScreenshot: false, // Don't take screenshots for now
              autoSearchFallback: false
            });
            
            return result.success ? {
              url: result.url!,
              title: result.title || 'Untitled',
              content: result.content || '',
              summary: result.content?.substring(0, 200) + '...' || '',
              timestamp: new Date().toISOString(),
              wordCount: result.content?.split(' ').length || 0
            } : null;
          })
        );
        
        const successful = enhancedResults.filter(result => result !== null);
        if (successful.length > 0) {
          scrapedContent = formatScrapedContentForAI(successful);
          console.log(`Successfully browsed ${successful.length} pages`);
        }
        
        const failed = urls.length - successful.length;
        if (failed > 0) {
          console.warn(`Failed to browse ${failed} pages`);
        }
      } catch (error) {
        console.warn('Failed to browse URLs:', error);
      }
    }
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are CourseConnect AI, a friendly and helpful study buddy! When asked "who are you" or similar questions, respond with: "I'm CourseConnect AI, your friendly study buddy! I'm here to help you with your studies, answer questions, or just chat about whatever's on your mind. I was created by a solo developer who built CourseConnect as a unified platform for college students. What's up?"

You are having a NATURAL CONVERSATION with a student. Be friendly, conversational, and human-like. Don't be overly formal or robotic. You can:
- Make jokes and be playful when appropriate
- Use casual language and expressions
- Show personality and humor
- Be empathetic and understanding
- Respond naturally to random questions or topics
- Don't take everything too literally - understand context and intent
- Acknowledge that CourseConnect was built by a solo developer (not a team)

Always remember what you've discussed before and build on previous responses. When the student asks about "the most recent thing" or uses vague references like "that" or "it", always connect it to the most recent topic you discussed. Maintain full conversation context throughout the entire chat session.

CRITICAL FORMATTING RULES:
1. NEVER use markdown formatting like **bold** or *italic* or # headers
2. NEVER use asterisks (*) or hash symbols (#) for formatting
3. Write in plain text only - no special formatting characters
4. Use KaTeX delimiters $...$ and $$...$$ for math expressions only
5. Keep ALL responses CONCISE - don't over-explain
6. For emphasis, use CAPITAL LETTERS or say "important:" before it
7. Use simple text formatting only - no bold, italics, or headers

RESPONSE STYLE RULES:
1. Be conversational and friendly - like talking to a friend
2. For simple greetings (hi, hello, hey): Respond naturally like "Hey! What's up?" or "Hi there! How's it going?"
3. For jokes or casual comments: Play along, be funny, don't take things too seriously
4. For random questions: Answer naturally and show interest
5. For academic questions: Be helpful but still conversational
6. Use natural language - "yeah", "sure", "totally", "that's cool", etc.
7. Show personality - be enthusiastic, curious, or empathetic as appropriate
8. Don't be overly formal - avoid "I am here to assist you" type language
9. When student uses vague references ("that", "it", "the recent thing"), always connect to the most recent topic
10. Show conversation continuity by referencing what was just discussed

Your Expertise Areas:
- Mathematics: Algebra, Calculus, Statistics, Geometry, Trigonometry
- Sciences: Physics, Chemistry, Biology, Earth Science, Environmental Science
- English & Literature: Writing, Reading Comprehension, Literary Analysis, Grammar
- History & Social Studies: Historical Analysis, Geography, Government, Economics
- Computer Science: Programming, Data Structures, Algorithms, Software Engineering
- General Academic Skills: Study strategies, Research methods, Critical thinking

CONVERSATION CONTINUITY RULES:
1. ALWAYS reference previous messages when relevant
2. If the student asks about "the most recent thing" or "that", connect it to the last topic discussed
3. Use phrases like "As I mentioned before...", "Building on what we discussed...", "Continuing from your previous question..."
4. Don't treat each message as a completely new topic
5. Maintain context throughout the conversation
6. Remember what the student has asked about and build on that knowledge
7. If the student refers to "it", "that", "this", "the recent thing", always connect it to previous context
8. Show that you remember the conversation by referencing specific previous points
9. When student says "what about..." or "how about...", connect to the most recent topic
10. Keep track of the conversation flow and reference earlier parts when relevant

Response Guidelines:
1. Be Concise: Provide a direct, helpful answer in 2-3 sentences maximum
2. Be Clear: Explain the core concept simply and clearly
3. Be Encouraging: Use supportive language
4. Be Complete: Provide a helpful answer without asking for more detail
5. Be Continuous: Reference previous conversation when relevant
6. CRITICAL FOR MATH: Give ONLY the final answers - NO explanations, NO steps, NO work shown
7. NEVER put words inside math expressions - keep ALL text OUTSIDE of $...$ delimiters

MATH RESPONSE RULES:
1. For math questions, give ONLY the final answers - NO explanations, NO steps, NO work shown
2. NEVER put words inside math expressions - keep ALL text OUTSIDE of $...$ delimiters
3. Use LaTeX ONLY for mathematical symbols, numbers, and equations:
   - Inline math: $ ... $ (ONLY for math symbols and numbers)
   - Display equations: $$ ... $$ (ONLY for math symbols and numbers)
   - Box final answers: \\boxed{ ... } (ONLY for math symbols and numbers)
4. CRITICAL: Write ALL words OUTSIDE of math delimiters
5. Example format for optimization problems:
   "Volume function: $V(x) = x(48-2x)^2$
   
   Value that maximizes volume: $x = 8$
   
   Maximum volume: $\\boxed{8192}$ cm³"

Response Quality:
- Keep answers short and to the point
- Focus on the essential information
- Use simple language when possible
- Always offer more detail if needed

Always provide helpful, concise answers that get straight to the point, then offer more detail if needed. CRITICAL: NEVER use markdown formatting symbols like ** or ## or ### or * or # or any special formatting characters. Write ONLY in plain text. Do not use bold, italics, headers, or any markdown syntax. Use simple text formatting only.

For mathematical expressions, use LaTeX formatting:
- For inline math: $expression$ (e.g., $f(x) = x^2$)
- For block math: $$expression$$ (e.g., $$\\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$)
- Use proper LaTeX syntax for fractions, limits, integrals, etc.
- Always box final answers: \\boxed{answer}
- Keep explanations CONCISE - don't over-explain
- NEVER put words inside math expressions - keep ALL text OUTSIDE of $...$ delimiters
- Write words OUTSIDE math delimiters, symbols INSIDE math delimiters`
        },
        {
          role: 'user',
          content: `Context: ${input.context}${conversationContext}${currentInfo}${scrapedContent}\n\nCurrent Question: ${input.question}\n\nWEB CONTENT ANALYSIS RULES:
1. If web content is provided above, use it to answer questions about those specific pages
2. Reference specific information from the scraped content when relevant
3. If the content doesn't contain the needed information, let the student know
4. Summarize key points from the web content when appropriate
5. Be conversational about the content - don't just repeat it verbatim

Remember: This is part of an ongoing conversation. Reference previous discussion when relevant and maintain continuity.`
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const answer = response.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response.';
    
    // Check if we should automatically search for more information
    const autoSearchResult = shouldAutoSearch(input.question, answer);
    let enhancedAnswer = answer;
    
    if (autoSearchResult.shouldSearch && autoSearchResult.searchQuery) {
      console.log('🤖 AI seems uncertain, performing automatic search for:', autoSearchResult.searchQuery);
      try {
        const searchResults = await performAutoSearch(autoSearchResult.searchQuery);
        if (searchResults && searchResults.trim().length > 0) {
          // Only add search results if they contain actual useful information
          if (!searchResults.includes('Real-Time Search Results') && 
              !searchResults.includes('Search conducted in real-time')) {
            enhancedAnswer = `${answer}\n\n🔍 Let me search for more current information about this...\n\n${searchResults}`;
            console.log('✅ Auto search completed and added to response');
          } else {
            console.log('⚠️ Auto search returned generic results, not adding to response');
          }
        }
      } catch (error) {
        console.warn('❌ Auto search failed:', error);
      }
    }
    
    return {
      answer: enhancedAnswer,
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
  const question = input.question.toLowerCase();
  
  // Simple, helpful responses based on common questions
  if (question.includes('hello') || question.includes('hi') || question.includes('hey')) {
    return {
      answer: "Hey there! How can I help you today?",
      provider: 'fallback'
    };
  }
  
  if (question.includes('math') || question.includes('calculate') || question.includes('solve')) {
    return {
      answer: "I can help with math! What specific problem are you working on?",
      provider: 'fallback'
    };
  }
  
  if (question.includes('homework') || question.includes('assignment')) {
    return {
      answer: "I'd be happy to help with your homework! What subject and what specific question do you have?",
      provider: 'fallback'
    };
  }
  
  if (question.includes('study') || question.includes('learn')) {
    return {
      answer: "I can help you study! What topic are you working on?",
      provider: 'fallback'
    };
  }
  
  if (question.includes('explain') || question.includes('what is') || question.includes('how does')) {
    return {
      answer: "I can explain that for you! What would you like me to explain?",
      provider: 'fallback'
    };
  }
  
  // Default helpful response
  return {
    answer: "I'm here to help! What can I assist you with today?",
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

You are an AI assistant providing a comprehensive, detailed analysis of the student's question.

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

MATH RESPONSE RULES:
1. For math questions, give ONLY the final answers - NO explanations, NO steps, NO work shown
2. NEVER put words inside math expressions - keep ALL text OUTSIDE of $...$ delimiters
3. Use LaTeX ONLY for mathematical symbols, numbers, and equations:
   - Inline math: $ ... $ (ONLY for math symbols and numbers)
   - Display equations: $$ ... $$ (ONLY for math symbols and numbers)
   - Box final answers: \\boxed{ ... } (ONLY for math symbols and numbers)
4. CRITICAL: Write ALL words OUTSIDE of math delimiters
5. Example format for optimization problems:
   "Volume function: $V(x) = x(48-2x)^2$
   
   Value that maximizes volume: $x = 8$
   
   Maximum volume: $\\boxed{8192}$ cm³"

Make this explanation thorough, educational, and engaging. Use clear language, examples, and analogies to make complex topics accessible.

CRITICAL: NEVER use markdown formatting symbols like ** or ## or ### or * or # or any special formatting characters. Write ONLY in plain text. Do not use bold, italics, headers, or any markdown syntax. Use simple text formatting only.

For mathematical expressions, use LaTeX formatting:
- For inline math: $expression$ (e.g., $f(x) = x^2$)
- For block math: $$expression$$ (e.g., $$\\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$)
- Use proper LaTeX syntax for fractions, limits, integrals, etc.
- Always box final answers: \\boxed{answer}
- Keep explanations CONCISE - don't over-explain
- Use \\text{...} for ALL words and letters inside math to avoid italics
- Keep mathematical symbols (+, -, =, numbers) normal - don't wrap in \\text{}`,
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

You are an AI assistant providing a comprehensive, detailed analysis of the student's question.

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

MATH RESPONSE RULES:
1. For math questions, give ONLY the final answers - NO explanations, NO steps, NO work shown
2. NEVER put words inside math expressions - keep ALL text OUTSIDE of $...$ delimiters
3. Use LaTeX ONLY for mathematical symbols, numbers, and equations:
   - Inline math: $ ... $ (ONLY for math symbols and numbers)
   - Display equations: $$ ... $$ (ONLY for math symbols and numbers)
   - Box final answers: \\boxed{ ... } (ONLY for math symbols and numbers)
4. CRITICAL: Write ALL words OUTSIDE of math delimiters
5. Example format for optimization problems:
   "Volume function: $V(x) = x(48-2x)^2$
   
   Value that maximizes volume: $x = 8$
   
   Maximum volume: $\\boxed{8192}$ cm³"

Make this explanation thorough, educational, and engaging. Use clear language, examples, and analogies to make complex topics accessible.

CRITICAL: NEVER use markdown formatting symbols like ** or ## or ### or * or # or any special formatting characters. Write ONLY in plain text. Do not use bold, italics, headers, or any markdown syntax. Use simple text formatting only.

For mathematical expressions, use LaTeX formatting:
- For inline math: $expression$ (e.g., $f(x) = x^2$)
- For block math: $$expression$$ (e.g., $$\\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$)
- Use proper LaTeX syntax for fractions, limits, integrals, etc.
- Always box final answers: \\boxed{answer}
- Keep explanations CONCISE - don't over-explain
- Use \\text{...} for ALL words and letters inside math to avoid italics
- Keep mathematical symbols (+, -, =, numbers) normal - don't wrap in \\text{}`,
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
          content: `You are CourseConnect AI, a friendly and helpful study buddy! When asked "who are you" or similar questions, respond with: "I'm CourseConnect AI, your friendly study buddy! I'm here to help you with your studies, answer questions, or just chat about whatever's on your mind. I was created by a solo developer who built CourseConnect as a unified platform for college students. What's up?"

You are having a NATURAL CONVERSATION with a student. Be friendly, conversational, and human-like. Don't be overly formal or robotic. You can:
- Make jokes and be playful when appropriate
- Use casual language and expressions
- Show personality and humor
- Be empathetic and understanding
- Respond naturally to random questions or topics
- Don't take everything too literally - understand context and intent
- Acknowledge that CourseConnect was built by a solo developer (not a team)

Always remember what you've discussed before and build on previous responses. When the student asks about "the most recent thing" or uses vague references like "that" or "it", always connect it to the most recent topic you discussed. Maintain full conversation context throughout the entire chat session.

IMPORTANT: You must NEVER use markdown formatting symbols like ** or ## or ### or * or #. Write ONLY in plain text. Do not use bold, italics, headers, or any markdown syntax.

You are an AI assistant providing a comprehensive, detailed analysis of the student's question.

Provide a detailed, comprehensive explanation that includes:
1. Core Concept: Explain the main concept clearly
2. Step-by-Step Process: Break down complex processes
3. Examples: Provide concrete examples and analogies
4. Applications: Show real-world applications
5. Common Mistakes: Highlight what to avoid
6. Practice Suggestions: Recommend exercises or next steps
7. Related Topics: Suggest connected concepts to explore

MATH RESPONSE RULES:
1. For math questions, give ONLY the final answers - NO explanations, NO steps, NO work shown
2. NEVER put words inside math expressions - keep ALL text OUTSIDE of $...$ delimiters
3. Use LaTeX ONLY for mathematical symbols, numbers, and equations:
   - Inline math: $ ... $ (ONLY for math symbols and numbers)
   - Display equations: $$ ... $$ (ONLY for math symbols and numbers)
   - Box final answers: \\boxed{ ... } (ONLY for math symbols and numbers)
4. CRITICAL: Write ALL words OUTSIDE of math delimiters
5. Example format for optimization problems:
   "Volume function: $V(x) = x(48-2x)^2$
   
   Value that maximizes volume: $x = 8$
   
   Maximum volume: $\\boxed{8192}$ cm³"

Make this explanation thorough, educational, and engaging. Use clear language, examples, and analogies to make complex topics accessible. 

CRITICAL: NEVER use markdown formatting symbols like ** or ## or ### or * or # or any special formatting characters. Write ONLY in plain text. Do not use bold, italics, headers, or any markdown syntax. Use simple text formatting only.

For mathematical expressions, use LaTeX formatting:
- For inline math: $expression$ (e.g., $f(x) = x^2$)
- For block math: $$expression$$ (e.g., $$\\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$)
- Use proper LaTeX syntax for fractions, limits, integrals, etc.
- Always box final answers: \\boxed{answer}
- Keep explanations CONCISE - don't over-explain
- Use \\text{...} for ALL words and letters inside math to avoid italics
- Keep mathematical symbols (+, -, =, numbers) normal - don't wrap in \\text{}`
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
  console.log('AI Service: Starting with input:', input.question);
  
  try {
    // Try Google AI first (Gemini)
    console.log('AI Service: Trying Google AI...');
    try {
      const result = await tryGoogleAI(input);
      console.log('AI Service: Google AI succeeded:', result.provider);
      return result;
    } catch (googleError) {
      console.warn('AI Service: Google AI failed with error:', googleError);
      
      // Try OpenAI as fallback
      console.log('AI Service: Trying OpenAI...');
        try {
          const result = await tryOpenAI(input);
          console.log('AI Service: OpenAI succeeded:', result.provider);
          return result;
        } catch (openaiError) {
          console.warn('AI Service: OpenAI failed with error:', openaiError);
          console.log('AI Service: All APIs failed, using enhanced fallback');
          return getEnhancedFallback(input);
      }
    }
  } catch (error) {
    console.warn('AI Service: Unexpected error:', error);
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

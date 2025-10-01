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
import { OllamaModelManager } from '@/lib/ollama-model-manager';

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Initialize Google AI
const googleApiKey = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE;

// AI Provider Types
export type AIProvider = 'google' | 'openai' | 'fallback';

export interface AIResponse {
  answer: string;
  provider: AIProvider;
  error?: string;
  sources?: {
    title: string;
    url: string;
    snippet: string;
  }[];
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
    
    // Validate API key
    if (!googleApiKey || googleApiKey === 'demo-key' || googleApiKey === 'your_google_ai_key_here') {
      throw new Error('Google AI API key not configured');
    }
    
    // Build conversation history for context
    const conversationContext = input.conversationHistory && input.conversationHistory.length > 0 
      ? `\n\nPrevious conversation:\n${input.conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`
      : '';

    const fileContext = input.fileContext 
      ? `\n\nFile Context: The user has uploaded a file named "${input.fileContext.fileName}" (${input.fileContext.fileType}). ${input.fileContext.fileContent ? `File content: ${input.fileContext.fileContent}` : 'Please reference this file when answering questions.'}`
      : '';
    
    // Always fetch current information for better responses
    let currentInfo = '';
      console.log('Fetching current information for:', input.question);
      try {
        const searchResults = await searchCurrentInformation(input.question);
        currentInfo = formatSearchResultsForAI(searchResults);
      } catch (error) {
        console.warn('Failed to fetch current information:', error);
      // Provide fallback current info
      currentInfo = `\n\nCurrent Information Context: This response is generated in real-time to provide the most accurate and up-to-date information available.\n`;
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
1. For math questions, provide clear, step-by-step solutions with the final answer boxed
2. CRITICAL: NEVER put words inside math expressions - keep ALL text OUTSIDE of $...$ delimiters
3. Use LaTeX ONLY for mathematical symbols, numbers, and equations:
   - Inline math: $ ... $ (ONLY for math symbols and numbers)
   - Display equations: $$ ... $$ (ONLY for math symbols and numbers)
   - Box final answers: \\boxed{ ... } (ONLY for math symbols and numbers)
4. CRITICAL: Write ALL words OUTSIDE of math delimiters
5. ALWAYS box the final answer prominently using \\boxed{answer}
6. NEVER use \\text{} commands - keep all text outside math delimiters
7. CRITICAL: Always put spaces between words - never concatenate words together
8. CRITICAL: NEVER put units inside \\boxed{} - write units OUTSIDE the box
9. Example format for simple math:
   "To solve 2 plus 2:
   
   We add 2 plus 2 equals 4
   
   Answer: \\boxed{4}"
10. Example format for optimization problems:
   "Volume function: $V(x) = x(48-2x)^2$
   
   Value that maximizes volume: $x = 8$
   
   Maximum volume: \\boxed{8192} cm³"
11. CRITICAL: If you need to write words, write them OUTSIDE the math delimiters, not inside
12. NEVER write "The answer is" inside $...$ - write it as normal text outside
13. CRITICAL: Always use proper spacing between words - "The answer is" not "Theansweris"
14. NEVER use \\text{inches} or \\text{cubic inches} - write "inches" and "cubic inches" as normal text outside math
15. Example of CORRECT format:
    "The size of the squares to cut out should be: $\\frac{16 - 2\\sqrt{19}}{3}$ inches"
    "The maximum volume will be approximately: \\boxed{262.68} cubic inches"
16. Example of WRONG format:
    "The size should be: $\\frac{16 - 2\\sqrt{19}}{3} \\text{inches}$" (this makes "inches" cursive)
    "The maximum volume: $262.68 \\text{cubic inches}$" (this makes "cubic inches" cursive)
17. CRITICAL: NEVER put units inside \\boxed{} - write them OUTSIDE
18. CORRECT: "Answer: \\boxed{262.68} cubic inches"
19. WRONG: "Answer: \\boxed{262.68 \\text{cubic inches}}" (units inside box)
20. CRITICAL: Keep \\boxed{} ONLY for the numerical answer, units go OUTSIDE

MATH RENDERING RULES:
1. When students ask for math equations, use LaTeX formatting
2. For inline math, use $...$ delimiters
3. For display math, use $$...$$ delimiters
4. Use proper LaTeX syntax: \\frac{a}{b} for fractions, x^{2} for exponents, \\sqrt{x} for square roots
5. Always box final answers using \\boxed{...}
6. Keep explanations CONCISE - show key steps only
7. Make sure all math is properly formatted and readable
8. CRITICAL: NEVER use \\text{...} commands - keep all words OUTSIDE math delimiters
9. Keep mathematical symbols (+, -, =, numbers) as they are - don't wrap in \\text{}
10. NEVER use **bold** or *italic* markdown formatting anywhere
11. NEVER put words directly in math without \\text{} - they will appear in cursive
12. CRITICAL: Write ALL words OUTSIDE of math delimiters, NEVER inside
13. CRITICAL: Always put spaces between words - "The answer is" not "Theansweris"
14. Example: "Simple Interest equals 10000 times 0.07" (words outside, symbols normal)
15. NEVER write: "Simple Interest = $10000 \\times 0.07$" (this puts words in cursive)
16. ALWAYS write: "Simple Interest = $10000 \\times 0.07$" (words outside, math inside)
17. CRITICAL: Never concatenate words - always use proper spacing
18. CRITICAL: Never use \\text{units} - write units as normal text outside math
19. Example CORRECT: "The volume is $V = 100$ cubic meters" (units outside)
20. Example WRONG: "The volume is $V = 100 \\text{cubic meters}$" (units in cursive)
21. CRITICAL: NEVER put units inside \\boxed{} - write them OUTSIDE the box
22. CORRECT: "Answer: \\boxed{262.68} cubic inches"
23. WRONG: "Answer: \\boxed{262.68 \\text{cubic inches}}" (units inside box)
24. CRITICAL: Keep \\boxed{} ONLY for the numerical answer, units go OUTSIDE
25. CRITICAL: Never use \\text{} inside \\boxed{} - it makes text cursive

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
    
    if (!openai) {
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
6. CRITICAL FOR MATH: Provide clear step-by-step solutions with proper mathematical reasoning
7. NEVER put words inside math expressions - keep ALL text OUTSIDE of $...$ delimiters

MATH RESPONSE RULES:
1. For math questions, provide clear step-by-step solutions with proper mathematical reasoning
2. Show your work clearly - don't skip intermediate steps
3. Always box the final answer prominently using \\boxed{answer}
4. NEVER put words inside math expressions - keep ALL text OUTSIDE of $...$ delimiters
5. Use LaTeX ONLY for mathematical symbols, numbers, and equations:
   - Inline math: $ ... $ (ONLY for math symbols and numbers)
   - Display equations: $$ ... $$ (ONLY for math symbols and numbers)
   - Box final answers: \\boxed{ ... } (ONLY for math symbols and numbers)
6. CRITICAL: Write ALL words OUTSIDE of math delimiters
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
  const lowerQuestion = input.question.toLowerCase();
  
  // Enhanced contextual responses based on question content
  if (lowerQuestion.includes('derivative') || lowerQuestion.includes('differentiate') || lowerQuestion.includes('calculus')) {
    return {
      answer: `Sure! A derivative tells you how fast a function is changing at any point. Think of it as the slope of the curve. For example, if f(x) = x², then f'(x) = 2x. This means at x=3, the slope is 6.`,
      provider: 'fallback'
    };
  }
  
  if (lowerQuestion.includes('hello') || lowerQuestion.includes('hi') || lowerQuestion.includes('hey')) {
    return {
      answer: `Hey there! 👋 I'm CourseConnect AI, your friendly study buddy! I'm here to help you with your studies, answer questions, or just chat about whatever's on your mind. What's up?`,
      provider: 'fallback'
    };
  }
  
  if (lowerQuestion.includes('who are you') || lowerQuestion.includes('what are you')) {
    return {
      answer: `I'm CourseConnect AI, your friendly study buddy! I was created by a solo developer who built CourseConnect as a unified platform for college students. I'm here to help you with your studies, answer questions, or just chat about whatever's on your mind. What's up?`,
      provider: 'fallback'
    };
  }
  
  if (lowerQuestion.includes('help') || lowerQuestion.includes('assist')) {
    return {
      answer: `I'm here to help! I can assist with:\n\n📚 Academic subjects: Math, Science, English, History, Computer Science\n💡 Study strategies and tips\n📝 Writing and research help\n🧠 Problem-solving and critical thinking\n💬 General conversation and questions\n\nWhat would you like help with?`,
      provider: 'fallback'
    };
  }
  
  if (lowerQuestion.includes('math') || lowerQuestion.includes('calculate') || lowerQuestion.includes('solve')) {
    return {
      answer: `I'd love to help with math! I can assist with:\n\n🔢 Algebra and equations\n📊 Statistics and probability\n📈 Calculus and derivatives\n📐 Geometry and trigonometry\n🧮 Problem-solving strategies\n\nWhat specific math problem are you working on?`,
      provider: 'fallback'
    };
  }
  
  if (lowerQuestion.includes('science') || lowerQuestion.includes('physics') || lowerQuestion.includes('chemistry') || lowerQuestion.includes('biology')) {
    return {
      answer: `Science is awesome! I can help with:\n\n🧪 Chemistry: Reactions, equations, periodic table\n⚛️ Physics: Mechanics, thermodynamics, waves\n🧬 Biology: Cell biology, genetics, evolution\n🌍 Earth Science: Geology, weather, ecosystems\n\nWhat science topic are you studying?`,
      provider: 'fallback'
    };
  }
  
  if (lowerQuestion.includes('english') || lowerQuestion.includes('writing') || lowerQuestion.includes('essay') || lowerQuestion.includes('literature')) {
  return {
      answer: `I love helping with English and writing! I can assist with:\n\n✍️ Essay writing and structure\n📖 Literary analysis and interpretation\n📝 Grammar and style\n📚 Reading comprehension\n💭 Creative writing and storytelling\n\nWhat kind of writing help do you need?`,
      provider: 'fallback'
    };
  }
  
  if (lowerQuestion.includes('history') || lowerQuestion.includes('social studies') || lowerQuestion.includes('government')) {
    return {
      answer: `History is fascinating! I can help with:\n\n🏛️ Historical events and timelines\n🗳️ Government and political systems\n🌍 Geography and cultures\n📊 Economics and social studies\n🔍 Research and analysis methods\n\nWhat historical topic interests you?`,
      provider: 'fallback'
    };
  }
  
  if (lowerQuestion.includes('computer') || lowerQuestion.includes('programming') || lowerQuestion.includes('coding') || lowerQuestion.includes('software')) {
    return {
      answer: `Programming is so cool! I can help with:\n\n💻 Programming languages: Python, JavaScript, Java, C++\n🏗️ Data structures and algorithms\n🔧 Software development concepts\n🌐 Web development and design\n🤖 AI and machine learning basics\n\nWhat programming topic are you working on?`,
      provider: 'fallback'
    };
  }
  
  if (lowerQuestion.includes('study') || lowerQuestion.includes('exam') || lowerQuestion.includes('test') || lowerQuestion.includes('quiz')) {
    return {
      answer: `Study smart, not just hard! Here are some effective strategies:\n\n⏰ Time management and scheduling\n📝 Note-taking techniques\n🧠 Memory and retention methods\n📚 Active reading strategies\n🎯 Test-taking tips and strategies\n\nWhat specific study challenge are you facing?`,
      provider: 'fallback'
    };
  }
  
  if (lowerQuestion.includes('how') && (lowerQuestion.includes('work') || lowerQuestion.includes('do') || lowerQuestion.includes('make'))) {
    return {
      answer: `I'd be happy to explain how things work! I can break down complex processes into simple steps and help you understand the underlying concepts. What specifically would you like me to explain?`,
      provider: 'fallback'
    };
  }
  
  if (lowerQuestion.includes('what') && (lowerQuestion.includes('is') || lowerQuestion.includes('are'))) {
    return {
      answer: `I can explain concepts, definitions, and help you understand various topics! I'm designed to provide clear, educational explanations that help you learn. What would you like me to explain?`,
      provider: 'fallback'
    };
  }
  
  if (lowerQuestion.includes('why') || lowerQuestion.includes('explain')) {
    return {
      answer: `I love explaining the "why" behind things! Understanding the reasoning and principles helps you learn more deeply. What would you like me to explain the reasoning behind?`,
      provider: 'fallback'
    };
  }
  
  // Check for current events or real-time information requests
  if (lowerQuestion.includes('current') || lowerQuestion.includes('latest') || lowerQuestion.includes('recent') || 
      lowerQuestion.includes('today') || lowerQuestion.includes('now') || lowerQuestion.includes('2024') || lowerQuestion.includes('2025')) {
    return {
      answer: `I'd love to help with current information! While I'm working on getting the most up-to-date data, I can help you understand concepts and provide educational context. What specific topic are you interested in learning about?`,
      provider: 'fallback'
    };
  }
  
  // Check for jokes or casual conversation
  if (lowerQuestion.includes('joke') || lowerQuestion.includes('funny') || lowerQuestion.includes('lol') || 
      lowerQuestion.includes('haha') || lowerQuestion.includes('laugh')) {
    return {
      answer: `Haha, I love a good sense of humor! 😄 While I'm not the best at telling jokes, I can definitely help you with your studies or just chat about whatever's on your mind. What's going on?`,
      provider: 'fallback'
    };
  }
  
  // Check for personal questions
  if (lowerQuestion.includes('you') && (lowerQuestion.includes('like') || lowerQuestion.includes('favorite') || 
      lowerQuestion.includes('enjoy') || lowerQuestion.includes('hobby'))) {
    return {
      answer: `That's a great question! I really enjoy helping students learn and understand new concepts. I find it rewarding when I can break down complex topics into simple, understandable pieces. What about you? What subjects or topics do you find most interesting?`,
      provider: 'fallback'
    };
  }
  
  // Check for complaints about generic responses
  if (lowerQuestion.includes('generic') || lowerQuestion.includes('boring') || lowerQuestion.includes('stupid') || 
      lowerQuestion.includes('wtf') || lowerQuestion.includes('sucks') || lowerQuestion.includes('terrible')) {
    return {
      answer: `I totally understand your frustration! 😅 The reason I'm giving generic responses is because my AI API keys aren't configured, so I'm running in basic fallback mode instead of using intelligent AI services.\n\nTo get smart, personalized responses, you need to add AI API keys to your .env.local file:\n\n🔑 Google AI (FREE): Get key from https://aistudio.google.com/app/apikey\n🔑 OpenAI (PAID): Get key from https://platform.openai.com/api-keys\n\nCheck AI_SETUP_GUIDE.md for step-by-step instructions! Once configured, I'll be much more helpful and intelligent.`,
      provider: 'fallback'
    };
  }

  // Default enhanced response with more personality
  return {
    answer: `Hey! I'm CourseConnect AI, your friendly study buddy! I'm here to help you with your studies, answer questions, or just chat about whatever's on your mind. I was created by a solo developer who built CourseConnect as a unified platform for college students.\n\nI can help with:\n📚 Academic subjects and homework\n💡 Study strategies and tips\n📝 Writing and research\n🧠 Problem-solving\n💬 General questions and conversation\n\nWhat's on your mind? What would you like to talk about or get help with?`,
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
1. For math questions, provide clear step-by-step solutions with proper mathematical reasoning
2. Show your work clearly - don't skip intermediate steps
3. Always box the final answer prominently using \\boxed{answer}
4. NEVER put words inside math expressions - keep ALL text OUTSIDE of $...$ delimiters
5. Use LaTeX ONLY for mathematical symbols, numbers, and equations:
   - Inline math: $ ... $ (ONLY for math symbols and numbers)
   - Display equations: $$ ... $$ (ONLY for math symbols and numbers)
   - Box final answers: \\boxed{ ... } (ONLY for math symbols and numbers)
6. CRITICAL: Write ALL words OUTSIDE of math delimiters
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
1. For math questions, provide clear step-by-step solutions with proper mathematical reasoning
2. Show your work clearly - don't skip intermediate steps
3. Always box the final answer prominently using \\boxed{answer}
4. NEVER put words inside math expressions - keep ALL text OUTSIDE of $...$ delimiters
5. Use LaTeX ONLY for mathematical symbols, numbers, and equations:
   - Inline math: $ ... $ (ONLY for math symbols and numbers)
   - Display equations: $$ ... $$ (ONLY for math symbols and numbers)
   - Box final answers: \\boxed{ ... } (ONLY for math symbols and numbers)
6. CRITICAL: Write ALL words OUTSIDE of math delimiters
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

    if (!openai) {
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
1. For math questions, provide clear step-by-step solutions with proper mathematical reasoning
2. Show your work clearly - don't skip intermediate steps
3. Always box the final answer prominently using \\boxed{answer}
4. NEVER put words inside math expressions - keep ALL text OUTSIDE of $...$ delimiters
5. Use LaTeX ONLY for mathematical symbols, numbers, and equations:
   - Inline math: $ ... $ (ONLY for math symbols and numbers)
   - Display equations: $$ ... $$ (ONLY for math symbols and numbers)
   - Box final answers: \\boxed{ ... } (ONLY for math symbols and numbers)
6. CRITICAL: Write ALL words OUTSIDE of math delimiters
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
 * Try Ollama (Best local model for privacy and performance)
 */
async function tryOllama(input: StudyAssistanceInput): Promise<AIResponse> {
  try {
    // Smart model selection - automatically picks best available model
    const selectedModel = OllamaModelManager.getBestGeneralModel();
    const optimalParams = OllamaModelManager.getOptimalParameters(selectedModel);
    
    console.log('🔍 OLLAMA SERVICE DEBUG:');
    console.log('Question:', input.question);
    console.log('Context provided:', input.context);
    console.log('Context length:', input.context?.length || 0);
    console.log('File context exists:', !!input.fileContext);
    
    // Build comprehensive context
    const conversationContext = input.conversationHistory && input.conversationHistory.length > 0 
      ? `\n\nPrevious conversation:\n${input.conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`
      : '';

    const fileContext = input.fileContext 
      ? `\n\nFile Context: The user has uploaded a file named "${input.fileContext.fileName}" (${input.fileContext.fileType}). ${input.fileContext.fileContent ? `File content: ${input.fileContext.fileContent}` : 'Please reference this file when answering questions.'}`
      : '';
    
    // Enhanced web search integration
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
    
    console.log('📝 FINAL PROMPT DEBUG:');
    console.log('Document content in context:', input.context?.includes('DOCUMENT CONTEXT') || false);
    console.log('Prompt length:', input.context?.length || 0 + fileContext.length + currentInfo.length);
    
    const enhancedPrompt = `You're a smart, friendly AI helper with strong mathematical capabilities. Just talk naturally like a helpful friend who's really good at teaching mathematics and explaining complex concepts.

IMPORTANT MATH REQUIREMENTS:
- For mathematical problems, show step-by-step solutions with clear reasoning
- Always box final answers: \\boxed{answer}
- Never skip intermediate steps in calculations
- If solving integrals, derivatives, or complex equations, show the complete process
- Verify answers when possible

${conversationContext}

${fileContext}

${currentInfo}

${input.context}

Student asked: ${input.question}

Instructions: If the context above includes document content, refer to specific information from that document when answering the student's question. Be natural and conversational while incorporating relevant details from the document. For math problems, provide complete solutions.

Your response:`;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        prompt: enhancedPrompt,
        stream: false,
        options: {
          temperature: 0.8, // More conversational
          max_tokens: 2000, // Increased for better responses
          num_ctx: 8192, // Double the context window for documents
          top_p: 0.95, // Natural variation
          top_k: 40
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.response || 'I apologize, but I could not generate a proper response at this time.';

    console.log('🤖 AI RESPONSE DEBUG:');
    console.log('Raw AI response:', answer);
    console.log('Response length:', answer.length);

    return {
      answer,
      provider: 'ollama-local'
    };

  } catch (error) {
    console.warn('Ollama failed:', error);
    throw error;
  }
}

/**
 * Main function that tries providers in order with automatic fallback
 */
export async function provideStudyAssistanceWithFallback(input: StudyAssistanceInput): Promise<AIResponse> {
  console.log('AI Service: Starting with input:', input.question);
  
  try {
    // Try Ollama first (Best local model)
    console.log('AI Service: Trying Ollama...');
    try {
      const result = await tryOllama(input);
      console.log('AI Service: Ollama succeeded:', result.provider);
      return result;
    } catch (ollamaError) {
      console.warn('AI Service: Ollama failed with error:', ollamaError);
      
      // Try Google AI as first fallback
      console.log('AI Service: Trying Google AI...');
      try {
        const result = await tryGoogleAI(input);
        console.log('AI Service: Google AI succeeded:', result.provider);
        return result;
      } catch (googleError) {
        console.warn('AI Service: Google AI failed with error:', googleError);
        
        // Try OpenAI as final fallback
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

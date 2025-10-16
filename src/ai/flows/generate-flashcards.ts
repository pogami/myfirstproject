
'use server';

/**
 * @fileOverview An AI flow for generating flashcards from a given text context.
 *
 * - generateFlashcards - A function that takes a text block and returns a set of flashcards.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generateFlashcards function.
 * - Flashcard - The schema for a single flashcard.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateFlashcardsInputSchema, GenerateFlashcardsOutputSchema, GenerateFlashcardsInput, GenerateFlashcardsOutput } from '@/ai/schemas/flashcard-schemas';

export { type GenerateFlashcardsInput, type GenerateFlashcardsOutput, type Flashcard } from '@/ai/schemas/flashcard-schemas';


export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: {schema: GenerateFlashcardsInputSchema},
  output: {schema: GenerateFlashcardsOutputSchema},
  prompt: `You are an expert at creating study materials for college students. Your task is to generate a set of high-quality flashcards based on the provided context.

  The context may include the class name, a history of questions and answers from a class chat, a specific topic, or manually provided text notes. Prioritize the most important concepts.

  **IMPORTANT FORMATTING RULES:**
  - For mathematical expressions, equations, formulas, or any math content, wrap them in LaTeX delimiters:
    - Use $...$ for inline math (e.g., $x^2 + y^2 = r^2$)
    - Use $$...$$ for block math/equations (e.g., $$\\frac{d}{dx}[x^2] = 2x$$)
  - Include proper LaTeX syntax for fractions, exponents, integrals, Greek letters, etc.
  - Examples: $\\frac{a}{b}$, $x^2$, $\\sqrt{x}$, $\\int_0^1 f(x)dx$, $\\alpha$, $\\beta$, $\\pi$

  {{#if className}}
  The flashcards are for the class: **{{className}}**.
  {{/if}}

  {{#if chatHistory}}
  Here is the recent chat history. Use the questions asked and answers provided to identify key topics students are focusing on.
  ---
  {{{chatHistory}}}
  ---
  {{/if}}

  {{#if topic}}
  Generate flashcards for the following topic: **{{topic}}**.
  {{/if}}

  {{#if context}}
  Also use the following notes or content:
  ---
  {{{context}}}
  ---
  {{/if}}

  Analyze all the provided information and generate between 5 and 15 flashcards. Each flashcard should have a clear question and a concise, accurate answer. Use LaTeX formatting for any mathematical content.`,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

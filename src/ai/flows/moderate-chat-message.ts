// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview A chat message moderation AI agent.
 *
 * - moderateChatMessage - A function that moderates chat messages.
 * - ModerateChatMessageInput - The input type for the moderateChatMessage function.
 * - ModerateChatMessageOutput - The return type for the moderateChatMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateChatMessageInputSchema = z.object({
  message: z.string().describe('The chat message to moderate.'),
});
export type ModerateChatMessageInput = z.infer<typeof ModerateChatMessageInputSchema>;

const ModerateChatMessageOutputSchema = z.object({
  isSafe: z.boolean().describe('Whether the message is safe or not.'),
  reason: z.string().describe('The reason why the message is not safe, if applicable.'),
});
export type ModerateChatMessageOutput = z.infer<typeof ModerateChatMessageOutputSchema>;

export async function moderateChatMessage(input: ModerateChatMessageInput): Promise<ModerateChatMessageOutput> {
  return moderateChatMessageFlow(input);
}

const moderateChatMessagePrompt = ai.definePrompt({
  name: 'moderateChatMessagePrompt',
  input: {schema: ModerateChatMessageInputSchema},
  output: {schema: ModerateChatMessageOutputSchema},
  prompt: `You are a moderator for a student chat platform. Your job is to determine whether a given message is safe and respectful.

  Respond with an object that has the following properties:
  - isSafe: true if the message is safe and respectful, false otherwise.
  - reason: A brief explanation of why the message is not safe, if applicable.

  Message: {{{message}}}`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const moderateChatMessageFlow = ai.defineFlow(
  {
    name: 'moderateChatMessageFlow',
    inputSchema: ModerateChatMessageInputSchema,
    outputSchema: ModerateChatMessageOutputSchema,
  },
  async input => {
    const {output} = await moderateChatMessagePrompt(input);
    return output!;
  }
);

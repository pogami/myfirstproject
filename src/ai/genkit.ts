import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Check if API key is available
const apiKey = process.env.GOOGLE_AI_API_KEY;

if (!apiKey) {
  console.warn('⚠️  GOOGLE_AI_API_KEY not found in environment variables.');
  console.warn('   To enable AI features, add GOOGLE_AI_API_KEY to your .env.local file');
  console.warn('   Get your API key from: https://aistudio.google.com/app/apikey');
}

export const ai = genkit({
  plugins: [googleAI({
    apiKey: apiKey || 'demo-key', // Use demo-key as fallback
  })],
  model: 'googleai/gemini-2.5-flash',
});

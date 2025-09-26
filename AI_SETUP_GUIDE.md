# AI Setup Guide for CourseConnect

## The Problem
Your AI is giving generic responses because no AI API keys are configured. The system tries Google AI first, then OpenAI, and when both fail, it falls back to basic responses.

## Quick Fix - Add AI API Keys

### Option 1: Google AI (Gemini) - FREE
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add to `.env.local`:
```bash
GOOGLE_AI_API_KEY=your_google_ai_key_here
```

### Option 2: OpenAI (ChatGPT) - PAID
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add to `.env.local`:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### Option 3: Both (Recommended)
Add both keys to `.env.local`:
```bash
# AI Configuration
GOOGLE_AI_API_KEY=your_google_ai_key_here
OPENAI_API_KEY=your_openai_api_key_here
AI_PROVIDER_PREFERENCE=google
```

## Test the AI
1. Restart your dev server: `npm run dev`
2. Go to `/dashboard/chat`
3. Ask a question - you should get intelligent responses!

## Current AI Features
- **Dual Provider**: Tries Google AI first, falls back to OpenAI
- **Smart Fallback**: If both fail, provides helpful responses
- **Context Aware**: Remembers conversation history
- **File Analysis**: Can analyze uploaded documents
- **Image Analysis**: Can analyze uploaded images
- **Web Search**: Can search for current information

## Troubleshooting
- **Generic responses**: Check API keys are set correctly
- **API errors**: Verify keys are valid and have credits
- **Slow responses**: Check internet connection
- **No responses**: Check server logs for errors

## Cost Considerations
- **Google AI**: Free tier available, very affordable
- **OpenAI**: Pay-per-use, typically $0.002 per 1K tokens
- **Fallback**: Always works, basic responses

## Security
- Never commit API keys to git
- Use `.env.local` for local development
- Use environment variables in production



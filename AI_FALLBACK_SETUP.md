# AI API Configuration

## DeepSeek API Setup

To use DeepSeek AI as a fallback option, add the following to your environment variables:

```bash
# .env.local
DEEPSEEK_API_KEY=sk-4029f2dbc86d4daabca61761232e6a23
```

## AI Provider Fallback Chain

The system now uses the following fallback order:
1. **Google Gemini** (primary)
2. **DeepSeek AI** (secondary fallback)
3. **OpenAI ChatGPT** (tertiary fallback)
4. **Enhanced Fallback** (local responses when all APIs fail)

## Environment Variables

```bash
# Primary AI Provider
GOOGLE_AI_API_KEY=your_google_ai_key_here

# Fallback AI Providers
DEEPSEEK_API_KEY=sk-4029f2dbc86d4daabca61761232e6a23
OPENAI_API_KEY=your_openai_key_here

# Provider Preference (optional)
AI_PROVIDER_PREFERENCE=fallback
```

## Features Added

### Class Chat System
- **Syllabus Matching**: Users with similar syllabi are automatically grouped together
- **Chat Preferences**: Users can choose between AI-only chats or public class chats
- **Group Selection**: When matching groups are found, users can choose to join existing groups or create new ones
- **Firebase Integration**: Class groups and syllabus data are stored in Firebase collections

### AI Fallback Chain
- **DeepSeek Integration**: Added DeepSeek AI as a secondary fallback option
- **Automatic Failover**: System automatically tries the next provider if one fails
- **Consistent Responses**: All AI providers use the same prompt format for consistent responses

### Database Collections
- `classGroups`: Stores class group information and member lists
- `syllabi`: Stores uploaded syllabus data for matching
- `chats`: Existing chat storage (unchanged)
- `users`: User data with chat references (unchanged)

# Enhanced Music Integration Setup Guide

This guide will help you set up both actual Spotify Web API integration and AI-generated music functionality in your CourseConnect advanced AI page.

## 🎵 Features Implemented

### ✅ What's Already Built
- **Enhanced Spotify Integration Component** - Complete UI with tabs for Spotify and AI-generated music
- **Unified Music Player** - Single interface for both Spotify and AI music
- **Focus Sessions** - Pre-configured study sessions (Deep Focus, Pomodoro, Meditation, etc.)
- **AI Music Generation** - Interface for creating custom calm music
- **Spotify Web API Service** - Complete service layer for Spotify integration
- **AI Music Service** - Service layer for AI music generation
- **Configuration System** - Centralized config for API keys and endpoints

### 🎯 Key Features
- **Dual Music Sources**: Switch between Spotify playlists and AI-generated tracks
- **Smart Focus Sessions**: Pre-configured music sessions for different study types
- **Custom AI Generation**: Generate music based on text prompts and mood
- **Real-time Controls**: Play, pause, volume, skip, shuffle controls
- **Responsive Design**: Mobile-optimized interface

## 🚀 Setup Instructions

### 1. Spotify Web API Setup

#### Step 1: Create Spotify App
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create App"
3. Fill in app details:
   - **App Name**: CourseConnect Music Integration
   - **App Description**: Music integration for study sessions
   - **Redirect URI**: `http://localhost:3000/dashboard/advanced` (for development)
4. Note down your **Client ID** and **Client Secret**

#### Step 2: Configure Environment Variables
Create a `.env.local` file in your project root:

```bash
# Spotify Web API Configuration
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/dashboard/advanced

# For production, update the redirect URI to your domain
# NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=https://yourdomain.com/dashboard/advanced
```

#### Step 3: Update Spotify Service
The `SpotifyService` class in `src/lib/spotify-service.ts` is already configured to use these environment variables.

### 2. AI Music Generation Setup

#### Option A: Use Existing AI Music APIs

**Recommended Services:**
1. **AIVA** - AI music composition platform
2. **Amper Music** - AI music creation
3. **Mubert** - AI-generated music streaming
4. **Soundraw** - AI music generator

#### Option B: Custom AI Music Generation

If you want to implement your own AI music generation:

```bash
# Add to .env.local
NEXT_PUBLIC_MUSIC_GENERATION_API_KEY=your_api_key_here
NEXT_PUBLIC_MUSIC_GENERATION_API_URL=https://your-api-endpoint.com/generate-music
```

#### Option C: Demo Mode (Current Implementation)
The current implementation includes a demo mode that simulates AI music generation. This works out of the box for testing.

### 3. OAuth Callback Handling

Add this to your `src/app/dashboard/advanced/page.tsx` to handle Spotify OAuth callbacks:

```typescript
// Add this useEffect to handle OAuth callback
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');

  if (error) {
    toast({
      variant: "destructive",
      title: "Spotify Authorization Failed",
      description: "Failed to authorize with Spotify. Please try again.",
    });
    return;
  }

  if (code) {
    // Exchange code for token
    spotifyService.exchangeCodeForToken(code).then(success => {
      if (success) {
        toast({
          title: "Spotify Connected!",
          description: "Successfully connected to Spotify.",
        });
        // Remove code from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    });
  }
}, []);
```

### 4. Production Deployment

#### Update Redirect URIs
1. In Spotify Developer Dashboard, add your production domain:
   - `https://yourdomain.com/dashboard/advanced`
2. Update environment variables for production

#### Environment Variables for Production
```bash
# Production environment variables
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_production_client_id
SPOTIFY_CLIENT_SECRET=your_production_client_secret
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=https://yourdomain.com/dashboard/advanced
```

## 🎵 Usage Guide

### For Users

#### Connecting Spotify
1. Go to Advanced AI page → Music tab
2. Click "Connect Spotify"
3. Authorize the app in Spotify
4. Your playlists will be loaded automatically

#### Generating AI Music
1. Switch to "AI Generated" tab
2. Enter a description of the music you want
3. Choose mood (Calm, Focus, Meditation, etc.)
4. Click "Generate" and wait for AI to create your music

#### Using Focus Sessions
1. Scroll down to "Focus Sessions"
2. Choose a session type (Deep Focus, Pomodoro, etc.)
3. Click "Start" to begin the session
4. Music will play automatically

### For Developers

#### Adding New Focus Sessions
Edit `focusSessions` array in `src/components/enhanced-spotify-integration.tsx`:

```typescript
{
  id: '5',
  name: 'New Session',
  duration: 15,
  type: 'study',
  description: 'Description of the session',
  tracks: []
}
```

#### Customizing AI Music Prompts
Edit `src/lib/music-config.ts` to add new prompts:

```typescript
export const musicPrompts = {
  calm: [
    'gentle piano melody with soft strings',
    'your new prompt here'
  ],
  // ... other moods
};
```

## 🔧 Technical Details

### Architecture
- **Component**: `EnhancedSpotifyIntegration` - Main UI component
- **Services**: 
  - `SpotifyService` - Handles Spotify Web API calls
  - `AIMusicService` - Handles AI music generation
- **Configuration**: `music-config.ts` - Centralized configuration

### Key Features
- **Token Management**: Automatic token refresh for Spotify
- **Error Handling**: Graceful fallbacks and user-friendly error messages
- **Responsive Design**: Mobile-optimized interface
- **Demo Mode**: Works without API keys for testing

### Security Considerations
- **Client Secret**: Never expose in frontend code
- **Token Storage**: Uses localStorage (consider more secure storage for production)
- **CORS**: Configure proper CORS settings for your domain

## 🐛 Troubleshooting

### Common Issues

#### Spotify Connection Fails
- Check Client ID and Secret are correct
- Verify redirect URI matches exactly
- Ensure app is not in development mode restrictions

#### AI Music Generation Fails
- Check API key is valid
- Verify API endpoint is accessible
- Check network connectivity

#### Music Won't Play
- Check browser autoplay policies
- Verify audio URLs are accessible
- Check console for CORS errors

### Debug Mode
Enable debug logging by adding to your component:

```typescript
// Add this to see detailed logs
console.log('Spotify connected:', spotifyService.isConnected());
console.log('Current user:', await spotifyService.getCurrentUser());
```

## 📚 Additional Resources

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api/)
- [Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk/)
- [AI Music Generation APIs](https://www.assemblyai.com/blog/ai-music-generation-apis/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

## 🎉 Next Steps

1. **Set up Spotify Developer Account** and get your API credentials
2. **Configure environment variables** with your API keys
3. **Test the integration** in development mode
4. **Deploy to production** with proper redirect URIs
5. **Consider adding more AI music services** for variety
6. **Implement user preferences** to save favorite tracks and sessions

The enhanced music integration is now ready to provide your users with both Spotify's extensive music library and AI-generated calm music for optimal study sessions!

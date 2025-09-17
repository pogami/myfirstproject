// AI Music Generation Service
import { config, musicPrompts } from '@/lib/music-config';

export interface AIGeneratedTrack {
  id: string;
  name: string;
  description: string;
  duration: number;
  audio_url: string;
  image_url: string;
  mood: 'calm' | 'focus' | 'energetic' | 'sleep' | 'meditation';
  bpm: number;
  generated_at: string;
  prompt: string;
  tags: string[];
}

export interface MusicGenerationRequest {
  prompt: string;
  mood: 'calm' | 'focus' | 'energetic' | 'sleep' | 'meditation';
  duration: number; // in seconds
  style?: string;
  instruments?: string[];
  tempo?: number;
}

export interface MusicGenerationResponse {
  success: boolean;
  track?: AIGeneratedTrack;
  error?: string;
  processing_time?: number;
}

class AIMusicService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = config.aiMusic.apiKey;
    this.apiUrl = config.aiMusic.apiUrl;
  }

  // Generate music using AI
  async generateMusic(request: MusicGenerationRequest): Promise<MusicGenerationResponse> {
    try {
      // For demo purposes, we'll simulate the API call
      // In a real implementation, you would call an actual AI music generation API
      
      if (!this.apiKey) {
        // Fallback to demo mode
        return this.generateDemoMusic(request);
      }

      const response = await fetch(`${this.apiUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          prompt: request.prompt,
          mood: request.mood,
          duration: request.duration,
          style: request.style,
          instruments: request.instruments,
          tempo: request.tempo
        })
      });

      if (!response.ok) {
        throw new Error(`Music generation API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        track: data.track,
        processing_time: data.processing_time
      };
    } catch (error) {
      console.error('Music generation failed:', error);
      // Fallback to demo mode
      return this.generateDemoMusic(request);
    }
  }

  // Demo music generation (fallback)
  private async generateDemoMusic(request: MusicGenerationRequest): Promise<MusicGenerationResponse> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    const track: AIGeneratedTrack = {
      id: `ai_demo_${Date.now()}`,
      name: `AI Generated: ${request.prompt || this.getRandomPrompt(request.mood)}`,
      description: `AI-generated ${request.mood} music created from: "${request.prompt}"`,
      duration: request.duration,
      audio_url: this.getDemoAudioUrl(request.mood),
      image_url: this.getDemoImageUrl(request.mood),
      mood: request.mood,
      bpm: this.getBPMForMood(request.mood),
      generated_at: new Date().toISOString(),
      prompt: request.prompt,
      tags: this.generateTags(request)
    };

    return {
      success: true,
      track,
      processing_time: 2500
    };
  }

  private getRandomPrompt(mood: string): string {
    const prompts = musicPrompts[mood as keyof typeof musicPrompts] || musicPrompts.calm;
    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  private getDemoAudioUrl(mood: string): string {
    // Demo audio URLs - in production, these would be actual generated audio files
    const demoUrls = {
      calm: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      focus: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      energetic: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      sleep: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      meditation: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
    };
    return demoUrls[mood as keyof typeof demoUrls] || demoUrls.calm;
  }

  private getDemoImageUrl(mood: string): string {
    const imageUrls = {
      calm: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=64&h=64&fit=crop',
      focus: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=64&h=64&fit=crop',
      energetic: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=64&h=64&fit=crop',
      sleep: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=64&h=64&fit=crop',
      meditation: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=64&h=64&fit=crop'
    };
    return imageUrls[mood as keyof typeof imageUrls] || imageUrls.calm;
  }

  private getBPMForMood(mood: string): number {
    const bpmMap = {
      calm: 60,
      focus: 80,
      energetic: 120,
      sleep: 50,
      meditation: 55
    };
    return bpmMap[mood as keyof typeof bpmMap] || 70;
  }

  private generateTags(request: MusicGenerationRequest): string[] {
    const tags = [request.mood];
    
    if (request.style) tags.push(request.style);
    if (request.instruments) tags.push(...request.instruments);
    if (request.tempo) tags.push(`${request.tempo}bpm`);
    
    return tags;
  }

  // Get suggested prompts for different moods
  getSuggestedPrompts(mood: string): string[] {
    return musicPrompts[mood as keyof typeof musicPrompts] || musicPrompts.calm;
  }

  // Validate generation request
  validateRequest(request: MusicGenerationRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.prompt || request.prompt.trim().length < 3) {
      errors.push('Prompt must be at least 3 characters long');
    }

    if (request.duration < 30 || request.duration > 1800) {
      errors.push('Duration must be between 30 seconds and 30 minutes');
    }

    if (!['calm', 'focus', 'energetic', 'sleep', 'meditation'].includes(request.mood)) {
      errors.push('Invalid mood specified');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Get available moods
  getAvailableMoods(): Array<{ value: string; label: string; description: string }> {
    return [
      { value: 'calm', label: 'Calm', description: 'Peaceful and relaxing music' },
      { value: 'focus', label: 'Focus', description: 'Music for concentration and study' },
      { value: 'energetic', label: 'Energetic', description: 'Upbeat and motivating music' },
      { value: 'sleep', label: 'Sleep', description: 'Gentle music for rest and sleep' },
      { value: 'meditation', label: 'Meditation', description: 'Mindful and meditative sounds' }
    ];
  }

  // Format duration for display
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

export const aiMusicService = new AIMusicService();

'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Music, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipForward, 
  SkipBack, 
  Shuffle, 
  Repeat,
  Headphones,
  Zap,
  Brain,
  Coffee,
  Sparkles,
  RefreshCw,
  Settings,
  ExternalLink,
  Download,
  Heart,
  Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Types
interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  preview_url?: string;
  image_url: string;
  external_urls?: {
    spotify: string;
  };
  popularity?: number;
}

interface AIGeneratedTrack {
  id: string;
  name: string;
  description: string;
  duration: number;
  audio_url: string;
  image_url: string;
  mood: 'calm' | 'focus' | 'energetic' | 'sleep' | 'meditation';
  bpm: number;
  generated_at: string;
}

interface FocusSession {
  id: string;
  name: string;
  duration: number;
  tracks: (SpotifyTrack | AIGeneratedTrack)[];
  type: 'study' | 'focus' | 'break' | 'deep_work' | 'meditation';
  description: string;
}

interface SpotifyIntegrationProps {
  isConnected?: boolean;
}

export function EnhancedSpotifyIntegration({ isConnected = false }: SpotifyIntegrationProps) {
  // State management
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(isConnected);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | AIGeneratedTrack | null>(null);
  const [volume, setVolume] = useState([70]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [activeTab, setActiveTab] = useState<'spotify' | 'ai-generated'>('spotify');
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<any[]>([]);
  const [aiGeneratedTracks, setAiGeneratedTracks] = useState<AIGeneratedTrack[]>([]);
  const [musicGenerationPrompt, setMusicGenerationPrompt] = useState('');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Predefined focus sessions
  const focusSessions: FocusSession[] = [
    {
      id: '1',
      name: 'Deep Focus',
      duration: 25,
      type: 'deep_work',
      description: 'Intense concentration music for deep work sessions',
      tracks: []
    },
    {
      id: '2',
      name: 'Pomodoro Study',
      duration: 25,
      type: 'study',
      description: 'Classical and ambient music for study sessions',
      tracks: []
    },
    {
      id: '3',
      name: 'Meditation Break',
      duration: 10,
      type: 'meditation',
      description: 'Calming sounds for mindfulness and meditation',
      tracks: []
    },
    {
      id: '4',
      name: 'Energy Boost',
      duration: 5,
      type: 'break',
      description: 'Upbeat music for study breaks',
      tracks: []
    }
  ];

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = volume[0] / 100;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume, isMuted]);

  // Spotify Web API Integration
  const connectSpotify = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, you would redirect to Spotify's OAuth endpoint
      // For demo purposes, we'll simulate the connection
      const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
      
      if (!clientId) {
        throw new Error('Spotify Client ID not configured');
      }

      // Simulate OAuth flow
      const authUrl = `https://accounts.spotify.com/authorize?` +
        `client_id=${clientId}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(window.location.origin + '/dashboard/advanced')}&` +
        `scope=${encodeURIComponent('user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private')}`;

      // For demo, we'll simulate successful connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      localStorage.setItem('spotifyConnected', 'true');
      setIsSpotifyConnected(true);
      
      // Load demo playlists
      loadSpotifyPlaylists();
      
      toast({
        title: "Spotify Connected!",
        description: "Your Spotify account is now integrated with CourseConnect.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Failed to connect to Spotify. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSpotifyPlaylists = async () => {
    try {
      // Simulate loading Spotify playlists
      const mockPlaylists = [
        {
          id: '1',
          name: 'Focus Flow',
          description: 'Deep focus music for studying',
          tracks: [
            {
              id: '1',
              name: 'Ambient Study Music',
              artist: 'Focus Beats',
              album: 'Study Sessions',
              duration: 1800,
              preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
              image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=64&h=64&fit=crop',
              external_urls: { spotify: 'https://open.spotify.com/track/1' }
            }
          ]
        },
        {
          id: '2',
          name: 'Chill Vibes',
          description: 'Relaxing music for breaks',
          tracks: [
            {
              id: '2',
              name: 'Chill Study Music',
              artist: 'Relax Sounds',
              album: 'Chill Sessions',
              duration: 2100,
              preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
              image_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=64&h=64&fit=crop',
              external_urls: { spotify: 'https://open.spotify.com/track/2' }
            }
          ]
        }
      ];
      
      setSpotifyPlaylists(mockPlaylists);
    } catch (error) {
      console.error('Failed to load Spotify playlists:', error);
    }
  };

  // AI Music Generation
  const generateAIMusic = async (prompt: string, mood: AIGeneratedTrack['mood'] = 'calm') => {
    setIsGeneratingMusic(true);
    try {
      // Simulate AI music generation API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newTrack: AIGeneratedTrack = {
        id: `ai_${Date.now()}`,
        name: `AI Generated: ${prompt || 'Calm Study Music'}`,
        description: `AI-generated ${mood} music for focus and concentration`,
        duration: 1800, // 30 minutes
        audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Demo URL
        image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=64&h=64&fit=crop',
        mood,
        bpm: mood === 'calm' ? 60 : mood === 'energetic' ? 120 : 80,
        generated_at: new Date().toISOString()
      };
      
      setAiGeneratedTracks(prev => [newTrack, ...prev]);
      
      toast({
        title: "Music Generated!",
        description: `Your ${mood} music has been created successfully.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Failed to generate AI music. Please try again.",
      });
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  const togglePlayPause = async () => {
    if (!currentTrack) {
      toast({
        variant: "destructive",
        title: "No Track Selected",
        description: "Please select a track to play music.",
      });
      return;
    }

    if (audioRef.current && currentTrack) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.src = 'preview_url' in currentTrack ? currentTrack.preview_url || '' : currentTrack.audio_url;
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const startFocusSession = (session: FocusSession) => {
    setCurrentSession(session);
    setIsPlaying(true);
    
    toast({
      title: `${session.name} Started`,
      description: session.description,
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume[0] / 100;
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = newVolume[0] / 100;
    }
  };

  const getSessionIcon = (type: FocusSession['type']) => {
    switch (type) {
      case 'study': return <Brain className="h-4 w-4" />;
      case 'focus': return <Zap className="h-4 w-4" />;
      case 'break': return <Coffee className="h-4 w-4" />;
      case 'deep_work': return <Headphones className="h-4 w-4" />;
      case 'meditation': return <Sparkles className="h-4 w-4" />;
      default: return <Music className="h-4 w-4" />;
    }
  };

  const getSessionColor = (type: FocusSession['type']) => {
    switch (type) {
      case 'study': return 'bg-blue-500';
      case 'focus': return 'bg-purple-500';
      case 'break': return 'bg-green-500';
      case 'deep_work': return 'bg-indigo-500';
      case 'meditation': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isAITrack = (track: SpotifyTrack | AIGeneratedTrack): track is AIGeneratedTrack => {
    return 'mood' in track;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Enhanced Music Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'spotify' | 'ai-generated')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="spotify" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                Spotify
              </TabsTrigger>
              <TabsTrigger value="ai-generated" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Generated
              </TabsTrigger>
            </TabsList>

            <TabsContent value="spotify" className="space-y-4">
              {!isSpotifyConnected ? (
                <div className="text-center py-8">
                  <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Connect Spotify</h3>
                  <p className="text-muted-foreground mb-4">
                    Access your Spotify playlists and control playback directly from CourseConnect.
                  </p>
                  <Button 
                    onClick={connectSpotify} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Music className="h-4 w-4 animate-spin mr-2" />
                        Connecting...
                      </>
                    ) : (
                      'Connect Spotify'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Current Track */}
                  {currentTrack && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                          {currentTrack.image_url ? (
                            <img 
                              src={currentTrack.image_url} 
                              alt={currentTrack.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Music className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{currentTrack.name}</h4>
                          <p className="text-sm text-muted-foreground">{currentTrack.artist}</p>
                          <p className="text-xs text-muted-foreground">{currentTrack.album}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-muted-foreground">
                            {formatDuration(currentTrack.duration)}
                          </div>
                          {!isAITrack(currentTrack) && currentTrack.external_urls && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={currentTrack.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Music Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <Button variant="outline" size="sm">
                      <Shuffle className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="lg" 
                      onClick={togglePlayPause}
                      className="w-12 h-12 rounded-full"
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6" />
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Repeat className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={toggleMute}
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="flex-1">
                      <Slider
                        value={volume}
                        onValueChange={handleVolumeChange}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">
                      {isMuted ? '0' : volume[0]}%
                    </span>
                  </div>

                  {/* Spotify Playlists */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Your Playlists</h4>
                    <div className="grid gap-3">
                      {spotifyPlaylists.map((playlist) => (
                        <div 
                          key={playlist.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                              <Music className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium">{playlist.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {playlist.description}
                              </div>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => {
                              setCurrentTrack(playlist.tracks[0]);
                              setIsPlaying(true);
                            }}
                          >
                            Play
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ai-generated" className="space-y-4">
              <div className="space-y-6">
                {/* AI Music Generation */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold">Generate AI Music</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Create personalized calm music using AI. Describe the mood or style you want.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Music Description</label>
                      <textarea
                        value={musicGenerationPrompt}
                        onChange={(e) => setMusicGenerationPrompt(e.target.value)}
                        placeholder="e.g., 'calm piano music for studying', 'ambient nature sounds', 'soft electronic beats'"
                        className="w-full p-3 border rounded-lg resize-none"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => generateAIMusic(musicGenerationPrompt, 'calm')}
                        disabled={isGeneratingMusic}
                        className="flex-1"
                      >
                        {isGeneratingMusic ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Calm Music
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => generateAIMusic(musicGenerationPrompt, 'focus')}
                        disabled={isGeneratingMusic}
                      >
                        Focus
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => generateAIMusic(musicGenerationPrompt, 'meditation')}
                        disabled={isGeneratingMusic}
                      >
                        Meditation
                      </Button>
                    </div>
                  </div>
                </div>

                {/* AI Generated Tracks */}
                <div className="space-y-3">
                  <h4 className="font-medium">AI Generated Tracks</h4>
                  {aiGeneratedTracks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No AI-generated tracks yet. Create your first track above!</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {aiGeneratedTracks.map((track) => (
                        <div 
                          key={track.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                              <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium">{track.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {track.description} • {track.bpm} BPM
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {track.mood}
                            </Badge>
                            <Button 
                              size="sm" 
                              onClick={() => {
                                setCurrentTrack(track);
                                setIsPlaying(true);
                              }}
                            >
                              Play
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Focus Sessions */}
          <div className="mt-6 space-y-3">
            <h4 className="font-medium">Focus Sessions</h4>
            <div className="grid gap-3">
              {focusSessions.map((session) => (
                <div 
                  key={session.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${getSessionColor(session.type)} flex items-center justify-center text-white`}>
                      {getSessionIcon(session.type)}
                    </div>
                    <div>
                      <div className="font-medium">{session.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {session.description} • {session.duration} minutes
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => startFocusSession(session)}
                    disabled={currentSession?.id === session.id && isPlaying}
                  >
                    {currentSession?.id === session.id && isPlaying ? 'Active' : 'Start'}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Current Session Status */}
          {currentSession && (
            <div className="mt-6 bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${getSessionColor(currentSession.type)}`} />
                <span className="font-medium">{currentSession.name} Session</span>
                <Badge variant="outline">
                  {currentSession.duration} min
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {isPlaying ? 'Playing focus music' : 'Session paused'}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
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
  Coffee
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  preview_url?: string;
  image_url: string;
}

interface FocusSession {
  id: string;
  name: string;
  duration: number;
  tracks: SpotifyTrack[];
  type: 'study' | 'focus' | 'break' | 'deep_work';
}

interface SpotifyIntegrationProps {
  isConnected?: boolean;
}

export function SpotifyIntegration({ isConnected = false }: SpotifyIntegrationProps) {
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(isConnected);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [volume, setVolume] = useState([70]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Focus sessions with actual music URLs
  const focusSessions: FocusSession[] = [
    {
      id: '1',
      name: 'Deep Focus',
      duration: 25,
      type: 'deep_work',
      tracks: [
        {
          id: '1',
          name: 'Lofi Study Music',
          artist: 'Chill Beats',
          album: 'Study Sessions',
          duration: 1800,
          preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=64&h=64&fit=crop'
        },
        {
          id: '2',
          name: 'Ambient Focus',
          artist: 'Nature Sounds',
          album: 'Concentration',
          duration: 2100,
          preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          image_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=64&h=64&fit=crop'
        }
      ]
    },
    {
      id: '2',
      name: 'Pomodoro Study',
      duration: 25,
      type: 'study',
      tracks: [
        {
          id: '3',
          name: 'Classical Study',
          artist: 'Mozart',
          album: 'Academic Focus',
          duration: 1500,
          preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=64&h=64&fit=crop'
        }
      ]
    },
    {
      id: '3',
      name: 'Break Time',
      duration: 5,
      type: 'break',
      tracks: [
        {
          id: '4',
          name: 'Upbeat Break',
          artist: 'Energy Boost',
          album: 'Study Breaks',
          duration: 300,
          preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          image_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=64&h=64&fit=crop'
        }
      ]
    }
  ];

  useEffect(() => {
    const connected = localStorage.getItem('spotifyConnected') === 'true';
    setIsSpotifyConnected(connected);
    if (connected) {
      setCurrentTrack(focusSessions[0].tracks[0]);
    }
  }, []);

  useEffect(() => {
    if (currentTrack && currentTrack.preview_url) {
      const audio = new Audio(currentTrack.preview_url);
      audio.loop = true;
      audio.volume = volume[0] / 100;
      setAudioElement(audio);
      
      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, [currentTrack, volume]);

  useEffect(() => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.play().catch(console.error);
      } else {
        audioElement.pause();
      }
    }
  }, [isPlaying, audioElement]);

  const connectSpotify = async () => {
    setIsLoading(true);
    try {
      // Simulate Spotify API connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      localStorage.setItem('spotifyConnected', 'true');
      setIsSpotifyConnected(true);
      setCurrentTrack(focusSessions[0].tracks[0]);
      
      toast({
        title: "Spotify Connected!",
        description: "Your focus music is now integrated with CourseConnect.",
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

  const togglePlayPause = async () => {
    if (!currentTrack?.preview_url) {
      toast({
        variant: "destructive",
        title: "No Music Available",
        description: "Please select a track to play music.",
      });
      return;
    }

    setIsPlaying(!isPlaying);
    toast({
      title: isPlaying ? "Music Paused" : "Music Playing",
      description: isPlaying ? "Focus music paused" : `Now playing: ${currentTrack.name}`,
    });
  };

  const startFocusSession = (session: FocusSession) => {
    setCurrentSession(session);
    setCurrentTrack(session.tracks[0]);
    setIsPlaying(true);
    
    toast({
      title: `${session.name} Started`,
      description: `Focus session for ${session.duration} minutes`,
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioElement) {
      audioElement.volume = !isMuted ? 0 : volume[0] / 100;
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    if (audioElement && !isMuted) {
      audioElement.volume = newVolume[0] / 100;
    }
  };

  const getSessionIcon = (type: FocusSession['type']) => {
    switch (type) {
      case 'study': return <Brain className="h-4 w-4" />;
      case 'focus': return <Zap className="h-4 w-4" />;
      case 'break': return <Coffee className="h-4 w-4" />;
      case 'deep_work': return <Headphones className="h-4 w-4" />;
      default: return <Music className="h-4 w-4" />;
    }
  };

  const getSessionColor = (type: FocusSession['type']) => {
    switch (type) {
      case 'study': return 'bg-blue-500';
      case 'focus': return 'bg-purple-500';
      case 'break': return 'bg-green-500';
      case 'deep_work': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Spotify Focus Music
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSpotifyConnected ? (
            <div className="text-center py-8">
              <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Connect Spotify</h3>
              <p className="text-muted-foreground mb-4">
                Enhance your study sessions with curated focus music and ambient sounds.
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
                    <div className="text-sm text-muted-foreground">
                      {formatDuration(currentTrack.duration)}
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

              {/* Focus Sessions */}
              <div className="space-y-3">
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
                            {session.duration} minutes • {session.tracks.length} tracks
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
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

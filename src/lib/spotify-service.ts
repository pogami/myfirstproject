// Spotify Web API Service
import { config, spotifyEndpoints } from '@/lib/music-config';

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: Array<{ url: string; height: number; width: number }>;
  country: string;
  product: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string; height: number; width: number }>;
  tracks: {
    total: number;
    items: SpotifyTrack[];
  };
  external_urls: {
    spotify: string;
  };
  owner: {
    display_name: string;
  };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string; id: string }>;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
  popularity: number;
}

export interface SpotifyPlayerState {
  is_playing: boolean;
  item: SpotifyTrack | null;
  progress_ms: number;
  volume_percent: number;
  device: {
    id: string;
    is_active: boolean;
    name: string;
    type: string;
    volume_percent: number;
  };
}

class SpotifyService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.loadTokens();
  }

  private loadTokens() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('spotify_access_token');
      this.refreshToken = localStorage.getItem('spotify_refresh_token');
      const expiry = localStorage.getItem('spotify_token_expiry');
      this.tokenExpiry = expiry ? parseInt(expiry) : 0;
    }
  }

  private saveTokens(accessToken: string, refreshToken: string, expiresIn: number) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('spotify_access_token', accessToken);
      localStorage.setItem('spotify_refresh_token', refreshToken);
      localStorage.setItem('spotify_token_expiry', (Date.now() + expiresIn * 1000).toString());
    }
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenExpiry = Date.now() + expiresIn * 1000;
  }

  private isTokenExpired(): boolean {
    return Date.now() >= this.tokenExpiry;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(spotifyEndpoints.token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${config.spotify.clientId}:${config.spotify.clientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken
        })
      });

      if (!response.ok) return false;

      const data = await response.json();
      this.saveTokens(data.access_token, this.refreshToken, data.expires_in);
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  }

  private async getValidToken(): Promise<string | null> {
    if (!this.accessToken) return null;

    if (this.isTokenExpired()) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) return null;
    }

    return this.accessToken;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getValidToken();
    if (!token) throw new Error('No valid access token');

    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the request
          return this.makeRequest(endpoint, options);
        }
      }
      throw new Error(`Spotify API error: ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: config.spotify.clientId,
      response_type: 'code',
      redirect_uri: config.spotify.redirectUri,
      scope: config.spotify.scopes.join(' '),
      show_dialog: 'true'
    });

    return `${spotifyEndpoints.auth}?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<boolean> {
    try {
      const response = await fetch(spotifyEndpoints.token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${config.spotify.clientId}:${config.spotify.clientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: config.spotify.redirectUri
        })
      });

      if (!response.ok) return false;

      const data = await response.json();
      this.saveTokens(data.access_token, data.refresh_token, data.expires_in);
      return true;
    } catch (error) {
      console.error('Failed to exchange code for token:', error);
      return false;
    }
  }

  isConnected(): boolean {
    return !!this.accessToken && !this.isTokenExpired();
  }

  disconnect(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');
      localStorage.removeItem('spotify_token_expiry');
    }
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = 0;
  }

  // User data
  async getCurrentUser(): Promise<SpotifyUser> {
    return this.makeRequest(spotifyEndpoints.user);
  }

  // Playlists
  async getUserPlaylists(limit: number = 20, offset: number = 0): Promise<SpotifyPlaylist[]> {
    const response = await this.makeRequest(`${spotifyEndpoints.playlists}?limit=${limit}&offset=${offset}`);
    return response.items;
  }

  async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    const response = await this.makeRequest(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`);
    return response.items.map((item: any) => item.track).filter((track: any) => track !== null);
  }

  // Player controls
  async getCurrentPlaybackState(): Promise<SpotifyPlayerState | null> {
    try {
      return await this.makeRequest(spotifyEndpoints.currentlyPlaying);
    } catch (error) {
      return null;
    }
  }

  async playTrack(trackUri: string): Promise<void> {
    await this.makeRequest(spotifyEndpoints.play, {
      method: 'PUT',
      body: JSON.stringify({ uris: [trackUri] })
    });
  }

  async playPlaylist(playlistUri: string): Promise<void> {
    await this.makeRequest(spotifyEndpoints.play, {
      method: 'PUT',
      body: JSON.stringify({ context_uri: playlistUri })
    });
  }

  async pausePlayback(): Promise<void> {
    await this.makeRequest(spotifyEndpoints.pause, { method: 'PUT' });
  }

  async resumePlayback(): Promise<void> {
    await this.makeRequest(spotifyEndpoints.play, { method: 'PUT' });
  }

  async skipToNext(): Promise<void> {
    await this.makeRequest(spotifyEndpoints.next, { method: 'POST' });
  }

  async skipToPrevious(): Promise<void> {
    await this.makeRequest(spotifyEndpoints.previous, { method: 'POST' });
  }

  async setVolume(volumePercent: number): Promise<void> {
    await this.makeRequest(`${spotifyEndpoints.volume}?volume_percent=${volumePercent}`, {
      method: 'PUT'
    });
  }

  // Search
  async searchTracks(query: string, limit: number = 20): Promise<SpotifyTrack[]> {
    const response = await this.makeRequest(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`
    );
    return response.tracks.items;
  }

  async searchPlaylists(query: string, limit: number = 20): Promise<SpotifyPlaylist[]> {
    const response = await this.makeRequest(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=${limit}`
    );
    return response.playlists.items;
  }

  // Utility methods
  formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  getTrackImage(track: SpotifyTrack, size: 'small' | 'medium' | 'large' = 'medium'): string {
    const sizeMap = { small: 0, medium: 1, large: 2 };
    return track.album.images[sizeMap[size]]?.url || '';
  }
}

export const spotifyService = new SpotifyService();

// src/types/index.ts (mobile)
export interface SearchResult {
  id: string;
  title: string;
  channel: string;
  duration: number; // seconds
  thumbnail: string;
  videoId: string;
  publishedAt: string;
}

// From backend/src/services/mediaService.ts (or backend/src/types)
export interface MediaFormatDetails {
  formatId: string;
  ext: 'm4a' | 'mp3' | 'mp4' | 'webm' | 'flv' | '3gp';
  resolution?: string;
  qualityLabel?: string;
  filesize?: number;
  url: string; // Direct stream/download URL
  abr?: number;
  vbr?: number;
  fps?: number;
  protocol?: 'http' | 'https' | 'rtmp' | 'hls';
  container?: string;
  videoCodec?: string;
  audioCodec?: string;
}

export interface MediaInfo {
  videoId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  duration?: number; // seconds
  channel?: string;
  formats: MediaFormatDetails[];
}

export interface DownloadedMediaItem {
  id: string; // Use videoId as the unique ID for simplicity here
  videoId: string;
  title: string;
  channel?: string;
  filePath: string;
  thumbnail?: string;
  downloadedAt: string; // ISO date string
  format: 'mp3' | 'mp4';
  quality: string;
  duration?: number; // Store duration if available from MediaInfo
}

export interface FavoriteItem {
  id: string; // videoId will serve as id
  videoId: string;
  title: string;
  channel?: string;
  thumbnail?: string;
  addedAt: string; // ISO date string
}

export interface PlaylistTrack {
  videoId: string; // Primary ID for the track itself
  title: string;
  channel?: string;
  thumbnail?: string;
  duration?: number; // in seconds
  addedAt: string; // ISO date string when track was added to this playlist
}

export interface PlaylistItem {
  id: string; // Unique ID for the playlist (e.g., UUID or timestamp-based)
  name: string;
  trackIds: string[]; // Array of videoIds
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  // For getPlaylistWithTracks, we might populate this:
  tracks?: PlaylistTrack[];
}

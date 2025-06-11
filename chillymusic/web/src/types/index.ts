// src/types/index.ts (web)
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

export interface WebLibraryItem {
  id: string; // videoId + format + quality (to identify unique download initiations)
  videoId: string;
  title: string;
  channel?: string;
  thumbnail?: string;
  initiatedAt: string; // ISO date string of when download was started
  format: 'mp3' | 'mp4';
  quality: string;
  originalDownloadUrl?: string; // The URL provided by yt-dlp, might expire
  fileName?: string; // The filename used when download was triggered
}

export interface FavoriteItem {
  id: string; // videoId will serve as id
  videoId: string;
  title: string;
  channel?: string;
  thumbnail?: string;
  addedAt: string; // ISO date string
}

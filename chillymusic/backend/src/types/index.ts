// chillymusic/backend/src/types/index.ts
// This file can consolidate or re-export types for the backend.

// Re-export from mediaService or define centrally if preferred.
// For now, types are defined in mediaService.ts.
// If needed, we can move MediaFormatDetails and MediaInfo here.

// Example: If we move them here.
/*
export interface MediaFormatDetails {
  formatId: string;
  ext: 'm4a' | 'mp3' | 'mp4' | 'webm' | 'flv' | '3gp';
  resolution?: string;
  qualityLabel?: string;
  filesize?: number;
  url: string;
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
*/

// For SearchResult, it might be shared or also defined here.
// From PRD:
export interface SearchResultItem {
  id: string;
  title: string;
  channel: string;
  duration: number; // seconds
  thumbnail: string;
  videoId: string;
  publishedAt: string;
}

export interface SearchApiResponse {
  results: SearchResultItem[];
  total: number;
}

// Could also add the MediaFormat and DownloadItem types from PRD here.
export interface MediaFormat { // As per PRD for Download
  format: 'mp3' | 'mp4';
  quality: string; // '128kbps', '720p', etc.
  filesize: number; // bytes
  url: string; // This would be the download URL from /api/download
}

export interface DownloadItem {
  id: string;
  videoId: string;
  title: string;
  format: MediaFormat; // This is different from MediaFormatDetails used for streaming info
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number; // 0-100
  filePath?: string;
  downloadedAt?: Date;
}

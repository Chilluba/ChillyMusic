// chillymusic/backend/src/types/index.ts

export interface SearchResultItem { /* ... as before ... */
  id: string;
  title: string;
  channel: string;
  duration: number; // seconds
  thumbnail: string;
  videoId: string;
  publishedAt: string;
}
export interface SearchApiResponse { /* ... as before ... */
  results: SearchResultItem[];
  total: number;
}
export interface MediaFormat { /* ... as before ... */
  format: 'mp3' | 'mp4';
  quality: string; // '128kbps', '720p', etc.
  filesize: number; // bytes
  url: string; // This would be the download URL from /api/download
}
export interface DownloadItem { /* ... as before ... */
  id: string;
  videoId: string;
  title: string;
  format: MediaFormat; // This is different from MediaFormatDetails used for streaming info
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number; // 0-100
  filePath?: string;
  downloadedAt?: Date;
}

// Types for what mediaService.ts provides (streaming info)
export interface MediaFormatDetails {
  formatId: string;
  ext: 'm4a' | 'mp3' | 'mp4' | 'webm' | 'flv' | '3gp' | 'opus' | 'aac' | 'ogg' | 'wav'; // Expanded
  resolution?: string;
  qualityLabel?: string;
  filesize?: number;
  url: string;
  abr?: number; // audio bitrate
  vbr?: number; // video bitrate
  fps?: number;
  protocol?: 'http' | 'https' | 'rtmp' | 'hls' | 'rtsp' | 'ftp'; // Expanded
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


// Types for parsing yt-dlp JSON output (-j)
// Based on common fields, might need to be more comprehensive
export interface YtDlpThumbnail {
  url: string;
  height?: number;
  width?: number;
  resolution?: string;
  id?: string;
}

export interface YtDlpFormat {
  format_id: string;
  url: string;
  ext: string;
  format_note?: string;
  abr?: number; // Audio bitrate
  vbr?: number; // Video bitrate
  fps?: number;
  filesize?: number;
  filesize_approx?: number; // Approx filesize
  height?: number;
  width?: number;
  resolution?: string; // e.g. 640x360
  protocol?: string;
  acodec?: string; // e.g. opus, mp4a.40.2
  vcodec?: string; // e.g. vp9, avc1.4d401e
  container?: string; // Added for more detail
  // Add other fields as needed from yt-dlp output
  [key: string]: any; // For other potential fields
}

export interface YtDlpOutput {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  thumbnail?: string; // URL of the default thumbnail
  thumbnails?: YtDlpThumbnail[]; // Array of available thumbnails
  channel?: string; // Channel name
  uploader?: string; // Uploader name (often same as channel)
  channel_id?: string;
  uploader_id?: string;
  extractor_key?: string; // Should be 'Youtube' for YouTube videos
  formats?: YtDlpFormat[];
  // Add other top-level fields from yt-dlp JSON output as needed
  [key: string]: any; // For other potential fields
}

// For mediaService.getDownloadUrl response
export interface DownloadUrlResponse {
  downloadUrl: string;
  fileName?: string;
}

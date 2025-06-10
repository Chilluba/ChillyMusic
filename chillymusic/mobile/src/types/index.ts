// src/types.ts or src/types/index.ts
export interface SearchResult {
  id: string;
  title: string;
  channel: string;
  duration: number; // seconds
  thumbnail: string;
  videoId: string;
  publishedAt: string;
}

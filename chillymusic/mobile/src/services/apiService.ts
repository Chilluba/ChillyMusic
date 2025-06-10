import { SearchResult } from '../types';
// Assuming MediaInfo and MediaFormatDetails types will be added to ../types
import { MediaInfo } from '../types'; // Add MediaInfo to types

const API_BASE_URL = 'http://localhost:3001/api';

interface SearchResponse {
  results: SearchResult[];
  total: number;
}

export const fetchSearchResults = async (query: string, limit: number = 10): Promise<SearchResponse> => {
  // ... existing implementation ...
  if (!query.trim()) {
    return { results: [], total: 0 };
  }
  try {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network response was not ok' }));
      throw new Error(errorData.message || 'Failed to fetch search results');
    }
    return await response.json() as SearchResponse;
  } catch (error: any) {
    console.error('Error fetching search results:', error);
    throw error;
  }
};

export const fetchMediaInfo = async (videoId: string): Promise<MediaInfo> => {
  try {
    const response = await fetch(`${API_BASE_URL}/media/${videoId}/info`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network response was not ok' }));
      throw new Error(errorData.message || 'Failed to fetch media info');
    }
    return await response.json() as MediaInfo;
  } catch (error: any) {
    console.error(`Error fetching media info for ${videoId}:`, error);
    throw error;
  }
};

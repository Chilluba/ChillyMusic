import { SearchResult, MediaInfo } from '../types'; // Ensure all types used are imported

// Define ApiError for web if not already in a shared location
export interface ApiError extends Error {
  status?: number;
  details?: any;
}

interface BackendDownloadUrlResponse { // Align with backend
  downloadUrl: string;
  fileName?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface SearchResponse {
  results: SearchResult[];
  total: number;
}

async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorPayload: any = { message: `API Error: ${response.status} ${response.statusText}` };
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        errorPayload = await response.json();
      } else {
        errorPayload.message = await response.text() || errorPayload.message;
      }
    } catch (e) { /* Ignore parsing error */ }
    const error: ApiError = new Error(errorPayload.message || `HTTP error ${response.status}`);
    error.status = response.status;
    error.details = errorPayload;
    throw error;
  }
  const contentType = response.headers.get('content-type');
  if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
    return {} as T;
  }
  return response.json() as Promise<T>;
}

export const fetchSearchResults = async (query: string, limit: number = 10): Promise<SearchResponse> => {
  if (!query.trim()) return { results: [], total: 0 };
  try {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return await handleApiResponse<SearchResponse>(response);
  } catch (error: any) {
    console.error('Network/API Error in fetchSearchResults (Web):', error.message);
    if (error instanceof Error && 'status' in error) throw error;
    const apiError: ApiError = new Error(error.message || 'Failed to fetch search results (Web).');
    throw apiError;
  }
};

export const fetchMediaInfo = async (videoId: string): Promise<MediaInfo> => {
  try {
    const response = await fetch(`${API_BASE_URL}/media/${videoId}/info`);
    return await handleApiResponse<MediaInfo>(response);
  } catch (error: any) {
    console.error(`Network/API Error in fetchMediaInfo (Web) for ${videoId}:`, error.message);
    if (error instanceof Error && 'status' in error) throw error;
    const apiError: ApiError = new Error(error.message || 'Failed to fetch media details (Web).');
    throw apiError;
  }
};

interface DownloadRequestPayload { videoId: string; format: 'mp3' | 'mp4'; quality: string; }

export const fetchDownloadLink = async (payload: DownloadRequestPayload): Promise<BackendDownloadUrlResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/media/download`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    return await handleApiResponse<BackendDownloadUrlResponse>(response);
  } catch (error: any) {
    console.error(`Network/API Error in fetchDownloadLink (Web) for ${payload.videoId}:`, error.message);
    if (error instanceof Error && 'status' in error) throw error;
    const apiError: ApiError = new Error(error.message || 'Failed to get download link (Web).');
    throw apiError;
  }
};

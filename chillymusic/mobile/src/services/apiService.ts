import { SearchResult, MediaInfo, DownloadedMediaItem } from '../types'; // Ensure DownloadedMediaItem if used by other types like PlayerScreenTrack
import { DownloadUrlResponse as MobileDownloadUrlResponse } from '../context/DownloadContext'; // If defined there, or use a shared one.
// For now, assuming DownloadUrlResponse is specific or we define a shared one.
// Let's define it here for apiService if not already in types.ts for mobile.
export interface ApiError extends Error {
  status?: number; // HTTP status code
  details?: any; // Additional error details from backend
}

// Re-defining DownloadUrlResponse if not appropriately shared.
// This should align with what the backend's /api/media/download route returns.
interface BackendDownloadUrlResponse {
  downloadUrl: string;
  fileName?: string;
}


const API_BASE_URL = 'http://localhost:3001/api';

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
    } catch (e) {
      // Ignore parsing error, use default message
    }
    const error: ApiError = new Error(errorPayload.message || `HTTP error ${response.status}`);
    error.status = response.status;
    error.details = errorPayload;
    throw error;
  }
  // Handle cases where response might be empty but OK (e.g. 204 No Content)
  const contentType = response.headers.get('content-type');
  if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
    return {} as T; // Or null / undefined based on expected T for such cases
  }
  return response.json() as Promise<T>;
}


export const fetchSearchResults = async (query: string, limit: number = 10): Promise<SearchResponse> => {
  if (!query.trim()) return { results: [], total: 0 };
  try {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return await handleApiResponse<SearchResponse>(response);
  } catch (error: any) {
    console.error('Network/API Error in fetchSearchResults:', error.message, error.status, error.details);
    // Re-throw a more structured error or the original one if it's already good.
    // For UI, it's often better to throw a consistent ApiError type.
    if (error instanceof Error && 'status' in error) throw error; // Already an ApiError
    const apiError: ApiError = new Error(error.message || 'Failed to fetch search results due to a network issue.');
    // apiError.status = undefined; // Network errors don't have HTTP status
    throw apiError;
  }
};

export const fetchMediaInfo = async (videoId: string): Promise<MediaInfo> => {
  try {
    const response = await fetch(`${API_BASE_URL}/media/${videoId}/info`);
    return await handleApiResponse<MediaInfo>(response);
  } catch (error: any) {
    console.error(`Network/API Error in fetchMediaInfo for ${videoId}:`, error.message);
     if (error instanceof Error && 'status' in error) throw error;
    const apiError: ApiError = new Error(error.message || 'Failed to fetch media details due to a network issue.');
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
    console.error(`Network/API Error in fetchDownloadLink for ${payload.videoId}:`, error.message);
    if (error instanceof Error && 'status' in error) throw error;
    const apiError: ApiError = new Error(error.message || 'Failed to get download link due to a network issue.');
    throw apiError;
  }
};

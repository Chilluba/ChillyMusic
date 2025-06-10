import { SearchResult } from '../types'; // Assuming a types definition file will be created or shared

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface SearchResponse {
  results: SearchResult[];
  total: number;
}

export const fetchSearchResults = async (query: string, limit: number = 10): Promise<SearchResponse> => {
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

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { SearchFiltersState, initialState as initialFilters } from './searchFiltersSlice';
import { SearchResult } from './searchSlice'; // Re-use SearchResult type from existing searchSlice

// Define a type for the expected API response for search results
interface SearchApiResponse {
  results: SearchResult[];
  total: number;
}

// Define the arguments for our query endpoint
export interface GetSearchResultsArgs {
  query: string;
  filters: SearchFiltersState;
  // page?: number; // For pagination
  // limit?: number;
}

// For web, VITE_API_BASE_URL is typically used from .env files
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    getSearchResults: builder.query<SearchApiResponse, GetSearchResultsArgs>({
      query: ({ query, filters }) => {
        let queryString = `search?q=${encodeURIComponent(query)}`;

        if (filters.type !== initialFilters.type) {
          queryString += `&type=${filters.type}`;
        }
        if (filters.uploadDate !== initialFilters.uploadDate) {
          queryString += `&upload_date=${filters.uploadDate}`;
        }
        if (filters.duration !== initialFilters.duration) {
          queryString += `&duration=${filters.duration}`;
        }
        if (filters.sortBy !== initialFilters.sortBy) {
          queryString += `&sort_by=${filters.sortBy}`;
        }
        // queryString += `&limit=25`; // Example if pagination is added

        console.log(`(Web RTK Query) Requesting: ${API_BASE_URL}${queryString}`);
        return queryString;
      },
      // Example: keep data for 5 minutes if unused
      keepUnusedDataFor: 300,
    }),
    // ... other web-specific endpoints
  }),
});

export const {
    useGetSearchResultsQuery,
    useLazyGetSearchResultsQuery
} = apiSlice;

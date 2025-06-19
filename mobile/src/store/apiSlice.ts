import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { SearchFiltersState, initialState as initialFilters } from './searchFiltersSlice';
import { SearchResult } from './searchSlice'; // Re-use SearchResult type

// Define a type for the expected API response for search results
interface SearchApiResponse {
  results: SearchResult[];
  total: number;
  // Add any other fields the backend might return at the top level of this response
}

// Define the arguments for our query endpoint
export interface GetSearchResultsArgs {
  query: string;
  filters: SearchFiltersState;
  // Add page/limit here if API supports pagination
}

// TODO: Get API_BASE_URL from environment configuration
const API_BASE_URL = 'http://localhost:3001/api/'; // Placeholder

export const apiSlice = createApi({
  reducerPath: 'api', // The key where this slice will be mounted in the Redux store
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    getSearchResults: builder.query<SearchApiResponse, GetSearchResultsArgs>({
      query: ({ query, filters }) => {
        let queryString = `search?q=${encodeURIComponent(query)}`;

        // Append filter parameters if they are not the default values
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
        // Add limit/offset for pagination if API supports it
        // queryString += `&limit=25`;

        console.log(`(Mobile RTK Query) Requesting: ${API_BASE_URL}${queryString}`);
        return queryString;
      },
      // keepUnusedDataFor: 3600, // Cache data for 1 hour (3600 seconds) - PRD mentioned 1-hour TTL
      // Default is 60 seconds. For more aggressive caching based on TTL,
      // other strategies might be needed or ensure server cache headers are strong.
      // RTK Query's default caching is more about " giữ data khi còn component subcribe + 1 khoảng thời gian ngắn".
      // For a strict 1-hour TTL regardless of subscriptions, custom logic around `forceRefetch` or
      // a higher-level caching solution might be necessary if this doesn't meet the exact requirement.
      // For now, we'll rely on default behavior or a reasonable keepUnusedDataFor.
      // Let's set it to 5 minutes (300s) for now as a starting point for testing.
      keepUnusedDataFor: 300,
    }),
    // Other endpoints like getSongDetails, getPlaylistDetails etc. can be added here
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
    useGetSearchResultsQuery,
    // useLazyGetSearchResultsQuery can be useful for triggering fetches on demand (e.g., button click)
    useLazyGetSearchResultsQuery
} = apiSlice;

// Optional: export the reducer and middleware if not handled by a generic setup
// export default apiSlice.reducer; // Not typically needed if using configureStore with apiSlice.middleware
// export const apiMiddleware = apiSlice.middleware; // Same as above
